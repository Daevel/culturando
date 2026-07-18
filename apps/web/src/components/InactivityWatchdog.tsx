"use client";

import { Hourglass } from "lucide-react";
import { usePathname } from "next/navigation";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { logoutAction } from "@/features/auth/actions/logout.action";
import { useTranslation } from "@/hooks/useTranslation";

const inactivityTimeoutMs = 15 * 60_000;
const logoutGracePeriodSeconds = 60;
const activityEvents = ["keydown", "mousedown", "mousemove", "scroll", "touchstart"] as const;

function formatRemainingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export function InactivityWatchdog() {
  const pathname = usePathname();
  const t = useTranslation();
  const timeoutRef = useRef<number | undefined>(undefined);
  const countdownRef = useRef<number | undefined>(undefined);
  const [isInactive, setIsInactive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(logoutGracePeriodSeconds);
  const [hasGracePeriodExpired, setHasGracePeriodExpired] = useState(false);
  const isAuthRoute = pathname.startsWith(routes.auth);

  const clearWatchdogTimeout = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const startWatchdogTimeout = useCallback(() => {
    clearWatchdogTimeout();
    timeoutRef.current = window.setTimeout(() => {
      setIsInactive(true);
    }, inactivityTimeoutMs);
  }, [clearWatchdogTimeout]);

  const continueNavigation = useCallback(() => {
    setIsInactive(false);
    setRemainingSeconds(logoutGracePeriodSeconds);
    setHasGracePeriodExpired(false);
    startWatchdogTimeout();
  }, [startWatchdogTimeout]);

  const loginAgain = useCallback(() => {
    setIsInactive(false);
    startTransition(() => {
      void logoutAction();
    });
  }, []);

  useEffect(() => {
    function handleActivity() {
      if (isInactive) {
        return;
      }

      startWatchdogTimeout();
    }

    if (isAuthRoute) {
      clearWatchdogTimeout();
      setIsInactive(false);
      return;
    }

    if (!isInactive) {
      startWatchdogTimeout();
    }

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, handleActivity, { passive: true });
    }

    return () => {
      clearWatchdogTimeout();

      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, handleActivity);
      }
    };
  }, [clearWatchdogTimeout, isAuthRoute, isInactive, startWatchdogTimeout]);

  useEffect(() => {
    if (!isInactive || isAuthRoute) {
      return;
    }

    clearWatchdogTimeout();
    setRemainingSeconds(logoutGracePeriodSeconds);
    setHasGracePeriodExpired(false);

    countdownRef.current = window.setInterval(() => {
      setRemainingSeconds((currentRemainingSeconds) => {
        if (currentRemainingSeconds <= 1) {
          if (countdownRef.current !== undefined) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = undefined;
          }

          setHasGracePeriodExpired(true);
          return 0;
        }

        return currentRemainingSeconds - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current !== undefined) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = undefined;
      }
    };
  }, [clearWatchdogTimeout, isAuthRoute, isInactive]);

  if (!isInactive || isAuthRoute) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div
        aria-describedby="inactivity-watchdog-description"
        aria-labelledby="inactivity-watchdog-title"
        className="w-full max-w-md rounded-2xl border bg-card p-6 text-center text-card-foreground shadow-2xl"
        role="alertdialog"
      >
        <h2
          className="font-serif text-2xl font-semibold tracking-tight"
          id="inactivity-watchdog-title"
        >
          {hasGracePeriodExpired
            ? t("watchdog.inactivity.expiredTitle")
            : t("watchdog.inactivity.title")}
        </h2>
        <div className="mx-auto my-6 flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Hourglass aria-hidden="true" className="size-12" />
        </div>
        <div
          className="mx-auto max-w-sm space-y-3 text-sm leading-6 text-muted-foreground"
          id="inactivity-watchdog-description"
        >
          {hasGracePeriodExpired ? (
            <p>{t("watchdog.inactivity.expiredDescription")}</p>
          ) : (
            <>
              <p>{t("watchdog.inactivity.description")}</p>
              <p className="text-3xl font-semibold text-foreground tabular-nums">
                {formatRemainingTime(remainingSeconds)}
              </p>
            </>
          )}
        </div>
        <Button
          className="mt-6 w-full sm:w-auto"
          onClick={hasGracePeriodExpired ? loginAgain : continueNavigation}
          type="button"
        >
          {hasGracePeriodExpired
            ? t("watchdog.inactivity.loginAgainLabel")
            : t("watchdog.inactivity.continueLabel")}
        </Button>
      </div>
    </div>
  );
}

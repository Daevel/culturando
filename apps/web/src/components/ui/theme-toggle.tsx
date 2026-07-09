"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const storageKey = "culturando-theme";

function getPreferredTheme(): Theme {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

type ThemeToggleProps = {
  className?: string;
  darkLabel: string;
  iconOnly?: boolean;
  lightLabel: string;
  tooltipLabel?: string;
};

export function ThemeToggle({
  className,
  darkLabel,
  iconOnly = false,
  lightLabel,
  tooltipLabel,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark" ? storedTheme : getPreferredTheme();

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
  }

  const label = theme === "dark" ? lightLabel : darkLabel;

  const button = (
    <Button
      aria-label={label}
      aria-pressed={theme === "dark"}
      className={cn("rounded-full bg-background/85 shadow-sm backdrop-blur", className)}
      onClick={toggleTheme}
      size={iconOnly ? "icon" : "sm"}
      type="button"
      variant="outline"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" size={16} />
      ) : (
        <Moon aria-hidden="true" size={16} />
      )}
      {iconOnly ? null : <span>{label}</span>}
    </Button>
  );

  if (!iconOnly) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {tooltipLabel ?? label}
      </TooltipContent>
    </Tooltip>
  );
}

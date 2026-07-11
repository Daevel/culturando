import { assets } from "@culturando/assets";
import { appConfig } from "@culturando/config";
import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "full" | "mark";
};

export function BrandLogo({ className, priority = false, variant = "full" }: BrandLogoProps) {
  const isFullLogo = variant === "full";
  const width = isFullLogo ? 320 : 128;
  const height = isFullLogo ? 80 : 128;
  const lightThemeSrc = isFullLogo ? assets.logo.fullLight : assets.logo.markDark;
  const darkThemeSrc = isFullLogo ? assets.logo.fullDark : assets.logo.markLight;

  return (
    <span
      aria-label={appConfig.name}
      className={cn("inline-flex shrink-0 items-center", className)}
      role="img"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="h-full w-full object-contain dark:hidden"
        height={height}
        priority={priority}
        src={lightThemeSrc}
        width={width}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="hidden h-full w-full object-contain dark:block"
        height={height}
        priority={priority}
        src={darkThemeSrc}
        width={width}
      />
    </span>
  );
}

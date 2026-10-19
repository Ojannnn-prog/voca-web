import React from "react";
import { cn } from "@/lib/utils";

interface VocaLogoProps {
  variant?: "full" | "icon";
  theme?: "color" | "dark" | "light" | "pink";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VocaLogo({
  variant = "full",
  theme = "color",
  className,
  size = "md",
}: VocaLogoProps) {
  // Ukuran dimensi icon
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl md:text-3xl",
    lg: "text-4xl md:text-5xl",
  };

  const subTextSizes = {
    sm: "text-[7px]",
    md: "text-[9px] md:text-[10px]",
    lg: "text-xs tracking-[0.25em]",
  };

  // Warna pisau vortex
  let redBlade = "#E42130";
  let yellowBlade = "#F6B12E";
  let greenBlade = "#38AD4F";
  let blueBlade = "#21649D";
  let athleteColor = "#21649D";
  let textColor = "text-[#111111]";
  let subTextColor = "text-[#4B5563]";

  if (theme === "pink") {
    redBlade = "#FF4D8D";
    yellowBlade = "#FF4D8D";
    greenBlade = "#FF4D8D";
    blueBlade = "#FF4D8D";
    athleteColor = "#FF4D8D";
    textColor = "text-[#FF4D8D]";
    subTextColor = "text-[#FF9EBC]";
  } else if (theme === "light") {
    redBlade = "#FFFFFF";
    yellowBlade = "#FFFFFF";
    greenBlade = "#FFFFFF";
    blueBlade = "#FFFFFF";
    athleteColor = "#FFFFFF";
    textColor = "text-white";
    subTextColor = "text-white/80";
  } else if (theme === "dark") {
    redBlade = "#111111";
    yellowBlade = "#111111";
    greenBlade = "#111111";
    blueBlade = "#111111";
    athleteColor = "#111111";
    textColor = "text-[#111111]";
    subTextColor = "text-neutral-500";
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* VORTEX ATHLETE SVG ICON (Konsep 3) */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(iconSizes[size], "shrink-0 transition-transform duration-300 hover:rotate-45")}
        aria-label="VOCA Vortex Icon"
      >
        {/* Blade 1 (Top / Merah) */}
        <path
          d="M 50 8 C 68 8, 85 20, 90 38 C 84 28, 72 22, 58 24 C 52 25, 46 28, 42 32 C 45 22, 48 14, 50 8 Z"
          fill={redBlade}
        />
        {/* Blade 2 (Right / Kuning) */}
        <path
          d="M 92 50 C 92 68, 80 85, 62 90 C 72 84, 78 72, 76 58 C 75 52, 72 46, 68 42 C 78 45, 86 48, 92 50 Z"
          fill={yellowBlade}
        />
        {/* Blade 3 (Bottom / Hijau) */}
        <path
          d="M 50 92 C 32 92, 15 80, 10 62 C 16 72, 28 78, 42 76 C 48 75, 54 72, 58 68 C 55 78, 52 86, 50 92 Z"
          fill={greenBlade}
        />
        {/* Blade 4 (Left / Biru) */}
        <path
          d="M 8 50 C 8 32, 20 15, 38 10 C 28 16, 22 28, 24 42 C 25 48, 28 54, 32 58 C 22 55, 14 52, 8 50 Z"
          fill={blueBlade}
        />

        {/* Central Athletic Figure (Letter 'V' with spread arms & head) */}
        <g>
          {/* Circular Head */}
          <circle cx="50" cy="35" r="4.8" fill={athleteColor} />
          {/* Athletic V-Body with raised energetic arms */}
          <path
            d="M 37 44 C 41 46, 46 54, 50 67 C 54 54, 59 46, 63 44 C 61 49, 56 61, 50 74 C 44 61, 39 49, 37 44 Z"
            fill={athleteColor}
          />
        </g>
      </svg>

      {/* Typography: "voca" (Fredoka) + "VORTEX COMMUNITY OF ATHLETICS" */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-fredoka font-bold tracking-tight lowercase",
              textSizes[size],
              textColor
            )}
          >
            v<span className="inline-block transform scale-y-90">o</span>ca
          </span>
          <span
            className={cn(
              "font-sans font-semibold uppercase tracking-[0.2em] -mt-0.5",
              subTextSizes[size],
              subTextColor
            )}
          >
            Vortex Community of Athletics
          </span>
        </div>
      )}
    </div>
  );
}

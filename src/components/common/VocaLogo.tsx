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
      {/* OFFICIAL LOGO VOCA.SVG ICON */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/LOGO%20VOCA.svg"
        alt="VOCA Official Logo"
        className={cn(
          iconSizes[size],
          "shrink-0 object-contain transition-transform duration-300 hover:scale-105"
        )}
      />

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

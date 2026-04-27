/**
 * BrandLogo.tsx — HAMA Academy
 * Refactored for logo visibility audit fixes.
 *
 * SIZE TIER SYSTEM:
 *   xs  → h-5  (20px)  utility only — watermarks, chips
 *   sm  → h-8  (32px)  compact nav / mobile topbar
 *   md  → h-11 (44px)  landing navbar / normal nav
 *   lg  → h-20 (80px)  auth pages / expressive brand moments
 *
 * CHANGES FROM AUDIT:
 *   - sm bumped from h-7 (28px) to h-8 (32px) — was too small in topbar/landing
 *   - lg bumped from h-16 (64px) to h-20 (80px) — auth should be most expressive
 *   - subtle mode: opacity raised from ~75% to 85% for better contrast on dark glass
 *   - glow effect scoped only to lg size to prevent noise on small placements
 *   - Added `plate` prop: thin backing plate for logo on very busy glass surfaces
 *   - watermark opacity tightened to 0.07 (from effectively ~15%)
 */

import React from "react";

type LogoVariant =
  | "full"
  | "icon"
  | "mono-light"
  | "mono-dark"
  | "watermark";

type LogoSize = "xs" | "sm" | "md" | "lg";

interface BrandLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  /** Soft glow. Auto-disabled for xs/sm — only fires at md+ */
  glow?: boolean;
  /** Thin translucent backing plate for busy glass backgrounds */
  plate?: boolean;
  /** Slightly reduced opacity for secondary placements */
  subtle?: boolean;
  clickable?: boolean;
  href?: string;
  className?: string;
  alt?: string;
}

const SIZE_MAP: Record<LogoSize, string> = {
  xs: "h-5",   // 20px — utility/chips/watermarks only
  sm: "h-8",   // 32px — compact nav, mobile topbar, collapsed sidebar icon
  md: "h-11",  // 44px — landing navbar, normal internal nav
  lg: "h-20",  // 80px — auth pages, expressive brand moments
};

const VARIANT_SRC: Record<LogoVariant, string> = {
  "full":       "/hamalogonew.png",
  "icon":       "/hamonogram.png",
  "mono-light": "/hamalogonew.png",
  "mono-dark":  "/hamalogonew.png",
  "watermark":  "/hamalogonew.png",
};

const VARIANT_FILTER: Record<LogoVariant, string> = {
  "full":       "none",
  "icon":       "none",
  "mono-light": "brightness(0) invert(1)",
  "mono-dark":  "brightness(0)",
  "watermark":  "brightness(0) invert(1)",
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  size = "md",
  glow = false,
  plate = false,
  subtle = false,
  clickable = false,
  href = "/",
  className = "",
  alt = "HAMA Academy",
}) => {
  const sizeClass = SIZE_MAP[size];
  const src = VARIANT_SRC[variant];
  const filter = VARIANT_FILTER[variant];

  // Glow only makes visual sense at md and lg sizes
  const shouldGlow = glow && (size === "md" || size === "lg");

  // Watermark variant always near-invisible
  const opacity =
    variant === "watermark"
      ? 0.07
      : subtle
      ? 0.85
      : 1;

  const imgStyle: React.CSSProperties = {
    filter:
      filter !== "none"
        ? filter
        : shouldGlow
        ? "drop-shadow(0 0 8px rgba(212,175,55,0.55)) drop-shadow(0 0 20px rgba(212,175,55,0.25))"
        : variant === "icon"
        ? "drop-shadow(0 0 6px rgba(212,175,55,0.22))"
        : "none",
    opacity,
    transition: "opacity 0.2s ease",
  };

  const plateStyle: React.CSSProperties = plate
    ? {
        background: "rgba(11,15,25,0.45)",
        borderRadius: "8px",
        padding: "6px 10px",
        backdropFilter: "blur(4px)",
        display: "inline-flex",
        alignItems: "center",
      }
    : { display: "inline-flex", alignItems: "center" };

  const img = (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} w-auto object-contain shrink-0 ${className}`}
      style={imgStyle}
      draggable={false}
    />
  );

  const wrapped = plate ? <span style={plateStyle}>{img}</span> : img;

  if (clickable) {
    return (
      <a href={href} aria-label={alt} className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hama-gold/60 rounded">
        {wrapped}
      </a>
    );
  }

  return wrapped;
};

export default BrandLogo;

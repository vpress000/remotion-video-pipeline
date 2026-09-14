import React from "react";
import { Img, staticFile } from "remotion";
import type { BrandTheme } from "../../schema/video-spec";
import { fontFamily } from "../theme/fonts";

const isRemote = (src: string): boolean => /^https?:\/\//i.test(src);

/** Renders the brand logo image when supplied, otherwise a text wordmark. */
export const BrandLogo: React.FC<{ brand: BrandTheme; size: number }> = ({ brand, size }) => {
  if (brand.logoSrc) {
    const src = isRemote(brand.logoSrc) ? brand.logoSrc : staticFile(`brand/${brand.logoSrc}`);
    return <Img src={src} style={{ height: size, objectFit: "contain" }} />;
  }

  return (
    <div
      style={{
        fontFamily,
        fontWeight: 800,
        fontSize: size * 0.62,
        color: brand.text,
        letterSpacing: size * 0.01,
        textTransform: "uppercase",
      }}
    >
      {brand.name}
    </div>
  );
};

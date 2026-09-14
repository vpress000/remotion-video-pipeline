import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from "remotion";
import type { Scene, BrandTheme } from "../../schema/video-spec";

const isRemote = (src: string): boolean => /^https?:\/\//i.test(src);

/**
 * Scene background: product footage when provided, otherwise an animated
 * on-brand gradient so the video always renders even with no media assets.
 */
export const Background: React.FC<{ scene: Scene; brand: BrandTheme }> = ({ scene, brand }) => {
  const frame = useCurrentFrame();

  if (scene.footageSrc) {
    const src = isRemote(scene.footageSrc)
      ? scene.footageSrc
      : staticFile(`footage/${scene.footageSrc}`);
    return (
      <AbsoluteFill>
        <OffthreadVideo
          src={src}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <AbsoluteFill style={{ background: "rgba(0, 0, 0, 0.35)" }} />
      </AbsoluteFill>
    );
  }

  const base = scene.backgroundColor ?? brand.background;
  const drift = interpolate(frame, [0, 240], [0, 12], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(120% 120% at ${20 + drift}% 8%, ${brand.primary}33, transparent 45%)`,
          `radial-gradient(120% 120% at 88% ${92 - drift}%, ${brand.secondary}33, transparent 45%)`,
          base,
        ].join(", "),
      }}
    />
  );
};

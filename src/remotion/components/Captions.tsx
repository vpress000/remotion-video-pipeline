import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Captions, BrandTheme } from "../../schema/video-spec";
import { cueAt } from "../../captions/vtt";
import { fontFamily } from "../theme/fonts";

/** Bottom-anchored caption overlay driven by absolute (whole-video) time. */
export const CaptionsOverlay: React.FC<{ captions: Captions; brand: BrandTheme }> = ({
  captions,
  brand,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  if (!captions.enabled || captions.cues.length === 0) return null;

  const timeMs = (frame / fps) * 1000;
  const cue = cueAt(captions.cues, timeMs);
  if (!cue) return null;

  const base = Math.min(width, height);

  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", padding: base * 0.08 }}
    >
      <div
        style={{
          fontFamily,
          fontSize: base * 0.038,
          fontWeight: 700,
          color: brand.text,
          background: "rgba(0, 0, 0, 0.55)",
          padding: `${base * 0.015}px ${base * 0.03}px`,
          borderRadius: base * 0.02,
          textAlign: "center",
          maxWidth: "86%",
          lineHeight: 1.25,
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};

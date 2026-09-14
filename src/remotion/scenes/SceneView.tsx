import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, BrandTheme } from "../../schema/video-spec";
import { Background } from "../components/Background";
import { BrandLogo } from "../components/BrandLogo";
import { fontFamily } from "../theme/fonts";

/** Renders a single scene with its transition, headline, subtext and bullets. */
export const SceneView: React.FC<{ scene: Scene; brand: BrandTheme }> = ({ scene, brand }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const base = Math.min(width, height);

  const enter = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.min(18, Math.max(6, Math.floor(durationInFrames / 2))),
  });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const animated = scene.transition !== "none";
  const opacity = animated ? Math.min(enter, fadeOut) : 1;
  const translateY = scene.transition === "slide" ? interpolate(enter, [0, 1], [base * 0.06, 0]) : 0;
  const scale = scene.transition === "zoom" ? interpolate(enter, [0, 1], [0.92, 1]) : 1;

  return (
    <AbsoluteFill>
      <Background scene={scene} brand={brand} />

      <div style={{ position: "absolute", top: base * 0.06, left: base * 0.09 }}>
        <BrandLogo brand={brand} size={base * 0.05} />
      </div>

      <AbsoluteFill
        style={{ padding: base * 0.09, justifyContent: "center", alignItems: "flex-start" }}
      >
        <div
          style={{
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            maxWidth: "92%",
          }}
        >
          <div
            style={{
              fontFamily,
              fontWeight: 800,
              fontSize: base * 0.075,
              color: brand.text,
              lineHeight: 1.05,
            }}
          >
            {scene.headline}
          </div>

          {scene.subtext ? (
            <div
              style={{
                fontFamily,
                fontWeight: 500,
                fontSize: base * 0.036,
                color: brand.text,
                opacity: 0.9,
                marginTop: base * 0.03,
              }}
            >
              {scene.subtext}
            </div>
          ) : null}

          {scene.bullets.length > 0 ? (
            <ul
              style={{
                marginTop: base * 0.03,
                paddingLeft: base * 0.045,
                color: brand.text,
                fontFamily,
                fontSize: base * 0.032,
              }}
            >
              {scene.bullets.map((bullet, index) => (
                <li key={index} style={{ marginBottom: base * 0.012 }}>
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

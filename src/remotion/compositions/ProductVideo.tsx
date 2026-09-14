import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { VideoSpec } from "../../schema/video-spec";
import { SceneView } from "../scenes/SceneView";
import { CaptionsOverlay } from "../components/Captions";
import { MusicTrack } from "../components/MusicTrack";

/**
 * Top-level composition. Lays each scene out on the timeline back-to-back,
 * overlays timed captions, and plays background music across the whole video.
 * Consumes a Zod-validated VideoSpec as its props.
 */
export const ProductVideo: React.FC<VideoSpec> = (spec) => {
  const { fps } = useVideoConfig();
  let offset = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: spec.brand.background }}>
      <MusicTrack music={spec.music} />

      {spec.scenes.map((scene) => {
        const durationInFrames = Math.max(1, Math.round(scene.durationInSeconds * fps));
        const from = offset;
        offset += durationInFrames;
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={durationInFrames}
            name={`${scene.type}:${scene.id}`}
          >
            <SceneView scene={scene} brand={spec.brand} />
          </Sequence>
        );
      })}

      <CaptionsOverlay captions={spec.captions} brand={spec.brand} />
    </AbsoluteFill>
  );
};

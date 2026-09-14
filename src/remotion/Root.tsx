import React from "react";
import { Composition } from "remotion";
import {
  videoSpecSchema,
  specDurationInFrames,
  type VideoSpec,
} from "../schema/video-spec";
import { ProductVideo } from "./compositions/ProductVideo";
import { FORMATS } from "../formats";
import sampleSpec from "../../data/specs/sample.video-spec.json";

// The committed sample lets the renderer run with zero API keys and no assets.
const defaultSpec: VideoSpec = videoSpecSchema.parse(sampleSpec);

const calculateMetadata = ({ props }: { props: VideoSpec }) => ({
  durationInFrames: specDurationInFrames(props),
  fps: props.fps,
});

export const RemotionRoot: React.FC = () => {
  const { vertical, landscape } = FORMATS;

  return (
    <>
      <Composition
        id="ProductVideoVertical"
        component={ProductVideo}
        schema={videoSpecSchema}
        defaultProps={defaultSpec}
        fps={defaultSpec.fps}
        durationInFrames={specDurationInFrames(defaultSpec)}
        width={vertical.width}
        height={vertical.height}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="ProductVideoLandscape"
        component={ProductVideo}
        schema={videoSpecSchema}
        defaultProps={defaultSpec}
        fps={defaultSpec.fps}
        durationInFrames={specDurationInFrames(defaultSpec)}
        width={landscape.width}
        height={landscape.height}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};

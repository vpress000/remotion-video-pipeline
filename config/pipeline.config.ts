import path from "node:path";
import { FORMATS, FPS, type FormatSize } from "../src/formats";

/**
 * Central configuration for asset locations and render dimensions.
 * Every path can be overridden with an environment variable so the same
 * codebase runs against the bundled samples or your own asset folders.
 */
export interface PipelineConfig {
  captionsDir: string;
  footageDir: string;
  audioDir: string;
  fps: number;
  formats: {
    vertical: FormatSize;
    landscape: FormatSize;
  };
}

export const pipelineConfig: PipelineConfig = {
  captionsDir: process.env.CAPTIONS_DIR ?? path.join("assets", "captions"),
  footageDir: process.env.FOOTAGE_DIR ?? path.join("public", "footage"),
  audioDir: process.env.AUDIO_DIR ?? path.join("public", "audio"),
  fps: FPS,
  formats: FORMATS,
};

import path from "node:path";
import { FORMATS, FPS, type FormatSize } from "../src/formats";

/**
 * Central configuration for asset locations and render dimensions.
 * Every path can be overridden with an environment variable so the same
 * codebase runs against bundled samples or your real Bee Naturals folders.
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
  captionsDir:
    process.env.BN_CAPTIONS_DIR ??
    "C:\\Users\\patel\\Downloads\\BeeNaturals\\Video Work\\Subtitles\\VTT Files",
  footageDir:
    process.env.BN_FOOTAGE_DIR ??
    "C:\\Users\\patel\\Downloads\\BeeNaturals\\Video Work\\Videos to Cut",
  audioDir: process.env.BN_AUDIO_DIR ?? path.join("public", "audio"),
  fps: FPS,
  formats: FORMATS,
};

import path from "node:path";

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
    vertical: { width: number; height: number };
    landscape: { width: number; height: number };
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
  fps: 30,
  formats: {
    vertical: { width: 1080, height: 1920 },
    landscape: { width: 1920, height: 1080 },
  },
};

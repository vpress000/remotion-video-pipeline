/**
 * Browser-safe render dimensions and fps.
 *
 * This module must NOT import any Node-only APIs (no `node:*`, `fs`, `path`, or
 * `process`) because it is pulled into the Remotion webpack bundle via Root.tsx.
 * Keep Node-only configuration in config/pipeline.config.ts instead.
 */
export interface FormatSize {
  width: number;
  height: number;
}

export const FPS = 30;

export const FORMATS: { vertical: FormatSize; landscape: FormatSize } = {
  vertical: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

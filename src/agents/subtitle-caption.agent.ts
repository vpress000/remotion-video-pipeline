import type { Agent } from "./types";
import type { CaptionCue } from "../schema/video-spec";
import type { EditPlan, Script } from "./contracts";

/**
 * SubtitleCaptionAgent (deterministic).
 *
 * Times captions from the script narration across each beat's allocated
 * duration. This is intentionally code, not an LLM call: caption timing is a
 * mechanical transform and must be exact. Swap in an LLM here later if you want
 * stylistic caption rewriting.
 */

const MAX_LINE = 42;

export const chunkText = (text: string, maxLen = MAX_LINE): string[] => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line.length === 0) {
      line = word;
    } else if (`${line} ${word}`.length <= maxLen) {
      line = `${line} ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export const subtitleCaptionAgent: Agent<{ script: Script; editPlan: EditPlan }, CaptionCue[]> = {
  name: "SubtitleCaptionAgent",
  async run({ script, editPlan }, ctx) {
    ctx.log("Timing captions from narration");
    const cues: CaptionCue[] = [];
    let cursorMs = 0;
    script.beats.forEach((beat, index) => {
      const durationSeconds = editPlan.scenes[index]?.durationInSeconds ?? 3;
      const durationMs = durationSeconds * 1000;
      const chunks = chunkText(beat.narration);
      if (chunks.length === 0) {
        cursorMs += durationMs;
        return;
      }
      const per = durationMs / chunks.length;
      chunks.forEach((text, c) => {
        cues.push({
          startMs: Math.round(cursorMs + c * per),
          endMs: Math.round(cursorMs + (c + 1) * per),
          text,
        });
      });
      cursorMs += durationMs;
    });
    return cues;
  },
};

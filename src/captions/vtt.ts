import type { CaptionCue } from "../schema/video-spec";

/** Convert a WebVTT/SRT timestamp (HH:MM:SS.mmm or MM:SS.mmm, ',' or '.') to milliseconds. */
export const timestampToMs = (timestamp: string): number => {
  const clean = timestamp.trim().replace(",", ".");
  const [hms, fraction = "0"] = clean.split(".");
  const parts = hms.split(":").map((n) => Number(n));
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  if (parts.length === 3) [hours, minutes, seconds] = parts;
  else if (parts.length === 2) [minutes, seconds] = parts;
  else [seconds] = parts;
  const ms = Number(fraction.padEnd(3, "0").slice(0, 3));
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + ms;
};

const TIME_RE =
  /(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{1,3})/;

/** Parse a WebVTT document into caption cues. Tolerates missing/extra headers and cue ids. */
export const parseVtt = (content: string): CaptionCue[] => {
  const normalized = content.replace(/\r\n/g, "\n").replace(/^WEBVTT[^\n]*\n/, "");
  const blocks = normalized.split(/\n\s*\n+/);
  const cues: CaptionCue[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").filter((line) => line.trim() !== "");
    const timeLineIndex = lines.findIndex((line) => TIME_RE.test(line));
    if (timeLineIndex === -1) continue;

    const match = lines[timeLineIndex].match(TIME_RE);
    if (!match) continue;

    const text = lines
      .slice(timeLineIndex + 1)
      .join(" ")
      .trim();
    if (!text) continue;

    cues.push({
      startMs: timestampToMs(match[1]),
      endMs: timestampToMs(match[2]),
      text,
    });
  }

  return cues;
};

/** The cue active at a given time (or null). */
export const cueAt = (cues: CaptionCue[], timeMs: number): CaptionCue | null =>
  cues.find((cue) => timeMs >= cue.startMs && timeMs < cue.endMs) ?? null;

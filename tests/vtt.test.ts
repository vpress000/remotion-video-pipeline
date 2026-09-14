import { describe, it, expect } from "vitest";
import { parseVtt, timestampToMs, cueAt } from "../src/captions/vtt";

describe("timestampToMs", () => {
  it("parses HH:MM:SS.mmm", () => {
    expect(timestampToMs("00:00:03.000")).toBe(3000);
    expect(timestampToMs("00:01:02.500")).toBe(62500);
  });

  it("accepts comma decimals and MM:SS form", () => {
    expect(timestampToMs("00:02,250")).toBe(2250);
  });
});

describe("parseVtt", () => {
  const vtt = [
    "WEBVTT",
    "",
    "1",
    "00:00:00.000 --> 00:00:02.000",
    "Hello world",
    "",
    "2",
    "00:00:02.000 --> 00:00:04.000",
    "Second line",
  ].join("\n");

  it("extracts cues (tolerating the header and cue ids)", () => {
    const cues = parseVtt(vtt);
    expect(cues).toHaveLength(2);
    expect(cues[0]).toEqual({ startMs: 0, endMs: 2000, text: "Hello world" });
    expect(cues[1].text).toBe("Second line");
  });

  it("finds the active cue by time", () => {
    const cues = parseVtt(vtt);
    expect(cueAt(cues, 1000)?.text).toBe("Hello world");
    expect(cueAt(cues, 3000)?.text).toBe("Second line");
    expect(cueAt(cues, 5000)).toBeNull();
  });
});

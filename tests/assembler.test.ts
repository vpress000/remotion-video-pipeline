import { describe, it, expect } from "vitest";
import { assembleVideoSpec } from "../src/agents/remotion.agent";
import { chunkText, subtitleCaptionAgent } from "../src/agents/subtitle-caption.agent";
import { consoleContext } from "../src/agents/types";
import { briefSchema } from "../src/schema/video-spec";
import type { CreativeDirection, EditPlan, MusicPlan, Script } from "../src/agents/contracts";

const brief = briefSchema.parse({ productName: "Test Serum", targetDurationSeconds: 20 });

const script: Script = {
  title: "Test",
  hook: "hook",
  callToAction: "Shop now at yourbrand.com",
  beats: [
    { sceneType: "intro", narration: "Meet the test serum for glowing skin.", onScreenText: "Glow" },
    { sceneType: "feature", narration: "Packed with vitamin C and hyaluronic acid.", onScreenText: "Powerful" },
    { sceneType: "cta", narration: "Shop now at yourbrand.com.", onScreenText: "Shop Now" },
  ],
};

const creative: CreativeDirection = {
  palette: { primary: "#F4B400", secondary: "#2E7D32", background: "#0E1B12", text: "#FFFFFF" },
  fontFamily: "Montserrat",
  mood: "calm",
  pacing: "medium",
  sceneVisuals: [
    { index: 0, visualIdea: "a", transition: "fade" },
    { index: 1, visualIdea: "b", transition: "slide" },
    { index: 2, visualIdea: "c", transition: "fade" },
  ],
};

const music: MusicPlan = { mood: "calm", bpm: 90, trackSuggestion: "soft acoustic", volume: 0.2 };

const editPlan: EditPlan = {
  scenes: [
    { index: 0, durationInSeconds: 3, footageHint: "x" },
    { index: 1, durationInSeconds: 6, footageHint: "y" },
    { index: 2, durationInSeconds: 3, footageHint: "z" },
  ],
};

describe("chunkText", () => {
  it("wraps text without dropping words", () => {
    const lines = chunkText("one two three four five six seven eight", 12);
    expect(lines.every((line) => line.length <= 12)).toBe(true);
    expect(lines.join(" ")).toBe("one two three four five six seven eight");
  });
});

describe("assembleVideoSpec", () => {
  it("normalizes scene durations to the brief target and validates", async () => {
    const captions = await subtitleCaptionAgent.run({ script, editPlan }, consoleContext);
    const spec = assembleVideoSpec({ brief, script, creative, music, editPlan, captions });

    const total = spec.scenes.reduce((sum, scene) => sum + scene.durationInSeconds, 0);
    expect(Math.round(total)).toBe(20);
    expect(spec.scenes).toHaveLength(3);
    expect(spec.scenes[1].transition).toBe("slide");
    expect(spec.brand.primary).toBe("#F4B400");
    expect(spec.captions.cues.length).toBeGreaterThan(0);
  });
});

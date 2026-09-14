import { describe, it, expect } from "vitest";
import {
  videoSpecSchema,
  briefSchema,
  specDurationInFrames,
} from "../src/schema/video-spec";
import sample from "../data/specs/sample.video-spec.json";

describe("videoSpecSchema", () => {
  it("parses the committed sample spec", () => {
    const spec = videoSpecSchema.parse(sample);
    expect(spec.scenes.length).toBeGreaterThan(0);
    expect(spec.title).toContain("Bee Naturals");
  });

  it("applies defaults for optional fields", () => {
    const spec = videoSpecSchema.parse({
      title: "Test",
      scenes: [{ id: "s1", type: "intro", durationInSeconds: 2, headline: "Hello" }],
    });
    expect(spec.fps).toBe(30);
    expect(spec.brand.name).toBe("Bee Naturals");
    expect(spec.scenes[0].transition).toBe("fade");
    expect(spec.scenes[0].bullets).toEqual([]);
    expect(spec.music.trackSrc).toBeNull();
  });

  it("computes total duration in frames", () => {
    const spec = videoSpecSchema.parse(sample);
    expect(specDurationInFrames(spec)).toBe(Math.round(19 * 30));
  });
});

describe("briefSchema", () => {
  it("defaults brand name and target duration", () => {
    const brief = briefSchema.parse({ productName: "Facial Nectar" });
    expect(brief.brandName).toBe("Bee Naturals");
    expect(brief.targetDurationSeconds).toBe(30);
  });
});

import type { Agent } from "./types";
import type { Brief, CaptionCue, VideoSpec } from "../schema/video-spec";
import { videoSpecSchema } from "../schema/video-spec";
import type { CreativeDirection, EditPlan, MusicPlan, Script } from "./contracts";

/**
 * RemotionAgent (deterministic).
 *
 * Assembles the outputs of the creative agents into a single Zod-validated
 * VideoSpec that the Remotion compositions consume. Scene durations are
 * normalized so the total matches the brief's target duration.
 */

export interface AssembleInput {
  brief: Brief;
  script: Script;
  creative: CreativeDirection;
  music: MusicPlan;
  editPlan: EditPlan;
  captions: CaptionCue[];
}

export const assembleVideoSpec = (input: AssembleInput): VideoSpec => {
  const { brief, script, creative, music, editPlan, captions } = input;
  const beatCount = script.beats.length;

  const rawDurations = script.beats.map(
    (_, i) => editPlan.scenes[i]?.durationInSeconds ?? brief.targetDurationSeconds / beatCount,
  );
  const total = rawDurations.reduce((a, b) => a + b, 0) || 1;
  const scale = brief.targetDurationSeconds / total;

  const scenes = script.beats.map((beat, i) => ({
    id: `scene-${i + 1}`,
    type: beat.sceneType,
    durationInSeconds: Math.max(1.5, Number((rawDurations[i] * scale).toFixed(2))),
    headline: beat.onScreenText,
    subtext: beat.narration,
    bullets: [] as string[],
    footageSrc: null,
    transition: creative.sceneVisuals[i]?.transition ?? "fade",
  }));

  const spec = {
    title: script.title,
    brand: {
      name: brief.brandName,
      primary: creative.palette.primary,
      secondary: creative.palette.secondary,
      background: creative.palette.background,
      text: creative.palette.text,
      fontFamily: creative.fontFamily,
      logoSrc: null,
    },
    fps: 30,
    scenes,
    captions: { enabled: true, vttSrc: null, cues: captions },
    music: { mood: music.mood, trackSrc: null, volume: music.volume },
    callToAction: script.callToAction,
  };

  return videoSpecSchema.parse(spec);
};

export const remotionAgent: Agent<AssembleInput, VideoSpec> = {
  name: "RemotionAgent",
  async run(input, ctx) {
    ctx.log("Assembling the final VideoSpec");
    return assembleVideoSpec(input);
  },
};

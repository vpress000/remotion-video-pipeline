import type { Agent } from "./types";
import { generateJSON } from "./llm/client";
import type { Brief } from "../schema/video-spec";
import { musicPlanSchema, type CreativeDirection, type MusicPlan } from "./contracts";

const SYSTEM = `You are AudioBGMAgent. You plan background music for a product video.
You DO NOT generate audio. You describe a royalty-free track to source (mood, instrumentation, tempo)
and choose a sensible mix volume (0.0-1.0, usually 0.12-0.25 so narration stays clear).
Match tempo (bpm) to the creative pacing: slow ~70-90, medium ~90-110, fast ~110-140.
Return ONLY the JSON object: { mood, bpm, trackSuggestion, volume }.`;

export const audioBgmAgent: Agent<{ brief: Brief; creative: CreativeDirection }, MusicPlan> = {
  name: "AudioBGMAgent",
  async run({ brief, creative }, ctx) {
    ctx.log("Planning background music (royalty-free brief)");
    const user = `Brand tone: ${brief.tone}. Creative mood: ${creative.mood}. Pacing: ${creative.pacing}.
Suggest one royalty-free track and mix settings. Return JSON only.`;
    return generateJSON({ system: SYSTEM, user, schema: musicPlanSchema, temperature: 0.5 });
  },
};

import type { Agent } from "./types";
import { generateJSON } from "./llm/client";
import type { Brief } from "../schema/video-spec";
import { creativeDirectionSchema, type CreativeDirection, type Script } from "./contracts";

const SYSTEM = `You are CreativeDirectorAgent for consumer product videos.
Given a script, define the visual language: color palette, typography, mood, pacing, and a per-beat visual idea + transition.
Color rules:
- Return palette values as hex strings (e.g. "#0E1B12").
- Ensure text contrasts strongly against background (WCAG-ish).
- Choose a palette that fits the brand tone and product described in the brief.
sceneVisuals must include one entry per script beat, indexed from 0.
transition is one of: none, fade, slide, zoom.
Return ONLY the JSON object described by the schema.`;

export const creativeDirectorAgent: Agent<{ brief: Brief; script: Script }, CreativeDirection> = {
  name: "CreativeDirectorAgent",
  async run({ brief, script }, ctx) {
    ctx.log("Defining palette, typography, pacing, and per-beat visuals");
    const user = `Brand: ${brief.brandName}. Tone: ${brief.tone}.
Script title: ${script.title}
Beats (${script.beats.length}):
${script.beats.map((b, i) => `${i}. [${b.sceneType}] ${b.onScreenText} — ${b.narration}`).join("\n")}
Return JSON only with palette, fontFamily, mood, pacing, and sceneVisuals (one per beat).`;
    return generateJSON({
      system: SYSTEM,
      user,
      schema: creativeDirectionSchema,
      temperature: 0.6,
    });
  },
};

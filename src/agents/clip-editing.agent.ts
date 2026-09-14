import type { Agent } from "./types";
import { generateJSON } from "./llm/client";
import type { Brief } from "../schema/video-spec";
import { editPlanSchema, type EditPlan, type Script } from "./contracts";

const SYSTEM = `You are ClipEditingAgent. You turn a script into an edit plan by allocating a duration
(in seconds) to each beat and giving a short footage hint (what b-roll/clip to show).
Rules:
- One scene entry per script beat, indexed from 0.
- Intro and outro/cta beats are usually shorter (1.5-3s); feature/product beats can be longer.
- The total of all durations should be close to the requested target duration.
Return ONLY the JSON object: { scenes: [{ index, durationInSeconds, footageHint }] }.`;

export const clipEditingAgent: Agent<{ brief: Brief; script: Script }, EditPlan> = {
  name: "ClipEditingAgent",
  async run({ brief, script }, ctx) {
    ctx.log(`Allocating scene durations toward ${brief.targetDurationSeconds}s`);
    const user = `Target total duration: ${brief.targetDurationSeconds} seconds.
Beats (${script.beats.length}):
${script.beats.map((b, i) => `${i}. [${b.sceneType}] ${b.onScreenText}`).join("\n")}
Return JSON only with one scene per beat.`;
    return generateJSON({ system: SYSTEM, user, schema: editPlanSchema, temperature: 0.3 });
  },
};

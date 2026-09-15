import type { Agent } from "./types";
import { generateJSON } from "./llm/client";
import type { Brief } from "../schema/video-spec";
import { scriptSchema, type Script } from "./contracts";

const SYSTEM = `You are ScriptCopywritingAgent, an expert short-form video copywriter for consumer product brands.
Write concise, benefit-led scripts for product videos.
Voice: warm, premium, trustworthy — adapt to the brand tone in the brief.
Hard rules:
- Never invent unsupported medical, health, or performance claims. Use honest product benefits only.
- Narration: 1-2 short sentences per beat.
- onScreenText: <= 6 words, punchy.
Return ONLY a JSON object: { title, hook, beats[] (sceneType, narration, onScreenText), callToAction }.
The first beat must be sceneType "intro" and the last "outro" or "cta".`;

export const scriptCopywritingAgent: Agent<Brief, Script> = {
  name: "ScriptCopywritingAgent",
  async run(brief, ctx) {
    ctx.log(`Writing a ${brief.targetDurationSeconds}s script for "${brief.productName}"`);
    const user = `Write the script.
Product: ${brief.productName}
Brand: ${brief.brandName}
Tagline: ${brief.tagline ?? "(none)"}
Key ingredients: ${brief.keyIngredients.join(", ") || "(none)"}
Benefits: ${brief.benefits.join(", ") || "(none)"}
Audience: ${brief.targetAudience}
Tone: ${brief.tone}
Call to action: ${brief.callToAction}
Aim for ${Math.max(4, Math.round(brief.targetDurationSeconds / 5))} beats total. Return JSON only.`;
    return generateJSON({ system: SYSTEM, user, schema: scriptSchema, temperature: 0.8 });
  },
};

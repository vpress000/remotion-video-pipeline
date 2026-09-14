import type { Agent } from "./types";
import { generateJSON } from "./llm/client";
import type { Brief, VideoSpec } from "../schema/video-spec";
import { reviewSchema, type Review } from "./contracts";

const SYSTEM = `You are QualityReviewAgent, the final gate before a Bee Naturals video is rendered.
Review the assembled VideoSpec against the brief and brand rules.
Check: on-brand tone, no medical/drug claims, clear CTA, sensible pacing/durations,
readable captions, and that key benefits/ingredients from the brief are represented.
Score 0-100. Set pass=true only when score >= 80 and there are no critical issues.
List concrete issues and concrete fixes. Return ONLY: { pass, score, issues, fixes }.`;

export const qualityReviewAgent: Agent<{ brief: Brief; spec: VideoSpec }, Review> = {
  name: "QualityReviewAgent",
  async run({ brief, spec }, ctx) {
    ctx.log("Reviewing the assembled spec for brand + compliance");
    const user = `BRIEF:
${JSON.stringify(brief, null, 2)}

VIDEO SPEC:
${JSON.stringify(spec, null, 2)}

Return JSON only.`;
    return generateJSON({ system: SYSTEM, user, schema: reviewSchema, temperature: 0.2 });
  },
};

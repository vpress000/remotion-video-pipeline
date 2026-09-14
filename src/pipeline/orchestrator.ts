import { type AgentContext, consoleContext } from "../agents/types";
import { isLLMConfigured } from "../agents/llm/client";
import {
  scriptCopywritingAgent,
  creativeDirectorAgent,
  audioBgmAgent,
  clipEditingAgent,
  subtitleCaptionAgent,
  assembleVideoSpec,
  qualityReviewAgent,
} from "../agents";
import type { Brief, VideoSpec } from "../schema/video-spec";
import type { Review } from "../agents/contracts";

export interface PipelineResult {
  spec: VideoSpec;
  review: Review;
  attempts: number;
}

/**
 * Runs the full 7-agent planning pipeline:
 *   ScriptCopywriting -> CreativeDirector -> (AudioBGM || ClipEditing)
 *     -> SubtitleCaption -> RemotionAgent(assemble) -> QualityReview
 * On a failing review, it regenerates once with the reviewer's fixes folded in.
 */
export const runPipeline = async (
  brief: Brief,
  ctx: AgentContext = consoleContext,
): Promise<PipelineResult> => {
  if (!isLLMConfigured()) {
    throw new Error(
      "No LLM API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env. " +
        "You can still render the committed sample spec without a key (npm run studio).",
    );
  }

  const buildSpec = async (input: Brief): Promise<VideoSpec> => {
    const script = await scriptCopywritingAgent.run(input, ctx);
    const creative = await creativeDirectorAgent.run({ brief: input, script }, ctx);
    const [music, editPlan] = await Promise.all([
      audioBgmAgent.run({ brief: input, creative }, ctx),
      clipEditingAgent.run({ brief: input, script }, ctx),
    ]);
    const captions = await subtitleCaptionAgent.run({ script, editPlan }, ctx);
    return assembleVideoSpec({ brief: input, script, creative, music, editPlan, captions });
  };

  const maxAttempts = 2;
  let currentBrief = brief;
  let result: PipelineResult | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const spec = await buildSpec(currentBrief);
    const review = await qualityReviewAgent.run({ brief, spec }, ctx);
    ctx.log(`QualityReview attempt ${attempt}: score ${review.score}, pass=${review.pass}`);
    result = { spec, review, attempts: attempt };

    if (review.pass || attempt === maxAttempts) break;

    const feedback = (review.fixes.length ? review.fixes : review.issues).join("; ");
    currentBrief = {
      ...brief,
      tone: `${brief.tone}. Apply reviewer feedback: ${feedback}`,
    };
    ctx.log("Review failed — regenerating with reviewer feedback");
  }

  return result as PipelineResult;
};

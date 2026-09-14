import { z } from "zod";

/**
 * Intermediate contracts exchanged between agents in the planning pipeline.
 * Each LLM agent validates its output against one of these before passing it on.
 */

// ---- ScriptCopywritingAgent ----
export const scriptBeatSchema = z.object({
  sceneType: z.enum(["intro", "product", "feature", "testimonial", "cta", "outro"]),
  narration: z.string(),
  onScreenText: z.string(),
});
export const scriptSchema = z.object({
  title: z.string(),
  hook: z.string(),
  beats: z.array(scriptBeatSchema).min(2),
  callToAction: z.string(),
});
export type Script = z.infer<typeof scriptSchema>;

// ---- CreativeDirectorAgent ----
export const creativeDirectionSchema = z.object({
  palette: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  fontFamily: z.string(),
  mood: z.string(),
  pacing: z.enum(["slow", "medium", "fast"]),
  sceneVisuals: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      visualIdea: z.string(),
      transition: z.enum(["none", "fade", "slide", "zoom"]),
    }),
  ),
});
export type CreativeDirection = z.infer<typeof creativeDirectionSchema>;

// ---- AudioBGMAgent ----
export const musicPlanSchema = z.object({
  mood: z.string(),
  bpm: z.number().int().positive().max(220),
  /** A description of the royalty-free track to source (no audio is generated). */
  trackSuggestion: z.string(),
  volume: z.number().min(0).max(1),
});
export type MusicPlan = z.infer<typeof musicPlanSchema>;

// ---- ClipEditingAgent ----
export const editPlanSchema = z.object({
  scenes: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        durationInSeconds: z.number().positive().max(60),
        footageHint: z.string(),
      }),
    )
    .min(2),
});
export type EditPlan = z.infer<typeof editPlanSchema>;

// ---- QualityReviewAgent ----
export const reviewSchema = z.object({
  pass: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(z.string()),
  fixes: z.array(z.string()),
});
export type Review = z.infer<typeof reviewSchema>;

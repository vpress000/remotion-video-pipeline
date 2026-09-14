import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/**
 * The VideoSpec is the single contract between the AI planning layer and the
 * Remotion renderer. The planning pipeline produces one of these; the Remotion
 * compositions consume it as (Zod-validated) input props.
 */

export const sceneTypeSchema = z.enum([
  "intro",
  "product",
  "feature",
  "testimonial",
  "cta",
  "outro",
]);
export type SceneType = z.infer<typeof sceneTypeSchema>;

export const transitionSchema = z.enum(["none", "fade", "slide", "zoom"]);
export type Transition = z.infer<typeof transitionSchema>;

export const sceneSchema = z.object({
  id: z.string(),
  type: sceneTypeSchema,
  durationInSeconds: z.number().positive().max(60),
  headline: z.string(),
  subtext: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  /** Filename (in the footage dir) or absolute path. Null => branded gradient. */
  footageSrc: z.string().nullable().default(null),
  backgroundColor: zColor().optional(),
  transition: transitionSchema.default("fade"),
});
export type Scene = z.infer<typeof sceneSchema>;

export const captionCueSchema = z.object({
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
  text: z.string(),
});
export type CaptionCue = z.infer<typeof captionCueSchema>;

export const captionsSchema = z.object({
  enabled: z.boolean().default(true),
  /** A .vtt filename in the captions dir. When set, run `npm run prep:captions` to inline it into `cues`. */
  vttSrc: z.string().nullable().default(null),
  cues: z.array(captionCueSchema).default([]),
});
export type Captions = z.infer<typeof captionsSchema>;

export const musicSchema = z.object({
  mood: z.string().default("calm, uplifting"),
  /** Filename inside assets/audio (a royalty-free track you supply). Null => silent. */
  trackSrc: z.string().nullable().default(null),
  volume: z.number().min(0).max(1).default(0.2),
});
export type Music = z.infer<typeof musicSchema>;

export const brandThemeSchema = z.object({
  name: z.string().default("Bee Naturals"),
  primary: zColor().default("#F4B400"),
  secondary: zColor().default("#2E7D32"),
  background: zColor().default("#0E1B12"),
  text: zColor().default("#FFFFFF"),
  fontFamily: z.string().default("Montserrat"),
  /** Logo filename in assets/brand or absolute path. Null => wordmark text. */
  logoSrc: z.string().nullable().default(null),
});
export type BrandTheme = z.infer<typeof brandThemeSchema>;

export const videoSpecSchema = z.object({
  title: z.string(),
  brand: brandThemeSchema.default({}),
  fps: z.number().int().positive().default(30),
  scenes: z.array(sceneSchema).min(1),
  captions: captionsSchema.default({}),
  music: musicSchema.default({}),
  callToAction: z.string().default("Shop now at beenaturals.com"),
});
export type VideoSpec = z.infer<typeof videoSpecSchema>;

/** Total spec duration in frames, given the spec's fps. */
export const specDurationInFrames = (spec: VideoSpec): number => {
  const totalSeconds = spec.scenes.reduce((sum, s) => sum + s.durationInSeconds, 0);
  return Math.max(1, Math.round(totalSeconds * spec.fps));
};

/** Input brief consumed by the planning pipeline. */
export const briefSchema = z.object({
  productName: z.string(),
  brandName: z.string().default("Bee Naturals"),
  tagline: z.string().optional(),
  keyIngredients: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  targetAudience: z.string().default("skincare-conscious adults"),
  tone: z.string().default("warm, natural, premium"),
  callToAction: z.string().default("Shop now at beenaturals.com"),
  targetDurationSeconds: z.number().positive().max(120).default(30),
});
export type Brief = z.infer<typeof briefSchema>;

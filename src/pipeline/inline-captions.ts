import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { videoSpecSchema } from "../schema/video-spec";
import { parseVtt } from "../captions/vtt";
import { pipelineConfig } from "../../config/pipeline.config";

/**
 * Inlines a .vtt caption file (referenced by `captions.vttSrc`) into a
 * VideoSpec's `captions.cues`, so the renderer needs no filesystem access.
 */
const program = new Command();
program
  .name("prep:captions")
  .option("-s, --spec <path>", "VideoSpec JSON to update", "data/specs/sample.video-spec.json")
  .option("-o, --out <path>", "Output path (defaults to in-place)")
  .parse();

const opts = program.opts() as { spec: string; out?: string };

const specPath = path.resolve(opts.spec);
const spec = videoSpecSchema.parse(JSON.parse(readFileSync(specPath, "utf-8")));

if (!spec.captions.vttSrc) {
  console.log("captions.vttSrc is not set — nothing to inline.");
  process.exit(0);
}

const vttPath = path.isAbsolute(spec.captions.vttSrc)
  ? spec.captions.vttSrc
  : path.join(pipelineConfig.captionsDir, spec.captions.vttSrc);

const cues = parseVtt(readFileSync(vttPath, "utf-8"));
spec.captions.cues = cues;

const outPath = path.resolve(opts.out ?? opts.spec);
writeFileSync(outPath, JSON.stringify(spec, null, 2), "utf-8");
console.log(`Inlined ${cues.length} cue(s) from ${vttPath}\n  -> ${outPath}`);

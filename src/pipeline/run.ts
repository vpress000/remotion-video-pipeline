import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { briefSchema } from "../schema/video-spec";
import { runPipeline } from "./orchestrator";
import { consoleContext } from "../agents/types";

const program = new Command();
program
  .name("plan")
  .description("Generate a VideoSpec from a product brief using the 7-agent pipeline")
  .option("-b, --brief <path>", "Path to a brief JSON file", "data/briefs/sample-product.json")
  .option(
    "-o, --out <path>",
    "Where to write the generated VideoSpec",
    "data/specs/generated.video-spec.json",
  )
  .parse();

const opts = program.opts() as { brief: string; out: string };

const main = async (): Promise<void> => {
  const briefPath = path.resolve(opts.brief);
  const brief = briefSchema.parse(JSON.parse(readFileSync(briefPath, "utf-8")));

  console.log(`\nPlanning video for "${brief.productName}"\n`);
  const { spec, review, attempts } = await runPipeline(brief, consoleContext);

  const outPath = path.resolve(opts.out);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(spec, null, 2), "utf-8");

  console.log(`\nDone in ${attempts} attempt(s). Review score: ${review.score} (pass=${review.pass}).`);
  if (review.issues.length) {
    console.log("Issues:\n" + review.issues.map((i) => ` - ${i}`).join("\n"));
  }
  console.log(`\nVideoSpec written to: ${opts.out}`);
  console.log("Render it with:  npm run studio   (or)   npm run render");
};

main().catch((error) => {
  console.error("\nPipeline failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

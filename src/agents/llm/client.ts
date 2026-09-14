import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { z } from "zod";

/**
 * Provider-agnostic LLM client used by every agent.
 *
 * - Selects Anthropic or OpenAI from `LLM_PROVIDER`.
 * - Reads the API key from the environment (never hard-coded).
 * - Coerces the model's reply into JSON and validates it with a Zod schema,
 *   retrying with the validation error fed back to the model.
 *
 * No API key is required to RENDER (the renderer reads a committed sample spec).
 * A key is only needed to run the planning pipeline (`npm run plan`).
 */

export type LLMProvider = "anthropic" | "openai";

export class MissingApiKeyError extends Error {}

export interface GenerateJSONOptions<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  temperature?: number;
  maxRetries?: number;
}

const resolveProvider = (): LLMProvider => {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase();
  if (provider !== "anthropic" && provider !== "openai") {
    throw new Error(`Unsupported LLM_PROVIDER "${provider}". Use "anthropic" or "openai".`);
  }
  return provider;
};

/** True when the selected provider has an API key available. */
export const isLLMConfigured = (): boolean => {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase();
  return provider === "openai"
    ? Boolean(process.env.OPENAI_API_KEY)
    : Boolean(process.env.ANTHROPIC_API_KEY);
};

const extractJson = (text: string): unknown => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in the model response.");
  }
  return JSON.parse(candidate.slice(start, end + 1));
};

const callAnthropic = async (system: string, user: string, temperature: number): Promise<string> => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError(
      "ANTHROPIC_API_KEY is not set. Add it to .env to run the planning pipeline.",
    );
  }
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    temperature,
    system,
    messages: [{ role: "user", content: user }],
  });
  return response.content.map((block) => (block.type === "text" ? block.text : "")).join("\n");
};

const callOpenAI = async (system: string, user: string, temperature: number): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError(
      "OPENAI_API_KEY is not set. Add it to .env to run the planning pipeline.",
    );
  }
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";
  const response = await client.chat.completions.create({
    model,
    temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
};

export const generateJSON = async <T>(options: GenerateJSONOptions<T>): Promise<T> => {
  const { system, user, schema, temperature = 0.7, maxRetries = 2 } = options;
  const provider = resolveProvider();
  let currentUser = user;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw =
      provider === "anthropic"
        ? await callAnthropic(system, currentUser, temperature)
        : await callOpenAI(system, currentUser, temperature);
    try {
      return schema.parse(extractJson(raw));
    } catch (error) {
      lastError = error;
      const detail = error instanceof Error ? error.message : String(error);
      currentUser =
        `${user}\n\nYour previous answer was rejected: ${detail}\n` +
        "Reply with ONLY a valid JSON object that matches the required schema.";
    }
  }

  const detail = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`LLM did not return schema-valid JSON after ${maxRetries + 1} attempts: ${detail}`);
};

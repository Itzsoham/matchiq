import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { TailorResultSchema, type TailorResult } from "@/lib/types";
import { buildTailorPrompt } from "@/lib/prompt";

const client = new Anthropic();

export async function tailorApplication(params: {
  resumeText: string;
  jdText: string;
  styleSamples: string;
}): Promise<TailorResult> {
  const prompt = buildTailorPrompt(params);

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(TailorResultSchema),
    },
    messages: [{ role: "user", content: prompt }],
  });

  if (response.parsed_output === null) {
    throw new Error("Model output did not match the expected schema");
  }

  return response.parsed_output;
}

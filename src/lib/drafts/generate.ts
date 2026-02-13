import { validateDraftRequest } from "../validation";
import { getToneProfile } from "../db/queries";

/**
 * Stub generator for MVP
 * In production, this would call an LLM API with the user's tone profile
 */
export function generateDraftText(topic: string, prompt: string, toneProfile?: { tone: string; style: string; audience: string }): string {
  const tone = toneProfile ? `${toneProfile.tone}, ${toneProfile.style}` : "professional, informative";
  const audience = toneProfile?.audience || "general";

  return `# ${topic}

[This is a generated draft based on your tone profile: ${tone} for ${audience} audience]

${prompt}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is where your AI-generated content would appear, tailored to match your unique writing style and tone.

The content would be based on:
- Topic: ${topic}
- Your prompt: ${prompt}
- Your tone profile: ${tone}
- Target audience: ${audience}

In a production implementation, this would use an LLM API to generate contextually relevant, high-quality content that matches your writing style.`;
}

/**
 * Validate draft generation request
 */
export function validateGenerateRequest(topic: string, prompt: string) {
  return validateDraftRequest(topic, prompt);
}

/**
 * Check if user has completed tone training
 */
export async function checkToneTraining(userId: string): Promise<boolean> {
  const profile = await getToneProfile(userId);
  return !!profile;
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }

  return null;
}

export function validateTrainingUrl(url: string): { ok: true; value: { url: string } } | { ok: false; errors: { url: string } } {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { ok: false, errors: { url: "URL is required" } };
  }

  return { ok: true, value: { url: trimmedUrl } };
}

export function validateDraftRequest(topic: string, prompt: string): { ok: true; value: { topic: string; prompt: string } } | { ok: false; errors: { topic?: string; prompt?: string } } {
  const trimmedTopic = topic.trim();
  const trimmedPrompt = prompt.trim();
  const errors: { topic?: string; prompt?: string } = {};

  if (!trimmedTopic) {
    errors.topic = "Topic is required";
  }

  if (!trimmedPrompt) {
    errors.prompt = "Prompt is required";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { topic: trimmedTopic, prompt: trimmedPrompt } };
}

import { validateTrainingUrl } from "./validation";

export interface ToneStatus {
  trained: boolean;
  trainedAt: string | null;
}

export interface TrainingViewModel {
  phase: "untrained" | "trained" | "justTrained";
  bannerText: string | null;
  showTrainingControls: boolean;
  inputsDisabled: boolean;
  showPasteSamplesCta: boolean;
  pasteSamplesHref?: string;
  showGenerateCta: boolean;
  generateHref?: string;
}

export function getTrainingViewModel({
  status,
  justTrained,
}: {
  status: ToneStatus;
  justTrained: boolean;
}): TrainingViewModel {
  // User just completed training
  if (justTrained) {
    return {
      phase: "justTrained",
      bannerText: "Training complete",
      showTrainingControls: false,
      inputsDisabled: true,
      showPasteSamplesCta: false,
      showGenerateCta: true,
      generateHref: "/generate",
    };
  }

  // User already trained (loaded from status)
  if (status.trained) {
    return {
      phase: "trained",
      bannerText: "Training already completed",
      showTrainingControls: false,
      inputsDisabled: true,
      showPasteSamplesCta: false,
      showGenerateCta: true,
      generateHref: "/generate",
    };
  }

  // User not trained yet
  return {
    phase: "untrained",
    bannerText: null,
    showTrainingControls: true,
    inputsDisabled: false,
    showPasteSamplesCta: true,
    pasteSamplesHref: "/train/samples",
    showGenerateCta: false,
  };
}

export async function submitTraining({
  status,
  url,
  trainApi,
}: {
  status: ToneStatus;
  url: string;
  trainApi: (url: string) => Promise<{ ok: true; trainedAt: string } | { ok: false; error: string }>;
}): Promise<
  | { ok: true; justTrained: boolean; nextStatus: ToneStatus }
  | { ok: false; fieldErrors: { url: string }; nextStatus: ToneStatus }
> {
  // If already trained, return early
  if (status.trained) {
    return { ok: true, justTrained: false, nextStatus: status };
  }

  // Validate URL
  const validation = validateTrainingUrl(url);
  if (!validation.ok) {
    return { ok: false, fieldErrors: validation.errors, nextStatus: status };
  }

  // Call training API
  const result = await trainApi(validation.value.url);

  if (!result.ok) {
    return { ok: false, fieldErrors: { url: result.error }, nextStatus: status };
  }

  // Update status
  const nextStatus: ToneStatus = {
    trained: true,
    trainedAt: result.trainedAt,
  };

  return { ok: true, justTrained: true, nextStatus };
}

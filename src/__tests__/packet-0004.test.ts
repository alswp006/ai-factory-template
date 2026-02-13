import { describe, it, expect } from "vitest";

import { validateTrainingUrl } from "../../src/lib/validation";
import {
  getTrainingViewModel,
  submitTraining,
  type ToneStatus,
  type TrainingViewModel,
} from "../../src/lib/training";
import { GET, __toneProfileStore } from "../../src/app/api/tone/status/route";

describe("packet 0004 - src/lib/validation.ts", () => {
  it("validates empty URL as required", () => {
    const res = validateTrainingUrl("  ");
    expect(res.ok).toBe(false);
    expect(res.errors.url).toBe("URL is required");
  });

  it("accepts a non-empty URL", () => {
    const res = validateTrainingUrl("https://example.com");
    expect(res.ok).toBe(true);
    expect(res.value.url).toBe("https://example.com");
  });
});

describe("packet 0004 - tone status API (src/app/api/tone/status/route.ts)", () => {
  it("returns 401 when not logged in (no x-user-id header)", async () => {
    const req = new Request("http://test.local/api/tone/status");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "UNAUTHENTICATED" });
  });

  it("returns trained=false when user has no stored tone profile", async () => {
    __toneProfileStore.clear();

    const req = new Request("http://test.local/api/tone/status", {
      headers: { "x-user-id": "user-1" },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ trained: false, trainedAt: null });
  });

  it("returns trained=true when user has trainedAt timestamp", async () => {
    __toneProfileStore.clear();
    __toneProfileStore.set("user-2", { trainedAt: "2025-01-01T00:00:00.000Z" });

    const req = new Request("http://test.local/api/tone/status", {
      headers: { "x-user-id": "user-2" },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ trained: true, trainedAt: "2025-01-01T00:00:00.000Z" });
  });
});

describe("packet 0004 - UI gating view-model (src/lib/training.ts)", () => {
  it("maps trained status to 'already completed' state with training controls hidden/disabled", () => {
    const status: ToneStatus = { trained: true, trainedAt: "2025-01-01T00:00:00.000Z" };
    const vm: TrainingViewModel = getTrainingViewModel({ status, justTrained: false });

    expect(vm.phase).toBe("trained");
    expect(vm.bannerText).toBe("Training already completed");
    expect(vm.showTrainingControls).toBe(false);
    expect(vm.inputsDisabled).toBe(true);
    expect(vm.showPasteSamplesCta).toBe(false);
    expect(vm.showGenerateCta).toBe(true);
    expect(vm.generateHref).toBe("/generate");
  });

  it("maps untrained status to show URL input + train button + paste samples CTA", () => {
    const status: ToneStatus = { trained: false, trainedAt: null };
    const vm: TrainingViewModel = getTrainingViewModel({ status, justTrained: false });

    expect(vm.phase).toBe("untrained");
    expect(vm.bannerText).toBe(null);
    expect(vm.showTrainingControls).toBe(true);
    expect(vm.inputsDisabled).toBe(false);
    expect(vm.showPasteSamplesCta).toBe(true);
    expect(vm.pasteSamplesHref).toBe("/train/samples");
    expect(vm.showGenerateCta).toBe(false);
  });

  it("maps successful training completion to 'Training complete' + enables CTA to /generate", () => {
    const status: ToneStatus = { trained: false, trainedAt: null };
    const vm: TrainingViewModel = getTrainingViewModel({ status, justTrained: true });

    expect(vm.phase).toBe("justTrained");
    expect(vm.bannerText).toBe("Training complete");
    expect(vm.showTrainingControls).toBe(false);
    expect(vm.inputsDisabled).toBe(true);
    expect(vm.showGenerateCta).toBe(true);
    expect(vm.generateHref).toBe("/generate");
  });
});

describe("packet 0004 - submitTraining controller logic (src/lib/training.ts)", () => {
  it("does not call training API when URL is empty and returns required-field validation", async () => {
    const status: ToneStatus = { trained: false, trainedAt: null };

    let calls = 0;
    const trainApi = async (_url: string) => {
      calls += 1;
      return { ok: true as const, trainedAt: "2025-01-01T00:00:00.000Z" };
    };

    const result = await submitTraining({ status, url: " ", trainApi });

    expect(calls).toBe(0);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.url).toBe("URL is required");
    expect(result.nextStatus).toEqual(status);
  });

  it("calls training API once when untrained and URL is provided; returns updated status + justTrained=true", async () => {
    const status: ToneStatus = { trained: false, trainedAt: null };

    let calls = 0;
    let seenUrl: string | null = null;
    const trainApi = async (url: string) => {
      calls += 1;
      seenUrl = url;
      return { ok: true as const, trainedAt: "2025-02-02T03:04:05.000Z" };
    };

    const result = await submitTraining({
      status,
      url: "https://example.com",
      trainApi,
    });

    expect(calls).toBe(1);
    expect(seenUrl).toBe("https://example.com");

    expect(result.ok).toBe(true);
    expect(result.justTrained).toBe(true);
    expect(result.nextStatus).toEqual({ trained: true, trainedAt: "2025-02-02T03:04:05.000Z" });

    const vm = getTrainingViewModel({ status: result.nextStatus, justTrained: result.justTrained });
    expect(vm.bannerText).toBe("Training complete");
    expect(vm.showGenerateCta).toBe(true);
    expect(vm.generateHref).toBe("/generate");
  });

  it("does not call training API when already trained; returns stable trained view model intent", async () => {
    const status: ToneStatus = { trained: true, trainedAt: "2025-01-01T00:00:00.000Z" };

    let calls = 0;
    const trainApi = async (_url: string) => {
      calls += 1;
      return { ok: true as const, trainedAt: "2025-02-02T03:04:05.000Z" };
    };

    const result = await submitTraining({ status, url: "https://example.com", trainApi });

    expect(calls).toBe(0);
    expect(result.ok).toBe(true);
    expect(result.justTrained).toBe(false);
    expect(result.nextStatus).toEqual(status);

    const vm = getTrainingViewModel({ status: result.nextStatus, justTrained: result.justTrained });
    expect(vm.phase).toBe("trained");
    expect(vm.bannerText).toBe("Training already completed");
  });
});

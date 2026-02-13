import { describe, it, expect, vi } from "vitest";

// ---------- Helpers ----------
async function jsonOf(res: Response) {
  return await res.json();
}

// ---------- API: /api/drafts/list ----------
describe("Packet 0007 - API /api/drafts/list", () => {
  it("returns 200 + empty list when user has no drafts", async () => {
    vi.resetModules();

    vi.mock("@/lib/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user_1" })),
    }));

    vi.mock("@/lib/db/queries", () => ({
      listDraftsByUserId: vi.fn(async () => []),
    }));

    const { GET } = await import("@/app/api/drafts/list/route");

    const req = new Request("http://localhost/api/drafts/list");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await jsonOf(res);
    expect(body).toEqual({ drafts: [] });
  });

  it("returns drafts for the current user (createdAt + request summary present)", async () => {
    vi.resetModules();

    vi.mock("@/lib/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user_1" })),
    }));

    const drafts = [
      {
        id: "d1",
        createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
        requestSummary: "Make it concise",
      },
      {
        id: "d2",
        createdAt: new Date("2024-01-02T00:00:00.000Z").toISOString(),
        requestSummary: "Add examples",
      },
    ];

    vi.mock("@/lib/db/queries", () => ({
      listDraftsByUserId: vi.fn(async () => drafts),
    }));

    const { GET } = await import("@/app/api/drafts/list/route");

    const req = new Request("http://localhost/api/drafts/list");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await jsonOf(res);
    expect(body.drafts).toHaveLength(2);
    expect(body.drafts[0]).toMatchObject({ id: "d1", requestSummary: "Make it concise" });
    expect(body.drafts[0].createdAt).toBeTruthy();
  });
});

// ---------- API: /api/drafts/[id] ----------
describe("Packet 0007 - API /api/drafts/[id]", () => {
  it("returns 404 when accessing another user's draft (no content leak)", async () => {
    vi.resetModules();

    vi.mock("@/lib/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user_1" })),
    }));

    vi.mock("@/lib/db/queries", () => ({
      getDraftByIdForUserId: vi.fn(async () => null),
    }));

    const { GET } = await import("@/app/api/drafts/[id]/route");

    const req = new Request("http://localhost/api/drafts/d_other");
    const res = await GET(req, { params: Promise.resolve({ id: "d_other" }) } as any);

    expect(res.status).toBe(404);
    const body = await jsonOf(res);
    // Only assert minimal error shape to avoid coupling.
    expect(body).toMatchObject({ error: expect.any(String) });
  });

  it("returns 200 + draft when owned by user", async () => {
    vi.resetModules();

    vi.mock("@/lib/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user_1" })),
    }));

    const draft = {
      id: "d1",
      generatedText: "original",
      editedText: "edited",
      createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
      requestSummary: "summary",
    };

    vi.mock("@/lib/db/queries", () => ({
      getDraftByIdForUserId: vi.fn(async () => draft),
    }));

    const { GET } = await import("@/app/api/drafts/[id]/route");

    const req = new Request("http://localhost/api/drafts/d1");
    const res = await GET(req, { params: Promise.resolve({ id: "d1" }) } as any);

    expect(res.status).toBe(200);
    const body = await jsonOf(res);
    expect(body).toMatchObject({ draft: { id: "d1" } });
    expect(body.draft.generatedText).toBe("original");
    expect(body.draft.editedText).toBe("edited");
  });
});

// ---------- API: /api/drafts/[id]/edit ----------
describe("Packet 0007 - API /api/drafts/[id]/edit", () => {
  it("persists editedText and returns updated draft", async () => {
    vi.resetModules();

    vi.mock("@/lib/auth", () => ({
      requireUser: vi.fn(async () => ({ id: "user_1" })),
    }));

    const updateDraftEditedText = vi.fn(async ({ id, userId, editedText }: any) => ({
      id,
      userId,
      editedText,
    }));

    vi.mock("@/lib/db/queries", () => ({
      updateDraftEditedText,
    }));

    const { POST } = await import("@/app/api/drafts/[id]/edit/route");

    const req = new Request("http://localhost/api/drafts/d1/edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ editedText: "new text" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "d1" }) } as any);

    expect(res.status).toBe(200);
    const body = await jsonOf(res);
    expect(updateDraftEditedText).toHaveBeenCalledWith({
      id: "d1",
      userId: "user_1",
      editedText: "new text",
    });
    expect(body).toMatchObject({ draft: { id: "d1", editedText: "new text" } });
  });
});

// ---------- Utility: clipboard ----------
describe("Packet 0007 - lib/clipboard", () => {
  it("does not attempt clipboard write when text is empty (Nothing to copy)", async () => {
    vi.resetModules();

    const writeText = vi.fn(async () => undefined);
    (globalThis as any).navigator = { clipboard: { writeText } };

    const { copyToClipboard } = await import("@/lib/clipboard");

    const result = await copyToClipboard("");

    expect(writeText).not.toHaveBeenCalled();
    // Avoid strict return coupling: just ensure it signals failure/empty.
    expect(result).not.toBe(true);
  });

  it("copies to clipboard and signals success when text is non-empty", async () => {
    vi.resetModules();

    const writeText = vi.fn(async () => undefined);
    (globalThis as any).navigator = { clipboard: { writeText } };

    const { copyToClipboard } = await import("@/lib/clipboard");

    const result = await copyToClipboard("hello");

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result).toBe(true);
  });

  it("handles clipboard write failure gracefully", async () => {
    vi.resetModules();

    const writeText = vi.fn(async () => {
      throw new Error("denied");
    });
    (globalThis as any).navigator = { clipboard: { writeText } };

    const { copyToClipboard } = await import("@/lib/clipboard");

    const result = await copyToClipboard("hello");

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });
});

import { prisma } from "../db";

/**
 * Get user's tone profile (user-scoped)
 */
export async function getToneProfile(userId: string) {
  return prisma.toneProfile.findUnique({
    where: { userId: parseInt(userId, 10) },
  });
}

/**
 * Create or update user's tone profile (user-scoped)
 */
export async function upsertToneProfile(
  userId: string,
  data: { tone: string; style: string; audience: string }
) {
  return prisma.toneProfile.upsert({
    where: { userId: parseInt(userId, 10) },
    update: data,
    create: {
      userId: parseInt(userId, 10),
      ...data,
    },
  });
}

/**
 * Get all drafts for a user (user-scoped)
 */
export async function getDrafts(userId: string) {
  return prisma.draft.findMany({
    where: { userId: parseInt(userId, 10) },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Get a single draft by ID (user-scoped)
 */
export async function getDraft(draftId: string, userId: string) {
  return prisma.draft.findFirst({
    where: {
      id: parseInt(draftId, 10),
      userId: parseInt(userId, 10),
    },
  });
}

/**
 * Create a new draft (user-scoped)
 */
export async function createDraft(
  userId: string,
  data: { title: string; generatedText: string; editedText?: string }
) {
  return prisma.draft.create({
    data: {
      userId: parseInt(userId, 10),
      ...data,
    },
  });
}

/**
 * Update a draft (user-scoped)
 */
export async function updateDraft(
  draftId: string,
  userId: string,
  data: { title?: string; editedText?: string }
) {
  return prisma.draft.updateMany({
    where: {
      id: parseInt(draftId, 10),
      userId: parseInt(userId, 10),
    },
    data,
  });
}

/**
 * Delete a draft (user-scoped)
 */
export async function deleteDraft(draftId: string, userId: string) {
  return prisma.draft.deleteMany({
    where: {
      id: parseInt(draftId, 10),
      userId: parseInt(userId, 10),
    },
  });
}

/**
 * List drafts for a user (for history view)
 * Returns minimal fields: id, createdAt, requestSummary (derived from title)
 */
export async function listDraftsByUserId(userId: string) {
  const drafts = await prisma.draft.findMany({
    where: { userId: parseInt(userId, 10) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      title: true,
    },
  });

  return drafts.map((draft) => ({
    id: draft.id.toString(),
    createdAt: draft.createdAt.toISOString(),
    requestSummary: draft.title,
  }));
}

/**
 * Get a single draft by ID for a user (user-scoped)
 * Returns null if not found or not owned by user
 */
export async function getDraftByIdForUserId(id: string, userId: string) {
  const draft = await prisma.draft.findFirst({
    where: {
      id: parseInt(id, 10),
      userId: parseInt(userId, 10),
    },
  });

  if (!draft) return null;

  return {
    id: draft.id.toString(),
    generatedText: draft.generatedText,
    editedText: draft.editedText,
    createdAt: draft.createdAt.toISOString(),
    requestSummary: draft.title,
  };
}

/**
 * Update editedText for a draft (user-scoped)
 * Returns the updated draft or null if not found/not owned
 */
export async function updateDraftEditedText({
  id,
  userId,
  editedText,
}: {
  id: string;
  userId: string;
  editedText: string;
}) {
  // First verify ownership
  const existing = await prisma.draft.findFirst({
    where: {
      id: parseInt(id, 10),
      userId: parseInt(userId, 10),
    },
  });

  if (!existing) return null;

  const updated = await prisma.draft.update({
    where: { id: parseInt(id, 10) },
    data: { editedText },
  });

  return {
    id: updated.id.toString(),
    userId: updated.userId.toString(),
    editedText: updated.editedText,
  };
}

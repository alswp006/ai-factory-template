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

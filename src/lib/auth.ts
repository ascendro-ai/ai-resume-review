import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function ensureUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Upsert user in our DB on first API call
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    const clerkUser = await currentUser();
    await prisma.user.create({
      data: {
        id: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || null,
        name: clerkUser?.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : null,
      },
    });
  }

  return userId;
}

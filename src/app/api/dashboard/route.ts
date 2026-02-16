import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { scorecardCount: true, reworkCredits: true },
  });

  const scorecards = await prisma.scorecard.findMany({
    where: { resume: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      overallScore: true,
      createdAt: true,
      resume: { select: { fileName: true } },
    },
  });

  const reworkSessions = await prisma.reworkSession.findMany({
    where: { resume: { userId: session.user.id } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      currentBulletIndex: true,
      totalBullets: true,
      createdAt: true,
      updatedAt: true,
      resume: { select: { fileName: true } },
    },
  });

  return NextResponse.json({ user, scorecards, reworkSessions });
}

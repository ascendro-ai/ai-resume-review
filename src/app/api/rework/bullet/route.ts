import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReworkQuestion, rewriteBullet } from "@/lib/claude";
import { checkRateLimit } from "@/lib/rate-limit";

// POST: Get question for a bullet or submit user explanation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 bullet interactions per minute per user
  const { allowed } = checkRateLimit(`rework:${session.user.id}`, 10);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const { bulletId, action, userExplanation } = await req.json();

  const bullet = await prisma.reworkBullet.findUnique({
    where: { id: bulletId },
    include: {
      reworkSession: {
        include: {
          resume: { select: { userId: true } },
        },
      },
    },
  });

  if (!bullet || bullet.reworkSession.resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Bullet not found" }, { status: 404 });
  }

  if (action === "ask") {
    // Claude asks the user about this bullet
    const question = await getReworkQuestion(
      bullet.originalText,
      bullet.sectionTitle
    );

    await prisma.reworkBullet.update({
      where: { id: bulletId },
      data: { status: "in_conversation" },
    });

    return NextResponse.json({ question });
  }

  if (action === "rewrite") {
    // User has explained, Claude rewrites
    if (!userExplanation) {
      return NextResponse.json(
        { error: "Please provide your explanation" },
        { status: 400 }
      );
    }

    const result = await rewriteBullet(
      bullet.originalText,
      userExplanation,
      bullet.sectionTitle
    );

    await prisma.reworkBullet.update({
      where: { id: bulletId },
      data: {
        userExplanation,
        revisedText: result.revisedBullet,
      },
    });

    return NextResponse.json({
      revisedBullet: result.revisedBullet,
      explanation: result.explanation,
    });
  }

  if (action === "accept") {
    // User accepts the revised bullet
    const revisedText = userExplanation; // In this case, it might be an edited version
    await prisma.reworkBullet.update({
      where: { id: bulletId },
      data: {
        status: "accepted",
        ...(revisedText ? { revisedText } : {}),
      },
    });

    // Update session progress
    const acceptedCount = await prisma.reworkBullet.count({
      where: {
        reworkSessionId: bullet.reworkSessionId,
        status: "accepted",
      },
    });

    const totalBullets = bullet.reworkSession.totalBullets;

    await prisma.reworkSession.update({
      where: { id: bullet.reworkSessionId },
      data: {
        currentBulletIndex: acceptedCount,
        ...(acceptedCount >= totalBullets ? { status: "completed" } : {}),
      },
    });

    return NextResponse.json({
      accepted: true,
      progress: { completed: acceptedCount, total: totalBullets },
      sessionCompleted: acceptedCount >= totalBullets,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateScorecard } from "@/lib/claude";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 scorecard requests per minute per user
  const { allowed } = checkRateLimit(`scorecard:${session.user.id}`, 5);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // Check scorecard limit
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.scorecardCount >= 3) {
    return NextResponse.json(
      { error: "You've used all 3 free scorecards. Upgrade to get more." },
      { status: 403 }
    );
  }

  const { resumeId } = await req.json();

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId, userId: session.user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const result = await generateScorecard(resume.extractedText);

  const scorecard = await prisma.scorecard.create({
    data: {
      resumeId: resume.id,
      overallScore: result.overallScore,
      strengths: result.strengths,
      improvements: result.improvements,
      sectionScores: result.sectionScores,
      formatFeedback: result.formatFeedback,
    },
  });

  // Increment scorecard count
  await prisma.user.update({
    where: { id: session.user.id },
    data: { scorecardCount: { increment: 1 } },
  });

  return NextResponse.json({ scorecard });
}

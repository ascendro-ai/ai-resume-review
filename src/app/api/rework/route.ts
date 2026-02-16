import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeIntoBullets } from "@/lib/pdf";

// POST: Start a new rework session
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.reworkCredits < 1) {
    return NextResponse.json(
      { error: "No rework credits remaining. Please purchase a rework session." },
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

  const bullets = parseResumeIntoBullets(resume.extractedText);

  if (bullets.length === 0) {
    return NextResponse.json(
      { error: "No bullet points found in resume to rework." },
      { status: 400 }
    );
  }

  // Deduct credit
  await prisma.user.update({
    where: { id: session.user.id },
    data: { reworkCredits: { decrement: 1 } },
  });

  // Create rework session with all bullets
  const reworkSession = await prisma.reworkSession.create({
    data: {
      resumeId: resume.id,
      totalBullets: bullets.length,
      bullets: {
        create: bullets.map((b) => ({
          sectionTitle: b.sectionTitle,
          originalText: b.text,
          order: b.order,
        })),
      },
    },
    include: {
      bullets: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json({ reworkSession });
}

// GET: Retrieve an existing rework session
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const reworkSession = await prisma.reworkSession.findUnique({
    where: { id: sessionId },
    include: {
      bullets: { orderBy: { order: "asc" } },
      resume: { select: { userId: true } },
    },
  });

  if (!reworkSession || reworkSession.resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ reworkSession });
}

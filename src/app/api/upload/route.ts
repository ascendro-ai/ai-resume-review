import { NextRequest, NextResponse } from "next/server";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTextFromPdf, parseResumeIntoBullets } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await ensureUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are accepted" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extractedText = await extractTextFromPdf(buffer);

  if (!extractedText || extractedText.trim().length < 50) {
    return NextResponse.json(
      { error: "Could not extract text from PDF. Please ensure it's not a scanned image." },
      { status: 400 }
    );
  }

  const resume = await prisma.resume.create({
    data: {
      userId,
      extractedText,
      fileName: file.name,
    },
  });

  const bullets = parseResumeIntoBullets(extractedText);

  return NextResponse.json({
    resumeId: resume.id,
    extractedText,
    bullets,
    fileName: file.name,
  });
}

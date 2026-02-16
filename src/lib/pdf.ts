import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ verbosity: 0, data: new Uint8Array(buffer) });
  const result = await parser.getText();
  return result.pages.map((p: { text: string }) => p.text).join("\n");
}

export interface ParsedBullet {
  sectionTitle: string;
  text: string;
  order: number;
}

export function parseResumeIntoBullets(text: string): ParsedBullet[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bullets: ParsedBullet[] = [];

  // Common resume section headers
  const sectionPatterns = [
    /^(education|academic)/i,
    /^(experience|work|professional|employment)/i,
    /^(leadership|extracurricular|activities|volunteer)/i,
    /^(skills|interests|technical|languages|certifications)/i,
    /^(projects|research)/i,
    /^(awards|honors|achievements)/i,
  ];

  let currentSection = "General";
  let order = 0;

  for (const line of lines) {
    // Check if this line is a section header
    const isHeader = sectionPatterns.some((p) => p.test(line));
    if (isHeader) {
      currentSection = line.replace(/[:\-–—]/g, "").trim();
      continue;
    }

    // Skip very short lines (likely names, dates, contact info)
    if (line.length < 15) continue;

    // Detect bullet points: lines starting with bullet chars, dashes, or action verbs
    const isBullet =
      /^[•·▪▸\-–—*]/.test(line) ||
      /^(Led|Managed|Developed|Created|Analyzed|Built|Designed|Implemented|Launched|Drove|Conducted|Collaborated|Spearheaded|Orchestrated|Optimized|Streamlined|Established|Generated|Delivered|Executed|Facilitated|Coordinated|Mentored|Trained|Negotiated|Achieved|Increased|Decreased|Reduced|Improved|Raised|Grew|Expanded|Authored|Published|Presented|Researched|Assessed|Evaluated)/i.test(
        line
      );

    if (isBullet) {
      // Clean up bullet characters
      const cleanText = line.replace(/^[•·▪▸\-–—*]\s*/, "").trim();
      if (cleanText.length > 10) {
        bullets.push({
          sectionTitle: currentSection,
          text: cleanText,
          order: order++,
        });
      }
    }
  }

  return bullets;
}

import jsPDF from "jspdf";

interface BulletData {
  sectionTitle: string;
  originalText: string;
  revisedText: string | null;
  order: number;
}

export function generateResumePDF(
  bullets: BulletData[],
  userName?: string
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 54; // ~0.75 inch margins
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(userName || "Your Name", pageWidth / 2, y, { align: "center" });
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "your.email@email.com  |  (555) 555-5555  |  City, State",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 8;

  // Divider line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // --- Group bullets by section ---
  const sections: Record<string, BulletData[]> = {};
  for (const bullet of bullets) {
    if (!sections[bullet.sectionTitle]) {
      sections[bullet.sectionTitle] = [];
    }
    sections[bullet.sectionTitle].push(bullet);
  }

  // Sort bullets within each section
  for (const key in sections) {
    sections[key].sort((a, b) => a.order - b.order);
  }

  // --- Render sections ---
  doc.setTextColor(0, 0, 0);

  for (const [sectionTitle, sectionBullets] of Object.entries(sections)) {
    // Check if we need a new page
    if (y > 700) {
      doc.addPage();
      y = margin;
    }

    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(sectionTitle.toUpperCase(), margin, y);
    y += 3;

    // Section divider
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;

    // Bullets
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    for (const bullet of sectionBullets) {
      const text = bullet.revisedText || bullet.originalText;
      const bulletChar = "\u2022  ";

      // Wrap text
      const lines = doc.splitTextToSize(
        bulletChar + text,
        contentWidth - 10
      ) as string[];

      // Check if we need a new page
      if (y + lines.length * 14 > 740) {
        doc.addPage();
        y = margin;
      }

      for (let i = 0; i < lines.length; i++) {
        doc.text(lines[i], margin + (i > 0 ? 12 : 0), y);
        y += 14;
      }
      y += 2; // Small gap between bullets
    }

    y += 10; // Gap between sections
  }

  return doc;
}

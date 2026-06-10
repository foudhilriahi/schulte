import PDFDocument from "pdfkit";
import type { Response } from "express";

// ── helpers ──────────────────────────────────────────────────────────────────

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

function formatMonth(value?: string): string {
  if (!value || !monthPattern.test(value)) return "";
  const date = new Date(`${value}-01T00:00:00`);
  const label = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function experienceDuration(exp: any): string {
  const start = formatMonth(exp?.startDate);
  const end = exp?.isCurrent ? "Présent" : formatMonth(exp?.endDate);
  if (start && end) return `${start} – ${end}`;
  if (start && exp?.isCurrent) return `${start} – Présent`;
  if (typeof exp?.duration === "string" && exp.duration.trim()) return exp.duration.trim();
  return "";
}

// ── colours ───────────────────────────────────────────────────────────────────

const BLUE   = "#1a3c6e";
const BLUE2  = "#2563eb";
const GREY   = "#64748b";
const BLACK  = "#1e293b";
const WHITE  = "#ffffff";
const LIGHT  = "#f0f4ff";
const LINE   = "#e2e8f0";

// ── main generator ────────────────────────────────────────────────────────────

/**
 * Streams a generated CV as a PDF directly into the Express response.
 * Supports "modern" (blue header) and "classic" (serif, centred header) templates.
 */
export function streamGeneratedCVPdf(
  res: Response,
  formData: any,
  template: "modern" | "classic",
  candidateName: string,
): void {
  const doc = new PDFDocument({ margin: 0, size: "A4" });

  const filename = `CV_${candidateName.replace(/[^a-zA-Z0-9À-ÿ\s]/g, "").trim().replace(/\s+/g, "_")}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  const W = doc.page.width;   // 595
  const M = 40;                // margin
  const CW = W - M * 2;       // content width

  const personal = formData?.personal ?? {};
  const education: any[] = Array.isArray(formData?.education) ? formData.education : [];
  const experience: any[] = Array.isArray(formData?.experience) ? formData.experience : [];
  const skills: string[] = Array.isArray(formData?.skills) ? formData.skills : [];
  const languages: any[] = Array.isArray(formData?.languages) ? formData.languages : [];
  const coverNote: string = typeof formData?.coverNote === "string" ? formData.coverNote.trim() : "";

  // ── MODERN template ────────────────────────────────────────────────────────
  if (template !== "classic") {
    // Header band
    doc.rect(0, 0, W, 72).fill(BLUE);

    // Name
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor(WHITE)
      .text(personal.name || "—", M, 18, { width: CW });

    // Contact line
    const contact = [personal.email, personal.phone, personal.city]
      .filter(Boolean)
      .join("   |   ");
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("rgba(255,255,255,0.85)")
      .text(contact, M, 46, { width: CW });

    let y = 88;

    const sectionTitle = (title: string) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(BLUE2)
        .text(title.toUpperCase(), M, y, { width: CW });
      y += 13;
      doc.moveTo(M, y).lineTo(W - M, y).strokeColor(LINE).lineWidth(1).stroke();
      y += 8;
    };

    const checkPage = (needed = 30) => {
      if (y + needed > doc.page.height - 40) {
        doc.addPage({ margin: 0 });
        y = 40;
      }
    };

    // Cover note
    if (coverNote) {
      checkPage(50);
      sectionTitle("Profil");
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(BLACK)
        .text(coverNote, M, y, { width: CW, lineGap: 2 });
      y += doc.heightOfString(coverNote, { width: CW, lineGap: 2 }) + 14;
    }

    // Experience
    if (experience.length > 0) {
      checkPage(40);
      sectionTitle("Expérience professionnelle");
      for (const exp of experience) {
        if (!exp.title) continue;
        checkPage(36);
        const dur = experienceDuration(exp);
        doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK).text(exp.title, M, y, { continued: false });
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(GREY)
          .text(`${exp.company || ""}${dur ? "  ·  " + dur : ""}`, M, y + 12, { width: CW });
        y += 22;
        if (exp.description) {
          checkPage(20);
          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor(BLACK)
            .text(exp.description, M + 8, y, { width: CW - 8, lineGap: 1.5 });
          y += doc.heightOfString(exp.description, { width: CW - 8, lineGap: 1.5 }) + 8;
        }
      }
      y += 4;
    }

    // Education
    if (education.length > 0) {
      checkPage(40);
      sectionTitle("Formation");
      for (const edu of education) {
        if (!edu.degree) continue;
        checkPage(28);
        doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK).text(edu.degree, M, y);
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(GREY)
          .text(
            [edu.field, edu.institution, edu.year].filter(Boolean).join("  ·  "),
            M,
            y + 12,
            { width: CW },
          );
        y += 26;
      }
      y += 4;
    }

    // Skills
    if (skills.length > 0) {
      checkPage(40);
      sectionTitle("Compétences");
      // Render as pill-like badges
      let x = M;
      const pillH = 16;
      const pillPad = 8;
      doc.font("Helvetica").fontSize(9).fillColor(BLACK);
      for (const skill of skills) {
        const tw = doc.widthOfString(skill) + pillPad * 2;
        if (x + tw > W - M) {
          x = M;
          y += pillH + 5;
          checkPage(pillH + 5);
        }
        doc.roundedRect(x, y, tw, pillH, 4).fillAndStroke(LIGHT, BLUE2);
        doc.fillColor(BLUE).text(skill, x + pillPad, y + 3.5, { lineBreak: false });
        x += tw + 6;
      }
      y += pillH + 14;
    }

    // Languages
    if (languages.length > 0) {
      checkPage(40);
      sectionTitle("Langues");
      for (const lang of languages) {
        if (!lang.name) continue;
        checkPage(18);
        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor(BLACK)
          .text(lang.name, M, y, { continued: true, width: 120 });
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor(GREY)
          .text(`  —  ${lang.level || ""}`, { continued: false });
        y += 16;
      }
    }

  // ── CLASSIC template ───────────────────────────────────────────────────────
  } else {
    let y = 50;

    const checkPage = (needed = 30) => {
      if (y + needed > doc.page.height - 40) {
        doc.addPage({ margin: 0 });
        y = 40;
      }
    };

    // Name centred
    doc
      .font("Times-Bold")
      .fontSize(22)
      .fillColor(BLACK)
      .text(personal.name || "—", M, y, { width: CW, align: "center" });
    y += 28;

    // Contact centred
    const contact = [personal.email, personal.phone, personal.city]
      .filter(Boolean)
      .join("   |   ");
    doc
      .font("Times-Roman")
      .fontSize(10)
      .fillColor(GREY)
      .text(contact, M, y, { width: CW, align: "center" });
    y += 8;

    doc.moveTo(M, y + 8).lineTo(W - M, y + 8).strokeColor(BLACK).lineWidth(0.5).stroke();
    y += 20;

    const sectionTitle = (title: string) => {
      doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor(BLACK)
        .text(title.toUpperCase(), M, y, { width: CW });
      y += 14;
      doc.moveTo(M, y).lineTo(W - M, y).strokeColor(BLACK).lineWidth(0.5).stroke();
      y += 8;
    };

    // Cover note
    if (coverNote) {
      checkPage(50);
      sectionTitle("Profil");
      doc
        .font("Times-Roman")
        .fontSize(10)
        .fillColor(BLACK)
        .text(coverNote, M, y, { width: CW, lineGap: 2 });
      y += doc.heightOfString(coverNote, { width: CW, lineGap: 2 }) + 14;
    }

    // Experience
    if (experience.length > 0) {
      checkPage(40);
      sectionTitle("Expérience professionnelle");
      for (const exp of experience) {
        if (!exp.title) continue;
        checkPage(36);
        const dur = experienceDuration(exp);
        doc.font("Times-Bold").fontSize(11).fillColor(BLACK).text(exp.title, M, y);
        doc
          .font("Times-Italic")
          .fontSize(10)
          .fillColor(GREY)
          .text(`${exp.company || ""}${dur ? ",  " + dur : ""}`, M, y + 13, { width: CW });
        y += 24;
        if (exp.description) {
          checkPage(20);
          doc
            .font("Times-Roman")
            .fontSize(10)
            .fillColor(BLACK)
            .text(exp.description, M + 10, y, { width: CW - 10, lineGap: 1.5 });
          y += doc.heightOfString(exp.description, { width: CW - 10, lineGap: 1.5 }) + 8;
        }
      }
      y += 4;
    }

    // Education
    if (education.length > 0) {
      checkPage(40);
      sectionTitle("Formation");
      for (const edu of education) {
        if (!edu.degree) continue;
        checkPage(28);
        doc.font("Times-Bold").fontSize(11).fillColor(BLACK).text(edu.degree, M, y);
        doc
          .font("Times-Italic")
          .fontSize(10)
          .fillColor(GREY)
          .text(
            [edu.field, edu.institution, edu.year].filter(Boolean).join(",  "),
            M,
            y + 13,
            { width: CW },
          );
        y += 26;
      }
      y += 4;
    }

    // Skills
    if (skills.length > 0) {
      checkPage(40);
      sectionTitle("Compétences");
      doc
        .font("Times-Roman")
        .fontSize(10)
        .fillColor(BLACK)
        .text(skills.join("  •  "), M, y, { width: CW, lineGap: 2 });
      y += doc.heightOfString(skills.join("  •  "), { width: CW, lineGap: 2 }) + 14;
    }

    // Languages
    if (languages.length > 0) {
      checkPage(40);
      sectionTitle("Langues");
      for (const lang of languages) {
        if (!lang.name) continue;
        checkPage(18);
        doc
          .font("Times-Bold")
          .fontSize(10)
          .fillColor(BLACK)
          .text(lang.name, M, y, { continued: true, width: 120 });
        doc
          .font("Times-Roman")
          .fontSize(10)
          .fillColor(GREY)
          .text(`  —  ${lang.level || ""}`, { continued: false });
        y += 16;
      }
    }
  }

  doc.end();
}

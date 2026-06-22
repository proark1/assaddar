import { formatCurrency, formatDate, formatStage, formatStatus } from "./format";
import { buildProjectDiagnosis } from "./operations";
import type { ProjectBundle } from "./types";

type PdfSection = {
  title: string;
  lines: string[];
};

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-");
}

function wrapLine(value: string, width = 92) {
  const words = normalizeText(value).split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!word) continue;
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= width) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function pdfString(value: string) {
  const bytes = Buffer.from(normalizeText(value), "latin1");
  let escaped = "";
  for (const byte of bytes) {
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
      escaped += `\\${String.fromCharCode(byte)}`;
    } else if (byte < 32 || byte > 126) {
      escaped += `\\${byte.toString(8).padStart(3, "0")}`;
    } else {
      escaped += String.fromCharCode(byte);
    }
  }
  return `(${escaped})`;
}

function flattenSections(title: string, sections: PdfSection[]) {
  const lines: Array<{ text: string; heading?: boolean }> = [
    { text: title, heading: true },
    { text: "" },
  ];

  for (const section of sections) {
    lines.push({ text: section.title, heading: true });
    for (const line of section.lines) {
      for (const wrapped of wrapLine(line)) lines.push({ text: wrapped });
    }
    lines.push({ text: "" });
  }

  return lines;
}

export function createSimplePdf(title: string, sections: PdfSection[]) {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 48;
  const marginTop = 58;
  const lineHeight = 15;
  const maxLinesPerPage = Math.floor((pageHeight - marginTop - 50) / lineHeight);
  const flat = flattenSections(title, sections);
  const pages: typeof flat[] = [];

  for (let index = 0; index < flat.length; index += maxLinesPerPage) {
    pages.push(flat.slice(index, index + maxLinesPerPage));
  }

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const fontObject = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  );
  const contentObjectIds: number[] = [];
  const pageObjectIds: number[] = [];

  for (const [pageIndex, pageLines] of pages.entries()) {
    const commands = ["BT", `/F1 10 Tf`, `1 0 0 1 ${marginX} ${pageHeight - marginTop} Tm`];
    pageLines.forEach((line, lineIndex) => {
      if (lineIndex > 0) commands.push(`0 -${lineHeight} Td`);
      commands.push(line.heading ? "/F1 14 Tf" : "/F1 10 Tf");
      commands.push(`${pdfString(line.text)} Tj`);
    });
    commands.push("/F1 8 Tf");
    commands.push(`1 0 0 1 ${marginX} 28 Tm`);
    commands.push(`${pdfString(`Seite ${pageIndex + 1} / ${pages.length}`)} Tj`);
    commands.push("ET");
    const stream = commands.join("\n");
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
    contentObjectIds.push(contentId);
  }

  const pagesObjectId = objects.length + pages.length + 1;
  for (const contentObjectId of contentObjectIds) {
    pageObjectIds.push(
      addObject(
        `<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObject} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      ),
    );
  }

  const pagesObject = addObject(
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`,
  );
  const catalogObject = addObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);

  const header = "%PDF-1.4\n";
  const chunks = [header];
  const offsets = [0];
  let offset = Buffer.byteLength(header, "latin1");
  objects.forEach((body, index) => {
    offsets.push(offset);
    const objectText = `${index + 1} 0 obj\n${body}\nendobj\n`;
    chunks.push(objectText);
    offset += Buffer.byteLength(objectText, "latin1");
  });
  const xrefOffset = offset;
  const xref = [
    `xref`,
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((item) => `${String(item).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root ${catalogObject} 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");
  chunks.push(xref);

  return Buffer.from(chunks.join(""), "latin1");
}

function bullet(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`) : ["- Keine Einträge."];
}

export function createProjectBriefPdf(bundle: ProjectBundle) {
  const diagnosis = buildProjectDiagnosis(bundle);
  return createSimplePdf(`ASDAR Projektbrief - ${bundle.project.name}`, [
    {
      title: "Projekt",
      lines: [
        `Kunde: ${bundle.organization.name}`,
        `Branche: ${bundle.organization.industry}`,
        `Status: ${formatStatus(bundle.project.status)}`,
        `ASDAR Phase: ${formatStage(bundle.project.asdarStage)}`,
        `Readiness: ${diagnosis.readinessScore}/100 (${diagnosis.readinessLabel})`,
      ],
    },
    {
      title: "Ausgangslage",
      lines: [
        bundle.project.summary || "Noch keine öffentliche Projektzusammenfassung.",
        bundle.intelligence.companyContext || "Unternehmenskontext noch offen.",
      ],
    },
    { title: "Probleme und Ziele", lines: [bundle.intelligence.issues, bundle.intelligence.goals].filter(Boolean) },
    { title: "Chancen", lines: bullet(diagnosis.opportunities) },
    { title: "Risiken", lines: bullet(diagnosis.risks) },
    { title: "Nächste Aufgaben", lines: bullet(diagnosis.recommendedTasks) },
  ]);
}

export function createProposalPdf({
  bundle,
  proposalNumber,
  scope,
  outcomes,
  timeline,
  amountCents,
}: {
  bundle: ProjectBundle;
  proposalNumber: string;
  scope: string;
  outcomes: string;
  timeline: string;
  amountCents: number;
}) {
  return createSimplePdf(`Angebot ${proposalNumber}`, [
    {
      title: "Kunde und Projekt",
      lines: [
        `Kunde: ${bundle.organization.name}`,
        `Projekt: ${bundle.project.name}`,
        `Branche: ${bundle.organization.industry}`,
      ],
    },
    {
      title: "Ausgangslage",
      lines: [
        bundle.project.summary ||
          bundle.intelligence.companyContext ||
          "Wird im Projekt konkretisiert.",
      ],
    },
    {
      title: "Leistungsumfang",
      lines: [scope || "ASDAR Analyse, Prozessstrukturierung und Pilotdefinition."],
    },
    {
      title: "Erwartete Ergebnisse",
      lines: [
        outcomes ||
          "Konkrete Automatisierungshebel, priorisierte Roadmap und nächste Umsetzungsschritte.",
      ],
    },
    { title: "Zeitrahmen und Budget", lines: [timeline || "Nach Abstimmung.", amountCents > 0 ? `Budget: ${formatCurrency(amountCents)}` : "Budget: nach Abstimmung"] },
    {
      title: "Freigabe",
      lines: [
        "Der Kunde kann dieses Angebot im Portal prüfen und digital annehmen. Die Annahme wird im Audit-Verlauf des Projekts gespeichert.",
      ],
    },
  ]);
}

export function createFinalReportPdf(bundle: ProjectBundle) {
  const diagnosis = buildProjectDiagnosis(bundle);
  return createSimplePdf(`ASDAR Abschlussbericht - ${bundle.project.name}`, [
    {
      title: "Projektüberblick",
      lines: [
        `Kunde: ${bundle.organization.name}`,
        `Projekt: ${bundle.project.name}`,
        `Status: ${formatStatus(bundle.project.status)}`,
        `ASDAR Phase: ${formatStage(bundle.project.asdarStage)}`,
        `Erstellt am: ${formatDate(new Date().toISOString())}`,
      ],
    },
    {
      title: "Zusammenfassung",
      lines: [diagnosis.customerSummary],
    },
    {
      title: "Erreichte Meilensteine",
      lines: bullet(
        bundle.milestones
          .filter((milestone) => milestone.visibleToCustomer)
          .map((milestone) => `${milestone.title} (${milestone.status})`),
      ),
    },
    {
      title: "Deliverables",
      lines: bullet(
        bundle.files
          .filter((file) => file.visibility === "customer")
          .map((file) => `${file.name}${file.approvalStatus === "approved" ? " - freigegeben" : ""}`),
      ),
    },
    { title: "Offene Chancen", lines: bullet(diagnosis.opportunities) },
    { title: "Empfohlene nächste Schritte", lines: bullet(diagnosis.recommendedTasks) },
  ]);
}

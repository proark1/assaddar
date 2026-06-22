import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/portal/auth";
import {
  createFinalReportPdf,
  createProjectBriefPdf,
  createProposalPdf,
} from "@/lib/portal/documents";
import { getProjectAccess, getProjectBundle, readStore } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

function filename(value: string) {
  const safe = value.replace(/[^\w. -]/g, "_").slice(0, 140) || "export.pdf";
  return `attachment; filename="${safe.replaceAll("\"", "_")}"; filename*=UTF-8''${encodeURIComponent(
    safe,
  )}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;
  const store = await readStore();
  if (!getProjectAccess(store, user.id, projectId)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const bundle = getProjectBundle(store, projectId);
  if (!bundle) return new NextResponse("Not found", { status: 404 });

  const type = request.nextUrl.searchParams.get("type") ?? "final";
  if (type === "brief" && user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const now = new Date().toISOString().slice(0, 10);
  const pdf =
    type === "brief"
      ? createProjectBriefPdf(bundle)
      : type === "proposal"
        ? createProposalPdf({
            bundle,
            proposalNumber: `AD-P-${now}`,
            scope: "ASDAR Analyse, Prozessstrukturierung und Pilotdefinition.",
            outcomes:
              "Konkrete Automatisierungshebel, priorisierte Roadmap und nächste Umsetzungsschritte.",
            timeline: "Nach Abstimmung.",
            amountCents: 0,
          })
        : createFinalReportPdf(bundle);
  const body = pdf.buffer.slice(
    pdf.byteOffset,
    pdf.byteOffset + pdf.byteLength,
  ) as ArrayBuffer;
  const exportName =
    type === "brief"
      ? `ASDAR-Projektbrief-${now}.pdf`
      : type === "proposal"
        ? `ASDAR-Angebot-${now}.pdf`
        : `ASDAR-Abschlussbericht-${now}.pdf`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.length),
      "Content-Disposition": filename(exportName),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

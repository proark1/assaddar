import { NextResponse } from "next/server";
import { processWebsiteCrawlQueue } from "@/lib/portal/website-intelligence";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const limit = Number(new URL(request.url).searchParams.get("limit") || "2");
  const result = await processWebsiteCrawlQueue({
    limit: Number.isFinite(limit) ? limit : 2,
  });

  return NextResponse.json({ ok: true, ...result });
}

import { NextResponse } from "next/server";
import { processCrmAutomationQueue } from "@/lib/portal/crm";
import { mutateStore } from "@/lib/portal/store";

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

  const result = await mutateStore((store) =>
    processCrmAutomationQueue({ store, locale: "de" }),
  );

  return NextResponse.json({ ok: true, ...result });
}

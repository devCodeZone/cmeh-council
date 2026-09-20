import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import { getSettings, setSetting } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdminSession("admin");
  if ("error" in guard) return guard.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  const keys = Object.keys(body);
  if (!keys.length) return NextResponse.json({ message: "No settings supplied." }, { status: 400 });

  for (const key of keys) {
    await setSetting(key, body[key]);
  }

  await logAudit({
    action: "settings.updated",
    userId: guard.session.userId,
    userName: guard.session.name,
    entityType: "website_settings",
    details: { keys },
  });

  const settings = await getSettings();
  return NextResponse.json(settings);
}

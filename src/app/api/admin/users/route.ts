import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const guard = await requireAdminSession("super_admin");
  if ("error" in guard) return guard.error;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .orderBy(users.name);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminSession("super_admin");
  if ("error" in guard) return guard.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  if (!body.name || !body.email || !body.password || !body.roleId) {
    return NextResponse.json({ message: "Name, email, password and role are required." }, { status: 400 });
  }
  if (String(body.password).length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, body.email.toLowerCase()));
  if (existing) return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 });

  const passwordHash = await hashPassword(body.password);
  const [row] = await db
    .insert(users)
    .values({
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash,
      roleId: Number(body.roleId),
      isActive: body.isActive !== false,
    })
    .returning();

  await logAudit({ action: "admin_user.created", userId: guard.session.userId, userName: guard.session.name, entityType: "user", entityId: row.id, details: { email: row.email } });

  return NextResponse.json({ id: row.id, name: row.name, email: row.email });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdminSession("super_admin");
  if ("error" in guard) return guard.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ message: "Missing id." }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: any = {
    name: body.name,
    roleId: body.roleId ? Number(body.roleId) : undefined,
    isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    updatedAt: new Date(),
  };
  if (body.password) {
    if (String(body.password).length < 8) return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    update.passwordHash = await hashPassword(body.password);
  }
  Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

  await db.update(users).set(update).where(eq(users.id, Number(body.id)));

  await logAudit({ action: "admin_user.updated", userId: guard.session.userId, userName: guard.session.name, entityType: "user", entityId: Number(body.id) });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdminSession("super_admin");
  if ("error" in guard) return guard.error;

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ message: "Missing id." }, { status: 400 });
  if (id === guard.session.userId) return NextResponse.json({ message: "You cannot deactivate your own account." }, { status: 400 });

  // Soft-delete: deactivate rather than hard-delete, to preserve audit trail integrity.
  await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, id));

  await logAudit({ action: "admin_user.deactivated", userId: guard.session.userId, userName: guard.session.name, entityType: "user", entityId: id });

  return NextResponse.json({ ok: true });
}

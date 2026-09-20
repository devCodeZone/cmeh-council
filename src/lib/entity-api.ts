import { NextRequest, NextResponse } from "next/server";
import { eq, asc, desc, type AnyColumn } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

/**
 * Generates a standard set of admin CRUD route handlers (GET list, POST
 * create, PATCH update-by-id-in-body, DELETE by ?id=) for a simple Drizzle
 * table. Used for the content entities that don't need bespoke logic
 * (testimonials, team members, FAQs, gallery items, services). Entities
 * with more complex needs (documents, registrations, blog, events) have
 * hand-written routes instead.
 */
export function makeEntityRoutes(opts: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: PgTable & Record<string, any>;
  idColumn?: string;
  orderColumn?: string;
  orderDir?: "asc" | "desc";
  minRole?: string;
  entityName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sanitizeCreate?: (body: any) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sanitizeUpdate?: (body: any) => any;
}) {
  const idKey = opts.idColumn || "id";
  const orderKey = opts.orderColumn || idKey;
  const minRole = opts.minRole || "content_editor";

  async function GET() {
    const guard = await requireAdminSession(minRole);
    if ("error" in guard) return guard.error;
    const orderCol = opts.table[orderKey] as AnyColumn;
    const rows = await db
      .select()
      .from(opts.table)
      .orderBy(opts.orderDir === "desc" ? desc(orderCol) : asc(orderCol));
    return NextResponse.json(rows);
  }

  async function POST(req: NextRequest) {
    const guard = await requireAdminSession(minRole);
    if ("error" in guard) return guard.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = await req.json().catch(() => ({}));
    if (opts.sanitizeCreate) body = opts.sanitizeCreate(body);
    const [row] = await db.insert(opts.table).values(body).returning();
    await logAudit({
      action: `${opts.entityName}.created`,
      userId: guard.session.userId,
      userName: guard.session.name,
      entityType: opts.entityName,
      entityId: row[idKey] as string | number,
    });
    return NextResponse.json(row);
  }

  async function PATCH(req: NextRequest) {
    const guard = await requireAdminSession(minRole);
    if ("error" in guard) return guard.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await req.json().catch(() => ({}));
    const id = raw.id;
    if (id === undefined) return NextResponse.json({ message: "Missing id." }, { status: 400 });
    const { id: _omit, ...rest } = raw;
    void _omit;
    const body = opts.sanitizeUpdate ? opts.sanitizeUpdate(rest) : rest;
    const idCol = opts.table[idKey] as AnyColumn;
    await db.update(opts.table).set(body).where(eq(idCol, id));
    await logAudit({
      action: `${opts.entityName}.updated`,
      userId: guard.session.userId,
      userName: guard.session.name,
      entityType: opts.entityName,
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  }

  async function DELETE(req: NextRequest) {
    const guard = await requireAdminSession(minRole);
    if ("error" in guard) return guard.error;
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!id) return NextResponse.json({ message: "Missing id." }, { status: 400 });
    const idCol = opts.table[idKey] as AnyColumn;
    await db.delete(opts.table).where(eq(idCol, id));
    await logAudit({
      action: `${opts.entityName}.deleted`,
      userId: guard.session.userId,
      userName: guard.session.name,
      entityType: opts.entityName,
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  }

  return { GET, POST, PATCH, DELETE };
}

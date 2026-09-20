import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function logAudit(params: {
  userId?: number | null;
  userName?: string | null;
  action: string;
  entityType?: string;
  entityId?: string | number;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      userName: params.userName ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId !== undefined ? String(params.entityId) : undefined,
      details: params.details,
      ipAddress: params.ipAddress ?? null,
    });
  } catch (err) {
    console.error("[audit] failed to write log:", err);
  }
}

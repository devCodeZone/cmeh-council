import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { websiteSettings } from "@/lib/db/schema";
import { siteConfig } from "@/lib/site-config";

/**
 * Runtime site settings: merges the safe placeholder defaults in
 * site-config.ts with any overrides an administrator has saved in the
 * `website_settings` table (Admin → Settings). Falling back to defaults
 * means the public site never breaks if the DB is briefly unreachable or a
 * key hasn't been set yet.
 */
export type RuntimeSettings = typeof siteConfig;

let cache: { data: RuntimeSettings; expiresAt: number } | null = null;

export async function getSettings(): Promise<RuntimeSettings> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  let merged: RuntimeSettings = siteConfig;
  try {
    const rows = await db.select().from(websiteSettings);
    if (rows.length) {
      const overrides: Record<string, unknown> = {};
      for (const row of rows) overrides[row.key] = row.value;
      merged = deepMerge(siteConfig, overrides) as RuntimeSettings;
    }
  } catch (err) {
    console.warn("[settings] falling back to defaults — could not read website_settings:", (err as Error).message);
  }

  cache = { data: merged, expiresAt: Date.now() + 30_000 };
  return merged;
}

export async function setSetting(key: string, value: unknown) {
  // Explicitly JSON-encode and cast to jsonb. Passing a raw JS `null`
  // through Drizzle's jsonb column can get sent to Postgres as a bare SQL
  // NULL rather than the JSON value `null`, which then violates this
  // column's NOT NULL constraint (a real, reproduced bug — not a hypothetical
  // edge case: it broke "Save All Changes" whenever a field like
  // foundingYear was still unset). Encoding it ourselves and casting sidesteps
  // that entirely, for every value shape (null, string, number, object).
  const encoded = sql`${JSON.stringify(value)}::jsonb`;
  await db
    .insert(websiteSettings)
    .values({ key, value: encoded, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: websiteSettings.key,
      set: { value: encoded, updatedAt: new Date() },
    });
  cache = null;
}

export async function getAllSettingsRaw() {
  return db.select().from(websiteSettings);
}

function deepMerge<T>(base: T, overrides: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(overrides)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

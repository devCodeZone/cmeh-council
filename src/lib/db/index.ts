import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import net from "net";
import * as schema from "./schema";

// Node's "Happy Eyeballs" dual-stack connection algorithm (on by default
// since Node 19/20) tries both the IPv6 (::1) and IPv4 (127.0.0.1) address
// for a bare hostname like "localhost" at once. On Windows specifically,
// when Postgres isn't listening on either, Node can fail to build a valid
// AggregateError for the combined failure and throws
// `TypeError: object null is not iterable` instead of a normal, catchable
// rejection — which is why that error was appearing as an uncaught
// exception even though every caller here already has its own try/catch
// (see getSettings/safeQuery). Disabling it makes a refused Postgres
// connection behave like an ordinary ECONNREFUSED again.
try {
  net.setDefaultAutoSelectFamily?.(false);
} catch {
  // Not available on older Node versions — safe to ignore.
}

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail loudly in server contexts that actually need the DB, but don't
  // crash module import (e.g. during `next build` type-checking).
  console.warn(
    "[db] DATABASE_URL is not set. Set it in .env before running the app — see README.md."
  );
}

const pool =
  global.__pgPool ??
  new Pool({
    connectionString: connectionString || "postgres://invalid:invalid@localhost:5432/invalid",
    max: 10,
    // Fail fast when Postgres isn't reachable instead of hanging on the
    // platform's default TCP timeout (which can be a minute or more) —
    // every page that queries the database would otherwise sit there
    // waiting before finally falling back to placeholder content.
    connectionTimeoutMillis: 5000,
  });

// node-postgres emits an 'error' event on the pool whenever an *idle*
// client hits a network-level problem (e.g. the database is unreachable
// and a background keep-alive fails). That event has no query/promise
// attached to it, so without a listener here Node treats it as an
// uncaught exception and crashes the dev server — even though every
// caller of `db` already has its own try/catch (see src/lib/settings.ts).
// Logging it here keeps those background errors from taking the process
// down; callers still see their own query fail normally.
pool.on("error", (err) => {
  console.error("[db] unexpected error on idle client:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

export const db = drizzle(pool, { schema });

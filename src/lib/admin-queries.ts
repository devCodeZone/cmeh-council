import { db } from "@/lib/db";
import {
  applications,
  payments,
  contactEnquiries,
  councilDocuments,
  blogPosts,
  events,
} from "@/lib/db/schema";
import { and, count, eq, gte, inArray, sql, sum } from "drizzle-orm";

export async function getDashboardStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalRegistrations,
    todaysRegistrations,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    pendingPayments,
    successfulPayments,
    totalCollected,
    contactEnquiriesCount,
    totalDocuments,
    blogPostsCount,
    upcomingEventsCount,
  ] = await Promise.all([
    db.select({ c: count() }).from(applications).then((r) => r[0]?.c ?? 0),
    db
      .select({ c: count() })
      .from(applications)
      .where(gte(applications.createdAt, todayStart))
      .then((r) => r[0]?.c ?? 0),
    db
      .select({ c: count() })
      .from(applications)
      .where(inArray(applications.status, ["payment_pending", "under_review", "info_required"]))
      .then((r) => r[0]?.c ?? 0),
    db.select({ c: count() }).from(applications).where(eq(applications.status, "approved")).then((r) => r[0]?.c ?? 0),
    db.select({ c: count() }).from(applications).where(eq(applications.status, "rejected")).then((r) => r[0]?.c ?? 0),
    db.select({ c: count() }).from(payments).where(inArray(payments.status, ["created", "pending"])).then((r) => r[0]?.c ?? 0),
    db.select({ c: count() }).from(payments).where(eq(payments.status, "successful")).then((r) => r[0]?.c ?? 0),
    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "successful"))
      .then((r) => Number(r[0]?.total || 0)),
    db.select({ c: count() }).from(contactEnquiries).then((r) => r[0]?.c ?? 0),
    db.select({ c: count() }).from(councilDocuments).then((r) => r[0]?.c ?? 0),
    db.select({ c: count() }).from(blogPosts).then((r) => r[0]?.c ?? 0),
    db
      .select({ c: count() })
      .from(events)
      .where(and(eq(events.status, "published"), gte(events.startDate, new Date().toISOString().slice(0, 10))))
      .then((r) => r[0]?.c ?? 0),
  ]);

  return {
    totalRegistrations,
    todaysRegistrations,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    pendingPayments,
    successfulPayments,
    totalCollected,
    contactEnquiriesCount,
    totalDocuments,
    blogPostsCount,
    upcomingEventsCount,
  };
}

export async function getRegistrationsTrend(days = 14) {
  const rows = await db.execute<{ day: string; count: string }>(sql`
    select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(count(a.id), 0) as count
    from generate_series(current_date - (${days - 1})::int, current_date, interval '1 day') as d(day)
    left join ${applications} a on a.created_at::date = d.day
    group by d.day
    order by d.day
  `);
  return rows.rows.map((r) => ({ day: r.day, count: Number(r.count) }));
}

export async function getApplicationStatusBreakdown() {
  const rows = await db
    .select({ status: applications.status, c: count() })
    .from(applications)
    .groupBy(applications.status);
  return rows.map((r) => ({ status: r.status, count: r.c }));
}

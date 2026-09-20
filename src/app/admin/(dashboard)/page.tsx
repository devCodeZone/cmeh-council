import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Wallet,
  Mail,
  FileText,
  Newspaper,
  CalendarDays,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { RegistrationsTrendChart, StatusBreakdownChart } from "@/components/admin/DashboardCharts";
import { getSession } from "@/lib/auth";
import { getDashboardStats, getRegistrationsTrend, getApplicationStatusBreakdown } from "@/lib/admin-queries";
import { formatCurrencyINR } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const [stats, trend, breakdown] = await Promise.all([getDashboardStats(), getRegistrationsTrend(), getApplicationStatusBreakdown()]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-ink mb-1">Welcome to Electrohomeopath Council Patna Admin Dashboard</h1>
      <p className="text-brand-muted mb-8">Signed in as {session?.name} ({session?.role.replace(/_/g, " ")})</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Registrations" value={stats.totalRegistrations} />
        <StatCard icon={CalendarCheck} label="Today's Registrations" value={stats.todaysRegistrations} />
        <StatCard icon={Clock} label="Pending Applications" value={stats.pendingApplications} tone="warning" />
        <StatCard icon={CheckCircle2} label="Approved Applications" value={stats.approvedApplications} tone="success" />
        <StatCard icon={XCircle} label="Rejected Applications" value={stats.rejectedApplications} tone="danger" />
        <StatCard icon={CreditCard} label="Pending Payments" value={stats.pendingPayments} tone="warning" />
        <StatCard icon={Wallet} label="Successful Payments" value={stats.successfulPayments} tone="success" />
        <StatCard icon={Wallet} label="Total Amount Collected" value={formatCurrencyINR(stats.totalCollected)} tone="success" />
        <StatCard icon={Mail} label="Contact Enquiries" value={stats.contactEnquiriesCount} />
        <StatCard icon={FileText} label="Total Documents" value={stats.totalDocuments} />
        <StatCard icon={Newspaper} label="Blog Posts" value={stats.blogPostsCount} />
        <StatCard icon={CalendarDays} label="Upcoming Events" value={stats.upcomingEventsCount} />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-brand-border bg-white p-5">
          <h2 className="font-semibold text-brand-ink mb-4">Registrations — Last 14 Days</h2>
          <RegistrationsTrendChart data={trend} />
        </div>
        <div className="rounded-2xl border border-brand-border bg-white p-5">
          <h2 className="font-semibold text-brand-ink mb-4">Applications by Status</h2>
          {breakdown.length ? <StatusBreakdownChart data={breakdown} /> : <p className="text-sm text-brand-muted py-16 text-center">No applications yet.</p>}
        </div>
      </div>
    </div>
  );
}

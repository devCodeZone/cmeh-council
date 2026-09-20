"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutTemplate,
  Newspaper,
  CalendarDays,
  Images,
  Star,
  Users,
  HelpCircle,
  Mail,
  Search,
  Settings,
  UserCog,
  History,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; children?: { label: string; href: string }[] };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Registrations",
    href: "/admin/registrations",
    icon: ClipboardList,
    children: [
      { label: "All Applications", href: "/admin/registrations" },
      { label: "Pending", href: "/admin/registrations?status=payment_pending" },
      { label: "Under Review", href: "/admin/registrations?status=under_review" },
      { label: "Approved", href: "/admin/registrations?status=approved" },
      { label: "Rejected", href: "/admin/registrations?status=rejected" },
    ],
  },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  {
    label: "Informations",
    href: "/admin/informations",
    icon: FileText,
    children: [
      { label: "All Documents", href: "/admin/informations" },
      { label: "Upload New", href: "/admin/informations/new" },
    ],
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: Newspaper,
    children: [
      { label: "All Posts", href: "/admin/blog" },
      { label: "Add New", href: "/admin/blog/new" },
      { label: "Categories", href: "/admin/blog/categories" },
    ],
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: CalendarDays,
    children: [
      { label: "All Events", href: "/admin/events" },
      { label: "Add Event", href: "/admin/events/new" },
    ],
  },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
  { label: "Services", href: "/admin/services", icon: LayoutTemplate },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Contact Enquiries", href: "/admin/enquiries", icon: Mail },
  { label: "SEO", href: "/admin/seo", icon: Search },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Admin Users", href: "/admin/users", icon: UserCog },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(NAV.find((n) => n.children && pathname.startsWith(n.href))?.label ?? null);

  return (
    <nav className="space-y-1 p-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.children && pathname.startsWith(item.href));
        const isOpen = openGroup === item.label;

        if (!item.children) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-brand-primary text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        }

        return (
          <div key={item.label}>
            <button
              onClick={() => setOpenGroup(isOpen ? null : item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen ? (
              <div className="ml-7 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-2 py-1.5 rounded text-[13px] text-white/65 hover:text-white hover:bg-white/5"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

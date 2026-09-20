"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/SocialIcons";
import { cn } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Registration", href: "/registration" },
  { label: "Colleges", href: "/colleges" },
  { label: "Gallery", href: "/gallery" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function Header({
  orgName,
  shortName,
  phone,
  whatsappNumber,
  social,
}: {
  orgName: string;
  shortName: string;
  phone: string;
  whatsappNumber: string;
  social: { facebook?: string; instagram?: string; youtube?: string; linkedin?: string };
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const digitsOnly = whatsappNumber.replace(/[^0-9]/g, "");
  const waHref = digitsOnly
    ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent("Hello Electrohomeopath Council Patna, I would like more information.")}`
    : undefined;
  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : undefined;

  const socialLinks = [
    { key: "facebook", href: social.facebook, Icon: FacebookIcon, label: "Facebook" },
    { key: "instagram", href: social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { key: "youtube", href: social.youtube, Icon: YoutubeIcon, label: "YouTube" },
    { key: "linkedin", href: social.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
  ].filter((s) => s.href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-shadow bg-white/95 backdrop-blur",
        scrolled ? "shadow-md" : "border-b border-brand-border"
      )}
    >
      {/* Top utility bar */}
      <div className="hidden lg:block bg-brand-ink text-white/90 text-xs">
        <div className="container-page flex items-center justify-between py-1.5">
          <div className="flex items-center gap-5">
            {telHref ? (
              <a href={telHref} onClick={() => trackEvent("phone_click")} className="flex items-center gap-1.5 hover:text-brand-accent">
                <Phone className="size-3.5" /> {phone}
              </a>
            ) : null}
            {waHref ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("whatsapp_click")} className="flex items-center gap-1.5 hover:text-brand-accent">
                <MessageCircle className="size-3.5" /> WhatsApp Us
              </a>
            ) : null}
          </div>
          {socialLinks.length ? (
            <div className="flex items-center gap-3">
              {socialLinks.map(({ key, href, Icon, label }) => (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-brand-accent">
                  <Icon className="size-3.5" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="container-page flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3 focus-ring rounded-lg shrink-0">
          <img src="/logo.png" alt={orgName} className="h-16 w-auto shrink-0" />
          <span className="leading-tight">
            <span className="block font-bold text-brand-ink text-[15px] sm:text-base">{orgName}</span>
            <span className="block text-[11px] text-brand-muted tracking-wide">Patna, Bihar</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-1" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-[13.5px] font-medium rounded-full transition-colors focus-ring",
                  active ? "text-brand-primary bg-brand-primary-light" : "text-brand-ink/80 hover:text-brand-primary hover:bg-brand-surface-alt"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden xl:flex items-center gap-3">
          <Link href="/admin/login" className="text-sm font-medium text-brand-ink/70 hover:text-brand-primary focus-ring rounded px-2 py-1">
            Login
          </Link>
          <LinkButton href="/registration" size="sm" className="tracking-wide">
            Register
          </LinkButton>
        </div>

        <button
          className="xl:hidden flex size-10 items-center justify-center rounded-lg border border-brand-border focus-ring"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div id="mobile-menu" className="xl:hidden border-t border-brand-border bg-white max-h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="container-page py-3 flex flex-col" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "py-3 border-b border-brand-border/70 text-[15px] font-medium flex items-center justify-between",
                  pathname === item.href ? "text-brand-primary" : "text-brand-ink"
                )}
              >
                {item.label}
                <ChevronDown className="size-4 -rotate-90 text-brand-muted" />
              </Link>
            ))}
            <Link href="/admin/login" className="py-3 text-[15px] font-medium text-brand-ink">
              Login
            </Link>
            <div className="pt-4 flex flex-col gap-3">
              <LinkButton href="/registration" className="w-full justify-center">
                Register
              </LinkButton>
              <div className="flex items-center justify-center gap-4 pt-1">
                {telHref ? (
                  <a href={telHref} className="flex items-center gap-1.5 text-sm text-brand-ink/80">
                    <Phone className="size-4" /> Call
                  </a>
                ) : null}
                {waHref ? (
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-brand-ink/80">
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

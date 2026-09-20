import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/SocialIcons";
import type { SiteConfig } from "@/lib/site-config";

export function Footer({ settings }: { settings: SiteConfig }) {
  const year = new Date().getFullYear();
  const social = [
    { href: settings.social.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: settings.social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: settings.social.youtube, Icon: YoutubeIcon, label: "YouTube" },
    { href: settings.social.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-brand-ink text-white/85 mt-20">
      <div className="container-page py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-white p-1.5">
              <img src="/logo.png" alt={settings.orgName} className="h-full w-full object-contain" />
            </span>
            <span className="font-bold text-white text-[15px] leading-tight">{settings.orgName}</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{settings.tagline}</p>
          {social.length ? (
            <div className="flex items-center gap-3 mt-5">
              {social.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-brand-accent transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <FooterCol
          title="Quick Links"
          links={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Services", href: "/services" },
            { label: "Registration", href: "/registration" },
            { label: "Informations", href: "/informations" },
            { label: "Gallery", href: "/gallery" },
          ]}
        />

        <FooterCol
          title="Resources"
          links={[
            { label: "Blog", href: "/blog" },
            { label: "Events", href: "/events" },
            { label: "FAQ", href: "/faq" },
            { label: "Contact", href: "/contact" },
            { label: "Downloads", href: "/informations" },
            { label: "Track Application", href: "/track-application" },
          ]}
        />

        <div>
          <h3 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Contact Information</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2.5">
              <MapPin className="size-4 shrink-0 mt-0.5 text-brand-accent" />
              <span>
                {settings.address.line1}, {settings.address.line2}, {settings.address.city}, {settings.address.state} {settings.address.pincode}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="size-4 shrink-0 mt-0.5 text-brand-accent" />
              <span>{settings.phone}</span>
            </li>
            <li className="flex gap-2.5">
              <MessageCircle className="size-4 shrink-0 mt-0.5 text-brand-accent" />
              <span>{settings.whatsappNumber}</span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="size-4 shrink-0 mt-0.5 text-brand-accent" />
              <span>{settings.email}</span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="size-4 shrink-0 mt-0.5 text-brand-accent" />
              <span>{settings.officeHours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {year} {settings.orgName}. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms-conditions" className="hover:text-white">Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className="hover:text-white">Refund Policy</Link>
            <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Website Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-white/70 hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

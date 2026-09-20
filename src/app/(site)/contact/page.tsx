import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/ContactForm";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/contact",
    title: "Contact",
    description: "Get in touch with Electrohomeopath Council Patna — address, phone, WhatsApp, email and office hours.",
  });
}

export default async function ContactPage() {
  const settings = await getSettings();
  const digitsOnly = settings.whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <section className="py-16">
        <div className="container-page">
          <SectionHeading as="h1" eyebrow="Get In Touch" title={settings.orgName} description="We're here to help with registration, documents, events and general enquiries." />

          <div className="mt-14 grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <InfoRow icon={MapPin} label="Address">
                {settings.address.line1}, {settings.address.line2}
                <br />
                {settings.address.city}, {settings.address.state} {settings.address.pincode}, {settings.address.country}
              </InfoRow>
              <InfoRow icon={Phone} label="Phone">
                {settings.phone}
                {settings.altPhone ? <><br />{settings.altPhone}</> : null}
              </InfoRow>
              <InfoRow icon={MessageCircle} label="WhatsApp">
                {digitsOnly ? (
                  <a href={`https://wa.me/${digitsOnly}`} target="_blank" rel="noopener noreferrer" className="text-brand-primary font-medium">
                    {settings.whatsappNumber}
                  </a>
                ) : (
                  settings.whatsappNumber
                )}
              </InfoRow>
              <InfoRow icon={Mail} label="Email">
                <a href={`mailto:${settings.email}`} className="text-brand-primary font-medium">
                  {settings.email}
                </a>
              </InfoRow>
              <InfoRow icon={Clock} label="Office Hours">
                {settings.officeHours}
              </InfoRow>

              <div className="rounded-2xl overflow-hidden border border-brand-border h-64 bg-brand-surface-alt mt-6">
                {settings.googleMapsEmbedUrl ? (
                  <iframe
                    src={settings.googleMapsEmbedUrl}
                    className="size-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Council office location"
                  />
                ) : (
                  <div className="size-full flex flex-col items-center justify-center text-brand-muted text-sm p-6 text-center gap-3">
                    <Navigation className="size-6" />
                    Map will appear here once a verified Google Maps embed URL is added in Admin → Settings.
                  </div>
                )}
              </div>
              {settings.googleMapsDirectionsUrl ? (
                <a
                  href={settings.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary"
                >
                  <Navigation className="size-4" /> Get Directions
                </a>
              ) : null}
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8">
                <h2 className="text-xl font-bold text-brand-ink mb-1">Send Us a Message</h2>
                <p className="text-sm text-brand-muted mb-6">We typically respond within 1–2 business days.</p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-brand-border bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary-light text-brand-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted mb-0.5">{label}</p>
        <p className="text-sm text-brand-ink leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

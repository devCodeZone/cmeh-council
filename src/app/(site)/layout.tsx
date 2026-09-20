import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { BackToTop } from "@/components/site/BackToTop";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ToastProvider } from "@/components/ui/Toast";
import { JsonLd } from "@/components/JsonLd";
import { getSettings } from "@/lib/settings";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { bodyFont, headingFont } from "@/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(settings.url),
    title: {
      default: `${settings.orgName} | Registration, Information & Updates`,
      template: `%s | ${settings.shortName}`,
    },
    description: settings.tagline,
    verification: settings.googleSiteVerification ? { google: settings.googleSiteVerification } : undefined,
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-surface text-brand-body">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ToastProvider>
          <Header
            orgName={settings.orgName}
            shortName={settings.shortName}
            phone={settings.phone}
            whatsappNumber={settings.whatsappNumber}
            social={settings.social}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer settings={settings} />
          <WhatsAppFab whatsappNumber={settings.whatsappNumber} phone={settings.phone} />
          <BackToTop />
        </ToastProvider>
        <GoogleAnalytics measurementId={settings.gaMeasurementId} />
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd(settings)} />
      </body>
    </html>
  );
}

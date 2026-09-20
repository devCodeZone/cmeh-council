import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackApplicationClient } from "@/components/registration/TrackApplicationClient";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/track-application",
    title: "Track Application",
    description: "Check the status of your Electrohomeopath Council Patna registration application.",
  });
}

export default function TrackApplicationPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Track Application" }]} />
      <section className="py-16">
        <div className="container-page max-w-3xl">
          <SectionHeading as="h1" eyebrow="Application Status" title="Track Application" description="Enter your application number and registered mobile number or email to check your status." />
          <div className="mt-10">
            <Suspense fallback={null}>
              <TrackApplicationClient />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}

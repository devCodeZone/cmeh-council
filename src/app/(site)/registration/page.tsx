import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SimpleRegistrationForm } from "@/components/registration/SimpleRegistrationForm";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/registration",
    title: "Online Candidate Registration",
    description: "Register as a candidate with Electrohomeopath Council Patna entirely online.",
  });
}

export default function RegistrationPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Registration" }]} />
      <section className="py-16">
        <div className="container-page max-w-4xl">
          <SectionHeading
            as="h1"
            eyebrow="Join The Council"
            title="Online Candidate Registration"
            description="Fill in the details below. On submitting, your registration will be emailed directly to the council for review."
          />
          <div className="mt-10">
            <SimpleRegistrationForm />
          </div>
        </div>
      </section>
    </>
  );
}

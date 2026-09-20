import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildMetadata } from "@/lib/seo";
import { COLLEGES } from "@/lib/colleges-data";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/colleges",
    title: "Colleges & Office Bearers",
    description: "Colleges affiliated with Electrohomeopath Council Patna, with their office bearers and doctors.",
  });
}

export default function CollegesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Colleges" }]} />
      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            as="h1"
            align="left"
            eyebrow="Directory"
            title="Colleges & Office Bearers"
            description="Doctors and office bearers associated with the council, listed by institution."
          />

          <div className="mt-10 space-y-12">
            {COLLEGES.map((college) => (
              <div key={college.name}>
                <h2 className="text-lg font-bold text-brand-ink mb-4">{college.name}</h2>
                <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-brand-surface-alt text-left text-xs uppercase tracking-wide text-brand-muted">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Designation</th>
                        <th className="px-4 py-3">Experience</th>
                        <th className="px-4 py-3">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {college.doctors.map((doctor) => (
                        <tr key={doctor.name} className="hover:bg-brand-surface-alt/60">
                          <td className="px-4 py-3 font-medium text-brand-ink whitespace-nowrap">{doctor.name}</td>
                          <td className="px-4 py-3">{doctor.designation}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{doctor.experience || "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {doctor.mobile ? (
                              <a href={`tel:${doctor.mobile}`} className="inline-flex items-center gap-1.5 text-brand-primary hover:underline">
                                <Phone className="size-3.5" /> {doctor.mobile}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

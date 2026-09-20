import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildMetadata } from "@/lib/seo";
import { AFFILIATED_COLLEGES } from "@/lib/affiliated-colleges-data";

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
            title="Affiliated Colleges"
            description="Colleges affiliated with Electrohomeopath Council Patna, listed by session."
          />

          <div className="mt-10 space-y-12">
            {AFFILIATED_COLLEGES.map((group) => (
              <div key={group.session}>
                <h2 className="text-lg font-bold text-brand-ink mb-4">Session : {group.session}</h2>
                <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-brand-surface-alt text-left text-xs uppercase tracking-wide text-brand-muted">
                      <tr>
                        <th className="px-4 py-3">Sl. No</th>
                        <th className="px-4 py-3">College Name</th>
                        <th className="px-4 py-3">Address</th>
                        <th className="px-4 py-3">Principal</th>
                        <th className="px-4 py-3">Mobile</th>
                        <th className="px-4 py-3">Roll Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {group.colleges.map((college) => (
                        <tr key={college.rollCode} className="hover:bg-brand-surface-alt/60">
                          <td className="px-4 py-3 text-brand-muted whitespace-nowrap">{college.slNo}</td>
                          <td className="px-4 py-3 font-medium text-brand-ink">{college.name}</td>
                          <td className="px-4 py-3">{college.address}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{college.principal}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {college.mobile.split(",").map((num, i) => (
                              <a
                                key={num}
                                href={`tel:${num.trim()}`}
                                className="inline-flex items-center gap-1.5 text-brand-primary hover:underline"
                              >
                                {i > 0 ? ", " : ""}
                                <Phone className="size-3.5" /> {num.trim()}
                              </a>
                            ))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-brand-ink">{college.rollCode}</td>
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

import type { Metadata } from "next";
import { CheckCircle2, Home } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Registration Submitted", robots: { index: false, follow: false } };

export default function RegistrationSuccessPage() {
  return (
    <section className="py-20">
      <div className="container-page max-w-2xl">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 sm:p-10 text-center">
          <CheckCircle2 className="size-14 text-brand-success mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-brand-ink mb-2">Registration Submitted Successfully</h1>
          <p className="text-brand-body">
            Thank you for registering with Electrohomeopath Council Patna. Your details have been emailed to the
            council, and they will contact you soon.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/" variant="ghost">
              <Home className="size-4" /> Return Home
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DocumentForm } from "@/components/admin/DocumentForm";

export default function NewDocumentPage() {
  return (
    <div>
      <Link href="/admin/informations" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary mb-4">
        <ArrowLeft className="size-4" /> Back to Informations
      </Link>
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Upload New Document</h1>
      <DocumentForm mode="create" />
    </div>
  );
}

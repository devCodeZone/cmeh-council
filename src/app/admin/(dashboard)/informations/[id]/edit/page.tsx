import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { councilDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DocumentForm } from "@/components/admin/DocumentForm";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [doc] = await db.select().from(councilDocuments).where(eq(councilDocuments.id, Number(id))).limit(1);
  if (!doc) notFound();

  return (
    <div>
      <Link href="/admin/informations" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary mb-4">
        <ArrowLeft className="size-4" /> Back to Informations
      </Link>
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Edit Document</h1>
      <DocumentForm
        mode="edit"
        documentId={doc.id}
        initial={{
          title: doc.title,
          description: doc.description || "",
          categoryId: doc.categoryId,
          publicationDate: doc.publicationDate || "",
          isPublished: doc.isPublished,
          isFeatured: doc.isFeatured,
        }}
      />
    </div>
  );
}

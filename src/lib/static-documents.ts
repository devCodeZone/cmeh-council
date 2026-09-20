import type { DocumentCardData } from "@/components/cards/DocumentCard";

/**
 * A small, fixed set of documents kept directly in the repo
 * (public/documents/) rather than in the database-backed council documents
 * system (councilDocuments table, managed from Admin -> Informations).
 *
 * Use this only for a handful of static files that don't need to change
 * without a code deploy. For anything the council should be able to
 * upload/edit/remove themselves, use the real Informations & Downloads
 * system once the database is connected — this list is a stand-in for that,
 * not a replacement.
 *
 * To add a document: drop the file in public/documents/ and add an entry
 * below. `id` just needs to be unique and negative so it never collides with
 * a real database row id.
 */
export const STATIC_DOCUMENTS: (DocumentCardData & { categorySlug?: string | null })[] = [
  {
    id: -1,
    title: "Admission Form (Form B)",
    categoryName: "Examination",
    categorySlug: null,
    description: "Application for Admission to Examination — Faculty of Electrohomeopathy.",
    // A real, recent date so this real document sorts above the placeholder
    // sample documents seeded alongside it, rather than to the bottom.
    publicationDate: new Date(),
    fileType: "pdf",
    fileSize: 489422,
    filePath: "/documents/admission-form.pdf",
  },
];

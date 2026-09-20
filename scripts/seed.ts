/**
 * Seeds baseline data: roles, a super-admin user, document/blog categories,
 * and a handful of sample content items so the site is not empty on first
 * run. Sample content is clearly labelled — replace/remove it from the
 * Admin Dashboard once real council content is available.
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import {
  roles,
  users,
  categories,
  blogCategories,
  councilDocuments,
  blogPosts,
  events,
  galleryItems,
  testimonials,
  teamMembers,
  faqItems,
  services,
} from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function upsertRole(name: string, description: string) {
  const existing = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
  if (existing[0]) return existing[0];
  const [row] = await db.insert(roles).values({ name, description }).returning();
  return row;
}

async function main() {
  console.log("Seeding roles...");
  const superAdminRole = await upsertRole("super_admin", "Complete access to every module.");
  await upsertRole("admin", "Operational and content access.");
  await upsertRole("registration_officer", "Manages candidate registrations and documents.");
  await upsertRole("content_editor", "Manages public-facing content (blog, events, gallery).");
  await upsertRole("accountant", "Manages payments and financial records.");

  console.log("Seeding super-admin user...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@cmehcouncilpatna.example";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (!existingAdmin[0]) {
    await db.insert(users).values({
      name: "Super Admin",
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      roleId: superAdminRole.id,
    });
    console.log(`  Created admin user: ${adminEmail} / ${adminPassword} (CHANGE THIS PASSWORD IMMEDIATELY)`);
  } else {
    console.log("  Admin user already exists, skipping.");
  }

  console.log("Seeding document categories...");
  const docCategoryNames = ["Notices", "Circulars", "Guidelines", "Forms", "Notifications", "Brochures", "Rules", "Academic Information", "Council Information", "Other Documents"];
  const docCategoryIds: Record<string, number> = {};
  for (const name of docCategoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (existing[0]) {
      docCategoryIds[name] = existing[0].id;
    } else {
      const [row] = await db.insert(categories).values({ name, slug }).returning();
      docCategoryIds[name] = row.id;
    }
  }

  console.log("Seeding blog categories...");
  const blogCategoryNames = ["Announcements", "Education", "Awareness", "Events Recap"];
  const blogCategoryIds: Record<string, number> = {};
  for (const name of blogCategoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const existing = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug)).limit(1);
    if (existing[0]) {
      blogCategoryIds[name] = existing[0].id;
    } else {
      const [row] = await db.insert(blogCategories).values({ name, slug }).returning();
      blogCategoryIds[name] = row.id;
    }
  }

  const anyDocs = await db.select().from(councilDocuments).limit(1);
  if (!anyDocs[0]) {
    console.log("Seeding sample council documents...");
    await db.insert(councilDocuments).values([
      {
        title: "[Sample] Candidate Registration Guidelines",
        slug: "sample-candidate-registration-guidelines",
        categoryId: docCategoryIds["Guidelines"],
        description: "Placeholder guideline document describing the online registration process. Replace with the verified council document.",
        filePath: "/uploads/sample/sample-document.pdf",
        fileType: "pdf",
        fileSize: 128_000,
        isPublished: true,
        isFeatured: true,
      },
      {
        title: "[Sample] Registration Application Form",
        slug: "sample-registration-application-form",
        categoryId: docCategoryIds["Forms"],
        description: "Placeholder downloadable form. Replace with the verified council form.",
        filePath: "/uploads/sample/sample-document.pdf",
        fileType: "pdf",
        fileSize: 96_000,
        isPublished: true,
      },
      {
        title: "[Sample] Council Notice — Office Hours",
        slug: "sample-council-notice-office-hours",
        categoryId: docCategoryIds["Notices"],
        description: "Placeholder notice. Replace with a real, dated notice from the council.",
        filePath: "/uploads/sample/sample-document.pdf",
        fileType: "pdf",
        fileSize: 54_000,
        isPublished: true,
      },
    ]);
  }

  const anyBlog = await db.select().from(blogPosts).limit(1);
  if (!anyBlog[0]) {
    console.log("Seeding sample blog posts...");
    await db.insert(blogPosts).values([
      {
        title: "How to Register Online with Electrohomeopath Council Patna",
        slug: "how-to-register-online",
        shortDescription: "A step-by-step walkthrough of the online candidate registration process, from filling the application to receiving your acknowledgement.",
        content: "<p>This guide walks new candidates through each step of the online registration process on this portal: personal details, educational information, document upload, review, and payment. Replace this sample article with council-authored content.</p>",
        authorName: "Council Desk",
        categoryId: blogCategoryIds["Announcements"],
        tags: ["registration", "how-to"],
        status: "published",
        publishedAt: new Date(),
        seoTitle: "How to Register Online | Electrohomeopath Council Patna",
        metaDescription: "Step-by-step guide to completing your online registration with Electrohomeopath Council Patna.",
        focusKeyword: "electrohomeopathy registration patna",
      },
      {
        title: "Understanding Electrohomeopathy: An Introduction",
        slug: "understanding-electrohomeopathy-introduction",
        shortDescription: "A general, informational introduction to Electrohomeopathy as a field of study for prospective candidates.",
        content: "<p>Placeholder informational article. Replace with verified, council-authored educational content about Electrohomeopathy.</p>",
        authorName: "Council Desk",
        categoryId: blogCategoryIds["Education"],
        tags: ["education", "electrohomeopathy"],
        status: "published",
        publishedAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        title: "Council Announces Upcoming Awareness Programme in Patna",
        slug: "council-announces-awareness-programme-patna",
        shortDescription: "Details of an upcoming public awareness programme organised by the council.",
        content: "<p>Placeholder announcement. Replace with real event details once confirmed.</p>",
        authorName: "Council Desk",
        categoryId: blogCategoryIds["Awareness"],
        tags: ["awareness", "patna"],
        status: "published",
        publishedAt: new Date(Date.now() - 86400000 * 10),
      },
    ]);
  }

  const anyEvents = await db.select().from(events).limit(1);
  if (!anyEvents[0]) {
    console.log("Seeding sample events...");
    const future = new Date();
    future.setDate(future.getDate() + 21);
    const past = new Date();
    past.setDate(past.getDate() - 30);
    await db.insert(events).values([
      {
        title: "Electrohomeopathy Awareness Seminar, Patna",
        slug: "electrohomeopathy-awareness-seminar-patna",
        description: "<p>Placeholder seminar description. Replace with verified event details once confirmed by the council.</p>",
        startDate: future.toISOString().slice(0, 10),
        startTime: "10:00 AM",
        endTime: "1:00 PM",
        venue: " Council Seminar Hall, Patna",
        featuredImage: "",
        status: "published",
      },
      {
        title: "Annual Council Meeting (Recap)",
        slug: "annual-council-meeting-recap",
        description: "<p>Placeholder recap of a past council meeting.</p>",
        startDate: past.toISOString().slice(0, 10),
        venue: "Council Office, Patna",
        status: "published",
      },
    ]);
  }

  const anyGallery = await db.select().from(galleryItems).limit(1);
  if (!anyGallery[0]) {
    console.log("Seeding sample gallery items...");
    await db.insert(galleryItems).values([
      { title: "Council Office", type: "photo", category: "general", imagePath: "/uploads/sample/gallery-1.svg", isPublished: true, sortOrder: 1 },
      { title: "Seminar Session", type: "photo", category: "seminars", imagePath: "/uploads/sample/gallery-2.svg", isPublished: true, sortOrder: 2 },
      { title: "Workshop", type: "photo", category: "workshops", imagePath: "/uploads/sample/gallery-3.svg", isPublished: true, sortOrder: 3 },
    ]);
  }

  const anyTestimonials = await db.select().from(testimonials).limit(1);
  if (!anyTestimonials[0]) {
    console.log("Seeding sample testimonials...");
    await db.insert(testimonials).values([
      { name: "[Sample] R. Kumar", designation: "Registered Candidate", location: "Patna, Bihar", quote: "Placeholder testimonial text — replace with a real, consented testimonial before launch.", isPublished: true, sortOrder: 1 },
      { name: "[Sample] S. Devi", designation: "Registered Candidate", location: "Gaya, Bihar", quote: "Placeholder testimonial text — replace with a real, consented testimonial before launch.", isPublished: true, sortOrder: 2 },
    ]);
  }

  const anyTeam = await db.select().from(teamMembers).limit(1);
  if (!anyTeam[0]) {
    console.log("Seeding sample team members...");
    await db.insert(teamMembers).values([
      { name: "[PLACEHOLDER Name]", position: "President", bio: "Verified biography to be added by the council.", isPublished: true, sortOrder: 1 },
      { name: "[PLACEHOLDER Name]", position: "Secretary", bio: "Verified biography to be added by the council.", isPublished: true, sortOrder: 2 },
    ]);
  }

  const anyFaq = await db.select().from(faqItems).limit(1);
  if (!anyFaq[0]) {
    console.log("Seeding sample FAQs...");
    await db.insert(faqItems).values([
      { question: "How do I register online with the council?", answer: "Visit the Online Registration page, complete the multi-step application form, upload the required documents, and pay the registration fee to submit your application.", category: "registration", sortOrder: 1, isPublished: true },
      { question: "What documents are required for registration?", answer: "A passport-size photograph, signature, identity proof, and your educational qualification certificates. See the Registration Guidelines for the full list.", category: "documents", sortOrder: 2, isPublished: true },
      { question: "How can I track my application status?", answer: "Use the Track Application page with your Application Number and registered mobile number or email.", category: "registration", sortOrder: 3, isPublished: true },
      { question: "What payment methods are supported?", answer: "UPI, debit card, credit card, net banking and supported wallets via our secure payment gateway.", category: "payments", sortOrder: 4, isPublished: true },
      { question: "Is my payment information secure?", answer: "Yes. Card and banking details are handled entirely by our payment gateway partner; this website never stores your card details.", category: "payments", sortOrder: 5, isPublished: true },
    ]);
  }

  const anyServices = await db.select().from(services).limit(1);
  if (!anyServices[0]) {
    console.log("Seeding sample services...");
    await db.insert(services).values([
      { title: "Candidate Registration", slug: "candidate-registration", icon: "clipboard-list", shortDescription: "Online registration for candidates seeking to register with the council.", fullDescription: "Placeholder description of the candidate registration service. Replace with verified council content describing eligibility and process.", sortOrder: 1, isPublished: true },
      { title: "Educational Activities", slug: "educational-activities", icon: "graduation-cap", shortDescription: "Educational initiatives and awareness activities related to Electrohomeopathy.", fullDescription: "Placeholder description. Replace with verified council content.", sortOrder: 2, isPublished: true },
      { title: "Seminars & Workshops", slug: "seminars-workshops", icon: "presentation", shortDescription: "Seminars and workshops organised by or affiliated with the council.", fullDescription: "Placeholder description. Replace with verified council content.", sortOrder: 3, isPublished: true },
      { title: "Council Information", slug: "council-information", icon: "info", shortDescription: "Notices, circulars and general information published by the council.", fullDescription: "Placeholder description. Replace with verified council content.", sortOrder: 4, isPublished: true },
      { title: "Publications", slug: "publications", icon: "book-open", shortDescription: "Publications and informational material relevant to Electrohomeopathy.", fullDescription: "Placeholder description. Replace with verified council content.", sortOrder: 5, isPublished: true },
      { title: "Awareness Programmes", slug: "awareness-programmes", icon: "megaphone", shortDescription: "Public awareness programmes in Patna and across Bihar.", fullDescription: "Placeholder description. Replace with verified council content.", sortOrder: 6, isPublished: true },
    ]);
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

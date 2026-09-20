import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/* Auth: roles & admin users                                           */
/* ------------------------------------------------------------------ */

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 40 }).notNull().unique(), // super_admin, admin, registration_officer, content_editor, accountant
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}));

/* ------------------------------------------------------------------ */
/* Candidates & Applications (Online Registration)                     */
/* ------------------------------------------------------------------ */

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  fathersName: varchar("fathers_name", { length: 200 }),
  mothersName: varchar("mothers_name", { length: 200 }),
  dob: date("dob"),
  gender: varchar("gender", { length: 20 }),
  nationality: varchar("nationality", { length: 80 }).default("Indian"),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  altMobile: varchar("alt_mobile", { length: 20 }),
  email: varchar("email", { length: 200 }).notNull(),
  aadhaarNumber: varchar("aadhaar_number", { length: 20 }), // optional, configurable
  addressLine1: text("address_line1"),
  city: varchar("city", { length: 120 }),
  district: varchar("district", { length: 120 }),
  state: varchar("state", { length: 120 }),
  pincode: varchar("pincode", { length: 12 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  mobileIdx: index("candidates_mobile_idx").on(t.mobile),
  emailIdx: index("candidates_email_idx").on(t.email),
}));

export const applicationStatusValues = [
  "draft",
  "payment_pending",
  "payment_completed",
  "under_review",
  "info_required",
  "approved",
  "rejected",
] as const;
export type ApplicationStatus = (typeof applicationStatusValues)[number];

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  applicationNumber: varchar("application_number", { length: 40 }).notNull().unique(),
  candidateId: integer("candidate_id").references(() => candidates.id).notNull(),
  registrationCategory: varchar("registration_category", { length: 150 }),
  courseQualification: varchar("course_qualification", { length: 150 }),
  registrationType: varchar("registration_type", { length: 80 }),
  previousRegistrationNumber: varchar("previous_registration_number", { length: 80 }),
  institutionDetails: text("institution_details"),
  experience: text("experience"),
  declarationAccepted: boolean("declaration_accepted").default(false).notNull(),
  declarationTextSnapshot: text("declaration_text_snapshot"),
  termsAccepted: boolean("terms_accepted").default(false).notNull(),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  status: varchar("status", { length: 30 }).$type<ApplicationStatus>().default("draft").notNull(),
  internalNote: text("internal_note"),
  feeAmount: numeric("fee_amount", { precision: 10, scale: 2 }).default("0"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  statusIdx: index("applications_status_idx").on(t.status),
  numberIdx: uniqueIndex("applications_number_idx").on(t.applicationNumber),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  candidate: one(candidates, { fields: [applications.candidateId], references: [candidates.id] }),
  qualifications: many(qualifications),
  documents: many(applicationDocuments),
  payments: many(payments),
}));

export const qualifications = pgTable("qualifications", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id, { onDelete: "cascade" }).notNull(),
  highestQualification: varchar("highest_qualification", { length: 150 }),
  course: varchar("course", { length: 150 }),
  institute: varchar("institute", { length: 200 }),
  boardUniversity: varchar("board_university", { length: 200 }),
  passingYear: varchar("passing_year", { length: 10 }),
  enrollmentNumber: varchar("enrollment_number", { length: 80 }),
  additionalQualification: text("additional_qualification"),
  sortOrder: integer("sort_order").default(0),
});

export const documentTypeValues = [
  "photo",
  "signature",
  "identity_proof",
  "qualification_certificate",
  "marksheet",
  "additional_certificate",
  "other",
] as const;
export type ApplicationDocumentType = (typeof documentTypeValues)[number];

export const applicationDocuments = pgTable("application_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id, { onDelete: "cascade" }).notNull(),
  docType: varchar("doc_type", { length: 40 }).$type<ApplicationDocumentType>().notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentStatusValues = ["created", "successful", "pending", "failed", "refunded"] as const;
export type PaymentStatus = (typeof paymentStatusValues)[number];

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id).notNull(),
  provider: varchar("provider", { length: 40 }).default("razorpay").notNull(),
  orderId: varchar("order_id", { length: 120 }),
  paymentId: varchar("payment_id", { length: 120 }),
  signature: text("signature"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  status: varchar("status", { length: 20 }).$type<PaymentStatus>().default("created").notNull(),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  orderIdx: index("payments_order_idx").on(t.orderId),
}));

/* ------------------------------------------------------------------ */
/* Council Documents ("Informations & Downloads") + Categories         */
/* ------------------------------------------------------------------ */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const councilDocuments = pgTable("council_documents", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 280 }).notNull().unique(),
  categoryId: integer("category_id").references(() => categories.id),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileType: varchar("file_type", { length: 20 }),
  fileSize: integer("file_size"),
  publicationDate: date("publication_date").defaultNow(),
  isPublished: boolean("is_published").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  sortOrder: integer("sort_order").default(0),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  publishedIdx: index("council_documents_published_idx").on(t.isPublished),
}));

export const councilDocumentsRelations = relations(councilDocuments, ({ one }) => ({
  category: one(categories, { fields: [councilDocuments.categoryId], references: [categories.id] }),
}));

/* ------------------------------------------------------------------ */
/* Blog                                                                 */
/* ------------------------------------------------------------------ */

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 280 }).notNull().unique(),
  featuredImage: text("featured_image"),
  shortDescription: text("short_description"),
  content: text("content").notNull(),
  authorName: varchar("author_name", { length: 150 }).default("Council Desk"),
  categoryId: integer("category_id").references(() => blogCategories.id),
  tags: jsonb("tags").$type<string[]>().default([]),
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft | published
  seoTitle: varchar("seo_title", { length: 255 }),
  metaDescription: text("meta_description"),
  focusKeyword: varchar("focus_keyword", { length: 150 }),
  canonicalUrl: text("canonical_url"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  statusIdx: index("blog_posts_status_idx").on(t.status),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  category: one(blogCategories, { fields: [blogPosts.categoryId], references: [blogCategories.id] }),
}));

/* ------------------------------------------------------------------ */
/* Events                                                               */
/* ------------------------------------------------------------------ */

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 280 }).notNull().unique(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  startTime: varchar("start_time", { length: 20 }),
  endTime: varchar("end_time", { length: 20 }),
  venue: varchar("venue", { length: 255 }),
  googleMapsUrl: text("google_maps_url"),
  featuredImage: text("featured_image"),
  galleryImages: jsonb("gallery_images").$type<string[]>().default([]),
  contactInfo: text("contact_info"),
  registrationUrl: text("registration_url"),
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft | published
  seoTitle: varchar("seo_title", { length: 255 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  statusIdx: index("events_status_idx").on(t.status),
  startDateIdx: index("events_start_date_idx").on(t.startDate),
}));

/* ------------------------------------------------------------------ */
/* Gallery                                                              */
/* ------------------------------------------------------------------ */

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  type: varchar("type", { length: 20 }).notNull(), // photo | video
  category: varchar("category", { length: 40 }).default("general"), // events | seminars | workshops | general
  imagePath: text("image_path"),
  videoUrl: text("video_url"), // youtube embed url
  thumbnail: text("thumbnail"),
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Testimonials, Team, FAQ, Services                                   */
/* ------------------------------------------------------------------ */

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  photoPath: text("photo_path"),
  designation: varchar("designation", { length: 150 }),
  location: varchar("location", { length: 150 }),
  quote: text("quote").notNull(),
  rating: integer("rating").default(5),
  isPublished: boolean("is_published").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  position: varchar("position", { length: 150 }),
  photoPath: text("photo_path"),
  bio: text("bio"),
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const faqItems = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 60 }).default("general"), // council, registration, documents, payments, events, general
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  icon: varchar("icon", { length: 60 }).default("stethoscope"),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Contact enquiries                                                    */
/* ------------------------------------------------------------------ */

export const contactEnquiries = pgTable("contact_enquiries", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("new").notNull(), // new | read | responded
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Website settings (key-value, editable from Admin → Settings)        */
/* ------------------------------------------------------------------ */

export const websiteSettings = pgTable("website_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Per-page SEO metadata (Admin → SEO)                                  */
/* ------------------------------------------------------------------ */

export const seoMeta = pgTable("seo_meta", {
  id: serial("id").primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }),
  metaDescription: text("meta_description"),
  focusKeyword: varchar("focus_keyword", { length: 150 }),
  canonicalUrl: text("canonical_url"),
  ogImage: text("og_image"),
  robots: varchar("robots", { length: 40 }).default("index,follow"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Audit logs                                                           */
/* ------------------------------------------------------------------ */

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userName: varchar("user_name", { length: 150 }),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }),
  entityId: varchar("entity_id", { length: 80 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 60 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  createdIdx: index("audit_logs_created_idx").on(t.createdAt),
}));

import { makeEntityRoutes } from "@/lib/entity-api";
import { contactEnquiries } from "@/lib/db/schema";

const handlers = makeEntityRoutes({
  table: contactEnquiries,
  orderColumn: "createdAt",
  orderDir: "desc",
  entityName: "contact_enquiry",
  minRole: "content_editor",
});

// Enquiries are created by public visitors via /api/contact — the admin API
// only needs to list, update (mark read/responded) and delete.
export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;

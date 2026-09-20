import { makeEntityRoutes } from "@/lib/entity-api";
import { services } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

export const { GET, POST, PATCH, DELETE } = makeEntityRoutes({
  table: services,
  orderColumn: "sortOrder",
  entityName: "service",
  sanitizeCreate: (body) => ({ ...body, slug: body.slug ? slugify(body.slug) : slugify(body.title || "service") }),
  sanitizeUpdate: (body) => (body.title ? { ...body, slug: body.slug ? slugify(body.slug) : slugify(body.title) } : body),
});

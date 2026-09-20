import { makeEntityRoutes } from "@/lib/entity-api";
import { blogCategories } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

export const { GET, POST, PATCH, DELETE } = makeEntityRoutes({
  table: blogCategories,
  orderColumn: "name",
  entityName: "blog_category",
  sanitizeCreate: (body) => ({ ...body, slug: body.slug ? slugify(body.slug) : slugify(body.name || "category") }),
  sanitizeUpdate: (body) => (body.name ? { ...body, slug: body.slug ? slugify(body.slug) : slugify(body.name) } : body),
});

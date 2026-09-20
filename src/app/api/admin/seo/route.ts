import { makeEntityRoutes } from "@/lib/entity-api";
import { seoMeta } from "@/lib/db/schema";

export const { GET, POST, PATCH, DELETE } = makeEntityRoutes({
  table: seoMeta,
  orderColumn: "pagePath",
  entityName: "seo_meta",
  minRole: "admin",
});

import { makeEntityRoutes } from "@/lib/entity-api";
import { faqItems } from "@/lib/db/schema";

export const { GET, POST, PATCH, DELETE } = makeEntityRoutes({
  table: faqItems,
  orderColumn: "sortOrder",
  entityName: "faq_item",
});

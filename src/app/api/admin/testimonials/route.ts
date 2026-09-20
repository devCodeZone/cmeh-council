import { makeEntityRoutes } from "@/lib/entity-api";
import { testimonials } from "@/lib/db/schema";

export const { GET, POST, PATCH, DELETE } = makeEntityRoutes({
  table: testimonials,
  orderColumn: "sortOrder",
  entityName: "testimonial",
});

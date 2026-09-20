import { makeEntityRoutes } from "@/lib/entity-api";
import { galleryItems } from "@/lib/db/schema";

export const { GET, POST, PATCH, DELETE } = makeEntityRoutes({
  table: galleryItems,
  orderColumn: "sortOrder",
  entityName: "gallery_item",
});

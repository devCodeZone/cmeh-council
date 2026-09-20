import { makeEntityRoutes } from "@/lib/entity-api";
import { teamMembers } from "@/lib/db/schema";

export const { GET, POST, PATCH, DELETE } = makeEntityRoutes({
  table: teamMembers,
  orderColumn: "sortOrder",
  entityName: "team_member",
});

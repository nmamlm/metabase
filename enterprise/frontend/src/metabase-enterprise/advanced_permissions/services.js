import { GET } from "metabase/lib/api";

export const ImpersonationApi = {
  get: GET("/api/impersonation/:groupId/:databaseId"),
};

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { push } from "react-router-redux";
import { GroupId, Impersonation } from "metabase-types/api";
import { EntityId } from "metabase/admin/permissions/types";
import {
  DATABASES_BASE_PATH,
  GROUPS_BASE_PATH,
} from "metabase/admin/permissions/utils/urls";
import { createThunkAction, withRequestState } from "metabase/lib/redux";
import { ImpersonationApi } from "./services";
import { ImpersonationParams } from "./types";
import { getImpersonationKey } from "./utils";

export const getImpersonatedPostAction = (
  entityId: EntityId,
  groupId: GroupId,
  view: "database" | "group",
) =>
  view === "database"
    ? push(
        `${DATABASES_BASE_PATH}/${entityId.databaseId}/impersonated/group/${groupId}`,
      )
    : push(
        `${GROUPS_BASE_PATH}/${groupId}/impersonated/database/${entityId.databaseId}`,
      );

export const FETCH_IMPERSONATION =
  "metabase-enterprise/advanced-permissions/FETCH_IMPERSONATION";
export const fetchImpersonation = withRequestState(
  (params: ImpersonationParams) => [
    "plugins",
    "advancedPermissionsPlugin",
    "impersonations",
    getImpersonationKey(params),
  ],
)(
  createThunkAction(
    FETCH_IMPERSONATION,
    ({ groupId, databaseId }: ImpersonationParams) =>
      async () =>
        ImpersonationApi.get({ groupId, databaseId }),
  ),
);

export interface AdvancedPermissionsState {
  impersonations: Impersonation[];
}

const initialState: AdvancedPermissionsState = {
  impersonations: [],
};

export const advancedPermissionsSlice = createSlice({
  initialState,
  name: "impersonations",
  reducers: {
    [FETCH_IMPERSONATION]: (
      state,
      { payload }: PayloadAction<Impersonation>,
    ) => {
      const impersonation = state.impersonations.find(
        impersonation =>
          impersonation.db_id === payload.db_id &&
          impersonation.group_id === payload.group_id,
      );

      if (impersonation) {
        impersonation.attribute = payload.attribute;
      } else {
        state.impersonations.push(payload);
      }
    },
  },
});

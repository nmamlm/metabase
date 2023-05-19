import React, { useCallback } from "react";
import { withRouter } from "react-router";
import { push } from "react-router-redux";
import { useMount } from "react-use";
import _ from "underscore";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { fetchAttributes } from "metabase-enterprise/sandboxes/actions";
import { getAttributes } from "metabase-enterprise/sandboxes/selectors";
import Databases from "metabase/entities/databases";
import { State } from "metabase-types/store";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper/LoadingAndErrorWrapper";
import {
  ImpersonationModalParams,
  ImpersonationParams,
} from "metabase-enterprise/advanced_permissions/types";
import { getParentPath } from "metabase/hoc/ModalRoute";
import { Database } from "metabase-types/api";
import { ImpersonationModalView } from "./ImpersonationModalView";
import { useDatabaseQuery } from "metabase/common/hooks";
import { getImpersonation } from "metabase-enterprise/advanced_permissions/selectors";

interface OwnProps {
  params: ImpersonationModalParams;
  route: {
    path: string;
  };
}
interface StateProps {
  database: Database;
}

const parseParams = (params: ImpersonationModalParams): ImpersonationParams => {
  const groupId = parseInt(params.groupId);
  const databaseId = parseInt(
    "databaseId" in params ? params.databaseId : params.impersonatedDatabaseId,
  );

  return {
    groupId,
    databaseId,
  };
};

type ImpersonationModalProps = OwnProps & StateProps;

const Component = ({ route, database, params }: ImpersonationModalProps) => {
  const { groupId, databaseId } = parseParams(params);

  const { data, isLoading, error } = useDatabaseQuery({
    id: databaseId,
  });

  // FIXME: fix TS
  const attributes = useSelector(getAttributes as any);
  const impersonation = useSelector(getImpersonation(databaseId, groupId));

  const dispatch = useDispatch();

  const handleSave = useCallback(attribute => {
    console.log("TODO: save", attribute);
  }, []);

  const handleCancel = useCallback(() => {
    dispatch(push(getParentPath(route, location)));
  }, [dispatch, route]);

  useMount(() => {
    dispatch(fetchAttributes());
  });

  return (
    <LoadingAndErrorWrapper loading={isLoading || !attributes} error={error}>
      <ImpersonationModalView
        attributes={attributes}
        database={database}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </LoadingAndErrorWrapper>
  );
};

export const ImpersonationModal = _.compose(
  Databases.load({
    id: (_state: State, { params }: OwnProps) =>
      parseInt(params.databaseId ?? params.impersonatedDatabaseId),
  }),
  withRouter,
)(Component);

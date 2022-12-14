import React, { useCallback, useMemo, useState, useEffect } from "react";
import { t } from "ttag";

import EmptyState from "metabase/components/EmptyState";
import Form from "metabase/containers/FormikForm";

import { ActionsApi } from "metabase/services";

import {
  getSubmitButtonColor,
  getSubmitButtonLabel,
  generateFieldSettingsFromParameters,
  getForm,
} from "metabase/actions/components/ActionCreator/FormCreator";
import { shouldPrefetchValues } from "metabase/actions/utils";

import type {
  WritebackParameter,
  WritebackQueryAction,
  OnSubmitActionForm,
  DataAppPage,
  ActionDashboardCard,
  ParametersForActionExecution,
} from "metabase-types/api";

import {
  setDefaultValues,
  setNumericValues,
  getChangedValues,
  getInitialValues,
} from "./utils";

interface Props {
  missingParameters: WritebackParameter[];
  dashcardParamValues: ParametersForActionExecution;

  action: WritebackQueryAction;
  page?: DataAppPage;
  dashcard?: ActionDashboardCard;
  onCancel?: () => void;
  submitButtonColor?: string;
  onSubmit: OnSubmitActionForm;
  onSubmitSuccess?: () => void;
}

function ActionParametersInputForm({
  missingParameters,
  dashcardParamValues,
  action,
  page,
  dashcard,
  onCancel,
  onSubmit,
  onSubmitSuccess,
}: Props) {
  const [prefetchValues, setPrefetchValues] =
    useState<ParametersForActionExecution>({});

  const shouldPrefetch = useMemo(() => shouldPrefetchValues(action), [action]);

  const fetchInitialValues = useCallback(
    () =>
      ActionsApi.prefetchValues({
        dashboardId: page?.id,
        dashcardId: dashcard?.id,
        parameters: JSON.stringify(dashcardParamValues),
      }).then(setPrefetchValues),
    [page?.id, dashcard?.id, dashcardParamValues],
  );

  useEffect(() => {
    // we need at least 1 parameter value (a PK) to fetch initial values
    const canPrefetch =
      Object.keys(dashcardParamValues).length > 0 && page && dashcard;

    if (shouldPrefetch) {
      setPrefetchValues({});
      canPrefetch && fetchInitialValues();
    }
  }, [shouldPrefetch, page, dashcard, dashcardParamValues, fetchInitialValues]);

  const fieldSettings = useMemo(
    () =>
      action.visualization_settings?.fields ??
      // if there are no field settings, we generate them from the parameters and field metadata
      generateFieldSettingsFromParameters(
        missingParameters,
        dashcard?.card?.result_metadata,
      ),
    [action, missingParameters, dashcard],
  );

  const form = useMemo(
    () => getForm(missingParameters, fieldSettings),
    [missingParameters, fieldSettings],
  );

  const initialValues = useMemo(
    () => getInitialValues(fieldSettings, prefetchValues),
    [fieldSettings, prefetchValues],
  );

  const handleSubmit = useCallback(
    async (params, actions) => {
      actions.setSubmitting(true);
      const paramsWithDefaultValues = setDefaultValues(params, fieldSettings);
      const paramsWithNumericValues = setNumericValues(
        paramsWithDefaultValues,
        fieldSettings,
      );
      const paramsWithChangedValues = getChangedValues(
        paramsWithNumericValues,
        initialValues,
      );

      const { success, error } = await onSubmit(paramsWithChangedValues);

      if (success) {
        actions.setErrors({});
        onSubmitSuccess?.();

        shouldPrefetch ? fetchInitialValues() : actions.resetForm();
      } else {
        throw new Error(error);
      }
    },
    [
      onSubmit,
      onSubmitSuccess,
      fieldSettings,
      initialValues,
      fetchInitialValues,
      shouldPrefetch,
    ],
  );

  const hasPrefetchedValues = !!Object.keys(prefetchValues).length;

  if (shouldPrefetch && !hasPrefetchedValues) {
    return <EmptyState message={t`Choose a record to update`} />;
  }

  const submitButtonLabel = getSubmitButtonLabel(action);

  return (
    <Form
      form={form}
      initialValues={initialValues}
      overwriteOnInitialValuesChange
      onClose={onCancel}
      onSubmit={handleSubmit}
      submitTitle={submitButtonLabel}
      submitButtonColor={getSubmitButtonColor(action)}
    />
  );
}

export default ActionParametersInputForm;
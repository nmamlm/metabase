import Question, { MetricQuestion } from "metabase-lib/lib/Question";
import StructuredQuery from "metabase-lib/lib/queries/StructuredQuery";
import NativeQuery from "metabase-lib/lib/queries/NativeQuery";
import { ModeType } from "./types";
import {
  MODE_TYPE_ACTION,
  MODE_TYPE_NATIVE,
  MODE_TYPE_SEGMENT,
  MODE_TYPE_METRIC,
  MODE_TYPE_TIMESERIES,
  MODE_TYPE_GEO,
  MODE_TYPE_PIVOT,
  MODE_TYPE_DEFAULT,
  MODE_TYPE_NEW_METRIC,
} from "metabase-lib/lib/Mode/constants";

export function getMode(question: Question): ModeType | null {
  if (!question) {
    return null;
  }

  if (question instanceof MetricQuestion) {
    return MODE_TYPE_NEW_METRIC;
  }

  if (question.card().display === "action-button") {
    return MODE_TYPE_ACTION;
  }

  const query = question.query();

  if (query instanceof NativeQuery) {
    return MODE_TYPE_NATIVE;
  }

  if (query instanceof StructuredQuery) {
    const aggregations = query.aggregations();
    const breakouts = query.breakouts();

    if (aggregations.length === 0 && breakouts.length === 0) {
      return MODE_TYPE_SEGMENT;
    }

    if (aggregations.length > 0 && breakouts.length === 0) {
      return MODE_TYPE_METRIC;
    }

    if (aggregations.length > 0 && breakouts.length > 0) {
      const breakoutFields = breakouts.map(b => b.field());
      if (
        (breakoutFields.length === 1 && breakoutFields[0].isDate()) ||
        (breakoutFields.length === 2 &&
          breakoutFields[0].isDate() &&
          breakoutFields[1].isCategory())
      ) {
        return MODE_TYPE_TIMESERIES;
      }

      if (breakoutFields.length === 1 && breakoutFields[0].isAddress()) {
        return MODE_TYPE_GEO;
      }

      if (
        (breakoutFields.length === 1 && breakoutFields[0].isCategory()) ||
        (breakoutFields.length === 2 &&
          breakoutFields[0].isCategory() &&
          breakoutFields[1].isCategory())
      ) {
        return MODE_TYPE_PIVOT;
      }
    }
  }

  return MODE_TYPE_DEFAULT;
}

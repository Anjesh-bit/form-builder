import { useCallback, useMemo, useState } from "react";
import { collectFieldIds } from "../form-config/utils/fieldTree";
import { validateFormConfig } from "../form-config/utils/formValidation";
import type { FormConfig, FormValues } from "../form-config/types";

const keepKnownIds = <T>(
  record: Record<string, T>,
  knownIds: Set<string>,
): Record<string, T> => {
  const recordIds = Object.keys(record);
  const knownRecordIds = recordIds.filter((id) => knownIds.has(id));
  const hasNoUnknownIds = knownRecordIds.length === recordIds.length;

  if (hasNoUnknownIds) return record;

  const knownRecord: Record<string, T> = {};

  for (const id of knownRecordIds) {
    knownRecord[id] = record[id];
  }

  return knownRecord;
};

export const useFormPreviewState = (config: FormConfig) => {
  const [values, setValues] = useState<FormValues>({});
  const [touchedFieldIds, setTouchedFieldIds] = useState<
    Record<string, boolean>
  >({});
  const [submitted, setSubmitted] = useState(false);

  const [previousConfig, setPreviousConfig] = useState(config);
  if (config !== previousConfig) {
    const knownIds = new Set(collectFieldIds(config));

    setPreviousConfig(config);
    setValues(keepKnownIds(values, knownIds));
    setTouchedFieldIds(keepKnownIds(touchedFieldIds, knownIds));
  }

  const setValue = useCallback((fieldId: string, value: string) => {
    setValues((previousValues) => ({ ...previousValues, [fieldId]: value }));
  }, []);

  const touchField = useCallback((fieldId: string) => {
    setTouchedFieldIds((previousTouched) =>
      previousTouched[fieldId]
        ? previousTouched
        : { ...previousTouched, [fieldId]: true },
    );
  }, []);

  const submit = useCallback(() => setSubmitted(true), []);

  const errors = useMemo(
    () => validateFormConfig(config, values),
    [config, values],
  );

  const getVisibleError = useCallback(
    (fieldId: string): string | null => {
      const shouldShowErrors = submitted || touchedFieldIds[fieldId];

      if (shouldShowErrors) return errors[fieldId] ?? null;

      return null;
    },
    [errors, submitted, touchedFieldIds],
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    setValue,
    touchField,
    submit,
    submitted,
    errors,
    getVisibleError,
    isValid,
  };
};

export type FormPreviewState = ReturnType<typeof useFormPreviewState>;

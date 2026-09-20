import type { FC } from "react";
import { FieldType } from "../form-config/enums";
import type { FormField, NumberField } from "../form-config/types";
import type { FormPreviewState } from "./useFormPreviewState";

type PreviewFieldProps = {
  field: FormField;
  formState: FormPreviewState;
};

const getRangeHint = ({ min, max }: NumberField): string => {
  const hasRange = min !== undefined || max !== undefined;

  return hasRange ? ` (${min ?? "any"} to ${max ?? "any"})` : "";
};

export const PreviewField: FC<PreviewFieldProps> = ({ field, formState }) => {
  const { getVisibleError, values, setValue, touchField } = formState;
  const { id, label, required } = field;

  const error = getVisibleError(id);
  const hasError = error !== null;
  const errorId = `${id}-error`;
  const describedBy = hasError ? errorId : undefined;
  const requiredMarker = required ? " *" : "";

  const errorMessage = hasError && (
    <p id={errorId} className="field-error" role="alert">
      {error}
    </p>
  );

  if (field.type === FieldType.Group) {
    const isEmptyGroup = field.children.length === 0;

    return (
      <fieldset className="preview-group" aria-describedby={describedBy}>
        <legend>
          {label}
          {requiredMarker}
        </legend>
        {isEmptyGroup ? (
          <p className="empty-hint">Empty group.</p>
        ) : (
          field.children.map((child) => (
            <PreviewField key={child.id} field={child} formState={formState} />
          ))
        )}
        {errorMessage}
      </fieldset>
    );
  }

  const rangeHint = field.type === FieldType.Number ? getRangeHint(field) : "";

  return (
    <div className="preview-field">
      <label htmlFor={id}>
        {label}
        {requiredMarker}
        {rangeHint && <span className="field-hint">{rangeHint}</span>}
      </label>
      <input
        id={id}
        inputMode={field.type === FieldType.Number ? "decimal" : undefined}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        value={values[id] ?? ""}
        onChange={({ target }) => setValue(id, target.value)}
        onBlur={() => touchField(id)}
      />
      {errorMessage}
    </div>
  );
};

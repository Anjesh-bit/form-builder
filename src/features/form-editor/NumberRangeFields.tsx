import type { FC } from "react";
import { VALIDATION_MESSAGES } from "../form-config/constants";
import { useFormConfigActions } from "../form-config/formConfigContext";
import type { NumberField } from "../form-config/types";
import { isValidRange } from "../form-config/utils/formValidation";

type NumberRangeFieldsProps = {
  field: NumberField;
};

const parseNumberInput = (inputValue: string): number | undefined =>
  inputValue ? Number(inputValue) : undefined;

export const NumberRangeFields: FC<NumberRangeFieldsProps> = ({ field }) => {
  const { updateNumberRange } = useFormConfigActions();
  const { id, min, max } = field;

  const hasRangeError = !isValidRange({ min, max });

  return (
    <div className="field-editor__row field-editor__row--indent">
      <label>
        min
        <input
          type="number"
          value={min ?? ""}
          aria-invalid={hasRangeError}
          onChange={({ target }) =>
            updateNumberRange(id, { min: parseNumberInput(target.value) })
          }
        />
      </label>
      <label>
        max
        <input
          type="number"
          value={max ?? ""}
          aria-invalid={hasRangeError}
          onChange={({ target }) =>
            updateNumberRange(id, { max: parseNumberInput(target.value) })
          }
        />
      </label>
      {hasRangeError && (
        <p className="field-error" role="alert">
          {VALIDATION_MESSAGES.minExceedsMax}
        </p>
      )}
    </div>
  );
};

import { memo, type FC } from "react";
import { useFormConfigActions } from "../form-config/formConfigContext";
import { FieldType, MoveDirection } from "../form-config/enums";
import type { FormField } from "../form-config/types";
import { FieldEditorList } from "./FieldEditorList";
import { AddFieldButtons } from "./AddFieldButtons";
import { NumberRangeFields } from "./NumberRangeFields";

type FieldEditorProps = {
  field: FormField;
  isFirst: boolean;
  isLast: boolean;
};

export const FieldEditor: FC<FieldEditorProps> = memo(
  ({ field, isFirst, isLast }) => {
    const { updateField, removeField, moveField } = useFormConfigActions();
    const { id, label, required } = field;

    return (
      <div className="field-editor">
        <div className="field-editor__row">
          <span className={`field-type-tag field-type-tag--${field.type}`}>
            {field.type}
          </span>

          <input
            aria-label="Field label"
            className="field-editor__label"
            value={label}
            onChange={({ target }) => updateField(id, { label: target.value })}
          />

          <label className="field-editor__checkbox">
            <input
              type="checkbox"
              checked={required}
              onChange={({ target }) =>
                updateField(id, { required: target.checked })
              }
            />
            required
          </label>

          <button
            type="button"
            onClick={() => moveField(id, MoveDirection.Up)}
            disabled={isFirst}
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveField(id, MoveDirection.Down)}
            disabled={isLast}
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => removeField(id)}
            aria-label="Delete field"
          >
            delete
          </button>
        </div>

        {field.type === FieldType.Number && <NumberRangeFields field={field} />}

        {field.type === FieldType.Group && (
          <div className="field-editor__children">
            <FieldEditorList fields={field.children} />
            <AddFieldButtons parentId={id} />
          </div>
        )}
      </div>
    );
  },
);

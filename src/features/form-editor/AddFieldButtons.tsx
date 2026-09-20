import type { FC } from "react";
import { generateFieldId } from "../form-config/utils/generateFieldId";
import { useFormConfigActions } from "../form-config/formConfigContext";
import { ADDABLE_FIELD_TYPES } from "../form-config/constants";
import { FieldType } from "../form-config/enums";
import type { FormField } from "../form-config/types";

const createEmptyField = (type: FieldType): FormField => {
  const id = generateFieldId(type);
  const label = `New ${type} field`;

  if (type === FieldType.Group)
    return { id, type, label, required: false, children: [] };

  return { id, type, label, required: false };
};

type AddFieldButtonsProps = {
  parentId: string | null;
};

export const AddFieldButtons: FC<AddFieldButtonsProps> = ({ parentId }) => {
  const { addField } = useFormConfigActions();

  return (
    <div className="new-field-buttons">
      {ADDABLE_FIELD_TYPES.map((fieldType) => (
        <button
          key={fieldType}
          type="button"
          onClick={() => addField(parentId, createEmptyField(fieldType))}
        >
          + {fieldType}
        </button>
      ))}
    </div>
  );
};

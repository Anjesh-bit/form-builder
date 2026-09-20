import { FieldType } from "../../enums";
import type { FormConfig, FormField } from "../../types";

type SerializedField = {
  type: FieldType;
  label: string;
  required: boolean;
  min?: number;
  max?: number;
  children?: SerializedField[];
};

const serializeField = (field: FormField): SerializedField => {
  const { type, label, required } = field;
  const commonProperties = { type, label, required };

  if (field.type === FieldType.Number)
    return { ...commonProperties, min: field.min, max: field.max };

  if (field.type === FieldType.Group)
    return { ...commonProperties, children: field.children.map(serializeField) };

  return commonProperties;
};

export const exportConfig = (config: FormConfig): string =>
  JSON.stringify({ fields: config.map(serializeField) }, null, 2);

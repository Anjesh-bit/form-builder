import { VALIDATION_MESSAGES } from "../constants";
import { FieldType } from "../enums";
import type {
  FormConfig,
  FormErrors,
  FormValues,
  GroupField,
  LeafField,
  NumberField,
  NumberRangeChanges,
} from "../types";

const isFilled = (value = ""): boolean => Boolean(value.trim());

export const groupHasValue = (group: GroupField, values: FormValues): boolean =>
  group.children.some((child) =>
    child.type === FieldType.Group
      ? groupHasValue(child, values)
      : isFilled(values[child.id]),
  );

export const isValidRange = ({
  min = -Infinity,
  max = Infinity,
}: NumberRangeChanges): boolean => min <= max;

const validateNumberRange = (
  { min = -Infinity, max = Infinity }: NumberField,
  numericValue: number,
): string | null => {
  if (numericValue < min) return VALIDATION_MESSAGES.minValue(min);
  if (numericValue > max) return VALIDATION_MESSAGES.maxValue(max);

  return null;
};

const DECIMAL_LITERAL = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

const validateNumberValue = (
  field: NumberField,
  value: string,
): string | null => {
  const numericValue = Number(value);
  const isDecimal = DECIMAL_LITERAL.test(value);

  return isDecimal && Number.isFinite(numericValue)
    ? validateNumberRange(field, numericValue)
    : VALIDATION_MESSAGES.invalidNumber;
};

export const validateLeafField = (
  field: LeafField,
  rawValue = "",
): string | null => {
  const { required } = field;
  const value = rawValue.trim();

  if (!value) return required ? VALIDATION_MESSAGES.required : null;

  if (field.type === FieldType.Number) return validateNumberValue(field, value);

  return null;
};

const validateGroupField = (
  group: GroupField,
  values: FormValues,
): string | null => {
  const hasChildren = group.children.length > 0;
  const isMissingValue =
    group.required && hasChildren && !groupHasValue(group, values);

  return isMissingValue ? VALIDATION_MESSAGES.groupNeedsValue : null;
};

export const validateFormConfig = (
  config: FormConfig,
  values: FormValues,
): FormErrors => {
  const errorsByFieldId: FormErrors = {};

  const collectErrors = (fields: FormConfig) => {
    for (const field of fields) {
      const { id } = field;

      const error =
        field.type === FieldType.Group
          ? validateGroupField(field, values)
          : validateLeafField(field, values[id]);
      if (error) errorsByFieldId[id] = error;

      if (field.type === FieldType.Group) collectErrors(field.children);
    }
  };

  collectErrors(config);
  return errorsByFieldId;
};

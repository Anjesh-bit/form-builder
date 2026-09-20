import { FieldType } from "./enums";

export const ADDABLE_FIELD_TYPES = [
  FieldType.Text,
  FieldType.Number,
  FieldType.Group,
] as const;

export const VALIDATION_MESSAGES = {
  required: "This field is required",
  invalidNumber: "Enter a valid number",
  groupNeedsValue: "Fill in at least one field in this group",
  minValue: (min: number) => `Must be at least ${min}`,
  maxValue: (max: number) => `Must be at most ${max}`,
  minExceedsMax: "Min must not be greater than max",
} as const;

export const IMPORT_ERROR_MESSAGES = {
  invalidJson: "That is not valid JSON.",
  unexpectedShape:
    'Expected an array of fields, or an object shaped like { "fields": [...] }.',
  fieldMustBeObject: (path: string) => `${path} should be an object.`,
  invalidFieldType: (path: string) =>
    `${path}.type must be "text", "number", or "group".`,
  emptyLabel: (path: string) => `${path}.label must be a non-empty string.`,
  mustBeNumber: (path: string) => `${path} must be a number.`,
  minExceedsMax: (path: string) =>
    `${path}.min must not be greater than ${path}.max.`,
  childrenMustBeArray: (path: string) => `${path}.children must be an array.`,
} as const;

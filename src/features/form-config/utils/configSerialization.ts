import { IMPORT_ERROR_MESSAGES } from "../constants";
import { FieldType } from "../enums";
import { generateFieldId } from "./generateFieldId";
import { isValidRange } from "./formValidation";
import type {
  FormConfig,
  FormField,
  JsonObject,
  JsonValue,
  NumberField,
} from "../types";

type SerializedField = {
  type: FieldType;
  label: string;
  required: boolean;
  min?: number;
  max?: number;
  children?: SerializedField[];
};

type MaybeJsonValue = JsonValue | undefined;

const FIELD_TYPE_VALUES: readonly MaybeJsonValue[] = Object.values(FieldType);

export class ConfigImportError extends Error {}

const isJsonObject = (value: MaybeJsonValue): value is JsonObject => {
  const isObjectLike = typeof value === "object" && value !== null;
  return isObjectLike && !Array.isArray(value);
};

const isFieldType = (value: MaybeJsonValue): value is FieldType =>
  FIELD_TYPE_VALUES.includes(value);

const serializeField = (field: FormField): SerializedField => {
  const { type, label, required } = field;
  const commonProperties = { type, label, required };

  if (field.type === FieldType.Number) {
    return {
      ...commonProperties,
      min: field.min,
      max: field.max,
    };
  }

  if (field.type === FieldType.Group) {
    return {
      ...commonProperties,
      children: field.children.map(serializeField),
    };
  }

  return commonProperties;
};

export const exportConfig = (config: FormConfig): string =>
  JSON.stringify({ fields: config.map(serializeField) }, null, 2);

const readOptionalNumber = (
  value: MaybeJsonValue,
  path: string,
): number | undefined => {
  if (value === undefined || typeof value === "number") return value;

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.mustBeNumber(path));
};

const parseField = (rawField: MaybeJsonValue, path: string): FormField => {
  if (isJsonObject(rawField)) return parseTypedField(rawField, path);

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.fieldMustBeObject(path));
};

const parseTypedField = (rawField: JsonObject, path: string): FormField => {
  const { type, label } = rawField;

  if (isFieldType(type)) return parseLabeledField(rawField, type, label, path);

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.invalidFieldType(path));
};

const parseLabeledField = (
  rawField: JsonObject,
  type: FieldType,
  label: MaybeJsonValue,
  path: string,
): FormField => {
  if (typeof label === "string" && label.trim())
    return buildField(rawField, type, label, path);

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.emptyLabel(path));
};

const buildNumberField = (
  rawField: JsonObject,
  baseProperties: Pick<NumberField, "id" | "label" | "required">,
  path: string,
): NumberField => {
  const min = readOptionalNumber(rawField.min, `${path}.min`);
  const max = readOptionalNumber(rawField.max, `${path}.max`);

  if (isValidRange({ min, max }))
    return { ...baseProperties, type: FieldType.Number, min, max };

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.minExceedsMax(path));
};

const buildField = (
  rawField: JsonObject,
  type: FieldType,
  label: string,
  path: string,
): FormField => {
  const required = rawField.required === true;
  const id = generateFieldId(type);

  if (type === FieldType.Text) return { id, type, label, required };

  if (type === FieldType.Number)
    return buildNumberField(rawField, { id, label, required }, path);

  const rawChildren = rawField.children ?? [];
  if (Array.isArray(rawChildren)) {
    const children = rawChildren.map((rawChild, index) =>
      parseField(rawChild, `${path}.children[${index}]`),
    );
    return { id, type, label, required, children };
  }

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.childrenMustBeArray(path));
};

const extractRawFields = (parsedJson: JsonValue): JsonValue[] => {
  if (Array.isArray(parsedJson)) return parsedJson;

  if (isJsonObject(parsedJson) && Array.isArray(parsedJson.fields))
    return parsedJson.fields;

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.unexpectedShape);
};

const parseJson = (json: string): JsonValue => {
  try {
    return JSON.parse(json);
  } catch {
    throw new ConfigImportError(IMPORT_ERROR_MESSAGES.invalidJson);
  }
};

export const importConfig = (json: string): FormConfig => {
  const parsedJson = parseJson(json);

  return extractRawFields(parsedJson).map((rawField, index) =>
    parseField(rawField, `fields[${index}]`),
  );
};

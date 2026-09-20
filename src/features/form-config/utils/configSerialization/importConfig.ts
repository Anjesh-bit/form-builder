import { IMPORT_ERROR_MESSAGES } from "../../constants";
import { FieldType } from "../../enums";
import type {
  FormConfig,
  FormField,
  GroupField,
  JsonObject,
  JsonValue,
  NumberField,
} from "../../types";
import { isValidRange } from "../formValidation";
import { generateFieldId } from "../generateFieldId";
import { ConfigImportError } from "./ConfigImportError";
import {
  isFieldType,
  isJsonObject,
  isNonEmptyString,
  type MaybeJsonValue,
} from "./jsonGuards";

type BaseProperties = Pick<FormField, "id" | "label" | "required">;

const parseJson = (json: string): JsonValue => {
  try {
    return JSON.parse(json);
  } catch {
    throw new ConfigImportError(IMPORT_ERROR_MESSAGES.invalidJson);
  }
};

const extractRawFields = (parsedJson: JsonValue): JsonValue[] => {
  if (Array.isArray(parsedJson)) return parsedJson;

  if (isJsonObject(parsedJson) && Array.isArray(parsedJson.fields))
    return parsedJson.fields;

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.unexpectedShape);
};

const readOptionalNumber = (
  value: MaybeJsonValue,
  path: string,
): number | undefined => {
  if (value === undefined || typeof value === "number") return value;

  throw new ConfigImportError(IMPORT_ERROR_MESSAGES.mustBeNumber(path));
};

const parseNumberField = (
  rawField: JsonObject,
  base: BaseProperties,
  path: string,
): NumberField => {
  const min = readOptionalNumber(rawField.min, `${path}.min`);
  const max = readOptionalNumber(rawField.max, `${path}.max`);

  if (!isValidRange({ min, max }))
    throw new ConfigImportError(IMPORT_ERROR_MESSAGES.minExceedsMax(path));

  return { ...base, type: FieldType.Number, min, max };
};

const parseGroupField = (
  rawField: JsonObject,
  base: BaseProperties,
  path: string,
): GroupField => {
  const rawChildren = rawField.children ?? [];

  if (!Array.isArray(rawChildren))
    throw new ConfigImportError(IMPORT_ERROR_MESSAGES.childrenMustBeArray(path));

  const children = rawChildren.map((rawChild, index) =>
    parseField(rawChild, `${path}.children[${index}]`),
  );

  return { ...base, type: FieldType.Group, children };
};

const parseField = (rawField: MaybeJsonValue, path: string): FormField => {
  if (!isJsonObject(rawField))
    throw new ConfigImportError(IMPORT_ERROR_MESSAGES.fieldMustBeObject(path));

  const { type, label } = rawField;

  if (!isFieldType(type))
    throw new ConfigImportError(IMPORT_ERROR_MESSAGES.invalidFieldType(path));

  if (!isNonEmptyString(label))
    throw new ConfigImportError(IMPORT_ERROR_MESSAGES.emptyLabel(path));

  const base = {
    id: generateFieldId(type),
    label,
    required: rawField.required === true,
  };

  switch (type) {
    case FieldType.Text:
      return { ...base, type };
    case FieldType.Number:
      return parseNumberField(rawField, base, path);
    case FieldType.Group:
      return parseGroupField(rawField, base, path);
  }
};

export const importConfig = (json: string): FormConfig =>
  extractRawFields(parseJson(json)).map((rawField, index) =>
    parseField(rawField, `fields[${index}]`),
  );

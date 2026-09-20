import { FieldType } from "../../enums";
import type { JsonObject, JsonValue } from "../../types";

export type MaybeJsonValue = JsonValue | undefined;

const FIELD_TYPE_VALUES: readonly MaybeJsonValue[] = Object.values(FieldType);

export const isJsonObject = (value: MaybeJsonValue): value is JsonObject => {
  const isObjectLike = typeof value === "object" && value !== null;
  return isObjectLike && !Array.isArray(value);
};

export const isFieldType = (value: MaybeJsonValue): value is FieldType =>
  FIELD_TYPE_VALUES.includes(value);

export const isNonEmptyString = (value: MaybeJsonValue): value is string =>
  typeof value === "string" && value.trim() !== "";

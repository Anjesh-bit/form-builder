import { describe, expect, it } from "vitest";
import { VALIDATION_MESSAGES } from "../constants";
import { FieldType } from "../enums";
import type { FormConfig, GroupField, NumberField, TextField } from "../types";
import {
  groupHasValue,
  isValidRange,
  validateFormConfig,
  validateLeafField,
} from "./formValidation";

const textField = (overrides: Partial<TextField> = {}): TextField => ({
  id: "text",
  type: FieldType.Text,
  label: "Text",
  required: false,
  ...overrides,
});

const numberField = (overrides: Partial<NumberField> = {}): NumberField => ({
  id: "number",
  type: FieldType.Number,
  label: "Number",
  required: false,
  ...overrides,
});

const groupField = (overrides: Partial<GroupField> = {}): GroupField => ({
  id: "group",
  type: FieldType.Group,
  label: "Group",
  required: false,
  children: [],
  ...overrides,
});

describe("validateLeafField", () => {
  it("requires a value when the field is required", () => {
    expect(validateLeafField(textField({ required: true }), "")).toBe(
      VALIDATION_MESSAGES.required,
    );
  });

  it("treats whitespace-only and missing values as empty", () => {
    const field = textField({ required: true });

    expect(validateLeafField(field, "   ")).toBe(VALIDATION_MESSAGES.required);
    expect(validateLeafField(field, undefined)).toBe(
      VALIDATION_MESSAGES.required,
    );
  });

  it("accepts an empty optional field, even with a min", () => {
    expect(validateLeafField(numberField({ min: 18 }), "")).toBeNull();
  });

  it("rejects non-numeric input for number fields", () => {
    expect(validateLeafField(numberField(), "abc")).toBe(
      VALIDATION_MESSAGES.invalidNumber,
    );
  });

  it("enforces min and max", () => {
    const field = numberField({ min: 10, max: 20 });

    expect(validateLeafField(field, "9")).toBe(
      VALIDATION_MESSAGES.minValue(10),
    );
    expect(validateLeafField(field, "21")).toBe(
      VALIDATION_MESSAGES.maxValue(20),
    );
    expect(validateLeafField(field, "10")).toBeNull();
    expect(validateLeafField(field, "20")).toBeNull();
  });

  it("treats a min or max of 0 as a real limit", () => {
    expect(validateLeafField(numberField({ min: 0 }), "-1")).toBe(
      VALIDATION_MESSAGES.minValue(0),
    );
    expect(validateLeafField(numberField({ max: 0 }), "1")).toBe(
      VALIDATION_MESSAGES.maxValue(0),
    );
  });

  it("applies no range when min and max are unset", () => {
    expect(validateLeafField(numberField(), "-1000000")).toBeNull();
  });

  it("does not range-check text fields", () => {
    expect(validateLeafField(textField(), "anything")).toBeNull();
  });
});

describe("isValidRange", () => {
  it("accepts min below, equal to, or missing relative to max", () => {
    expect(isValidRange({ min: 1, max: 2 })).toBe(true);
    expect(isValidRange({ min: 2, max: 2 })).toBe(true);
    expect(isValidRange({ min: 1 })).toBe(true);
    expect(isValidRange({ max: 1 })).toBe(true);
    expect(isValidRange({})).toBe(true);
  });

  it("rejects min above max", () => {
    expect(isValidRange({ min: 3, max: 2 })).toBe(false);
  });

  it("handles negative and zero bounds", () => {
    expect(isValidRange({ min: -5, max: 0 })).toBe(true);
    expect(isValidRange({ min: 0, max: -5 })).toBe(false);
  });
});

describe("groupHasValue", () => {
  it("is false when every child is blank", () => {
    const group = groupField({ children: [textField({ id: "a" })] });

    expect(groupHasValue(group, { a: "  " })).toBe(false);
  });

  it("finds a value in a nested group", () => {
    const group = groupField({
      children: [
        groupField({ id: "inner", children: [textField({ id: "a" })] }),
      ],
    });

    expect(groupHasValue(group, { a: "hi" })).toBe(true);
  });
});

describe("validateFormConfig", () => {
  it("collects errors by field id, including nested fields", () => {
    const config: FormConfig = [
      textField({ id: "name", required: true }),
      groupField({
        id: "address",
        children: [numberField({ id: "zip", min: 1000 })],
      }),
    ];

    expect(validateFormConfig(config, { zip: "5" })).toEqual({
      name: VALIDATION_MESSAGES.required,
      zip: VALIDATION_MESSAGES.minValue(1000),
    });
  });

  it("requires at least one filled child for a required group", () => {
    const config: FormConfig = [
      groupField({
        id: "g",
        required: true,
        children: [textField({ id: "a" })],
      }),
    ];

    expect(validateFormConfig(config, {})).toEqual({
      g: VALIDATION_MESSAGES.groupNeedsValue,
    });
    expect(validateFormConfig(config, { a: "x" })).toEqual({});
  });

  it("returns no errors for a valid form", () => {
    const config: FormConfig = [textField({ id: "a", required: true })];

    expect(validateFormConfig(config, { a: "ok" })).toEqual({});
  });
});

import { describe, expect, it } from "vitest";
import {
  ConfigImportError,
  exportConfig,
  importConfig,
} from "./configSerialization";
import { IMPORT_ERROR_MESSAGES } from "../constants";
import { FieldType } from "../enums";
import type { FormConfig } from "../types";

const withoutIds = (config: FormConfig): unknown =>
  JSON.parse(
    JSON.stringify(config, (key, value) => (key === "id" ? undefined : value)),
  );

describe("importConfig", () => {
  it("accepts a { fields: [...] } object", () => {
    const config = importConfig(
      JSON.stringify({ fields: [{ type: "text", label: "Name" }] }),
    );

    expect(config).toHaveLength(1);
    expect(config[0]).toMatchObject({
      type: FieldType.Text,
      label: "Name",
      required: false,
    });
  });

  it("accepts an explicit required: false", () => {
    const [field] = importConfig(
      '[{ "type": "text", "label": "n", "required": false }]',
    );

    expect(field.required).toBe(false);
  });

  it("accepts a bare array", () => {
    const config = importConfig(
      JSON.stringify([{ type: "text", label: "Name", required: true }]),
    );

    expect(config[0].required).toBe(true);
  });

  it("imports number limits and nested groups", () => {
    const config = importConfig(
      JSON.stringify([
        {
          type: "group",
          label: "Address",
          children: [{ type: "number", label: "Zip", min: 0, max: 99999 }],
        },
      ]),
    );

    expect(withoutIds(config)).toEqual([
      {
        type: "group",
        label: "Address",
        required: false,
        children: [
          { type: "number", label: "Zip", required: false, min: 0, max: 99999 },
        ],
      },
    ]);
  });

  it("accepts a min equal to max", () => {
    const [field] = importConfig(
      '[{ "type": "number", "label": "n", "min": 5, "max": 5 }]',
    );

    expect(field).toMatchObject({ min: 5, max: 5 });
  });

  it("assigns a fresh id to every imported field", () => {
    const [first, second] = importConfig(
      JSON.stringify([
        { type: "text", label: "A" },
        { type: "text", label: "B" },
      ]),
    );

    expect(first.id).toBeTruthy();
    expect(first.id).not.toBe(second.id);
  });

  it.each([
    ["invalid JSON", "{ nope", IMPORT_ERROR_MESSAGES.invalidJson],
    ["a bare string", '"hello"', IMPORT_ERROR_MESSAGES.unexpectedShape],
    ["an object without fields", "{}", IMPORT_ERROR_MESSAGES.unexpectedShape],
    [
      "a non-object field",
      "[1]",
      IMPORT_ERROR_MESSAGES.fieldMustBeObject("fields[0]"),
    ],
    [
      "an unknown field type",
      '[{ "type": "date", "label": "x" }]',
      IMPORT_ERROR_MESSAGES.invalidFieldType("fields[0]"),
    ],
    [
      "an empty label",
      '[{ "type": "text", "label": "  " }]',
      IMPORT_ERROR_MESSAGES.emptyLabel("fields[0]"),
    ],
    [
      "a non-numeric min",
      '[{ "type": "number", "label": "n", "min": "1" }]',
      IMPORT_ERROR_MESSAGES.mustBeNumber("fields[0].min"),
    ],
    [
      "a string required flag",
      '[{ "type": "text", "label": "n", "required": "yes" }]',
      IMPORT_ERROR_MESSAGES.mustBeBoolean("fields[0].required"),
    ],
    [
      "a null required flag",
      '[{ "type": "number", "label": "n", "required": null }]',
      IMPORT_ERROR_MESSAGES.mustBeBoolean("fields[0].required"),
    ],
    [
      "a non-boolean required flag on a nested field, with its path",
      '[{ "type": "group", "label": "g", "children": [{ "type": "text", "label": "t", "required": 1 }] }]',
      IMPORT_ERROR_MESSAGES.mustBeBoolean("fields[0].children[0].required"),
    ],
    [
      "a min greater than max",
      '[{ "type": "number", "label": "n", "min": 10, "max": 5 }]',
      IMPORT_ERROR_MESSAGES.minExceedsMax("fields[0]"),
    ],
    [
      "non-array children",
      '[{ "type": "group", "label": "g", "children": {} }]',
      IMPORT_ERROR_MESSAGES.childrenMustBeArray("fields[0]"),
    ],
    [
      "an invalid nested field, with its path",
      '[{ "type": "group", "label": "g", "children": [{ "type": "text" }] }]',
      IMPORT_ERROR_MESSAGES.emptyLabel("fields[0].children[0]"),
    ],
  ])("rejects %s", (_name, json, message) => {
    expect(() => importConfig(json)).toThrow(new ConfigImportError(message));
  });
});

describe("exportConfig", () => {
  it("round-trips through importConfig, apart from ids", () => {
    const original = importConfig(
      JSON.stringify([
        { type: "text", label: "Name", required: true },
        { type: "number", label: "Age", min: 18 },
        {
          type: "group",
          label: "Address",
          children: [{ type: "text", label: "City" }],
        },
      ]),
    );

    const roundTripped = importConfig(exportConfig(original));

    expect(withoutIds(roundTripped)).toEqual(withoutIds(original));
  });

  it("does not export ids", () => {
    const config = importConfig('[{ "type": "text", "label": "A" }]');

    expect(exportConfig(config)).not.toContain('"id"');
  });
});

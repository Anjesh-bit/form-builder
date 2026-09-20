import { describe, expect, it } from "vitest";
import { FieldType, MoveDirection } from "./enums";
import { FormConfigActionType, formConfigReducer } from "./formConfigReducer";
import type { FormConfig, FormField } from "./types";

const textField = (id: string): FormField => ({
  id,
  type: FieldType.Text,
  label: id,
  required: false,
});

const idsOf = (config: FormConfig) => config.map(({ id }) => id);

describe("formConfigReducer", () => {
  it("adds a field", () => {
    const result = formConfigReducer([textField("a")], {
      type: FormConfigActionType.AddField,
      parentId: null,
      field: textField("b"),
    });

    expect(idsOf(result)).toEqual(["a", "b"]);
  });

  it("removes a field", () => {
    const result = formConfigReducer([textField("a"), textField("b")], {
      type: FormConfigActionType.RemoveField,
      fieldId: "a",
    });

    expect(idsOf(result)).toEqual(["b"]);
  });

  it("updates a field", () => {
    const result = formConfigReducer([textField("a")], {
      type: FormConfigActionType.UpdateField,
      fieldId: "a",
      changes: { label: "Renamed", required: true },
    });

    expect(result[0]).toMatchObject({ label: "Renamed", required: true });
  });

  it("updates a number field's range", () => {
    const numberField: FormField = {
      id: "n",
      type: FieldType.Number,
      label: "n",
      required: false,
    };

    const result = formConfigReducer([numberField], {
      type: FormConfigActionType.UpdateNumberRange,
      fieldId: "n",
      range: { min: 1, max: 9 },
    });

    expect(result[0]).toMatchObject({ min: 1, max: 9 });
  });

  it("moves a field", () => {
    const result = formConfigReducer([textField("a"), textField("b")], {
      type: FormConfigActionType.MoveField,
      fieldId: "b",
      direction: MoveDirection.Up,
    });

    expect(idsOf(result)).toEqual(["b", "a"]);
  });

  it("replaces the whole config", () => {
    const nextConfig = [textField("x")];

    const result = formConfigReducer([textField("a")], {
      type: FormConfigActionType.SetConfig,
      config: nextConfig,
    });

    expect(result).toBe(nextConfig);
  });

  it("throws on an unknown action", () => {
    const unknownAction = { type: "UNKNOWN" } as never;

    expect(() => formConfigReducer([], unknownAction)).toThrow(
      "Unhandled action",
    );
  });
});

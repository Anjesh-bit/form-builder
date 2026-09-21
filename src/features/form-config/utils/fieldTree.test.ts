import { describe, expect, it } from "vitest";
import {
  addField,
  collectFieldIds,
  findField,
  moveField,
  removeField,
  updateField,
  updateNumberRange,
} from "./fieldTree";
import { FieldType, MoveDirection } from "../enums";
import type { FormConfig, FormField, GroupField } from "../types";

const textField = (id: string): FormField => ({
  id,
  type: FieldType.Text,
  label: id,
  required: false,
});

const groupField = (id: string, children: FormField[]): GroupField => ({
  id,
  type: FieldType.Group,
  label: id,
  required: false,
  children,
});

const idsOf = (fields: FormConfig) => fields.map(({ id }) => id);

describe("findField", () => {
  const config = [textField("a"), groupField("g", [textField("b")])];

  it("finds a top-level field", () => {
    expect(findField(config, "a")?.id).toBe("a");
  });

  it("finds a nested field", () => {
    expect(findField(config, "b")?.id).toBe("b");
  });

  it("returns undefined when nothing matches", () => {
    expect(findField(config, "missing")).toBeUndefined();
  });
});

describe("collectFieldIds", () => {
  it("returns every id, including groups and nested fields", () => {
    const config = [
      textField("a"),
      groupField("g", [textField("b"), groupField("inner", [textField("c")])]),
    ];

    expect(collectFieldIds(config)).toEqual(["a", "g", "b", "inner", "c"]);
  });

  it("returns an empty list for an empty config", () => {
    expect(collectFieldIds([])).toEqual([]);
  });
});

describe("addField", () => {
  it("appends to the root when parentId is null", () => {
    const result = addField([textField("a")], null, textField("b"));

    expect(idsOf(result)).toEqual(["a", "b"]);
  });

  it("appends to the matching group's children", () => {
    const config = [groupField("g", [textField("a")])];

    const [group] = addField(config, "g", textField("b"));

    expect(group.type === FieldType.Group && idsOf(group.children)).toEqual([
      "a",
      "b",
    ]);
  });

  it("adds into deeply nested groups", () => {
    const config = [groupField("outer", [groupField("inner", [])])];

    const result = addField(config, "inner", textField("x"));

    expect(findField(result, "x")).toBeDefined();
  });

  it("does not mutate the original config", () => {
    const config = [groupField("g", [])];

    addField(config, "g", textField("x"));

    expect(config[0].children).toHaveLength(0);
  });

  it("throws when parentId matches no field", () => {
    const config = [groupField("g", [groupField("inner", [])])];

    expect(() => addField(config, "missing", textField("x"))).toThrow(
      'Cannot add field: no group with id "missing".',
    );
  });

  it("throws when parentId matches a non-group field", () => {
    expect(() => addField([textField("a")], "a", textField("x"))).toThrow(
      'Cannot add field: no group with id "a".',
    );
  });

  it("does not throw for a nested group next to non-matching branches", () => {
    const config = [
      groupField("other", [groupField("deep", [])]),
      groupField("target", []),
    ];

    expect(() => addField(config, "target", textField("x"))).not.toThrow();
    expect(() => addField(config, "deep", textField("y"))).not.toThrow();
  });

  it("keeps untouched sibling groups by reference", () => {
    const before = [
      groupField("target", []),
      groupField("other", [textField("x")]),
    ];

    const after = addField(before, "target", textField("new"));

    expect(after[1]).toBe(before[1]);
    expect(after[0]).not.toBe(before[0]);
  });

  it("rebuilds only the path to the target group", () => {
    const untouched = textField("keep");
    const before = [
      groupField("outer", [groupField("inner", []), untouched]),
      groupField("sibling", []),
    ];

    const after = addField(before, "inner", textField("new"));

    expect(after[1]).toBe(before[1]);
    expect(findField(after, "keep")).toBe(untouched);
  });
});

describe("removeField", () => {
  it("removes a top-level field", () => {
    const result = removeField([textField("a"), textField("b")], "a");

    expect(idsOf(result)).toEqual(["b"]);
  });

  it("removes a nested field", () => {
    const result = removeField([groupField("g", [textField("a")])], "a");

    expect(findField(result, "a")).toBeUndefined();
    expect(findField(result, "g")).toBeDefined();
  });

  it("removes a group together with its children", () => {
    const result = removeField([groupField("g", [textField("a")])], "g");

    expect(result).toEqual([]);
  });

  it("keeps untouched sibling groups by reference", () => {
    const before = [
      groupField("g1", [textField("x")]),
      groupField("g2", [textField("y")]),
    ];

    const after = removeField(before, "x");

    expect(after[1]).toBe(before[1]);
    expect(after[0]).not.toBe(before[0]);
  });

  it("keeps a group by reference when a top-level sibling is removed", () => {
    const before = [textField("a"), groupField("g", [textField("b")])];

    const after = removeField(before, "a");

    expect(after[0]).toBe(before[1]);
  });

  it("returns the same array when nothing matches", () => {
    const before = [textField("a"), groupField("g", [textField("b")])];

    expect(removeField(before, "missing")).toBe(before);
  });
});

describe("updateField", () => {
  it("updates only the targeted field", () => {
    const result = updateField([textField("a"), textField("b")], "b", {
      label: "Renamed",
      required: true,
    });

    expect(result[0].label).toBe("a");
    expect(result[1]).toMatchObject({ label: "Renamed", required: true });
  });

  it("updates a nested field", () => {
    const result = updateField([groupField("g", [textField("a")])], "a", {
      label: "Nested",
    });

    expect(findField(result, "a")?.label).toBe("Nested");
  });

  it("keeps untouched sibling groups by reference", () => {
    const before = [textField("a"), groupField("g", [textField("b")])];

    const after = updateField(before, "a", { label: "Renamed" });

    expect(after[1]).toBe(before[1]);
  });

  it("rebuilds only the path to a nested change", () => {
    const untouched = textField("c");
    const before = [
      groupField("g", [textField("b"), untouched]),
      groupField("h", [textField("d")]),
    ];

    const after = updateField(before, "b", { label: "Renamed" });

    expect(after[0]).not.toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    expect(findField(after, "c")).toBe(untouched);
  });

  it("returns the same array when nothing matches", () => {
    const before = [textField("a"), groupField("g", [textField("b")])];

    expect(updateField(before, "missing", { label: "x" })).toBe(before);
  });
});

describe("updateNumberRange", () => {
  const numberField = (id: string): FormField => ({
    id,
    type: FieldType.Number,
    label: id,
    required: false,
  });

  it("sets min and max on a number field", () => {
    const result = updateNumberRange([numberField("n")], "n", {
      min: 1,
      max: 10,
    });

    expect(result[0]).toMatchObject({ min: 1, max: 10 });
  });

  it("changes only the given bound", () => {
    const [field] = updateNumberRange(
      updateNumberRange([numberField("n")], "n", { min: 1, max: 10 }),
      "n",
      { max: 20 },
    );

    expect(field).toMatchObject({ min: 1, max: 20 });
  });

  it("clears a bound when given undefined", () => {
    const [field] = updateNumberRange(
      updateNumberRange([numberField("n")], "n", { min: 1 }),
      "n",
      { min: undefined },
    );

    expect(field).toMatchObject({ min: undefined });
  });

  it("leaves non-number fields untouched", () => {
    const config = [textField("t")];

    const [field] = updateNumberRange(config, "t", { min: 1, max: 2 });

    expect(field).toBe(config[0]);
    expect(field).not.toHaveProperty("min");
  });

  it("updates a number field nested in a group", () => {
    const result = updateNumberRange(
      [groupField("g", [numberField("n")])],
      "n",
      { min: 5 },
    );

    expect(findField(result, "n")).toMatchObject({ min: 5 });
  });

  it("keeps untouched sibling groups by reference", () => {
    const before = [numberField("n"), groupField("g", [textField("b")])];

    const after = updateNumberRange(before, "n", { min: 1 });

    expect(after[1]).toBe(before[1]);
  });

  it("returns the same array when the target is not a number field", () => {
    const before = [textField("t"), groupField("g", [textField("b")])];

    expect(updateNumberRange(before, "t", { min: 1 })).toBe(before);
  });
});

describe("moveField", () => {
  const config = [textField("a"), textField("b"), textField("c")];

  it("moves a field up", () => {
    expect(idsOf(moveField(config, "b", MoveDirection.Up))).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("moves a field down", () => {
    expect(idsOf(moveField(config, "b", MoveDirection.Down))).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("leaves the order alone at the boundaries", () => {
    expect(idsOf(moveField(config, "a", MoveDirection.Up))).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(idsOf(moveField(config, "c", MoveDirection.Down))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("only reorders within the field's own group", () => {
    const nested = [groupField("g", [textField("x"), textField("y")])];

    const [group] = moveField(nested, "y", MoveDirection.Up);

    expect(group.type === FieldType.Group && idsOf(group.children)).toEqual([
      "y",
      "x",
    ]);
  });

  it("keeps untouched sibling groups by reference", () => {
    const before = [
      groupField("g", [textField("x"), textField("y")]),
      groupField("other", [textField("z")]),
    ];

    const after = moveField(before, "y", MoveDirection.Up);

    expect(after[1]).toBe(before[1]);
  });

  it("returns the same array when a nested move hits a boundary", () => {
    const before = [groupField("g", [textField("x"), textField("y")])];

    expect(moveField(before, "x", MoveDirection.Up)).toBe(before);
  });

  it("returns the same array when nothing matches", () => {
    const before = [textField("a"), groupField("g", [textField("b")])];

    expect(moveField(before, "missing", MoveDirection.Up)).toBe(before);
  });
});

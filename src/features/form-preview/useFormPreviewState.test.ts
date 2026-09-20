import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VALIDATION_MESSAGES } from "../form-config/constants";
import { FieldType } from "../form-config/enums";
import type { FormConfig } from "../form-config/types";
import { useFormPreviewState } from "./useFormPreviewState";

const nameField = {
  id: "name",
  type: FieldType.Text,
  label: "Name",
  required: true,
} as const;

const cityField = {
  id: "city",
  type: FieldType.Text,
  label: "City",
  required: true,
} as const;

const renderPreviewState = (initialConfig: FormConfig) =>
  renderHook(({ config }) => useFormPreviewState(config), {
    initialProps: { config: initialConfig },
  });

describe("useFormPreviewState", () => {
  it("hides errors until a field is touched", () => {
    const { result } = renderPreviewState([nameField]);

    expect(result.current.getVisibleError("name")).toBeNull();

    act(() => result.current.touchField("name"));

    expect(result.current.getVisibleError("name")).toBe(
      VALIDATION_MESSAGES.required,
    );
  });

  it("shows every error once the form is submitted", () => {
    const { result } = renderPreviewState([nameField, cityField]);

    act(() => result.current.submit());

    expect(result.current.submitted).toBe(true);
    expect(result.current.isValid).toBe(false);
    expect(result.current.getVisibleError("city")).toBe(
      VALIDATION_MESSAGES.required,
    );
  });

  it("clears the error once the value is filled in", () => {
    const { result } = renderPreviewState([nameField]);

    act(() => result.current.touchField("name"));
    act(() => result.current.setValue("name", "Ada"));

    expect(result.current.getVisibleError("name")).toBeNull();
    expect(result.current.isValid).toBe(true);
  });

  it("drops values and touched flags for fields removed from the config", () => {
    const { result, rerender } = renderPreviewState([nameField, cityField]);

    act(() => result.current.setValue("city", "Paris"));
    act(() => result.current.touchField("city"));

    rerender({ config: [nameField] });

    expect(result.current.values).toEqual({});

    rerender({ config: [nameField, cityField] });

    expect(result.current.values.city).toBeUndefined();
    expect(result.current.getVisibleError("city")).toBeNull();
  });

  it("keeps the same values object when no field was removed", () => {
    const { result, rerender } = renderPreviewState([nameField]);

    act(() => result.current.setValue("name", "Ada"));
    const valuesBefore = result.current.values;

    rerender({ config: [{ ...nameField, label: "Full name" }] });

    expect(result.current.values).toBe(valuesBefore);
  });
});

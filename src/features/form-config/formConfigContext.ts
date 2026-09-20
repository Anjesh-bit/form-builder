import { createContext, useContext } from "react";
import type { MoveDirection } from "./enums";
import type {
  FieldChanges,
  FormConfig,
  FormField,
  NumberRangeChanges,
} from "./types";

export type FormConfigActions = {
  addField: (parentId: string | null, field: FormField) => void;
  removeField: (fieldId: string) => void;
  updateField: (fieldId: string, changes: FieldChanges) => void;
  updateNumberRange: (fieldId: string, range: NumberRangeChanges) => void;
  moveField: (fieldId: string, direction: MoveDirection) => void;
  setConfig: (config: FormConfig) => void;
};

export const FormConfigContext = createContext<FormConfig | null>(null);
export const FormConfigActionsContext = createContext<FormConfigActions | null>(
  null,
);

const requireContextValue = <T>(value: T | null): T => {
  if (value) return value;

  throw new Error("Form config hooks must be used inside a FormConfigProvider");
};

export const useFormConfig = (): FormConfig =>
  requireContextValue(useContext(FormConfigContext));

export const useFormConfigActions = (): FormConfigActions =>
  requireContextValue(useContext(FormConfigActionsContext));

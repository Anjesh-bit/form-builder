import type { MoveDirection } from "./enums";
import type {
  FieldChanges,
  FormConfig,
  FormField,
  NumberRangeChanges,
} from "./types";
import {
  addField,
  moveField,
  removeField,
  updateField,
  updateNumberRange,
} from "./utils/fieldTree";

export enum FormConfigActionType {
  AddField = "ADD_FIELD",
  RemoveField = "REMOVE_FIELD",
  UpdateField = "UPDATE_FIELD",
  UpdateNumberRange = "UPDATE_NUMBER_RANGE",
  MoveField = "MOVE_FIELD",
  SetConfig = "SET_CONFIG",
}

export type FormConfigAction =
  | {
      type: FormConfigActionType.AddField;
      parentId: string | null;
      field: FormField;
    }
  | { type: FormConfigActionType.RemoveField; fieldId: string }
  | {
      type: FormConfigActionType.UpdateField;
      fieldId: string;
      changes: FieldChanges;
    }
  | {
      type: FormConfigActionType.UpdateNumberRange;
      fieldId: string;
      range: NumberRangeChanges;
    }
  | {
      type: FormConfigActionType.MoveField;
      fieldId: string;
      direction: MoveDirection;
    }
  | { type: FormConfigActionType.SetConfig; config: FormConfig };

export const formConfigReducer = (
  state: FormConfig,
  action: FormConfigAction,
): FormConfig => {
  switch (action.type) {
    case FormConfigActionType.AddField: {
      const { parentId, field } = action;
      return addField(state, parentId, field);
    }
    case FormConfigActionType.RemoveField: {
      const { fieldId } = action;
      return removeField(state, fieldId);
    }
    case FormConfigActionType.UpdateField: {
      const { fieldId, changes } = action;
      return updateField(state, fieldId, changes);
    }
    case FormConfigActionType.UpdateNumberRange: {
      const { fieldId, range } = action;
      return updateNumberRange(state, fieldId, range);
    }
    case FormConfigActionType.MoveField: {
      const { fieldId, direction } = action;
      return moveField(state, fieldId, direction);
    }
    case FormConfigActionType.SetConfig: {
      const { config } = action;
      return config;
    }
    default: {
      const unhandledAction: never = action;
      throw new Error(`Unhandled action: ${JSON.stringify(unhandledAction)}`);
    }
  }
};

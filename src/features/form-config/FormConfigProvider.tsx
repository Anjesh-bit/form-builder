import {
  useCallback,
  useMemo,
  useReducer,
  type FC,
  type ReactNode,
} from "react";
import {
  FormConfigActionsContext,
  FormConfigContext,
  type FormConfigActions,
} from "./formConfigContext";
import { FormConfigActionType, formConfigReducer } from "./formConfigReducer";
import type { MoveDirection } from "./enums";
import type {
  FieldChanges,
  FormConfig,
  FormField,
  NumberRangeChanges,
} from "./types";

type FormConfigProviderProps = {
  initialConfig: FormConfig;
  children: ReactNode;
};

export const FormConfigProvider: FC<FormConfigProviderProps> = ({
  initialConfig,
  children,
}) => {
  const [config, dispatch] = useReducer(formConfigReducer, initialConfig);

  const addField = useCallback(
    (parentId: string | null, field: FormField) =>
      dispatch({ type: FormConfigActionType.AddField, parentId, field }),
    [],
  );

  const removeField = useCallback(
    (fieldId: string) =>
      dispatch({ type: FormConfigActionType.RemoveField, fieldId }),
    [],
  );

  const updateField = useCallback(
    (fieldId: string, changes: FieldChanges) =>
      dispatch({ type: FormConfigActionType.UpdateField, fieldId, changes }),
    [],
  );

  const updateNumberRange = useCallback(
    (fieldId: string, range: NumberRangeChanges) =>
      dispatch({
        type: FormConfigActionType.UpdateNumberRange,
        fieldId,
        range,
      }),
    [],
  );

  const moveField = useCallback(
    (fieldId: string, direction: MoveDirection) =>
      dispatch({ type: FormConfigActionType.MoveField, fieldId, direction }),
    [],
  );

  const setConfig = useCallback(
    (nextConfig: FormConfig) =>
      dispatch({ type: FormConfigActionType.SetConfig, config: nextConfig }),
    [],
  );

  const actions = useMemo<FormConfigActions>(
    () => ({
      addField,
      removeField,
      updateField,
      updateNumberRange,
      moveField,
      setConfig,
    }),
    [
      addField,
      removeField,
      updateField,
      updateNumberRange,
      moveField,
      setConfig,
    ],
  );

  return (
    <FormConfigActionsContext.Provider value={actions}>
      <FormConfigContext.Provider value={config}>
        {children}
      </FormConfigContext.Provider>
    </FormConfigActionsContext.Provider>
  );
};

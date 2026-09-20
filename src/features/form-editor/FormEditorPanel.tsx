import type { FC } from "react";
import { useFormConfig } from "../form-config/formConfigContext";
import { FieldEditorList } from "./FieldEditorList";
import { AddFieldButtons } from "./AddFieldButtons";
import "./FormEditorPanel.css";

export const FormEditorPanel: FC = () => {
  const config = useFormConfig();

  return (
    <section className="panel">
      <h2 className="panel__title">Builder</h2>
      <FieldEditorList fields={config} />
      <AddFieldButtons parentId={null} />
    </section>
  );
};

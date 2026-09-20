import { memo, type FC } from "react";
import type { FormField } from "../form-config/types";
import { FieldEditor } from "./FieldEditor";

type FieldEditorListProps = {
  fields: FormField[];
};

export const FieldEditorList: FC<FieldEditorListProps> = memo(({ fields }) => {
  const hasNoFields = fields.length === 0;

  if (hasNoFields) return <p className="empty-hint">No fields yet.</p>;

  const lastFieldIndex = fields.length - 1;

  return (
    <>
      {fields.map((field, index) => {
        const isFirst = index === 0;
        const isLast = index === lastFieldIndex;

        return (
          <FieldEditor
            key={field.id}
            field={field}
            isFirst={isFirst}
            isLast={isLast}
          />
        );
      })}
    </>
  );
});

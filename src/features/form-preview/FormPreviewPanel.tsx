import type { FC, SubmitEvent } from "react";
import { useFormConfig } from "../form-config/formConfigContext";
import { PreviewField } from "./PreviewField";
import { useFormPreviewState } from "./useFormPreviewState";
import "./FormPreviewPanel.css";

export const FormPreviewPanel: FC = () => {
  const config = useFormConfig();
  const formState = useFormPreviewState(config);

  const { errors, submitted, isValid, submit } = formState;

  const errorCount = Object.keys(errors).length;
  const hasNoFields = config.length === 0;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <section className="panel">
      <h2 className="panel__title">Live preview</h2>
      <form onSubmit={handleSubmit} noValidate>
        {hasNoFields ? (
          <p className="empty-hint">
            Nothing to preview yet — add a field in the builder.
          </p>
        ) : (
          config.map((field) => (
            <PreviewField key={field.id} field={field} formState={formState} />
          ))
        )}
        <div className="form-preview__actions">
          <button type="submit">Validate form</button>
          {submitted && (
            <span
              className={isValid ? "status status--ok" : "status status--error"}
            >
              {isValid
                ? "Form is valid"
                : `${errorCount} field(s) need attention`}
            </span>
          )}
        </div>
      </form>
    </section>
  );
};

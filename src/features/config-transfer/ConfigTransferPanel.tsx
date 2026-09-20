import { useState, type FC } from "react";
import {
  useFormConfig,
  useFormConfigActions,
} from "../form-config/formConfigContext";
import {
  ConfigImportError,
  exportConfig,
  importConfig,
} from "../form-config/utils/configSerialization";
import { TRANSFER_MESSAGES } from "./constants";
import { StatusKind } from "./enums";
import "./ConfigTransferPanel.css";

type StatusMessage = {
  kind: StatusKind;
  text: string;
};

export const ConfigTransferPanel: FC = () => {
  const config = useFormConfig();
  const { setConfig } = useFormConfigActions();
  const [jsonText, setJsonText] = useState("");
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null,
  );

  const handleExport = () => {
    setJsonText(exportConfig(config));
    setStatusMessage({ kind: StatusKind.Ok, text: TRANSFER_MESSAGES.exported });
  };

  const handleImport = () => {
    try {
      const importedConfig = importConfig(jsonText);
      setConfig(importedConfig);
      setStatusMessage({
        kind: StatusKind.Ok,
        text: TRANSFER_MESSAGES.imported(importedConfig.length),
      });
    } catch (error) {
      const failureReason =
        error instanceof ConfigImportError
          ? error.message
          : TRANSFER_MESSAGES.unexpectedImportError;
      setStatusMessage({
        kind: StatusKind.Error,
        text: TRANSFER_MESSAGES.importFailed(failureReason),
      });
    }
  };

  return (
    <section className="panel">
      <h2 className="panel__title">Export / import</h2>
      <textarea
        className="config-transfer__textarea"
        rows={10}
        value={jsonText}
        onChange={({ target }) => setJsonText(target.value)}
        placeholder='Click Export to see the current config, or paste JSON like { "fields": [...] } and click Import.'
      />
      <div className="config-transfer__actions">
        <button type="button" onClick={handleExport}>
          Export
        </button>
        <button type="button" onClick={handleImport}>
          Import
        </button>
      </div>
      {statusMessage && (
        <p className={`status status--${statusMessage.kind}`}>
          {statusMessage.text}
        </p>
      )}
    </section>
  );
};

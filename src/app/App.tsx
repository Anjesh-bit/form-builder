import type { FC } from "react";
import { createDefaultFormConfig } from "../features/form-config/utils/createDefaultFormConfig";
import { FormConfigProvider } from "../features/form-config/FormConfigProvider";
import { FormEditorPanel } from "../features/form-editor/FormEditorPanel";
import { FormPreviewPanel } from "../features/form-preview/FormPreviewPanel";
import { ConfigTransferPanel } from "../features/config-transfer/ConfigTransferPanel";
import { ThemeToggle } from "../features/theme/ThemeToggle";
import { APP_EYEBROW, APP_TAGLINE, APP_TITLE } from "./constants";
import "./App.css";

const App: FC = () => (
  <FormConfigProvider initialConfig={createDefaultFormConfig()}>
    <div className="app-layout">
      <ThemeToggle />
      <header className="app-header">
        <p className="app-header__eyebrow">{APP_EYEBROW}</p>
        <h1 className="app-header__title">{APP_TITLE}</h1>
        <p className="app-header__tagline">{APP_TAGLINE}</p>
      </header>
      <FormEditorPanel />
      <FormPreviewPanel />
      <ConfigTransferPanel />
    </div>
  </FormConfigProvider>
);

export default App;

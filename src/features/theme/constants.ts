import { Theme } from "./enums";

export const THEME_STORAGE_KEY = "form-builder-theme";

export const THEME_ATTRIBUTE = "data-theme";

export const SWITCH_TO_LABEL: Record<Theme, string> = {
  [Theme.Light]: "Dark mode",
  [Theme.Dark]: "Light mode",
};

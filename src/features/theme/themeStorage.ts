import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "./constants";
import { Theme } from "./enums";

export const getStoredTheme = (): Theme => {
  try {
    const storedValue = localStorage.getItem(THEME_STORAGE_KEY);
    const matchingTheme = Object.values(Theme).find(
      (theme) => theme === storedValue,
    );

    return matchingTheme ?? Theme.Light;
  } catch {
    return Theme.Light;
  }
};

export const saveTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
};

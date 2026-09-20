import { useCallback, useEffect, useState } from "react";
import { Theme } from "./enums";
import { applyTheme, getStoredTheme, saveTheme } from "./themeStorage";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === Theme.Light ? Theme.Dark : Theme.Light,
    );
  }, []);

  return { theme, toggleTheme };
};

import type { FC } from "react";
import { SWITCH_TO_LABEL } from "./constants";
import { useTheme } from "./useTheme";
import "./ThemeToggle.css";

export const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      {SWITCH_TO_LABEL[theme]}
    </button>
  );
};

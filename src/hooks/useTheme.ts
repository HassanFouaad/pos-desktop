import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setThemeMode, ThemeMode, toggleTheme } from "../store/globalSlice";

/**
 * Hook to access and modify theme settings from Redux store
 * Provides a consistent API for theme operations throughout the app
 */
export function useTheme() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.global.theme);

  /**
   * Toggle between light and dark themes
   */
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  /**
   * Set a specific theme mode
   */
  const handleSetTheme = (themeMode: ThemeMode) => {
    dispatch(setThemeMode(themeMode));
  };

  return {
    mode,
    toggleTheme: handleToggleTheme,
    setTheme: handleSetTheme,
  };
}

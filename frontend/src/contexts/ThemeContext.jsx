import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'gplx_theme_mode';
const MOTION_STORAGE_KEY = 'gplx_motion_level';
const THEMES = ['light', 'dark'];
const MOTION_LEVELS = ['off', 'soft', 'normal', 'strong'];

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(savedTheme) ? savedTheme : 'light';
  } catch (error) {
    return 'light';
  }
};

const getInitialMotion = () => {
  try {
    const savedMotion = localStorage.getItem(MOTION_STORAGE_KEY);
    return MOTION_LEVELS.includes(savedMotion) ? savedMotion : 'normal';
  } catch (error) {
    return 'normal';
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [motion, setMotion] = useState(getInitialMotion);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Ignore storage errors in restricted browser modes.
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-motion', motion);
    try {
      localStorage.setItem(MOTION_STORAGE_KEY, motion);
    } catch (error) {
      // Ignore storage errors in restricted browser modes.
    }
  }, [motion]);

  const value = useMemo(() => ({
    theme,
    motion,
    isDark: theme === 'dark',
    toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    setTheme,
    setMotion
  }), [theme, motion]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

export default ThemeContext;

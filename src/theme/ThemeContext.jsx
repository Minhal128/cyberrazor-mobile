import React, { createContext, useContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const systemIsDark = Appearance.getColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(true ?? systemIsDark);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme: () => setIsDark((v) => !v),
    }),
    [isDark]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeContext);
}




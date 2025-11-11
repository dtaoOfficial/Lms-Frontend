import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Define your accent colors (must match your CSS)
const ACCENT_COLORS = ['blue', 'purple', 'emerald', 'rose', 'amber'];

// 2. Create the Context
const ThemeContext = createContext();

// 3. Create the Provider component
export const ThemeProvider = ({ children }) => {
  // 4. Set up state, reading from localStorage for the initial value
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });
  
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('app-accent') || 'blue';
  });

  // 5. Use useEffect to apply changes to the <html> tag and localStorage
  useEffect(() => {
    const root = document.documentElement; // This is the <html> tag

    // --- Handle Dark/Light Mode ---
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Save theme choice
    localStorage.setItem('app-theme', theme);

    // --- Handle Accent Color ---
    // Remove all old accent classes
    ACCENT_COLORS.forEach(color => {
      root.classList.remove(`theme-${color}`);
    });
    // Add the new one
    root.classList.add(`theme-${accent}`);
    // Save accent choice
    localStorage.setItem('app-accent', accent);

  }, [theme, accent]); // Rerun this effect anytime theme or accent changes

  // 6. Define the value to be passed to consuming components
  const value = {
    theme,
    setTheme,
    accent,
    setAccent,
    accentColors: ACCENT_COLORS
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 7. Create a custom hook for easy access to the context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
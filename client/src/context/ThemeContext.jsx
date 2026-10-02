/**
 * =========================================================================
 * Theme Context (context/ThemeContext.jsx)
 * =========================================================================
 * Manages Dark Mode vs. Light Mode state across the entire React application.
 * 
 * VIVA EXPLANATION:
 * - Uses React Context API (`createContext`, `useContext`) to supply theme state
 *   to any component without prop drilling.
 * - Stores user preference in `localStorage` ('light' or 'dark').
 * - Sets `data-theme` attribute on the `document.documentElement` (`<html>` element)
 *   which triggers CSS variable overrides defined in `index.css`.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Read saved theme from localStorage or default to system preference / light
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('wad_todo_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    // Apply data-theme to HTML tag
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wad_todo_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

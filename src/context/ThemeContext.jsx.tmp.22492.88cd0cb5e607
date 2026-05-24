import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const THEMES = {
  blue:   { label: 'Blue',   emoji: '🔵', primary: '#2563eb', hover: '#1d4ed8', light: '#eff6ff', soft: '#dbeafe', text: '#1e40af' },
  indigo: { label: 'Indigo', emoji: '🟣', primary: '#4f46e5', hover: '#4338ca', light: '#eef2ff', soft: '#e0e7ff', text: '#3730a3' },
  purple: { label: 'Purple', emoji: '💜', primary: '#9333ea', hover: '#7e22ce', light: '#faf5ff', soft: '#f3e8ff', text: '#6b21a8' },
  green:  { label: 'Green',  emoji: '🟢', primary: '#16a34a', hover: '#15803d', light: '#f0fdf4', soft: '#dcfce7', text: '#14532d' },
  teal:   { label: 'Teal',   emoji: '🩵', primary: '#0d9488', hover: '#0f766e', light: '#f0fdfa', soft: '#ccfbf1', text: '#134e4a' },
  orange: { label: 'Orange', emoji: '🟠', primary: '#ea580c', hover: '#c2410c', light: '#fff7ed', soft: '#ffedd5', text: '#9a3412' },
  rose:   { label: 'Rose',   emoji: '🌹', primary: '#e11d48', hover: '#be123c', light: '#fff1f2', soft: '#ffe4e6', text: '#9f1239' },
};

const ThemeContext = createContext();

export function applyThemeCss(themeName) {
  const t = THEMES[themeName] || THEMES.blue;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', t.primary);
  root.style.setProperty('--color-primary-hover', t.hover);
  root.style.setProperty('--color-primary-light', t.light);
  root.style.setProperty('--color-primary-soft', t.soft);
  root.style.setProperty('--color-primary-text', t.text);
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState('blue');

  // Auto-load theme when user changes (login/restore)
  useEffect(() => {
    const key = user?.username ? `theme_${user.username}` : null;
    const saved = key ? (localStorage.getItem(key) || 'blue') : 'blue';
    setTheme(saved);
    applyThemeCss(saved);
  }, [user?.username]);

  const changeTheme = (themeName) => {
    setTheme(themeName);
    applyThemeCss(themeName);
    if (user?.username) {
      localStorage.setItem(`theme_${user.username}`, themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

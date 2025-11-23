import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../utils/translations';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.es) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language>('es');

  // Initial Load
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem('colorin_theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }

    // Language
    const savedLang = localStorage.getItem('colorin_lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
        // Auto-detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'en') setLanguage('en');
    }
  }, []);

  // Apply Theme Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('colorin_theme', theme);
  }, [theme]);

  // Persist Language
  useEffect(() => {
    localStorage.setItem('colorin_lang', language);
    // Optional: Update html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = (key: keyof typeof translations.es) => {
    return translations[language][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
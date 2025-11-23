import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Lock, Sparkles, Home, Grid, Tag, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const PublicNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();

  // Detect scroll for styling transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: t('nav_home'), path: '/', icon: <Home className="w-4 h-4" /> },
    { name: t('nav_catalog'), path: '/catalog', icon: <Grid className="w-4 h-4" /> },
    { name: t('nav_offers'), path: '/catalog?filter=offers', highlight: true, icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-gray-200 dark:border-slate-800 py-3' 
            : 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm border-white/20 dark:border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
              <Sparkles className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Colorín<span className="text-rose-500">.</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5 ${
                  link.highlight 
                    ? 'text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-full' 
                    : location.pathname === link.path 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-full p-1">
                <button 
                    onClick={() => setLanguage('es')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${language === 'es' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                >
                    🇪🇸
                </button>
                <button 
                    onClick={() => setLanguage('en')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                >
                    🇺🇸
                </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-all"
                title={theme === 'dark' ? "Modo Claro" : "Modo Oscuro"}
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <Link 
              to="/login" 
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition-all"
              title={t('nav_login')}
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-xl md:hidden animate-fade-in">
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                    link.highlight 
                      ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' 
                      : location.pathname === link.path 
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-gray-100 dark:bg-slate-800 my-2"></div>

              {/* Mobile Settings */}
              <div className="flex items-center justify-between px-4 py-2">
                 <div className="flex items-center gap-2">
                    <button onClick={() => setLanguage('es')} className={`px-3 py-1 rounded-lg text-sm border ${language === 'es' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'border-gray-200 dark:border-slate-700 dark:text-gray-300'}`}>ES</button>
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-lg text-sm border ${language === 'en' ? 'bg-rose-100 border-rose-200 text-rose-700' : 'border-gray-200 dark:border-slate-700 dark:text-gray-300'}`}>EN</button>
                 </div>
                 <button onClick={toggleTheme} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                 </button>
              </div>

              <Link 
                to="/login" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Lock className="w-4 h-4" /> {t('nav_login')}
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-[72px] w-full bg-white dark:bg-slate-950"></div>
    </>
  );
};
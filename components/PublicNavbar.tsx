
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Menu, X, Lock, Home, Grid, Tag, Moon, Sun, Brush, Search, Rocket } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const { Link, useLocation, useNavigate } = ReactRouterDOM;

interface PublicNavbarProps {
  hideSpacer?: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ hideSpacer = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  // Construct current full path including query params to match links exactly
  const currentFullPath = location.pathname + location.search;

  const navLinks = [
    { 
      name: t('nav_home'), 
      path: '/', 
      icon: <Home className="w-4 h-4" /> 
    },
    { 
      name: t('nav_catalog'), 
      path: '/catalog', 
      icon: <Grid className="w-4 h-4" /> 
    },
    { 
      name: t('filter_new'), 
      path: '/catalog?filter=new', 
      icon: <Rocket className="w-4 h-4" /> 
    },
    { 
      name: t('nav_offers'), 
      path: '/catalog?filter=offers', 
      highlight: true, 
      icon: <Tag className="w-4 h-4" /> 
    },
  ];

  const isActiveLink = (linkPath: string) => {
      // Strict match for Home
      if (linkPath === '/' && currentFullPath === '/') return true;
      // Strict match for Filters (Offers/New)
      if (linkPath.includes('?')) return currentFullPath === linkPath;
      // Strict match for Catalog (to avoid highlighting it when on Offers/New)
      if (linkPath === '/catalog') return currentFullPath === '/catalog';
      
      return false;
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-gray-200 dark:border-slate-800 py-3' 
            : 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-white/20 dark:border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          
          {/* 1. Logo */}
          <Link to="/" className="flex items-center gap-2 group relative z-50 flex-shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 transition-transform group-hover:scale-105 group-hover:-rotate-12 duration-300">
              {!logoError ? (
                <img 
                  src="/favicon.svg" 
                  alt="Colorín Logo" 
                  className="w-full h-full object-contain drop-shadow-md"
                  onError={() => setLogoError(true)} 
                />
              ) : (
                <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Brush className="w-5 h-5" />
                </div>
              )}
            </div>
            <span className="hidden sm:block text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
              Colorín<span className="text-rose-500">.</span>
            </span>
          </Link>

          {/* 2. Global Search Bar (Between Logo and Menu) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
                <input 
                    type="text" 
                    placeholder="Buscar libros, mandalas..." 
                    className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-gray-800 dark:text-white placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-rose-500 transition-colors" />
            </form>
          </div>

          {/* 3. Desktop Menu */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => {
              const active = isActiveLink(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5 whitespace-nowrap ${
                    link.highlight 
                      ? active 
                        ? 'text-white bg-rose-600 px-4 py-2 rounded-full shadow-lg shadow-rose-500/30'
                        : 'text-rose-500 hover:text-white hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/30 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-full' 
                      : active
                        ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

            {/* Language & Theme Controls */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-full p-1">
                    <button 
                        type="button"
                        onClick={() => setLanguage('es')}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${language === 'es' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                    >
                        🇪🇸
                    </button>
                    <button 
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                    >
                        🇺🇸
                    </button>
                </div>

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4 pointer-events-none" /> : <Moon className="w-4 h-4 pointer-events-none" />}
                </button>
                
                <Link 
                  to="/login" 
                  className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition-all"
                >
                  <Lock className="w-4 h-4" />
                </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative z-50 ml-auto"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-2xl md:hidden animate-fade-in z-40 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col p-4 space-y-4">
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative w-full">
                  <input 
                      type="text" 
                      placeholder="Buscar..." 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>

              <div className="space-y-2">
                {navLinks.map((link) => {
                  const active = isActiveLink(link.path);
                  return (
                    <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-lg transition-colors ${
                        link.highlight 
                        ? active
                            ? 'bg-rose-600 text-white shadow-lg'
                            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' 
                        : active 
                            ? 'bg-gray-100 dark:bg-slate-800 text-rose-600 dark:text-white' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                    >
                    {link.icon}
                    {link.name}
                    </Link>
                  );
                })}
              </div>
              
              <div className="h-px bg-gray-100 dark:bg-slate-800"></div>

              {/* Mobile Controls */}
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setLanguage('es')} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${language === 'es' ? 'bg-white text-rose-600 border-rose-200 shadow-sm' : 'border-transparent text-gray-500'}`}>ES</button>
                    <button type="button" onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${language === 'en' ? 'bg-white text-rose-600 border-rose-200 shadow-sm' : 'border-transparent text-gray-500'}`}>EN</button>
                 </div>
                 
                 <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                    className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-gray-100 dark:border-slate-700"
                 >
                    {theme === 'dark' ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-indigo-600" />}
                 </button>
              </div>

              <Link to="/login" className="flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <Lock className="w-5 h-5" /> {t('nav_login')}
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer - Conditional */}
      {!hideSpacer && (
         <div className="h-[76px] md:h-[84px] w-full bg-white dark:bg-slate-950"></div>
      )}
    </>
  );
};

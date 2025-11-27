
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Showcase } from '../components/Showcase';
import { Footer } from '../components/Footer'; 
import { PublicNavbar } from '../components/PublicNavbar';
import { Product, Category, ShowcaseItem } from '../types';
import { Filter, X, Gift, Download, Heart, Palette, Download as DownloadIcon, Search, ArrowUpDown, Flame, Clock, Layers } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { SEO } from '../components/SEO';

const { Link, useNavigate } = ReactRouterDOM;

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  
  // Advanced Filter States
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [specialFilter, setSpecialFilter] = useState<'none' | 'new' | 'offers'>('none');
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState<'default' | 'price_asc' | 'price_desc' | 'views'>('default');

  const [loading, setLoading] = useState(true);
  
  // Lead Magnet State
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [leadMagnetUrl, setLeadMagnetUrl] = useState('');
  
  const { t, language } = useTheme();
  const navigate = useNavigate();
  const modalTriggered = useRef(false);

  // Create maps for fast lookup
  const { categoryColorMap, categoryTranslationMap } = useMemo(() => {
    const colorMap: Record<string, string> = {};
    const transMap: Record<string, string> = {};

    categories.forEach(cat => {
        if (cat.nombre) {
            const key = cat.nombre.trim().toLowerCase();
            colorMap[key] = cat.color;
            // Map the spanish lowercase key to the English name (if exists) or Spanish name
            transMap[key] = (language === 'en' && cat.nombre_en) ? cat.nombre_en : cat.nombre;
        }
    });
    return { categoryColorMap: colorMap, categoryTranslationMap: transMap };
  }, [categories, language]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
          // Attempt to fetch from View (for stats) first, fallback to basic table
          let allProducts: Product[] = [];
          
          // Try View first
          const { data: viewData, error: viewError } = await supabase.from('productos_con_stats').select('*').eq('activo', true);
          
          if (!viewError && viewData) {
              allProducts = viewData;
          } else {
              console.warn("View 'productos_con_stats' issue, using fallback table.");
              // Fallback if view doesn't exist or SQL error
              const { data: tableData } = await supabase.from('productos').select('*').eq('activo', true);
              if (tableData) allProducts = tableData;
          }

          const [catRes, showRes, configRes] = await Promise.all([
            supabase.from('categorias').select('*').eq('activo', true).order('orden'),
            supabase.from('showcase_gallery').select('*').eq('activo', true).order('orden'),
            supabase.from('app_config').select('*').eq('key', 'lead_magnet_url').single()
          ]);

          if (allProducts.length > 0) {
            // Sort by created_at by default for initial state
            const sorted = allProducts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setProducts(sorted);
            
            const destacados = sorted.filter(p => p.destacado);
            setHeroProducts(destacados.length > 0 ? destacados : sorted.slice(0, 5));
          }
          
          if (catRes.data) setCategories(catRes.data);
          if (showRes.data) setShowcaseItems(showRes.data);
          if (configRes.data) setLeadMagnetUrl(configRes.data.value);
      } catch (err) {
          console.error("Error loading home data:", err);
      } finally {
          setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ... (Lead Magnet Logic remains same) ...
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('colorin_modal_session');
    const hasSubscribed = localStorage.getItem('colorin_subscribed');

    if (hasSeenModal || hasSubscribed) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    const triggerModal = () => {
        if (!modalTriggered.current) {
            setShowLeadModal(true);
            modalTriggered.current = true;
            sessionStorage.setItem('colorin_modal_session', 'true');
        }
    };

    if (isMobile) {
        const timer = setTimeout(triggerModal, 30000); 
        const handleScroll = () => {
            const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercentage > 60) {
                triggerModal();
                window.removeEventListener('scroll', handleScroll);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    } else {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                triggerModal();
                document.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!email) return;
      try {
          await supabase.from('suscriptores').insert({ email, origen: 'home_modal' });
      } catch (err) {
          console.warn(err);
      } finally {
          setSubscribed(true);
          localStorage.setItem('colorin_subscribed', 'true');
      }
  };

  const handleDownloadGift = () => {
      if(leadMagnetUrl) window.open(leadMagnetUrl, '_blank');
      setTimeout(() => setShowLeadModal(false), 1000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchText.trim()) {
          navigate(`/catalog?q=${encodeURIComponent(searchText)}`);
      }
  }

  // FILTERING AND SORTING LOGIC
  const getFilteredProducts = () => {
      let filtered = [...products];

      // 1. Text Search (Local filtering if user just types but doesnt hit enter, though UI suggests navigation)
      if (searchText) {
          const lowerText = searchText.toLowerCase().trim();
          filtered = filtered.filter(p => 
              p.titulo.toLowerCase().includes(lowerText) || 
              (p.descripcion && p.descripcion.toLowerCase().includes(lowerText))
          );
      }

      // 2. Category / Special Filters
      if (specialFilter === 'offers') {
          filtered = filtered.filter(p => p.precio_anterior && p.precio_anterior > p.precio);
      } else if (specialFilter === 'new') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filtered = filtered.filter(p => new Date(p.created_at) > thirtyDaysAgo);
      } else if (activeCategory !== 'All') {
          // ROBUST FILTERING: Trim and Lowercase comparison
          filtered = filtered.filter(p => 
            p.categoria && p.categoria.trim().toLowerCase() === activeCategory.trim().toLowerCase()
          );
      }

      // 3. Sorting
      switch (sortOption) {
          case 'price_asc':
              filtered.sort((a, b) => a.precio - b.precio);
              break;
          case 'price_desc':
              filtered.sort((a, b) => b.precio - a.precio);
              break;
          case 'views':
              filtered.sort((a, b) => (b.visitas || 0) - (a.visitas || 0));
              break;
          default:
              // Default is created_at desc (already set on fetch)
              break;
      }

      return filtered;
  };

  const displayedProducts = getFilteredProducts();

  const handleCategoryClick = (catName: string) => {
      // Always set the raw (Spanish) name for filtering logic
      setActiveCategory(catName);
      setSpecialFilter('none');
      setSearchText('');
  };

  // Helper to get display name for category buttons
  const getCategoryDisplayName = (cat: Category) => {
      return (language === 'en' && cat.nombre_en) ? cat.nombre_en : cat.nombre;
  };

  // Safe string construction to avoid template literal syntax errors in Vercel
  const getPageTitle = () => {
    return t('home_title_1');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-x-hidden flex flex-col transition-colors duration-300">
      <SEO />
      {/* Pass hideSpacer to fix double height on mobile */}
      <PublicNavbar hideSpacer={true} />
      
      <Hero products={heroProducts} />

      <section className="pt-16 pb-12 bg-white dark:bg-slate-950 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                {getPageTitle()} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">{t('home_title_2')}</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
                {t('home_desc')} <span className="font-bold text-gray-800 dark:text-gray-200">{t('home_desc_bold')}</span>.
            </p>
            
            {/* Search and Filter Bar Area */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-4 max-w-3xl mx-auto flex flex-col md:flex-row gap-4 items-center animate-slide-up transform -translate-y-4 mb-12 relative z-20">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, descripción..." 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-rose-500 dark:text-white outline-none transition-all"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </form>

                {/* Sort Dropdown */}
                <div className="relative w-full md:w-auto min-w-[180px]">
                    <select 
                        className="w-full pl-10 pr-8 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-rose-500 appearance-none cursor-pointer font-medium dark:text-white outline-none transition-all"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                    >
                        <option value="default">Recomendados</option>
                        <option value="views">🔥 Más Vistos</option>
                        <option value="price_asc">💰 Precio: Bajo a Alto</option>
                        <option value="price_desc">💎 Precio: Alto a Bajo</option>
                    </select>
                    <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Download className="w-5 h-5 text-rose-500"/> {t('quality_pdf')}</span>
                <span className="flex items-center gap-2"><Palette className="w-5 h-5 text-purple-500"/> {t('quality_vector')}</span>
                <span className="flex items-center gap-2"><Heart className="w-5 h-5 text-red-500"/> {t('quality_love')}</span>
            </div>
        </div>
      </section>

      {/* Main Catalog */}
      <section id="catalogo" className="py-10 px-4 md:px-8 max-w-7xl mx-auto relative z-20 w-full">
        
        {/* Title */}
        <div className="text-center mb-10">
            <span className="text-rose-600 font-bold tracking-wider uppercase text-sm">
                {specialFilter === 'offers' ? 'Oportunidades' : specialFilter === 'new' ? 'Recién llegados' : t('catalog_title')}
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-2">
                {specialFilter === 'offers' ? t('filter_offers') : specialFilter === 'new' ? t('filter_new') : t('filter_style')}
            </h3>
        </div>

        {/* --- CATEGORY BAR --- */}
        {/* Mobile: Full-bleed scrolling (negative margins), Desktop: Normal */}
        <div className="mb-8 md:mb-12 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-3 w-max md:w-full">
                <button
                    onClick={() => { setActiveCategory('All'); setSpecialFilter('none'); }}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2 border ${
                    activeCategory === 'All' && specialFilter === 'none'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg scale-105' 
                        : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                    <Filter className="w-4 h-4" /> {t('catalog_filter_all')}
                </button>

                {/* Categories from DB */}
                {categories.length > 0 ? (
                    categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.nombre)}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border ${
                                activeCategory === cat.nombre 
                                ? `${cat.color || 'bg-rose-600'} text-white border-transparent shadow-lg scale-105` 
                                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200'
                            }`}
                        >
                            {getCategoryDisplayName(cat)}
                        </button>
                    ))
                ) : (
                    // Fallback visual
                    ['Mandalas', 'Infantil', 'Animales'].map((fallbackCat, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleCategoryClick(fallbackCat)}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border ${
                                activeCategory === fallbackCat
                                ? 'bg-rose-600 text-white border-rose-600' 
                                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800'
                            }`}
                        >
                            {fallbackCat}
                        </button>
                    ))
                )}

                {/* Special Filters Divider */}
                <div className="w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2 hidden md:block"></div>

                <button
                    onClick={() => { setSpecialFilter('new'); setActiveCategory('All'); }}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${
                        specialFilter === 'new'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                        : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:text-blue-600'
                    }`}
                >
                    <Clock className="w-4 h-4" /> {t('filter_new')}
                </button>
                <button
                    onClick={() => { setSpecialFilter('offers'); setActiveCategory('All'); }}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${
                        specialFilter === 'offers'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg scale-105' 
                        : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:text-orange-500'
                    }`}
                >
                    <Flame className="w-4 h-4" /> {t('filter_offers')}
                </button>
            </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rose-600"></div>
          </div>
        ) : (
          <>
             {/* Optimized Grid: gap-4 on mobile, gap-8 on desktop. grid-cols-1 on very small, but maybe grid-cols-2 on sm? Standard is 1 col for robust cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {displayedProducts.map((product, idx) => {
                const catKey = product.categoria?.trim().toLowerCase();
                return (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        index={idx} 
                        categoryColor={categoryColorMap[catKey]}
                        displayCategory={categoryTranslationMap[catKey]}
                    />
                );
              })}
            </div>
            
            {displayedProducts.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 mt-8">
                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Layers className="w-10 h-10 text-gray-300"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeCategory !== 'All' 
                        ? `No hay productos en "${(language === 'en' && categoryTranslationMap[activeCategory.trim().toLowerCase()]) ? categoryTranslationMap[activeCategory.trim().toLowerCase()] : activeCategory}"` 
                        : 'No se encontraron resultados'
                    }
                </h3>
                <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                    Es posible que aún no hayamos agregado productos a esta categoría o que tu búsqueda no coincida.
                </p>
                <button onClick={() => { setSearchText(''); setActiveCategory('All'); setSpecialFilter('none'); }} className="mt-6 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors">
                    Ver todos los productos
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Infinite Marquee */}
      {products.length > 4 && (
        <section className="py-10 bg-gray-900 dark:bg-black overflow-hidden relative group border-t border-gray-800 mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 dark:from-black via-transparent to-gray-900 dark:to-black z-10 pointer-events-none"></div>
            <div className="flex gap-8 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
                {[...products, ...products].map((p, i) => (
                    <Link to={`/product/${p.id}`} key={`${p.id}-${i}`} className="inline-block w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-105 border border-gray-700 relative flex-shrink-0">
                        <img src={p.portada_url} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold border border-white px-4 py-2 rounded-full backdrop-blur-sm text-xs">{t('hero_cta')}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
      )}

      {/* Showcase Section */}
      {showcaseItems.length > 0 && <Showcase items={showcaseItems} />}

      {/* Lead Magnet Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-scale-in">
                <button onClick={() => setShowLeadModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors z-20">
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-2/5 bg-rose-100 dark:bg-rose-900/40 hidden md:flex items-center justify-center p-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://img.freepik.com/free-vector/hand-drawn-mandala-background_23-2148098520.jpg')] bg-cover"></div>
                        <Gift className="w-16 h-16 text-rose-500 relative z-10 animate-bounce-slow" />
                    </div>
                    <div className="w-full md:w-3/5 p-8 dark:text-gray-200">
                        {subscribed ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X className="w-8 h-8 text-green-600 dark:text-green-400" /> 
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('gift_ready_title')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">{t('gift_ready_desc')}</p>
                                <Button onClick={handleDownloadGift} className="w-full">
                                    <DownloadIcon className="w-4 h-4 mr-2"/> {t('download_gift')}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Regalo Exclusivo</span>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 mt-1">{t('lead_magnet_title')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    {t('lead_magnet_desc')}
                                </p>
                                <form onSubmit={handleSubscribe} className="space-y-3">
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="Tu mejor email" 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 outline-none bg-gray-50 dark:bg-slate-800 dark:text-white"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                    <Button type="submit" className="w-full py-3">{t('lead_magnet_cta')}</Button>
                                    <p className="text-[10px] text-gray-400 text-center mt-2">{t('lead_magnet_spam')}</p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Home;

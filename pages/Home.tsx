import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Showcase } from '../components/Showcase';
import { Footer } from '../components/Footer'; 
import { PublicNavbar } from '../components/PublicNavbar';
import { Product, Category, ShowcaseItem } from '../types';
import { Filter, X, Gift, Download, Heart, Palette, Download as DownloadIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  
  // Filter States
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [specialFilter, setSpecialFilter] = useState<'none' | 'new' | 'offers'>('none');

  const [loading, setLoading] = useState(true);
  
  // Lead Magnet State
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [leadMagnetUrl, setLeadMagnetUrl] = useState('');
  
  // Translation
  const { t, language } = useTheme();

  // Exit Intent Refs
  const modalTriggered = useRef(false);

  useEffect(() => {
    document.title = "Colorín | Premium Coloring Books";

    const fetchData = async () => {
      setLoading(true);
      try {
          const [prodRes, catRes, showRes, configRes] = await Promise.all([
            supabase.from('productos').select('*').eq('activo', true).order('created_at', { ascending: false }),
            supabase.from('categorias').select('*').eq('activo', true).order('orden'),
            supabase.from('showcase_gallery').select('*').eq('activo', true).order('orden'),
            supabase.from('app_config').select('*').eq('key', 'lead_magnet_url').single()
          ]);

          if (prodRes.data) {
            setProducts(prodRes.data);
            const destacados = prodRes.data.filter(p => p.destacado);
            setHeroProducts(destacados.length > 0 ? destacados : prodRes.data.slice(0, 5));
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

  // SMART LEAD MAGNET LOGIC
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('colorin_modal_session');
    const hasSubscribed = localStorage.getItem('colorin_subscribed');

    if (hasSeenModal || hasSubscribed) return;

    // 1. Mobile Logic: Timer (30s) or Scroll (60%)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    const triggerModal = () => {
        if (!modalTriggered.current) {
            setShowLeadModal(true);
            modalTriggered.current = true;
            sessionStorage.setItem('colorin_modal_session', 'true');
        }
    };

    if (isMobile) {
        const timer = setTimeout(triggerModal, 30000); // 30s delay on mobile
        
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
        // 2. Desktop Logic: Exit Intent (Mouse leaves top of window)
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
          console.warn("Subscription tracking error:", err);
      } finally {
          setSubscribed(true);
          localStorage.setItem('colorin_subscribed', 'true');
      }
  };

  const handleDownloadGift = () => {
      if(leadMagnetUrl) {
          window.open(leadMagnetUrl, '_blank');
      } else {
          alert('El archivo de regalo se está configurando. Intenta de nuevo más tarde.');
      }
      setTimeout(() => setShowLeadModal(false), 1000);
  };

  const handleFilterClick = (type: 'category' | 'new' | 'offers', value?: string) => {
      if (type === 'category') {
          setActiveCategory(value || 'All');
          setSpecialFilter('none');
      } else {
          setActiveCategory('All');
          setSpecialFilter(type as 'new' | 'offers');
      }

      const gridSection = document.getElementById('catalogo');
      if (gridSection) {
          gridSection.scrollIntoView({ behavior: 'smooth' });
      }
  };

  let filteredProducts = products;

  if (specialFilter === 'offers') {
      filteredProducts = products.filter(p => p.precio_anterior && p.precio_anterior > p.precio);
  } else if (specialFilter === 'new') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filteredProducts = products.filter(p => new Date(p.created_at) > thirtyDaysAgo);
  } else if (activeCategory !== 'All') {
      filteredProducts = products.filter(p => p.categoria === activeCategory);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-x-hidden flex flex-col transition-colors duration-300">
      <PublicNavbar />
      
      <Hero products={heroProducts} />

      <section className="py-20 bg-white dark:bg-slate-950 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                {t('home_title_1')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">{t('home_title_2')}</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
                {t('home_desc')} <span className="font-bold text-gray-800 dark:text-gray-200">{t('home_desc_bold')}</span>.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-2"><Download className="w-5 h-5 text-rose-500"/> {t('quality_pdf')}</span>
                <span className="flex items-center gap-2"><Palette className="w-5 h-5 text-purple-500"/> {t('quality_vector')}</span>
                <span className="flex items-center gap-2"><Heart className="w-5 h-5 text-red-500"/> {t('quality_love')}</span>
            </div>
        </div>
      </section>

      {/* Infinite Marquee */}
      {products.length > 4 && (
        <section className="py-10 bg-gray-900 dark:bg-black overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 dark:from-black via-transparent to-gray-900 dark:to-black z-10 pointer-events-none"></div>
            <div className="flex gap-8 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
                {[...products, ...products].map((p, i) => (
                    <Link to={`/product/${p.id}`} key={`${p.id}-${i}`} className="inline-block w-48 md:w-64 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-105 border border-gray-700 relative flex-shrink-0">
                        <img src={p.portada_url} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold border border-white px-4 py-2 rounded-full backdrop-blur-sm">{t('hero_cta')}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
      )}

      {/* Main Catalog */}
      <section id="catalogo" className="py-16 px-4 md:px-8 max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-12">
            <span className="text-rose-600 font-bold tracking-wider uppercase text-sm">{t('catalog_title')}</span>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-2">
                {specialFilter === 'offers' ? t('filter_offers') + ' 🔥' : specialFilter === 'new' ? t('filter_new') + ' 🚀' : t('filter_style')}
            </h3>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
                onClick={() => handleFilterClick('category', 'All')}
                className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 border ${
                activeCategory === 'All' && specialFilter === 'none'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg scale-105' 
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
                <Filter className="w-4 h-4" />
                {t('catalog_filter_all')}
            </button>
            {categories.map(cat => (
                <button
                key={cat.id}
                onClick={() => handleFilterClick('category', cat.nombre)}
                className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 border ${
                    activeCategory === cat.nombre 
                    ? 'bg-rose-600 text-white border-rose-600 shadow-lg scale-105 shadow-rose-500/25' 
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:border-rose-200 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
                >
                {cat.nombre}
                </button>
            ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rose-600"></div>
          </div>
        ) : (
          <>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 mt-8">
                <p className="text-gray-400 text-xl font-medium">No se encontraron productos en esta sección.</p>
                <button onClick={() => handleFilterClick('category', 'All')} className="mt-4 text-rose-600 font-bold hover:underline">Ver todo el catálogo</button>
              </div>
            )}
          </>
        )}
      </section>

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
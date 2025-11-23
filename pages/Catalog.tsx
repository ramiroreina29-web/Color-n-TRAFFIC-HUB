import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Footer } from '../components/Footer';
import { PublicNavbar } from '../components/PublicNavbar';
import { Filter, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const { t } = useTheme();

  useEffect(() => {
    document.title = "Catálogo | Colorín"; // SEO
    
    const fetchData = async () => {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        supabase.from('productos').select('*').eq('activo', true).order('created_at', { ascending: false }),
        supabase.from('categorias').select('*').eq('activo', true).order('orden'),
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter Logic
  let filteredProducts = products;
  let pageTitle = t('catalog_title');
  let pageDescription = "Explora nuestra colección completa.";

  if (filterParam === 'new') {
      pageTitle = t('filter_new') + " 🚀";
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filteredProducts = products.filter(p => new Date(p.created_at) > thirtyDaysAgo);
  } else if (filterParam === 'offers') {
      pageTitle = t('filter_offers') + " 🔥";
      filteredProducts = products.filter(p => p.precio_anterior && p.precio_anterior > p.precio);
  } else if (activeCategory !== 'All') {
      filteredProducts = products.filter(p => p.categoria === activeCategory);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
      <PublicNavbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 py-24 w-full">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{pageTitle}</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{pageDescription}</p>
        </div>

        {/* Category Filter (Only show if not in specific mode) */}
        {!filterParam && (
             <div className="flex flex-wrap justify-center gap-3 mb-12 animate-slide-up">
                <button
                    onClick={() => setActiveCategory('All')}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
                    activeCategory === 'All'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' 
                        : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                    {t('catalog_filter_all')}
                </button>
                {categories.map(cat => (
                    <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.nombre)}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
                        activeCategory === cat.nombre 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
                        : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:text-rose-600 dark:hover:text-rose-400'
                    }`}
                    >
                    {cat.nombre}
                    </button>
                ))}
            </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-gray-200 dark:bg-slate-800 rounded-2xl h-80 animate-pulse"></div>)}
          </div>
        ) : (
          <>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 mt-8">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No encontramos resultados</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Intenta cambiar los filtros o vuelve más tarde.</p>
                {filterParam && (
                    <Link to="/catalog" className="inline-block mt-6 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors">
                        Ver todo el catálogo
                    </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
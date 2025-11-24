import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Footer } from '../components/Footer';
import { PublicNavbar } from '../components/PublicNavbar';
import { Search, X, Layers } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const queryParam = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Local state for the input to avoid lag, synced with URL
  const [searchText, setSearchText] = useState(queryParam);
  
  const { t, language } = useTheme();

  // Create maps for fast lookup (Color & Translation)
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
    document.title = "Catálogo | Colorín"; // SEO
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Attempt to fetch from View first
        let allProducts: Product[] = [];
        const { data: viewData, error: viewError } = await supabase.from('productos_con_stats').select('*').eq('activo', true);
        
        if (!viewError && viewData) {
            allProducts = viewData;
        } else {
            // Fallback
            const { data: tableData } = await supabase.from('productos').select('*').eq('activo', true);
            if (tableData) allProducts = tableData;
        }

        const { data: catRes } = await supabase.from('categorias').select('*').eq('activo', true).order('orden');

        // Sort by newest by default
        allProducts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setProducts(allProducts);
        if (catRes) setCategories(catRes);
      } catch (err) {
        console.error("Error loading catalog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync local input with URL param
  useEffect(() => {
    setSearchText(queryParam);
  }, [queryParam]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchText(val);
    if (val) {
        setSearchParams({ q: val });
        setActiveCategory('All'); // Reset category when searching
    } else {
        setSearchParams({});
    }
  };

  const clearSearch = () => {
      setSearchParams({});
      setSearchText('');
  };

  // --- FILTER LOGIC ---
  let filteredProducts = products;
  let pageTitle = t('catalog_title');
  let pageDescription = "Explora nuestra colección completa.";

  // 1. Search Query
  if (queryParam) {
      pageTitle = `Resultados para: "${queryParam}"`;
      pageDescription = `Buscando libros que coincidan...`;
      const lowerQ = queryParam.toLowerCase().trim();
      filteredProducts = products.filter(p => 
          p.titulo.toLowerCase().includes(lowerQ) || 
          (p.descripcion && p.descripcion.toLowerCase().includes(lowerQ))
      );
  } 
  // 2. Special Filters (New / Offers)
  else if (filterParam === 'new') {
      pageTitle = t('filter_new') + " 🚀";
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filteredProducts = products.filter(p => new Date(p.created_at) > thirtyDaysAgo);
  } else if (filterParam === 'offers') {
      pageTitle = t('filter_offers') + " 🔥";
      filteredProducts = products.filter(p => p.precio_anterior && p.precio_anterior > p.precio);
  } 
  // 3. Category Filter
  else if (activeCategory !== 'All') {
      // Robust comparison: Trim whitespace and ignore case
      filteredProducts = products.filter(p => 
          p.categoria && p.categoria.trim().toLowerCase() === activeCategory.trim().toLowerCase()
      );
  }

  const getCategoryDisplayName = (cat: Category) => {
    return (language === 'en' && cat.nombre_en) ? cat.nombre_en : cat.nombre;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
      <PublicNavbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 py-24 w-full">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{pageTitle}</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">{pageDescription}</p>
            
            {/* Search Bar - INSIDE CATALOG PAGE as requested */}
            <div className="max-w-lg mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Buscar libros, mandalas, estilos..." 
                        className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl focus:shadow-2xl focus:ring-0 outline-none text-gray-900 dark:text-white font-medium transition-all"
                        value={searchText}
                        onChange={handleSearchChange}
                    />
                    <Search className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-rose-500 transition-colors" />
                    {searchText && (
                        <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400 hover:text-rose-500"/>
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Category Filter Bar */}
        {!filterParam && !queryParam && (
             <div className="mb-12 overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-3 px-2 min-w-max md:min-w-0">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 border ${
                        activeCategory === 'All'
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg scale-105' 
                            : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        {t('catalog_filter_all')}
                    </button>
                    
                    {categories.length > 0 ? (
                        categories.map(cat => (
                            <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.nombre)}
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
                        // Fallback visual to prevent empty bar
                        ['Mandalas', 'Infantil', 'Animales', 'Arte Terapia'].map((fallbackCat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveCategory(fallbackCat)}
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
                </div>
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
              {filteredProducts.map((product, idx) => {
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
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 mt-8">
                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-slate-600">
                    <Layers className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeCategory !== 'All' 
                        ? `No hay productos en "${(language === 'en' && categoryTranslationMap[activeCategory.trim().toLowerCase()]) ? categoryTranslationMap[activeCategory.trim().toLowerCase()] : activeCategory}"` 
                        : 'No se encontraron resultados'
                    }
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                    Es posible que aún no hayamos agregado productos a esta categoría o que tu búsqueda no coincida.
                </p>
                {(filterParam || queryParam || activeCategory !== 'All') && (
                    <button onClick={() => { clearSearch(); setActiveCategory('All'); }} className="inline-block mt-6 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors">
                        Ver todo el catálogo
                    </button>
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
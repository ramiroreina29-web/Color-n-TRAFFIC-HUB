import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Product, Review, Category } from '../types';
import { useProductTracking, trackPayhipClick } from '../services/tracking';
import { ExternalLink, Check, ChevronRight, Home, ShieldCheck, Star, Download, Send, CheckCircle, Flame, TrendingUp, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/Footer';
import { PublicNavbar } from '../components/PublicNavbar';
import { useTheme } from '../contexts/ThemeContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [related, setRelated] = useState<Product[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ user_name: '', comment: '', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Translations
  const { language, t } = useTheme();

  // Automatic tracking hook
  useProductTracking(id);

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Product (Critical)
        const { data: productData, error: productError } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single();
        
        if (productError) throw productError;
        
        setProduct(productData);
        setActiveImage(productData.portada_url);

        // 2. Fetch "Amazon Style" Recommendations (Most Viewed in Category)
        const { data: relatedData } = await supabase
          .from('productos_con_stats') // Using the SQL View
          .select('*')
          .eq('categoria', productData.categoria)
          .neq('id', productData.id) // Exclude current
          .eq('activo', true)
          .order('visitas', { ascending: false }) // The "Amazon" Logic: Most popular first
          .limit(6);
        
        if (relatedData) setRelated(relatedData);

        // 3. Fetch Reviews
        const { data: reviewsData } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', id)
            .order('created_at', { ascending: false });
            
        if (reviewsData) {
            setReviews(reviewsData);
        }

        // 4. Fetch Categories for Translation
        const { data: catData } = await supabase
            .from('categorias')
            .select('nombre, nombre_en');
        
        if (catData) {
            const map: Record<string, string> = {};
            catData.forEach((c: any) => {
                if (c.nombre) map[c.nombre.trim().toLowerCase()] = c.nombre_en;
            });
            setCategoryMap(map);
        }

      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup title on unmount
    return () => {
      document.title = "Colorín | Premium Coloring Books";
    };
  }, [id]);

  useEffect(() => {
    if (product) {
       // SEO TITLE UPDATE - DYNAMIC based on language
       const title = (language === 'en' && product.titulo_en) ? product.titulo_en : product.titulo;
       document.title = `${title} | Colorín`;
    }
  }, [product, language]);

  const handlePayhipClick = () => {
    if (product) {
      trackPayhipClick(product.id);
      window.open(product.payhip_link, '_blank');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReview.user_name || !newReview.comment) return;
    setSubmittingReview(true);

    try {
        const payload = {
            product_id: product.id,
            user_name: newReview.user_name,
            comment: newReview.comment,
            rating: newReview.rating,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('reviews').insert(payload);
        
        if (error) throw error;

        const optimisicReview = { ...payload, id: Math.random().toString() };
        setReviews([optimisicReview as Review, ...reviews]);
        
        setNewReview({ user_name: '', comment: '', rating: 5 });
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
        console.error("Error submitting review", err);
        alert(`Error: ${err.message}`);
    } finally {
        setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1) 
    : '5.0';

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rose-600"></div>
      </div>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <PublicNavbar />
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <p className="text-xl font-bold mb-4">{t('notFound_title')}</p>
          <Link to="/" className="text-rose-600 hover:underline">{t('back_home')}</Link>
      </div>
    </div>
  );

  const allImages = [product.portada_url, ...(product.imagenes || [])];
  
  // Language Logic
  const displayTitle = (language === 'en' && product.titulo_en) ? product.titulo_en : product.titulo;
  const displayDesc = (language === 'en' && product.descripcion_en) ? product.descripcion_en : product.descripcion;
  
  // Category Translation Logic
  const catKey = product.categoria?.trim().toLowerCase() || '';
  const displayCategory = (language === 'en' && categoryMap[catKey]) ? categoryMap[catKey] : product.categoria;

  // Discount Logic
  const hasDiscount = product.precio_anterior && product.precio_anterior > product.precio;
  const discountPercent = hasDiscount && product.precio_anterior 
    ? Math.round(((product.precio_anterior - product.precio) / product.precio_anterior) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
        <PublicNavbar />
        
        {/* Breadcrumb */}
        <div className="bg-slate-50 dark:bg-slate-900 py-4 border-b border-gray-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Link to="/" className="hover:text-rose-600 transition-colors"><Home className="w-4 h-4"/></Link>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                <span className="font-medium">{displayCategory}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                <span className="text-gray-900 dark:text-white font-bold truncate">{displayTitle}</span>
            </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Gallery Section */}
          <div className="space-y-6">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-2xl border border-gray-100 dark:border-slate-700 group relative">
              <img 
                src={activeImage} 
                alt={displayTitle} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-1 snap-x">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-start ${
                      activeImage === img ? 'border-rose-600 shadow-lg scale-105 ring-2 ring-rose-200 dark:ring-rose-900' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-start pt-4">
            <div className="mb-4 flex items-center gap-3">
                <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-wider uppercase">
                    {displayCategory}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(Number(averageRating)) ? 'fill-current text-yellow-400' : 'text-gray-300 dark:text-slate-600'}`}/>)}
                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">({averageRating}) • {reviews.length} {language === 'es' ? 'reseñas' : 'reviews'}</span>
                </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              {displayTitle}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                {/* Price Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit flex items-center gap-4">
                    {hasDiscount && (
                        <div className="flex flex-col items-end mr-2">
                             <span className="text-sm font-bold text-gray-400 line-through">
                                ${product.precio_anterior}
                             </span>
                             <span className="text-xs font-black text-white bg-rose-500 px-2 py-0.5 rounded uppercase">
                                {discountPercent}% OFF
                             </span>
                        </div>
                    )}
                    {/* UPDATED: Emerald Green Price */}
                    <span className={`text-5xl font-black text-transparent bg-clip-text ${hasDiscount ? 'bg-gradient-to-r from-emerald-600 to-green-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ${product.precio}
                    </span>
                    {hasDiscount && (
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-bold animate-pulse">
                            OFERTA
                        </span>
                    )}
                </div>

                {product.demo_file_url && (
                    <a href={product.demo_file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 rounded-2xl border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors group">
                        <div className="bg-cyan-100 dark:bg-cyan-900/40 p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <Download className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col text-left leading-none">
                            <span className="text-xs uppercase tracking-wider text-cyan-400">{t('free_demo')}</span>
                            <span>{t('download_demo')}</span>
                        </div>
                    </a>
                )}
            </div>

            {/* NEW: Small Subtle Button between Price and Description */}
            <div className="mb-8">
                <button
                    onClick={handlePayhipClick}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-white font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                    <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('view_payhip')}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                </button>
            </div>

            <div className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-10 border-l-4 border-rose-200 dark:border-rose-900 pl-6 whitespace-pre-line">
              {displayDesc}
            </div>

            <div className="space-y-4 mb-12">
              {[
                  language === 'es' ? 'Descarga inmediata (PDF Alta Calidad)' : 'Instant Download (High Quality PDF)', 
                  language === 'es' ? 'Diseños Originales 100% Vectoriales' : '100% Original Vector Designs', 
                  language === 'es' ? 'Garantía de Satisfacción de 30 días' : '30-Day Satisfaction Guarantee', 
                  language === 'es' ? 'Imprime las veces que quieras' : 'Print as many times as you want'
                ].map((feat, i) => (
                <div key={i} className="flex items-center gap-4 text-gray-700 dark:text-gray-300 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-lg">{feat}</span>
                </div>
              ))}
            </div>

            {/* Main CTA */}
            <div className="space-y-6">
                <button
                onClick={handlePayhipClick}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-rose-600 to-red-600 text-white py-6 px-8 rounded-2xl text-2xl font-black shadow-xl hover:shadow-2xl hover:shadow-rose-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
                >
                <span className="relative z-10 flex items-center justify-center gap-4">
                    {t('view_payhip')}
                    <ExternalLink className="w-7 h-7 group-hover:rotate-45 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                </button>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <ShieldCheck className="w-5 h-5 text-green-500"/> 
                    <span>{t('payment_secure')}</span>
                </div>
            </div>
          </div>
        </div>

        {/* MOST VIEWED / AMAZON STYLE RECOMMENDATIONS */}
        {related.length > 0 && (
          <div className="mt-32 border-t border-gray-100 dark:border-slate-800 pt-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                     <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{t('related_products')}</h3>
                     <p className="text-rose-600 dark:text-rose-400 font-medium text-sm mt-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> {t('most_popular')} {displayCategory}
                     </p>
                </div>
            </div>
            
            {/* Horizontal Scroll Snap Carousel */}
            <div className="flex overflow-x-auto pb-8 gap-6 snap-x hide-scrollbar">
              {related.map((rel, idx) => {
                  const hasDisc = rel.precio_anterior && rel.precio_anterior > rel.precio;
                  // Related Item Title Translation
                  const relTitle = (language === 'en' && rel.titulo_en) ? rel.titulo_en : rel.titulo;
                  
                  return (
                 <div key={rel.id} className="min-w-[280px] w-[280px] md:min-w-[300px] snap-start group relative">
                     <Link to={`/product/${rel.id}`} className="block h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        
                        {/* Image Area */}
                        <div className="aspect-[3/4] relative overflow-hidden bg-gray-50 dark:bg-slate-800">
                            <img src={rel.portada_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                            
                            {/* Badges */}
                            {idx === 0 && (
                                <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-3 py-1 rounded-br-lg flex items-center gap-1 shadow-sm z-10">
                                    <Flame className="w-3 h-3 fill-current" /> #1 Best Seller
                                </div>
                            )}
                            {hasDisc && (
                                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg shadow-sm z-10">
                                    OFFER
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="p-4">
                             <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 min-h-[2.5em] group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                {relTitle}
                             </h4>
                             {/* Mini Stars in Related */}
                             <div className="flex items-center gap-1 mb-2">
                                <div className="flex text-yellow-400">
                                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                                </div>
                                <span className="text-[10px] text-gray-400">(120)</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    {hasDisc && <span className="text-xs text-gray-400 line-through font-medium">${rel.precio_anterior}</span>}
                                    <span className={`text-xl font-bold ${hasDisc ? 'text-rose-600 dark:text-rose-500' : 'text-gray-900 dark:text-white'}`}>${rel.precio}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-rose-600 dark:group-hover:bg-rose-500 group-hover:text-white transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                             </div>
                        </div>
                     </Link>
                 </div>
              )})}
            </div>
          </div>
        )}

        {/* Video Section */}
        {product.video_url && (
            <div className="mt-16 max-w-4xl mx-auto bg-slate-900 dark:bg-black rounded-[2.5rem] p-4 md:p-8 text-white shadow-2xl border border-slate-800">
                <div className="text-center mb-8 pt-4">
                    <h3 className="text-3xl font-bold mb-2">{t('video_title')}</h3>
                    <p className="text-gray-400">{t('video_desc')}</p>
                </div>
                <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={product.video_url.replace("watch?v=", "embed/")} 
                        title="Product Video" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen 
                    />
                </div>
            </div>
        )}

        {/* Reviews Section */}
        <div className="mt-24 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">{t('reviews_title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Form */}
                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">{t('write_review')}</h4>
                    {reviewSuccess ? (
                        <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-4 rounded-xl flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" /> ¡Gracias por tu opinión!
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('your_name')}</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Ej. María G." value={newReview.user_name} onChange={e => setNewReview({...newReview, user_name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('rating')}</label>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(star => (
                                        <button key={star} type="button" onClick={() => setNewReview({...newReview, rating: star})} className="focus:outline-none transition-transform hover:scale-110">
                                            <Star className={`w-8 h-8 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-slate-700'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('comment')}</label>
                                <textarea required rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none" placeholder="..." value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} />
                            </div>
                            <Button type="submit" isLoading={submittingReview} className="w-full">
                                <Send className="w-4 h-4 mr-2"/> {t('submit_review')}
                            </Button>
                        </form>
                    )}
                </div>

                {/* List */}
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {reviews.map((rev, idx) => (
                        <div key={rev.id || idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/40 dark:to-purple-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                                        {rev.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{rev.user_name}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-gray-200 dark:text-slate-700'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 italic">"{rev.comment}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
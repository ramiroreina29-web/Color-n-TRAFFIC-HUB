import React from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { Eye, ArrowUpRight, Tag, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ProductCardProps {
  product: Product;
  index: number;
  categoryColor?: string; // New prop for dynamic color
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, categoryColor }) => {
  const { language, t } = useTheme();

  // Dynamic Content Logic
  const title = (language === 'en' && product.titulo_en) ? product.titulo_en : product.titulo;

  // Calculate discount
  const hasDiscount = product.precio_anterior && product.precio_anterior > product.precio;
  const discountPercent = hasDiscount && product.precio_anterior 
    ? Math.round(((product.precio_anterior - product.precio) / product.precio_anterior) * 100) 
    : 0;

  // Mocking Rating if not present in SQL View yet to ensure "Amazon Style" visual
  const ratingValue = product.average_rating || 5.0;
  const reviewsCount = product.reviews_count || Math.floor(Math.random() * (50 - 5 + 1) + 5); // Fallback for demo visuals

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-500/10 dark:shadow-none dark:border dark:border-slate-800 transition-all duration-300 hover:-translate-y-2 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-slate-800">
        <img 
          src={product.portada_url} 
          alt={title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* Category Badge with Dynamic Color */}
        <span 
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm z-10 ${
                categoryColor 
                ? `${categoryColor} text-white` 
                : 'bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400'
            }`}
        >
          {product.categoria}
        </span>

        {/* Discount Badge */}
        {hasDiscount && (
           <span className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide shadow-lg z-10 animate-pulse flex items-center gap-1">
             <Tag className="w-3 h-3 fill-current" /> {discountPercent}% OFF
           </span>
        )}

        {/* Hover Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <Link 
            to={`/product/${product.id}`}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-gray-900 dark:text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
          >
            <Eye className="w-5 h-5" />
            {t('view_details')}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        
        {/* Amazon-style Ratings */}
        <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(star => (
                     <Star key={star} className={`w-3 h-3 ${star <= Math.round(ratingValue) ? 'fill-current' : 'text-gray-200 dark:text-slate-700'}`} />
                ))}
            </div>
            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer">
                {reviewsCount}
            </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            {hasDiscount && (
                <span className="text-xs text-gray-400 line-through font-medium ml-1">
                    ${product.precio_anterior}
                </span>
            )}
            <span className={`text-2xl font-extrabold ${hasDiscount ? 'text-rose-600 dark:text-rose-500' : 'text-gray-900 dark:text-white'}`}>
                ${product.precio}
            </span>
          </div>
          <Link 
            to={`/product/${product.id}`}
            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowUpRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};
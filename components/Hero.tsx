
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ChevronRight, Star } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const { Link } = ReactRouterDOM;

interface HeroProps {
  products: Product[];
}

export const Hero: React.FC<HeroProps> = ({ products }) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { language, t } = useTheme();

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 8000); // 8 seconds per slide
    return () => clearInterval(timer);
  }, [products.length, current]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev + 1) % products.length);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const handleDotClick = (index: number) => {
    if (index === current || isAnimating) return;
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 800);
  };

  if (!products.length) return null;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-gray-900 shadow-2xl">
      {products.map((product, index) => {
        // Translations Logic
        const title = (language === 'en' && product.titulo_en) ? product.titulo_en : product.titulo;
        const description = (language === 'en' && product.descripcion_en) ? product.descripcion_en : product.descripcion;

        return (
          <div
            key={product.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* 1. ATMOSPHERIC BACKGROUND (Blurred Product Image) */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                  className={`absolute inset-0 bg-cover bg-center blur-[80px] md:blur-[100px] scale-125 brightness-[0.4] transition-transform duration-[10000ms] ease-linear ${index === current ? 'scale-150' : 'scale-125'}`}
                  style={{ backgroundImage: `url(${product.portada_url})` }}
              />
              {/* Texture Overlay */}
              <div className="absolute inset-0 bg-black/30" style={{backgroundImage: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)'}}></div>
            </div>

            {/* 2. MAIN CONTENT CONTAINER */}
            {/* Added pt-28 to clear the fixed navbar on mobile since we removed the spacer */}
            <div className="absolute inset-0 flex items-center justify-center px-6 md:px-12 max-w-7xl mx-auto pt-20 md:pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center w-full h-full pb-10 md:pb-0">
                  
                  {/* LEFT: Text Content */}
                  <div className={`space-y-3 md:space-y-6 text-center md:text-left transform transition-all duration-1000 delay-300 z-20 flex flex-col items-center md:items-start justify-center md:justify-center ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] md:text-sm font-bold uppercase tracking-widest shadow-lg animate-pulse mb-1 md:mb-0">
                          <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                          <span>{t('hero_featured')}</span>
                      </div>

                      {/* Adjusted Title Size for Mobile */}
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight md:leading-[1.1] drop-shadow-2xl px-2 md:px-0">
                          {title}
                      </h1>

                      <p className="text-sm sm:text-base md:text-lg text-gray-300 font-light leading-relaxed line-clamp-3 md:line-clamp-4 max-w-lg mx-auto md:mx-0 drop-shadow-md px-2 md:px-0">
                          {description ? description.substring(0, 150) + "..." : "Explora este increíble libro para colorear."}
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 justify-center md:justify-start pt-2 md:pt-4 w-full md:w-auto">
                          <Link 
                              to={`/product/${product.id}`}
                              className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 md:px-8 bg-white text-gray-900 rounded-full font-bold text-sm md:text-lg transition-all hover:bg-rose-500 hover:text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] w-full sm:w-auto"
                          >
                              {t('hero_cta')}
                              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                          <span className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-yellow-400 drop-shadow-sm filter">
                              ${product.precio}
                          </span>
                      </div>
                  </div>

                  {/* RIGHT: Product 3D Floating Image */}
                  <div className={`relative flex justify-center items-center h-full max-h-[40vh] md:max-h-full transform transition-all duration-1000 delay-500 ${index === current ? 'translate-x-0 opacity-100' : 'translate-x-10 md:translate-x-20 opacity-0'}`}>
                      
                      {/* Floating Animation Container */}
                      <div className="animate-float relative z-10 group perspective-[1000px]">
                          
                          {/* Glowing effect */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-rose-500/40 to-blue-500/40 blur-[40px] md:blur-[60px] rounded-full"></div>

                          <Link to={`/product/${product.id}`} className="block relative transform-style-3d">
                              <img 
                                  src={product.portada_url} 
                                  alt={title}
                                  className="w-[140px] xs:w-[180px] sm:w-[240px] md:w-[280px] lg:w-[380px] rounded-xl shadow-2xl transition-all duration-500 ease-out 
                                            transform 
                                            rotate-y-[-10deg] rotate-x-[5deg]
                                            group-hover:rotate-y-[0deg] group-hover:rotate-x-[0deg] 
                                            group-hover:scale-110 group-hover:-translate-y-2
                                            shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                                            group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
                                  style={{
                                      backfaceVisibility: 'hidden',
                                  }}
                              />
                              {/* Reflection/Sheen effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"></div>
                          </Link>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation Indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === current ? 'w-8 md:w-10 bg-white shadow-[0_0_10px_white]' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

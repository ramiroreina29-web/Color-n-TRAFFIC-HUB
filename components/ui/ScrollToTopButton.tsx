
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Increased threshold to 800px so it appears only when deep in the page (well past the banner)
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`
        fixed bottom-20 right-4 md:bottom-24 md:right-6 z-40 
        p-3 rounded-full 
        bg-rose-500/40 dark:bg-rose-600/30 backdrop-blur-md 
        border border-white/20 dark:border-white/10
        text-white shadow-lg shadow-rose-500/10 
        transition-all duration-500 ease-out transform 
        hover:scale-110 hover:-translate-y-1 hover:bg-rose-500 hover:shadow-rose-500/40 hover:border-white/40
        group
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
      `}
      aria-label="Volver arriba"
    >
      <div className="relative">
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={2.5} />
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </button>
  );
};

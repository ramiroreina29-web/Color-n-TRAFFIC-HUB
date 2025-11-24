import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Logic: Show when scrolled down 300px
      if (window.scrollY > 300) {
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
        fixed bottom-32 right-8 z-40 
        p-3 rounded-full 
        bg-rose-500/10 dark:bg-rose-600/10 backdrop-blur-md 
        border border-white/20 dark:border-white/10
        text-rose-600 dark:text-rose-400
        transition-all duration-500 ease-out transform 
        hover:scale-110 hover:-translate-y-1 
        hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 hover:border-transparent
        group
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
      `}
      aria-label="Volver arriba"
    >
      <div className="relative">
        <ArrowUp className="w-5 h-5 group-hover:animate-bounce" strokeWidth={2.5} />
      </div>
    </button>
  );
};
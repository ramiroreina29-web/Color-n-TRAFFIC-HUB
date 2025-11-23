import React from 'react';
import { ShowcaseItem } from '../types';
import { Heart, ZoomIn, Palette } from 'lucide-react';

interface ShowcaseProps {
  items: ShowcaseItem[];
}

export const Showcase: React.FC<ShowcaseProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <section id="muro-fama" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent z-10"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-20">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 font-bold tracking-wider uppercase text-xs mb-4 border border-rose-100">
            <Palette className="w-4 h-4" />
            Comunidad Colorín
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Muro de la Fama
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Obras maestras coloreadas por artistas como tú. <br className="hidden md:block"/>
            Inspírate con los resultados finales de nuestra comunidad.
          </p>
        </div>

        {/* Masonry Grid Implementation using CSS Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 px-2 md:px-0">
          {items.map((item, idx) => (
            <div 
              key={item.id} 
              className="break-inside-avoid group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-500 cursor-pointer bg-gray-100"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <img 
                src={item.imagen_url} 
                alt={item.titulo || 'Obra de arte'} 
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="text-white font-bold text-xl mb-1 drop-shadow-md">
                    {item.titulo || 'Sin título'}
                    </h3>
                    {item.autor_nombre && (
                        <p className="text-rose-200 text-sm font-medium flex items-center gap-2">
                            Coloreado por <span className="text-white underline decoration-rose-500 decoration-2 underline-offset-4">{item.autor_nombre}</span>
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-3 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-rose-500 hover:border-rose-500 transition-all shadow-lg">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-all shadow-lg">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State visual helper for Admin */}
        {items.length === 0 && (
           <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <p className="text-gray-400 font-medium">El Muro de la Fama está vacío.</p>
                <p className="text-sm text-gray-400">Sube imágenes desde el Panel Admin &gt; Galería.</p>
           </div>
        )}
      </div>
    </section>
  );
};
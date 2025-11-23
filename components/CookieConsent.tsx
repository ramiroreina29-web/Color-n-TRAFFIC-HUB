import React, { useEffect, useState } from 'react';
import { Cookie, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('colorin_cookie_consent');
    if (!consent) {
      // Small delay for animation entrance
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('colorin_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 max-w-md animate-slide-up">
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-rose-100 p-3 rounded-xl flex-shrink-0">
            <Cookie className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Usamos Cookies 🍪</h4>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
              Al continuar navegando, aceptas nuestra <Link to="/cookies-policy" className="text-rose-600 hover:underline font-bold">Política de Cookies</Link>.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleAccept}
                className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Aceptar Todo
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
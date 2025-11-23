import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-rose-100">404</h1>
          <AlertCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-rose-500/20" />
        </div>
        
        <h2 className="text-4xl font-black text-gray-900 mt-4 mb-6 tracking-tight">
          ¡Ups! Página no encontrada
        </h2>
        
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          Parece que te has salido de las líneas. La página que buscas no existe o ha sido movida a otro libro de colorear.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 transform hover:-translate-y-1"
        >
          <Home className="w-5 h-5" /> Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
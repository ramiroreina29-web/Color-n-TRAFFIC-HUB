import React from 'react';
import { Footer } from '../../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

const CookiesPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
       <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold transition-colors">
                <ArrowLeft className="w-5 h-5" /> Volver al inicio
            </Link>
            <Cookie className="w-6 h-6 text-gray-300" />
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Política de Cookies</h1>
            <p className="text-gray-500 mb-10 text-lg">Última actualización: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-rose max-w-none text-gray-600">
                <p><strong>Colorín Hub</strong> utiliza cookies para mejorar tu experiencia en la web. A continuación explicamos qué son, cómo las usamos y cómo puedes controlarlas.</p>

                <h3>¿Qué son las cookies?</h3>
                <p>Las cookies son pequeños archivos de texto que los sitios web guardan en tu ordenador o dispositivo móvil cuando los visitas. Permiten que el sitio recuerde tus acciones y preferencias durante un período de tiempo.</p>

                <h3>¿Cómo usamos las cookies?</h3>
                <p>Utilizamos cookies para:</p>
                <ul>
                    <li><strong>Cookies Esenciales:</strong> Necesarias para que el sitio funcione correctamente (ej. recordar qué productos viste recientemente).</li>
                    <li><strong>Cookies de Análisis:</strong> Nos ayudan a entender cómo los visitantes interactúan con el sitio (ej. Google Analytics, métricas internas).</li>
                    <li><strong>Cookies de Preferencias:</strong> Recuerdan tus ajustes, como si ya has aceptado el banner de cookies o tu suscripción al boletín.</li>
                </ul>

                <h3>Control de cookies</h3>
                <p>Puedes controlar y/o eliminar las cookies como desees. Puedes borrar todas las cookies que ya están en tu ordenador y configurar la mayoría de los navegadores para que eviten su instalación. Sin embargo, si lo haces, es posible que tengas que ajustar manualmente algunas preferencias cada vez que visites un sitio.</p>
                
                <p>Para más información sobre cómo gestionar las cookies, visita la ayuda de tu navegador.</p>
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CookiesPolicy;
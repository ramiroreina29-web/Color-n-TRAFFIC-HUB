
import React, { useEffect } from 'react';
import { Footer } from '../../components/Footer';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { SEO } from '../../components/SEO';
import { PublicNavbar } from '../../components/PublicNavbar';

const { Link } = ReactRouterDOM;

const CookiesPolicy = () => {
  const { t, language } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
      <SEO title={t('legal_cookies')} />
      <PublicNavbar />
      
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 font-bold transition-colors">
                <ArrowLeft className="w-5 h-5" /> {t('back_home')}
            </Link>
            <Cookie className="w-6 h-6 text-gray-300 dark:text-gray-600" />
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-slate-800">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{t('legal_cookies')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">{t('last_updated')} {new Date().toLocaleDateString()}</p>

            <div className="prose prose-rose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                {language === 'es' ? (
                    <>
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
                    </>
                ) : (
                    <>
                         <p><strong>Colorín Hub</strong> uses cookies to improve your web experience. Below we explain what they are, how we use them, and how you can control them.</p>

                        <h3>What are cookies?</h3>
                        <p>Cookies are small text files that websites save on your computer or mobile device when you visit them. They allow the site to remember your actions and preferences over a period of time.</p>

                        <h3>How do we use cookies?</h3>
                        <p>We use cookies to:</p>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Necessary for the site to function correctly (e.g., remembering which products you recently viewed).</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the site (e.g., Google Analytics, internal metrics).</li>
                            <li><strong>Preference Cookies:</strong> Remember your settings, such as if you have already accepted the cookie banner or your newsletter subscription.</li>
                        </ul>

                        <h3>Controlling Cookies</h3>
                        <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site.</p>
                        
                        <p>For more information on how to manage cookies, please visit your browser's help section.</p>
                    </>
                )}
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CookiesPolicy;

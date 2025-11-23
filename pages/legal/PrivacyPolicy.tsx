import React from 'react';
import { Footer } from '../../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold transition-colors">
                <ArrowLeft className="w-5 h-5" /> Volver al inicio
            </Link>
            <Shield className="w-6 h-6 text-gray-300" />
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Política de Privacidad</h1>
            <p className="text-gray-500 mb-10 text-lg">Última actualización: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-rose max-w-none text-gray-600">
                <p>En <strong>Colorín Hub</strong>, nos tomamos muy en serio tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.</p>

                <h3>1. Información que recopilamos</h3>
                <p>Podemos recopilar información que nos proporcionas directamente, como:</p>
                <ul>
                    <li>Tu dirección de correo electrónico cuando te suscribes a nuestro boletín o descargas material gratuito.</li>
                    <li>Información de uso y navegación a través de cookies (ver Política de Cookies).</li>
                </ul>
                <p>No almacenamos información de pago. Todas las transacciones se procesan de forma segura a través de nuestro socio <strong>Payhip</strong>.</p>

                <h3>2. Uso de la información</h3>
                <p>Utilizamos tu información para:</p>
                <ul>
                    <li>Enviarte los productos digitales o regalos que has solicitado.</li>
                    <li>Mejorar nuestro sitio web y la experiencia de usuario.</li>
                    <li>Enviarte actualizaciones sobre nuevos lanzamientos y ofertas (solo si has dado tu consentimiento).</li>
                </ul>

                <h3>3. Compartir información</h3>
                <p>No vendemos, intercambiamos ni transferimos tu información personal a terceros, excepto a aquellos de confianza que nos ayudan a operar nuestro sitio web (como proveedores de email marketing), siempre que acuerden mantener esta información confidencial.</p>

                <h3>4. Seguridad</h3>
                <p>Implementamos medidas de seguridad para mantener segura tu información personal. Nuestro sitio web utiliza cifrado SSL (Secure Socket Layer) para garantizar que los datos viajen seguros.</p>

                <h3>5. Tus derechos</h3>
                <p>Tienes derecho a solicitar el acceso, corrección o eliminación de tus datos personales en cualquier momento. Puedes darte de baja de nuestros correos electrónicos utilizando el enlace "Unsubscribe" al final de cada email.</p>

                <h3>6. Contacto</h3>
                <p>Si tienes preguntas sobre esta política, contáctanos a través de nuestras redes sociales o correo de soporte.</p>
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
import React from 'react';
import { Footer } from '../../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PrivacyPolicy = () => {
  const { t, language } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold transition-colors">
                <ArrowLeft className="w-5 h-5" /> {t('back_home')}
            </Link>
            <Shield className="w-6 h-6 text-gray-300" />
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h1 className="text-4xl font-black text-gray-900 mb-2">{t('legal_privacy')}</h1>
            <p className="text-gray-500 mb-10 text-lg">{t('last_updated')} {new Date().toLocaleDateString()}</p>

            <div className="prose prose-rose max-w-none text-gray-600">
                {language === 'es' ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <p>At <strong>Colorín Hub</strong>, we take your privacy very seriously. This policy describes how we collect, use, and protect your personal information.</p>

                        <h3>1. Information We Collect</h3>
                        <p>We may collect information you provide directly to us, such as:</p>
                        <ul>
                            <li>Your email address when you subscribe to our newsletter or download free materials.</li>
                            <li>Usage and navigation information via cookies (see Cookie Policy).</li>
                        </ul>
                        <p>We do not store payment information. All transactions are securely processed through our partner <strong>Payhip</strong>.</p>

                        <h3>2. Use of Information</h3>
                        <p>We use your information to:</p>
                        <ul>
                            <li>Send you the digital products or gifts you requested.</li>
                            <li>Improve our website and user experience.</li>
                            <li>Send you updates on new releases and offers (only if you have consented).</li>
                        </ul>

                        <h3>3. Sharing Information</h3>
                        <p>We do not sell, trade, or transfer your personal information to third parties, except to trusted parties who assist us in operating our website (such as email marketing providers), so long as those parties agree to keep this information confidential.</p>

                        <h3>4. Security</h3>
                        <p>We implement security measures to keep your personal information safe. Our website uses SSL (Secure Socket Layer) encryption to ensure data travels securely.</p>

                        <h3>5. Your Rights</h3>
                        <p>You have the right to request access, correction, or deletion of your personal data at any time. You can unsubscribe from our emails using the "Unsubscribe" link at the bottom of each email.</p>

                        <h3>6. Contact</h3>
                        <p>If you have questions about this policy, please contact us via our social media channels or support email.</p>
                    </>
                )}
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
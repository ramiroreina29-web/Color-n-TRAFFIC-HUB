import React from 'react';
import { Footer } from '../../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const TermsAndConditions = () => {
  const { t, language } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold transition-colors">
                <ArrowLeft className="w-5 h-5" /> {t('back_home')}
            </Link>
            <Scale className="w-6 h-6 text-gray-300" />
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h1 className="text-4xl font-black text-gray-900 mb-2">{t('legal_terms')}</h1>
            <p className="text-gray-500 mb-10 text-lg">{t('last_updated')} {new Date().toLocaleDateString()}</p>

            <div className="prose prose-rose max-w-none text-gray-600">
                {language === 'es' ? (
                    <>
                        <p>Bienvenido a <strong>Colorín Hub</strong>. Al acceder a este sitio web y adquirir nuestros productos digitales, aceptas cumplir con los siguientes términos y condiciones.</p>

                        <h3>1. Propiedad Intelectual</h3>
                        <p>Todo el contenido de este sitio web, incluyendo pero no limitado a ilustraciones, diseños, logotipos, textos y gráficos, es propiedad exclusiva de <strong>Colorín Hub</strong> y está protegido por las leyes internacionales de derechos de autor.</p>

                        <h3>2. Licencia de Uso (Productos Digitales)</h3>
                        <p>Al comprar o descargar uno de nuestros libros para colorear (PDF), se te otorga una <strong>licencia de uso personal y no comercial</strong>:</p>
                        <ul>
                            <li>✅ <strong>PUEDES:</strong> Imprimir el archivo tantas veces como quieras para uso personal. Colorearlo digitalmente. Compartir tu trabajo final coloreado en redes sociales.</li>
                            <li>❌ <strong>NO PUEDES:</strong> Revender, redistribuir o compartir el archivo PDF original. Utilizar las ilustraciones para crear productos comerciales (camisetas, tazas, etc.) sin una licencia comercial extendida.</li>
                        </ul>

                        <h3>3. Productos y Entregas</h3>
                        <p>Todos nuestros productos son <strong>100% digitales</strong>. No se enviará ningún producto físico. Tras la confirmación del pago en Payhip, recibirás un enlace de descarga inmediata en tu correo electrónico.</p>

                        <h3>4. Política de Reembolsos</h3>
                        <p>Debido a la naturaleza digital e irrevocable de nuestros productos (descarga inmediata), <strong>no ofrecemos reembolsos</strong> una vez que los archivos han sido descargados, a menos que exista un defecto técnico comprobable en el archivo.</p>

                        <h3>5. Modificaciones</h3>
                        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>

                        <h3>6. Limitación de Responsabilidad</h3>
                        <p>Colorín Hub no se hace responsable de daños directos, indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de uso de nuestros materiales.</p>
                    </>
                ) : (
                    <>
                        <p>Welcome to <strong>Colorín Hub</strong>. By accessing this website and purchasing our digital products, you agree to comply with the following terms and conditions.</p>

                        <h3>1. Intellectual Property</h3>
                        <p>All content on this website, including but not limited to illustrations, designs, logos, text, and graphics, is the exclusive property of <strong>Colorín Hub</strong> and is protected by international copyright laws.</p>

                        <h3>2. License of Use (Digital Products)</h3>
                        <p>When purchasing or downloading one of our coloring books (PDF), you are granted a <strong>personal, non-commercial use license</strong>:</p>
                        <ul>
                            <li>✅ <strong>YOU CAN:</strong> Print the file as many times as you like for personal use. Color it digitally. Share your final colored work on social media.</li>
                            <li>❌ <strong>YOU CANNOT:</strong> Resell, redistribute, or share the original PDF file. Use the illustrations to create commercial products (t-shirts, mugs, etc.) without an extended commercial license.</li>
                        </ul>

                        <h3>3. Products and Delivery</h3>
                        <p>All our products are <strong>100% digital</strong>. No physical product will be shipped. Upon confirmation of payment via Payhip, you will receive an instant download link in your email.</p>

                        <h3>4. Refund Policy</h3>
                        <p>Due to the digital and irrevocable nature of our products (instant download), <strong>we do not offer refunds</strong> once files have been downloaded, unless there is a verifiable technical defect with the file.</p>

                        <h3>5. Modifications</h3>
                        <p>We reserve the right to modify these terms at any time. Changes will take effect immediately upon posting on the website.</p>

                        <h3>6. Limitation of Liability</h3>
                        <p>Colorín Hub is not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our materials.</p>
                    </>
                )}
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
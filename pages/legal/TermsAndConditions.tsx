import React from 'react';
import { Footer } from '../../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold transition-colors">
                <ArrowLeft className="w-5 h-5" /> Volver al inicio
            </Link>
            <Scale className="w-6 h-6 text-gray-300" />
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Términos y Condiciones</h1>
            <p className="text-gray-500 mb-10 text-lg">Última actualización: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-rose max-w-none text-gray-600">
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
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;
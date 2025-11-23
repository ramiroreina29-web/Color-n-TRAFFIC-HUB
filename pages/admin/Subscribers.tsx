import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Download, Users, Copy, Check, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  origen?: string;
}

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from('suscriptores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscribers:', error);
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadCSV = () => {
    if (subscribers.length === 0) return;

    // Create CSV content
    const headers = ['Email', 'Fecha Suscripción', 'Origen'];
    const rows = subscribers.map(sub => [
      sub.email, 
      new Date(sub.created_at).toLocaleDateString(), 
      sub.origen || 'Web'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suscriptores_colorin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div className="flex items-center gap-4">
                <Link to="/admin" className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 transition-all">
                    <ArrowLeft className="w-5 h-5"/>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Suscriptores</h1>
                    <p className="text-gray-500 text-sm">Gestiona tu lista de correos capturados</p>
                </div>
            </div>
            <div className="flex gap-3">
                 <div className="hidden md:flex flex-col items-end mr-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-black text-rose-600">{subscribers.length}</span>
                 </div>
                <Button onClick={downloadCSV} disabled={subscribers.length === 0}>
                    <Download className="w-5 h-5 mr-2" /> Exportar CSV
                </Button>
            </div>
        </div>

        {loading ? (
           <div className="space-y-4">
               {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>)}
           </div>
        ) : (
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {subscribers.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Users className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Aún no hay suscriptores</h3>
                        <p className="text-gray-500 mt-2">Los correos capturados en el pop-up de regalo aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Origen</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-rose-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-gray-900">{sub.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(sub.created_at).toLocaleDateString('es-ES', { 
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                                {sub.origen || 'Web'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => copyToClipboard(sub.email, sub.id)}
                                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-rose-600 transition-all border border-transparent hover:border-gray-200"
                                                title="Copiar Email"
                                            >
                                                {copiedId === sub.id ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
           </div>
        )}
      </div>
    </div>
  );
};

export default Subscribers;
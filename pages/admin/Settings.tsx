
import React, { useEffect, useState } from 'react';
import { supabase, BUCKET_NAME } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { Save, Upload, FileText, CheckCircle, ArrowLeft, Instagram, Facebook, Youtube, Twitter, Globe } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { SocialLink } from '../../types';

const { Link } = ReactRouterDOM;

// Helper for icons
const getIcon = (platform: string) => {
    switch(platform) {
        case 'instagram': return <Instagram className="w-5 h-5" />;
        case 'facebook': return <Facebook className="w-5 h-5" />;
        case 'youtube': return <Youtube className="w-5 h-5" />;
        case 'twitter': return <Twitter className="w-5 h-5" />;
        case 'tiktok': return <span className="font-bold text-sm">TT</span>;
        default: return <Globe className="w-5 h-5" />;
    }
};

const Settings = () => {
  const [leadMagnetUrl, setLeadMagnetUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Social State
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const [configRes, socialRes] = await Promise.all([
        supabase.from('app_config').select('*').eq('key', 'lead_magnet_url').single(),
        supabase.from('social_links').select('*').order('platform')
    ]);

    if (configRes.data) {
      setLeadMagnetUrl(configRes.data.value);
    }
    if (socialRes.data) {
        setSocialLinks(socialRes.data);
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    setSaving(true);
    try {
      let finalUrl = leadMagnetUrl;

      if (file) {
        const fileName = `settings/lead-magnet-${Date.now()}.pdf`;
        const { error: upErr } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, { upsert: true });
        if (upErr) throw upErr;
        
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        finalUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from('app_config')
        .upsert({ key: 'lead_magnet_url', value: finalUrl });

      if (error) throw error;
      
      setLeadMagnetUrl(finalUrl);
      showSuccess();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSocialSave = async (link: SocialLink) => {
      try {
          const { error } = await supabase.from('social_links').update({
              url: link.url,
              active: link.active
          }).eq('id', link.id);
          
          if(error) throw error;
          showSuccess();
      } catch (err) {
          console.error(err);
      }
  };

  const updateLocalLink = (id: string, field: keyof SocialLink, value: any) => {
      setSocialLinks(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const showSuccess = () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
             <Link to="/admin" className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-rose-600 transition-all"><ArrowLeft className="w-5 h-5"/></Link>
             <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        </div>

        <div className="space-y-8">
            {/* Social Media Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Redes Sociales (Footer)</h2>
                <p className="text-gray-500 mb-6">Activa las redes que quieres mostrar en el pie de página y añade tus enlaces.</p>
                
                <div className="space-y-4">
                    {socialLinks.map(link => (
                        <div key={link.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                            <div className={`p-3 rounded-full ${link.active ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'}`}>
                                {getIcon(link.platform)}
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">{link.platform}</label>
                                <input 
                                    type="text" 
                                    placeholder={`https://${link.platform}.com/tu-usuario`}
                                    className="w-full text-sm font-medium text-gray-800 outline-none bg-transparent placeholder-gray-300"
                                    value={link.url || ''}
                                    onChange={e => updateLocalLink(link.id, 'url', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-4 border-l pl-4 border-gray-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-10 h-6 rounded-full transition-colors relative ${link.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${link.active ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={link.active} onChange={e => {
                                        const newVal = e.target.checked;
                                        updateLocalLink(link.id, 'active', newVal);
                                        handleSocialSave({...link, active: newVal}); // Auto save toggle
                                    }} />
                                </label>
                                <Button 
                                    onClick={() => handleSocialSave(link)} 
                                    className="!py-2 !px-4 text-xs" 
                                    disabled={!link.url && link.active}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    ))}
                    {socialLinks.length === 0 && !loading && <p className="text-gray-400 text-sm">No se encontraron configuraciones de redes. Ejecuta el SQL de inicialización.</p>}
                </div>
            </div>

            {/* Lead Magnet Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Lead Magnet (Regalo Gratis)</h2>
                <p className="text-gray-500 mb-6">Sube el archivo PDF que se enviará automáticamente a los usuarios que dejen su correo en el pop-up.</p>

                <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8"/>
                            </div>
                            <input 
                                type="file" 
                                accept=".pdf,.zip" 
                                className="hidden" 
                                id="leadFile"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="leadFile" className="cursor-pointer">
                                <span className="bg-white border border-gray-300 px-4 py-2 rounded-lg font-bold text-sm text-gray-700 hover:border-rose-500 hover:text-rose-600 transition-colors">
                                    Seleccionar Archivo
                                </span>
                            </label>
                            {file && <p className="mt-4 text-sm font-bold text-gray-800">{file.name}</p>}
                        </div>
                    </div>

                    {leadMagnetUrl && (
                        <div className="bg-green-50 p-4 rounded-xl flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-green-800">Archivo actual configurado:</p>
                                <a href={leadMagnetUrl} target="_blank" className="text-xs text-green-600 underline truncate block">{leadMagnetUrl}</a>
                            </div>
                        </div>
                    )}

                    <Button onClick={handleUpload} isLoading={saving} className="w-full">
                        <Save className="w-4 h-4 mr-2" /> Guardar Archivo
                    </Button>
                </div>
            </div>
        </div>
        
        {success && (
            <div className="fixed bottom-10 right-10 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce flex items-center gap-2">
                <CheckCircle className="w-5 h-5"/> ¡Guardado con éxito!
            </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

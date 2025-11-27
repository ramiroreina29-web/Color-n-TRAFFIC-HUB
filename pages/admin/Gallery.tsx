
import React, { useEffect, useState } from 'react';
import { supabase, BUCKET_NAME } from '../../services/supabase';
import { ShowcaseItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, X, Upload, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

const Gallery = () => {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ShowcaseItem>>({
      titulo: '', autor_nombre: '', activo: true, orden: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase.from('showcase_gallery').select('*').order('created_at', { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta imagen de la galería?')) {
      await supabase.from('showcase_gallery').delete().eq('id', id);
      fetchData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !formData.id) return alert('Selecciona una imagen');
    
    setUploading(true);
    try {
        let imageUrl = formData.imagen_url;

        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `showcase/${Math.random()}.${fileExt}`;
            const { error: upErr } = await supabase.storage.from(BUCKET_NAME).upload(fileName, imageFile);
            if (upErr) throw upErr;
            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        }

        const payload = { ...formData, imagen_url: imageUrl };
        
        const { error } = await supabase.from('showcase_gallery').insert(payload);
        if(error) throw error;
        
        setModalOpen(false);
        setImageFile(null);
        setFormData({ titulo: '', autor_nombre: '', activo: true, orden: 0 });
        fetchData();
    } catch (err: any) {
        alert(err.message);
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-10 gap-4">
            <div className="flex items-center gap-4">
                <Link to="/admin" className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-rose-600 transition-all"><ArrowLeft className="w-5 h-5"/></Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Muro de la Fama</h1>
                    <p className="text-gray-500 text-sm">Gestiona las fotos de clientes ("Coloreado por...")</p>
                </div>
            </div>
            <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-5 h-5 mr-2" /> Nueva Imagen
            </Button>
        </div>

        {loading ? (
             <div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="aspect-square relative">
                            <img src={item.imagen_url} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="font-bold text-sm text-gray-900 truncate">{item.titulo || 'Sin título'}</p>
                            <p className="text-xs text-gray-500">{item.autor_nombre || 'Anónimo'}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Upload Modal */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Subir Obra de Arte</h3>
                        <button onClick={() => setModalOpen(false)}><X className="w-5 h-5"/></button>
                    </div>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Imagen</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                                <input type="file" required accept="image/*" className="w-full" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Título (Opcional)</label>
                            <input type="text" className="w-full border rounded-lg p-2" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ej. Mandala Floral" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Autor (Opcional)</label>
                            <input type="text" className="w-full border rounded-lg p-2" value={formData.autor_nombre} onChange={e => setFormData({...formData, autor_nombre: e.target.value})} placeholder="Ej. Laura G." />
                        </div>
                        <Button type="submit" isLoading={uploading} className="w-full mt-4">Subir a Galería</Button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;

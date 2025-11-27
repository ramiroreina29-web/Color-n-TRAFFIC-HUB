
import React, { useEffect, useState } from 'react';
import { supabase, BUCKET_NAME } from '../../services/supabase';
import { Product, Category } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, X, Upload, Save, ArrowLeft, Image as ImageIcon, Loader2, FileText, Check, Star, Flame, Languages, Globe } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Tab State for Modal (ES/EN)
  const [modalLang, setModalLang] = useState<'es' | 'en'>('es');
  
  // Form State
  const initialFormState: Partial<Product> = {
    titulo: '', titulo_en: '', descripcion: '', descripcion_en: '', precio: 0, precio_anterior: 0, categoria: '', 
    payhip_link: '', video_url: '', portada_url: '', imagenes: [], demo_file_url: '', activo: true, destacado: false, is_ai_generated: false
  };
  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);
  
  // File Upload States
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Fetch Productos
    const { data: prods, error: prodError } = await supabase.from('productos').select('*').order('created_at', { ascending: false });
    
    // 2. FETCH CATEGORÍAS (Sincronización Crítica)
    // Traemos las categorías de la tabla 'categorias' para poblar el dropdown.
    const { data: cats, error: catError } = await supabase
        .from('categorias')
        .select('*')
        .eq('activo', true) // Solo mostrar categorías activas para nuevos productos
        .order('orden', { ascending: true });
    
    if (prodError) console.error("Error fetching products:", prodError);
    if (catError) console.error("Error fetching categories:", catError);
    
    if (prods) setProducts(prods);
    if (cats) setCategories(cats);
    setLoading(false);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setFormData(product);
    } else {
      setFormData(initialFormState);
    }
    setPortadaFile(null);
    setGalleryFiles(null);
    setDemoFile(null);
    setModalLang('es'); // Reset to Spanish
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await supabase.from('productos').delete().eq('id', id);
      fetchData();
    }
  };

  const toggleDestacado = async (product: Product) => {
    const newVal = !product.destacado;
    // Optimistic update
    setProducts(products.map(p => p.id === product.id ? {...p, destacado: newVal} : p));
    
    const { error } = await supabase.from('productos').update({ destacado: newVal }).eq('id', product.id);
    if (error) {
        console.error("Error updating destacado:", error);
        // Revert on error
        setProducts(products.map(p => p.id === product.id ? {...p, destacado: !newVal} : p));
        alert("Error al actualizar estado destacado. Verifica que la columna 'destacado' exista en Supabase.");
    }
  };

  // Upload Logic
  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploading(true);

    try {
      let finalPortadaUrl = formData.portada_url;
      let finalDemoUrl = formData.demo_file_url;
      let finalImagenes = formData.imagenes || [];

      // 1. Upload Cover Image
      if (portadaFile) {
        finalPortadaUrl = await uploadFile(portadaFile, 'productos/portadas');
      }

      // 2. Upload Demo File
      if (demoFile) {
        finalDemoUrl = await uploadFile(demoFile, 'productos/demos');
      }

      // 3. Upload Gallery Images
      if (galleryFiles && galleryFiles.length > 0) {
        const newUrls: string[] = [];
        for (let i = 0; i < galleryFiles.length; i++) {
          const url = await uploadFile(galleryFiles[i], 'productos/galeria');
          newUrls.push(url);
        }
        finalImagenes = [...finalImagenes, ...newUrls];
      }

      const payload = {
        titulo: formData.titulo,
        titulo_en: formData.titulo_en,
        descripcion: formData.descripcion,
        descripcion_en: formData.descripcion_en,
        precio: formData.precio,
        precio_anterior: formData.precio_anterior || null,
        categoria: formData.categoria,
        payhip_link: formData.payhip_link,
        video_url: formData.video_url,
        activo: formData.activo,
        destacado: formData.destacado,
        portada_url: finalPortadaUrl,
        demo_file_url: finalDemoUrl,
        imagenes: finalImagenes,
        is_ai_generated: formData.is_ai_generated,
        updated_at: new Date().toISOString(),
      };

      let error;
      
      // Attempt Save
      if (formData.id) {
        const res = await supabase.from('productos').update(payload).eq('id', formData.id);
        error = res.error;
      } else {
        const res = await supabase.from('productos').insert({ ...payload, created_at: new Date().toISOString() });
        error = res.error;
      }

      if (error) throw error;

      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Error al guardar: ${error.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Helper to remove an image from the existing array (visual only until saved, but here we just update state)
  const removeGalleryImage = (indexToRemove: number) => {
      const currentImages = formData.imagenes || [];
      const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
      setFormData({ ...formData, imagenes: newImages });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div className="flex items-center gap-4">
                <Link to="/admin" className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 transition-all"><ArrowLeft className="w-5 h-5"/></Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
                    <p className="text-gray-500 text-sm">Gestiona tu catálogo completo</p>
                </div>
            </div>
            <Button onClick={() => handleOpenModal()}>
                <Plus className="w-5 h-5 mr-2" /> Nuevo Producto
            </Button>
        </div>

        {/* Loading State */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>)}
            </div>
        ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(prod => (
                <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-56 bg-gray-50">
                        <img src={prod.portada_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        <span className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold shadow-sm ${prod.activo ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {prod.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                        
                        {/* Destacado Toggle on Card */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleDestacado(prod); }}
                            className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all ${prod.destacado ? 'bg-yellow-400 text-white hover:bg-yellow-500' : 'bg-white/90 text-gray-400 hover:text-yellow-400'}`}
                            title="Destacar en Home (Hero)"
                        >
                            <Star className={`w-4 h-4 ${prod.destacado ? 'fill-current' : ''}`} />
                        </button>

                        {/* Discount Badge */}
                         {prod.precio_anterior && prod.precio_anterior > prod.precio && (
                             <span className="absolute top-3 right-20 bg-rose-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
                                <Flame className="w-3 h-3 fill-current"/> OFERTA
                             </span>
                        )}
                    </div>
                    <div className="p-5">
                        <div className="mb-3">
                             <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">{prod.categoria}</span>
                             <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{prod.titulo}</h3>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                            <div className="flex flex-col">
                                {prod.precio_anterior && prod.precio_anterior > prod.precio && (
                                    <span className="text-xs text-gray-400 line-through">${prod.precio_anterior}</span>
                                )}
                                <span className={`font-bold text-xl ${prod.precio_anterior && prod.precio_anterior > prod.precio ? 'text-rose-600' : 'text-gray-900'}`}>${prod.precio}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(prod)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Edit2 className="w-4 h-4"/>
                                </button>
                                <button onClick={() => handleDelete(prod.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        )}

        {/* Modal */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                {/* FORCE TEXT DARK: Added text-gray-900 to ensure contrast in light modal within dark mode apps */}
                <div className="bg-white text-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{formData.id ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
                            <p className="text-sm text-gray-500">Rellena los detalles para publicar.</p>
                        </div>
                        <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500"/></button>
                    </div>
                    
                    <form onSubmit={handleSave} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Left Column: Basic Info */}
                            <div className="space-y-6">
                                
                                {/* Language Toggle Tabs */}
                                <div>
                                    <label className="label-text mb-2">Idioma de Edición</label>
                                    <div className="flex border-b border-gray-200">
                                        <button 
                                            type="button"
                                            onClick={() => setModalLang('es')} 
                                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                                                modalLang === 'es' 
                                                ? 'border-rose-500 text-rose-600 bg-rose-50/50' 
                                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            🇪🇸 Español
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setModalLang('en')} 
                                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                                                modalLang === 'en' 
                                                ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            🇺🇸 Inglés
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Fields based on Modal Language */}
                                {modalLang === 'es' ? (
                                    <div className="animate-fade-in bg-rose-50/30 p-4 rounded-xl border border-rose-100">
                                        <div className="mb-4">
                                            <label className="label-text text-rose-900">Título Principal (Español) <span className="text-red-500">*</span></label>
                                            <input type="text" required className="input-field border-rose-200 focus:border-rose-500 focus:ring-rose-500" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ej. Libro de Mandalas Vol. 1" />
                                        </div>
                                        <div>
                                            <label className="label-text mb-1.5 flex items-center gap-2 text-rose-900">
                                                Descripción (Español)
                                            </label>
                                            <textarea 
                                                required 
                                                className="input-field min-h-[150px] leading-relaxed border-rose-200 focus:border-rose-500 focus:ring-rose-500" 
                                                value={formData.descripcion} 
                                                onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                                                placeholder="Describe tu producto en español..." 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-fade-in bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                                        <div className="mb-4">
                                            <label className="label-text flex items-center gap-2 text-blue-900">
                                                Título Traducción (Inglés)
                                                <Languages className="w-4 h-4 text-blue-400"/>
                                            </label>
                                            <input type="text" className="input-field border-blue-200 focus:border-blue-500 focus:ring-blue-500" value={formData.titulo_en || ''} onChange={e => setFormData({...formData, titulo_en: e.target.value})} placeholder="Ex. Mandala Book Vol. 1" />
                                            <p className="text-xs text-gray-400 mt-1">Si lo dejas vacío, se mostrará el título en español.</p>
                                        </div>
                                        <div>
                                            <label className="label-text mb-1.5 flex items-center gap-2 text-blue-900">
                                                Descripción (Inglés)
                                                <Globe className="w-3 h-3 text-blue-400"/>
                                            </label>
                                            <textarea 
                                                className="input-field min-h-[150px] leading-relaxed border-blue-200 focus:border-blue-500 focus:ring-blue-500" 
                                                value={formData.descripcion_en || ''} 
                                                onChange={e => setFormData({...formData, descripcion_en: e.target.value})} 
                                                placeholder="Describe your product in English..." 
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-text">Precio Actual ($)</label>
                                        <input type="number" step="0.01" required className="input-field font-mono" value={formData.precio} onChange={e => setFormData({...formData, precio: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="label-text flex items-center gap-1">
                                            Precio Anterior ($)
                                            <span className="bg-rose-100 text-rose-600 text-[10px] px-1.5 py-0.5 rounded font-black">?</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            className="input-field font-mono text-gray-500 border-dashed" 
                                            value={formData.precio_anterior || ''} 
                                            onChange={e => setFormData({...formData, precio_anterior: Number(e.target.value)})}
                                            placeholder="Opcional" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label-text flex items-center gap-2">
                                        Categoría
                                        {categories.length === 0 && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">Sin categorías</span>}
                                    </label>
                                    <select 
                                        className="input-field cursor-pointer" 
                                        required 
                                        value={formData.categoria} 
                                        onChange={e => setFormData({...formData, categoria: e.target.value})}
                                    >
                                        <option value="">Seleccionar categoría...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.nombre}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {categories.length === 0 && (
                                        <Link to="/admin/categories" className="text-xs text-rose-600 font-bold mt-1 hover:underline flex items-center gap-1">
                                            <Plus className="w-3 h-3"/> Crear Categoría primero
                                        </Link>
                                    )}
                                </div>

                                <div>
                                    <label className="label-text">Link de Payhip (Conversión)</label>
                                    <input type="url" required className="input-field text-blue-600" value={formData.payhip_link} onChange={e => setFormData({...formData, payhip_link: e.target.value})} placeholder="https://payhip.com/..." />
                                </div>
                            </div>

                            {/* Right Column: Media */}
                            <div className="space-y-6">
                                {/* Cover Image */}
                                <div>
                                    <label className="label-text">Portada Principal</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative group">
                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => {
                                            if (e.target.files?.[0]) setPortadaFile(e.target.files[0]);
                                        }} />
                                        
                                        {(portadaFile || formData.portada_url) ? (
                                            <div className="relative aspect-[3/4] w-32 mx-auto rounded-lg overflow-hidden shadow-md">
                                                <img 
                                                    src={portadaFile ? URL.createObjectURL(portadaFile) : formData.portada_url} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Preview" 
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-xs font-bold">Cambiar</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-8">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                                                    <Upload className="w-6 h-6"/>
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">Arrastra o click para subir</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Gallery Images Input - Explicitly Included */}
                                <div>
                                    <label className="label-text">Galería / Imágenes Extra</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative group">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={e => setGalleryFiles(e.target.files)}
                                        />
                                        <div className="py-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                                                <ImageIcon className="w-5 h-5"/>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {galleryFiles && galleryFiles.length > 0
                                                    ? `${galleryFiles.length} archivos nuevos seleccionados`
                                                    : "Subir imágenes de referencia"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Gallery Preview */}
                                    {formData.imagenes && formData.imagenes.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-gray-500 mb-2">Imágenes actuales:</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {formData.imagenes.map((img, idx) => (
                                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200 relative group">
                                                        <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeGalleryImage(idx)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-4">
                                    {/* Activo Checkbox */}
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-12 h-7 rounded-full transition-colors relative ${formData.activo ? 'bg-green-500' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.activo ? 'translate-x-5' : ''}`}></div>
                                        </div>
                                        <input type="checkbox" className="hidden" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />
                                        <span className="font-medium text-gray-700 group-hover:text-gray-900">Producto Activo</span>
                                    </label>

                                    {/* Destacado Checkbox */}
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-12 h-7 rounded-full transition-colors relative ${formData.destacado ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.destacado ? 'translate-x-5' : ''}`}></div>
                                        </div>
                                        <input type="checkbox" className="hidden" checked={formData.destacado} onChange={e => setFormData({...formData, destacado: e.target.checked})} />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-700 group-hover:text-gray-900 flex items-center gap-2">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500"/> Destacar en Banner
                                            </span>
                                            <span className="text-xs text-gray-400">Aparecerá en el Hero principal</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" isLoading={saving || uploading} className="min-w-[150px]">
                                <Save className="w-4 h-4 mr-2" /> Guardar Producto
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <style>{`
            .label-text {
                @apply block text-sm font-bold text-gray-900 mb-2;
            }
            .input-field {
                @apply w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all;
            }
            .btn-secondary {
                @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors;
            }
        `}</style>
      </div>
    </div>
  );
};

export default Products;

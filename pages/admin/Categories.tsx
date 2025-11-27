
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Category } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, X, Save, ArrowLeft, Layers, ArrowUp, ArrowDown, Tag, Palette, Check, Languages } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Tab State for Modal (ES/EN)
  const [modalLang, setModalLang] = useState<'es' | 'en'>('es');
  
  const initialFormState: Partial<Category> = {
    nombre: '',
    nombre_en: '',
    orden: 0,
    activo: true,
    color: 'bg-rose-600',
    icono: 'Tag'
  };
  
  const [formData, setFormData] = useState<Partial<Category>>(initialFormState);

  // Colores predefinidos para la UI (Sincronizado con Tailwind classes)
  const colorOptions = [
    { name: 'Rosa', class: 'bg-rose-600' },
    { name: 'Azul', class: 'bg-blue-600' },
    { name: 'Verde', class: 'bg-emerald-600' },
    { name: 'Morado', class: 'bg-purple-600' },
    { name: 'Naranja', class: 'bg-orange-500' },
    { name: 'Negro', class: 'bg-gray-900' },
    { name: 'Cian', class: 'bg-cyan-500' },
    { name: 'Amarillo', class: 'bg-yellow-500' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    // Traemos las categorías ordenadas por el campo 'orden'
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('orden', { ascending: true });
    
    if (error) {
        console.error("Error loading categories:", error);
    } else {
        setCategories(data || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (category?: Category) => {
    setModalLang('es'); // Reset to Spanish default
    if (category) {
      setFormData(category);
    } else {
      // Auto-calcular el siguiente número de orden
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.orden)) : 0;
      setFormData({ ...initialFormState, orden: maxOrder + 1 });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('⚠️ ¿Estás seguro? \n\nSi borras esta categoría, los productos asignados a ella dejarán de aparecer en los filtros hasta que los reasignes a otra categoría.')) {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) {
          alert('Error al eliminar: ' + error.message);
      } else {
          fetchCategories();
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.nombre) return alert("El nombre es obligatorio");
    setSaving(true);

    try {
      const payload = {
        nombre: formData.nombre,
        nombre_en: formData.nombre_en, // Save English name
        orden: formData.orden,
        activo: formData.activo,
        color: formData.color,
        icono: formData.icono
      };

      let error;
      if (formData.id) {
        // Update
        const res = await supabase.from('categorias').update(payload).eq('id', formData.id);
        error = res.error;
      } else {
        // Create
        const res = await supabase.from('categorias').insert(payload);
        error = res.error;
      }

      if (error) throw error;

      setModalOpen(false);
      fetchCategories(); // Recargar lista para ver cambios
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === categories.length - 1) return;

      const itemA = categories[index];
      const itemB = categories[direction === 'up' ? index - 1 : index + 1];

      // 1. Optimistic Update (Visual inmediata)
      const newCats = [...categories];
      newCats[index] = { ...itemA, orden: itemB.orden };
      newCats[direction === 'up' ? index - 1 : index + 1] = { ...itemB, orden: itemA.orden };
      // Reordenar array basado en nuevo orden
      newCats.sort((a,b) => a.orden - b.orden);
      setCategories(newCats);

      // 2. DB Update (Background)
      await supabase.from('categorias').update({ orden: itemB.orden }).eq('id', itemA.id);
      await supabase.from('categorias').update({ orden: itemA.orden }).eq('id', itemB.id);
      
      // 3. Refresh final para asegurar consistencia
      fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-10 gap-4">
            <div className="flex items-center gap-4">
                <Link to="/admin" className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 transition-all">
                    <ArrowLeft className="w-5 h-5"/>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
                    <p className="text-gray-500 text-sm">Estas categorías aparecerán en los filtros y al crear productos.</p>
                </div>
            </div>
            <Button onClick={() => handleOpenModal()}>
                <Plus className="w-5 h-5 mr-2" /> Nueva Categoría
            </Button>
        </div>

        {loading ? (
           <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>)}
           </div>
        ) : (
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-24 text-center">Orden</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Color Etiqueta</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {categories.map((cat, idx) => (
                                <tr key={cat.id} className="hover:bg-rose-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg py-1">
                                            {idx > 0 && (
                                                <button onClick={() => moveOrder(idx, 'up')} className="text-gray-400 hover:text-rose-600 p-1"><ArrowUp className="w-3 h-3"/></button>
                                            )}
                                            <span className="font-mono font-bold text-gray-600 w-4 text-center">{cat.orden}</span>
                                            {idx < categories.length - 1 && (
                                                <button onClick={() => moveOrder(idx, 'down')} className="text-gray-400 hover:text-rose-600 p-1"><ArrowDown className="w-3 h-3"/></button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {/* Preview del Badge */}
                                            <div className="flex flex-col">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm w-fit ${cat.color || 'bg-gray-400'}`}>
                                                    {cat.nombre}
                                                </span>
                                                {cat.nombre_en && (
                                                    <span className="text-xs text-gray-400 mt-1 ml-1 flex items-center gap-1">
                                                        <Languages className="w-3 h-3"/> {cat.nombre_en}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`w-6 h-6 rounded-full mx-auto border-2 border-white shadow-sm ${cat.color}`}></div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cat.activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {cat.activo ? 'VISIBLE' : 'OCULTO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(cat)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                                <Edit2 className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
           </div>
        )}

        {/* Modal */}
        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-scale-in">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900">{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                        <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                    </div>
                    
                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        {/* Language Tabs */}
                        <div className="flex border-b border-gray-100 mb-4">
                            <button 
                                type="button"
                                onClick={() => setModalLang('es')}
                                className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors ${modalLang === 'es' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-400'}`}
                            >
                                Español
                            </button>
                            <button 
                                type="button"
                                onClick={() => setModalLang('en')}
                                className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors ${modalLang === 'en' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400'}`}
                            >
                                Inglés
                            </button>
                        </div>

                        {modalLang === 'es' ? (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Nombre (Español) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 outline-none" 
                                        placeholder="Ej. Mandalas"
                                        value={formData.nombre}
                                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    Nombre (Inglés) <Languages className="w-4 h-4 text-blue-500"/>
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/20" 
                                        placeholder="Ex. Mandalas"
                                        value={formData.nombre_en || ''}
                                        onChange={e => setFormData({...formData, nombre_en: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Palette className="w-4 h-4"/> Color de Etiqueta</label>
                            <div className="grid grid-cols-4 gap-3">
                                {colorOptions.map((col) => (
                                    <button
                                        key={col.name}
                                        type="button"
                                        onClick={() => setFormData({...formData, color: col.class})}
                                        className={`h-10 rounded-lg border-2 flex items-center justify-center transition-all ${col.class} ${formData.color === col.class ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        title={col.name}
                                    >
                                        {formData.color === col.class && <Check className="w-4 h-4 text-white font-bold" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-12 h-7 rounded-full transition-colors relative ${formData.activo ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.activo ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <input type="checkbox" className="hidden" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />
                                <span className="font-bold text-gray-700 text-sm">Categoría Visible</span>
                            </label>
                        </div>

                        <Button type="submit" isLoading={saving} className="w-full">
                            <Save className="w-4 h-4 mr-2" /> Guardar Categoría
                        </Button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

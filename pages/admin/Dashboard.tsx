import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { DashboardStats, DailyMetric, Product } from '../../types';
import { Eye, MousePointerClick, TrendingUp, Package, LogOut, LayoutDashboard, ChevronRight, Image as ImageIcon, Settings, Menu, X, RefreshCw, Users, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayVisits: 0, todayClicks: 0, conversionRate: 0, activeProducts: 0
  });
  const [chartData, setChartData] = useState<DailyMetric[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData(false); // Initial load (show loading spinner)
    const interval = setInterval(() => fetchData(true), 30000); // 30s auto-refresh (silent)
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoadingData(true);
    
    try {
        // --- 1. Calculate Date Ranges ---
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // UTC Date String YYYY-MM-DD
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

        // --- 2. Fetch ALL Raw Metrics (Last 30 Days) ---
        const { data: rawMetrics, error: metricsError } = await supabase
            .from('metricas_visitas')
            .select('producto_id, fecha, visitas, clics_payhip')
            .gte('fecha', thirtyDaysStr);

        // CRITICAL FIX: If fetch fails, DO NOT reset stats to zero. Keep previous state.
        if (metricsError) {
            console.error("Error fetching metrics (keeping old data):", metricsError);
            if (!isBackground) setLoadingData(false);
            return; 
        }

        const safeMetrics = rawMetrics || [];

        // --- 3. Process "Today's" Stats ---
        const todayMetrics = safeMetrics.filter(m => {
            const rowDate = typeof m.fecha === 'string' ? m.fecha.split('T')[0] : '';
            return rowDate === todayStr;
        });

        const tVisits = todayMetrics.reduce((acc, curr) => acc + (curr.visitas || 0), 0);
        const tClicks = todayMetrics.reduce((acc, curr) => acc + (curr.clics_payhip || 0), 0);

        // --- 4. Count Active Products ---
        const { count, error: countError } = await supabase
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true);
        
        if (countError) console.warn("Error counting products:", countError);

        // --- 5. Process Chart Data (Last 7 Days) ---
        const historyMap = new Map<string, {fecha: string, visitas: number, clics_payhip: number}>();
        
        // Initialize last 7 days with 0
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            historyMap.set(dStr, { fecha: dStr, visitas: 0, clics_payhip: 0 });
        }

        // Fill with real data
        safeMetrics.forEach(m => {
            const dStr = typeof m.fecha === 'string' ? m.fecha.split('T')[0] : '';
            if (historyMap.has(dStr)) {
                const entry = historyMap.get(dStr)!;
                entry.visitas += (m.visitas || 0);
                entry.clics_payhip += (m.clics_payhip || 0);
            }
        });
        
        const history = Array.from(historyMap.values()).sort((a,b) => a.fecha.localeCompare(b.fecha));

        // --- 6. Process Top Products (Aggregate all 30 days) ---
        const productStatsMap: Record<string, {v: number, c: number}> = {};
        safeMetrics.forEach(m => {
             if (!productStatsMap[m.producto_id]) productStatsMap[m.producto_id] = {v:0, c:0};
             productStatsMap[m.producto_id].v += (m.visitas || 0);
             productStatsMap[m.producto_id].c += (m.clics_payhip || 0);
        });

        // Fetch actual product details
        const { data: allProducts } = await supabase
            .from('productos')
            .select('id, titulo, portada_url, categoria, activo')
            .eq('activo', true);
        
        let prodsData: Product[] = [];
        if (allProducts) {
             prodsData = allProducts.map(p => ({
                 ...p,
                 visitas: productStatsMap[p.id]?.v || 0,
                 clics_payhip: productStatsMap[p.id]?.c || 0,
                 // Defaults for TS
                 descripcion: '', precio: 0, imagenes: [], payhip_link: '', created_at: '', updated_at: ''
             } as Product))
             .sort((a, b) => (b.visitas || 0) - (a.visitas || 0))
             .slice(0, 10);
        }

        // Only update state if we successfully processed everything
        setStats({
            todayVisits: tVisits,
            todayClicks: tClicks,
            conversionRate: tVisits > 0 ? (tClicks / tVisits) * 100 : 0,
            activeProducts: count || stats.activeProducts // Fallback to old count if new is null
        });
        setChartData(history);
        setTopProducts(prodsData);

    } catch (err) {
        console.error("Dashboard fetch unexpected error:", err);
    } finally {
        if (!isBackground) setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const SidebarContent = () => (
      <>
        <div className="p-8 border-b border-gray-800">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-red-500 tracking-tight">Colorín</h1>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-6 space-y-3">
            <NavItem to="/admin" icon={<LayoutDashboard/>} label="Dashboard" active={location.pathname === '/admin'} onClick={() => setMobileMenuOpen(false)} />
            <NavItem to="/admin/products" icon={<Package/>} label="Productos" active={location.pathname === '/admin/products'} onClick={() => setMobileMenuOpen(false)} />
            <NavItem to="/admin/categories" icon={<Layers/>} label="Categorías" active={location.pathname === '/admin/categories'} onClick={() => setMobileMenuOpen(false)} />
            <NavItem to="/admin/gallery" icon={<ImageIcon/>} label="Galería Muro" active={location.pathname === '/admin/gallery'} onClick={() => setMobileMenuOpen(false)} />
            <NavItem to="/admin/subscribers" icon={<Users/>} label="Suscriptores" active={location.pathname === '/admin/subscribers'} onClick={() => setMobileMenuOpen(false)} />
            <NavItem to="/admin/settings" icon={<Settings/>} label="Configuración" active={location.pathname === '/admin/settings'} onClick={() => setMobileMenuOpen(false)} />
        </nav>
        <div className="p-6 border-t border-gray-800">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 w-full hover:bg-red-900/20 rounded-xl transition-all font-medium">
                <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
        </div>
      </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-gray-900 text-white hidden md:flex flex-col fixed h-full z-20 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="w-72 bg-gray-900 text-white flex flex-col h-full shadow-2xl animate-slide-right relative z-50">
                   <div className="absolute top-4 right-4">
                       <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                   </div>
                   <SidebarContent />
              </div>
              <div className="flex-1 bg-black/50 backdrop-blur-sm absolute inset-0 z-40" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 md:p-10 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-bold text-lg text-gray-900">Dashboard</span>
            </div>
            <button onClick={handleLogout}><LogOut className="w-5 h-5 text-gray-500"/></button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Resumen General</h1>
                <p className="text-gray-500 mt-1">Métricas en tiempo real de tu tienda.</p>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => fetchData(false)} 
                    className={`p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 transition-all ${loadingData ? 'animate-spin' : ''}`}
                    title="Refrescar datos manualmente"
                >
                    <RefreshCw className="w-5 h-5"/>
                </button>
                <div className="hidden md:block text-sm text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-200">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
                title="Visitas Hoy" 
                value={stats.todayVisits} 
                icon={<Eye className="w-6 h-6 text-white"/>} 
                color="bg-gradient-to-br from-blue-500 to-blue-600" 
            />
            <StatCard 
                title="Clics Payhip" 
                value={stats.todayClicks} 
                icon={<MousePointerClick className="w-6 h-6 text-white"/>} 
                color="bg-gradient-to-br from-emerald-500 to-green-600" 
            />
            <StatCard 
                title="Conversión" 
                value={`${stats.conversionRate.toFixed(1)}%`} 
                icon={<TrendingUp className="w-6 h-6 text-white"/>} 
                color="bg-gradient-to-br from-violet-500 to-purple-600" 
            />
            <StatCard 
                title="Prod. Activos" 
                value={stats.activeProducts} 
                icon={<Package className="w-6 h-6 text-white"/>} 
                color="bg-gradient-to-br from-orange-400 to-red-500" 
            />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Tendencia de Visitas</h3>
                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">Últimos 7 días</span>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="fecha" tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} dy={10} tickFormatter={(val) => val.slice(5)} />
                            <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Line type="monotone" dataKey="visitas" stroke="#0ea5e9" strokeWidth={4} dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Rendimiento Clics</h3>
                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">Últimos 7 días</span>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="fecha" tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} dy={10} tickFormatter={(val) => val.slice(5)} />
                            <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="clics_payhip" fill="url(#colorClicks)" radius={[6, 6, 0, 0]} barSize={40} />
                            <defs>
                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.6}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Interés por Producto</h3>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold">Últimos 30 días</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-8 py-4">Producto</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4 text-center">
                                <span className="flex items-center justify-center gap-1">
                                    <Eye className="w-3 h-3"/> Visitas
                                </span>
                            </th>
                            <th className="px-6 py-4 text-center">
                                <span className="flex items-center justify-center gap-1">
                                    <MousePointerClick className="w-3 h-3"/> Clics
                                </span>
                            </th>
                            <th className="px-6 py-4 text-center">Conv. %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {topProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-8 py-5 flex items-center gap-4">
                                    <img src={prod.portada_url} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shadow-sm" alt="" />
                                    <span className="font-bold text-gray-800 line-clamp-1 text-base">{prod.titulo}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">{prod.categoria}</span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{prod.visitas || 0}</span>
                                </td>
                                <td className="px-6 py-5 text-center font-medium text-emerald-600">{prod.clics_payhip || 0}</td>
                                <td className="px-6 py-5 text-center font-bold text-purple-600">
                                    {prod.visitas ? ((prod.clics_payhip || 0) / prod.visitas * 100).toFixed(1) : '0.0'}%
                                </td>
                            </tr>
                        ))}
                        {topProducts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">
                                    {loadingData ? 'Cargando datos...' : 'No hay datos suficientes aún.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <div className={`relative overflow-hidden rounded-3xl p-6 ${color} shadow-lg text-white group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">{icon}</div>
                <div className="text-right">
                     <p className="text-white/80 font-medium text-sm uppercase tracking-wide">{title}</p>
                </div>
            </div>
            <h3 className="text-4xl font-black tracking-tight">{value}</h3>
        </div>
        <div className="absolute -bottom-6 -right-6 text-white/10 transform rotate-12 scale-[2.5] blur-sm">
            {icon}
        </div>
    </div>
);

const NavItem = ({ to, icon, label, active, onClick }: { to: string, icon: React.ReactNode, label: string, active: boolean, onClick?: () => void }) => (
    <Link to={to} onClick={onClick} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${active ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
        <div className={`${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>{icon}</div>
        <span className="font-medium">{label}</span>
        {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50"/>}
    </Link>
);

export default Dashboard;
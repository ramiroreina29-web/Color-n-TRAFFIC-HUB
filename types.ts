export interface Product {
  id: string;
  titulo: string;
  titulo_en?: string; // New: English Title
  descripcion: string;
  descripcion_en?: string; // New: English Description
  precio: number;
  precio_anterior?: number;
  categoria: string;
  portada_url: string;
  imagenes: string[];
  video_url?: string;
  payhip_link: string;
  demo_file_url?: string; 
  is_ai_generated?: boolean;
  activo: boolean;
  destacado?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Stats
  visitas?: number;
  clics_payhip?: number;
  // Ratings
  average_rating?: number;
  reviews_count?: number;
}

export interface Category {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  orden: number;
  activo: boolean;
}

export interface Carousel {
  id: string;
  titulo: string;
  imagen_url: string;
  producto_id: string;
  orden: number;
  activo: boolean;
}

export interface ShowcaseItem {
  id: string;
  titulo?: string;
  autor_nombre?: string;
  imagen_url: string;
  orden: number;
  activo: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface DailyMetric {
  fecha: string;
  visitas: number;
  clics_payhip: number;
}

export interface VisitMetric {
  id: string;
  producto_id: string;
  fecha: string;
  visitas: number;
  clics_payhip: number;
}

export interface DashboardStats {
  todayVisits: number;
  todayClicks: number;
  conversionRate: number;
  activeProducts: number;
}

export interface AppConfig {
  key: string;
  value: string;
}

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter';
  url: string;
  active: boolean;
}
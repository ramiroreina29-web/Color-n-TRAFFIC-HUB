import { useEffect, useRef } from 'react';
import { supabase } from './supabase';

/**
 * Hook to track a product visit.
 * Uses a remote procedure call (RPC) to atomically increment counters.
 */
export const useProductTracking = (productId: string | undefined) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (!productId || tracked.current) return;

    const trackVisit = async () => {
      const today = new Date().toISOString().split('T')[0];
      const sessionKey = `visited_${productId}_${today}`;

      // Prevent double counting in the same session
      if (sessionStorage.getItem(sessionKey)) {
        return; 
      }

      try {
        const device = getDeviceType();
        const pais = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0] || 'Unknown';

        // Call the RPC function defined in SQL
        const { error } = await supabase.rpc('incrementar_visita', { 
            p_id: productId, 
            device, 
            country: pais 
        });

        if (error) {
            // Log a cleaner message if RPC fails (likely not defined yet)
            console.warn('Tracking RPC unavailable, using fallback. Error:', error.message);
            // Fallback if RPC fails (e.g. function not created yet)
            fallbackTrackVisit(productId, today, device, pais);
        } else {
            sessionStorage.setItem(sessionKey, 'true');
            tracked.current = true;
        }

      } catch (err) {
        console.error("Tracking error:", err);
      }
    };

    trackVisit();
  }, [productId]);
};

// Fallback logic in case RPC is missing
const fallbackTrackVisit = async (productId: string, today: string, device: string, pais: string) => {
    try {
        const { data: existing } = await supabase
            .from('metricas_visitas')
            .select('id, visitas')
            .eq('producto_id', productId)
            .eq('fecha', today)
            .single();

        if (existing) {
            await supabase
                .from('metricas_visitas')
                .update({ visitas: existing.visitas + 1 })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('metricas_visitas')
                .insert({
                    producto_id: productId,
                    fecha: today,
                    visitas: 1,
                    clics_payhip: 0,
                    dispositivo: device,
                    pais: pais
                });
        }
    } catch (e) {
        // Silently fail on fallback to avoid console spam
    }
};

export const trackPayhipClick = async (productId: string) => {
  try {
     // Use RPC for atomic increment
     const { error } = await supabase.rpc('incrementar_clic', { p_id: productId });
     
     if (error) {
         console.warn("Click tracking RPC unavailable, using fallback.");
         // Fallback manual update
         const today = new Date().toISOString().split('T')[0];
         const { data: existing } = await supabase
            .from('metricas_visitas')
            .select('id, clics_payhip')
            .eq('producto_id', productId)
            .eq('fecha', today)
            .single();

         if (existing) {
            await supabase
                .from('metricas_visitas')
                .update({ clics_payhip: existing.clics_payhip + 1 })
                .eq('id', existing.id);
         }
     }
  } catch (err) {
    console.error("Click tracking error:", err);
  }
};

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};
import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, url, type, keywords }) => {
  const { language } = useTheme();

  useEffect(() => {
    // 1. Base Variables
    const siteName = "Colorín Hub";
    const finalTitle = title ? `${title} | ${siteName}` : `${siteName} | Premium Coloring Books`;
    const defaultDesc = language === 'es' 
        ? "Descarga libros para colorear premium en PDF y vectores. Diseños exclusivos de mandalas, animales y arte terapia para imprimir."
        : "Download premium coloring books in PDF and vector formats. Exclusive mandala, animal, and art therapy designs to print instantly.";
    
    const finalDesc = description || defaultDesc;
    const defaultImage = "https://img.freepik.com/free-vector/mandala-intricate-patterns-black-white_23-2148098520.jpg";
    const finalImage = image || defaultImage;
    const currentUrl = url || window.location.href;
    const finalType = type || 'website';
    const finalKeywords = keywords || (language === 'es' 
        ? "libros colorear, pdf colorear, mandalas imprimir, arte terapia digital"
        : "coloring books, printable coloring pages, digital art therapy, mandala pdf");

    const locale = language === 'es' ? 'es_ES' : 'en_US';

    // 2. Update Document Title
    document.title = finalTitle;

    // 3. Helper to update meta tags efficiently
    const setMeta = (selector: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}="${selector}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, selector);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 4. Helper to update Link tags (Canonical)
    const setLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // --- EXECUTE UPDATES ---

    // Standard Meta
    setMeta('description', finalDesc);
    setMeta('keywords', finalKeywords);
    setMeta('author', 'Colorín Hub Team');

    // Open Graph (Facebook/LinkedIn/WhatsApp)
    setMeta('og:site_name', siteName, 'property');
    setMeta('og:title', finalTitle, 'property');
    setMeta('og:description', finalDesc, 'property');
    setMeta('og:image', finalImage, 'property');
    setMeta('og:url', currentUrl, 'property');
    setMeta('og:type', finalType, 'property');
    setMeta('og:locale', locale, 'property');

    // Twitter Cards
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', finalTitle);
    setMeta('twitter:description', finalDesc);
    setMeta('twitter:image', finalImage);

    // Canonical URL (Critical for SEO to avoid duplicate content)
    setLink('canonical', currentUrl);

    // Cleanup function? 
    // Usually not strictly necessary for SPAs unless we want to remove tags on unmount, 
    // but overwriting them on the next page load is standard practice for client-side routing.

  }, [title, description, image, url, type, keywords, language]);

  return null;
};
import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, url, type, keywords }) => {
  useEffect(() => {
    // 1. Update Document Title
    const siteName = "Colorín Hub";
    const finalTitle = title ? `${title} | ${siteName}` : `${siteName} | Premium Coloring Books`;
    document.title = finalTitle;

    // 2. Helper to update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      let element = isProperty 
        ? document.querySelector(`meta[property="${name}"]`) 
        : document.querySelector(`meta[name="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Defaults
    const defaultDesc = "Descarga libros para colorear premium en PDF y vectores. Diseños exclusivos de mandalas, animales y arte terapia para imprimir y colorear al instante.";
    const defaultImage = "https://img.freepik.com/free-vector/mandala-intricate-patterns-black-white_23-2148098520.jpg";
    const defaultUrl = window.location.href;
    const defaultKeywords = "libros colorear, pdf colorear, mandalas imprimir, arte terapia digital, coloring books, printable coloring pages";

    // 4. Update Meta Tags
    updateMeta('description', description || defaultDesc);
    updateMeta('keywords', keywords || defaultKeywords);
    
    // Open Graph
    updateMeta('og:title', finalTitle, true);
    updateMeta('og:description', description || defaultDesc, true);
    updateMeta('og:image', image || defaultImage, true);
    updateMeta('og:url', url || defaultUrl, true);
    updateMeta('og:type', type || 'website', true);

    // Twitter
    updateMeta('twitter:title', finalTitle);
    updateMeta('twitter:description', description || defaultDesc);
    updateMeta('twitter:image', image || defaultImage);
    updateMeta('twitter:card', 'summary_large_image');

  }, [title, description, image, url, type, keywords]);

  return null;
};
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Mail, Lock, Flame, Twitter, Youtube, Globe, Music2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { SocialLink } from '../types';
import { useTheme } from '../contexts/ThemeContext';

export const Footer = () => {
  const navigate = useNavigate();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const { t } = useTheme();

  useEffect(() => {
    const fetchSocials = async () => {
        const { data } = await supabase.from('social_links').select('*').eq('active', true);
        if (data) setSocialLinks(data);
    };
    fetchSocials();
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getIcon = (platform: string) => {
      switch(platform) {
          case 'instagram': return <Instagram className="w-5 h-5"/>;
          case 'facebook': return <Facebook className="w-5 h-5"/>;
          case 'youtube': return <Youtube className="w-5 h-5"/>;
          case 'twitter': return <Twitter className="w-5 h-5"/>;
          case 'tiktok': return <Music2 className="w-5 h-5"/>; 
          default: return <Globe className="w-5 h-5"/>;
      }
  };

  const getBgColor = (platform: string) => {
      switch(platform) {
          case 'instagram': return 'hover:bg-pink-600';
          case 'facebook': return 'hover:bg-blue-600';
          case 'youtube': return 'hover:bg-red-600';
          case 'twitter': return 'hover:bg-sky-500';
          case 'tiktok': return 'hover:bg-black';
          default: return 'hover:bg-rose-500';
      }
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-white pt-20 pb-10 rounded-t-[3rem] mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-2">
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-red-500 mb-6">Colorín Hub</h2>
                <p className="text-gray-400 max-w-md text-lg leading-relaxed mb-8">
                    {t('footer_desc')}
                </p>
                <div className="flex gap-4 flex-wrap">
                    {socialLinks.map(link => (
                        <a 
                            key={link.id}
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-900 flex items-center justify-center transition-colors ${getBgColor(link.platform)}`}
                            title={link.platform}
                        >
                            {getIcon(link.platform)}
                        </a>
                    ))}
                    {socialLinks.length === 0 && (
                        <span className="text-gray-600 text-sm italic">...</span>
                    )}
                </div>
            </div>
            
            <div>
                <h4 className="font-bold text-lg mb-6 text-white">{t('explore')}</h4>
                <ul className="space-y-4 text-gray-400">
                    <li>
                        <Link to="/catalog" onClick={handleScrollToTop} className="hover:text-rose-400 transition-colors flex items-center gap-2">
                            {t('nav_catalog')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/catalog?filter=new" onClick={handleScrollToTop} className="hover:text-rose-400 transition-colors flex items-center gap-2">
                            {t('filter_new')}
                        </Link>
                    </li>
                    <li>
                        <Link to="/catalog?filter=offers" onClick={handleScrollToTop} className="hover:text-rose-400 transition-colors font-bold flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500"/> {t('filter_offers')}
                        </Link>
                    </li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-lg mb-6 text-white">{t('legal')}</h4>
                <ul className="space-y-4 text-gray-400">
                    <li><Link to="/privacy-policy" onClick={handleScrollToTop} className="hover:text-white transition-colors">{t('legal_privacy')}</Link></li>
                    <li><Link to="/cookies-policy" onClick={handleScrollToTop} className="hover:text-white transition-colors">{t('legal_cookies')}</Link></li>
                    <li><Link to="/terms" onClick={handleScrollToTop} className="hover:text-white transition-colors">{t('legal_terms')}</Link></li>
                </ul>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Colorín Hub. {t('rights_reserved')}</p>
            <div className="flex gap-6 mt-4 md:mt-0 items-center">
                <Link to="/login" className="text-gray-600 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-gray-800/50" aria-label="Acceso Admin">
                    <Lock className="w-4 h-4" />
                </Link>
            </div>
        </div>
      </footer>
  );
};
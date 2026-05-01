import React, { useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, ArrowRight, Sun, Moon, Zap, TrendingUp, Palette, Umbrella, Newspaper, Globe, Loader2, RefreshCw } from 'lucide-react';
import { fetchFashionNews } from '../services/geminiService';
import { FashionNewsItem } from '../types';

interface HomeViewProps {
  onCameraClick: () => void;
  onGalleryClick: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onCameraClick, onGalleryClick }) => {
  const [greeting, setGreeting] = useState('');
  const [dateStr, setDateStr] = useState('');
  
  // News State
  const [news, setNews] = useState<FashionNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setGreeting('İyi Geceler');
    else if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('Tünaydın');
    else setGreeting('İyi Akşamlar');

    const date = new Date();
    setDateStr(date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }));

    loadNews();
  }, []);

  const loadNews = async (forceRefresh = false) => {
    // Cache Logic: Check localStorage first
    // Updated key to force refresh for Turkish content
    const CACHE_KEY = 'stilai_news_cache_tr_v1';
    const CACHE_TIME_KEY = 'stilai_news_time_tr_v1';
    
    if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        
        if (cached && cachedTime) {
            const now = Date.now();
            const fourHours = 4 * 60 * 60 * 1000;
            // Return cached if less than 4 hours old
            if (now - parseInt(cachedTime) < fourHours) {
                setNews(JSON.parse(cached));
                return;
            }
        }
    }

    setLoadingNews(true);
    try {
        const items = await fetchFashionNews();
        if (items && items.length > 0) {
            setNews(items);
            localStorage.setItem(CACHE_KEY, JSON.stringify(items));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }
    } catch (e) {
        console.error("News load failed", e);
    } finally {
        setLoadingNews(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
      switch(cat) {
          case 'Trend': return <TrendingUp className="w-4 h-4 text-purple-600" />;
          case 'Celebrity': return <StarIcon />;
          case 'Tip': return <Zap className="w-4 h-4 text-yellow-600" />;
          default: return <Newspaper className="w-4 h-4 text-blue-600" />;
      }
  };

  const StarIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  );

  return (
    <div className="px-5 pt-4 pb-24 animate-fade-in space-y-8">
      
      {/* 1. Header Section: Personalized & Date */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{dateStr}</p>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center">
            {greeting}, <span className="text-purple-600 ml-2">Stilist</span>
            {greeting === 'İyi Akşamlar' ? <Moon className="w-6 h-6 ml-2 text-indigo-400 fill-current opacity-50" /> : <Sun className="w-6 h-6 ml-2 text-orange-400 fill-current opacity-50" />}
          </h2>
        </div>
      </div>

      {/* 2. Hero Section: Glassmorphism Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 shadow-xl shadow-purple-200/50">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-3xl opacity-30 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600 rounded-full blur-3xl opacity-30 -ml-10 -mb-10"></div>
        
        <div className="relative z-10 p-8 text-white">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3 mr-1 text-yellow-300" /> AI Destekli Analiz
            </div>
            <h3 className="text-2xl font-bold leading-tight mb-2">
              Bugün ne giyeceğine<br/>karar veremedin mi?
            </h3>
            <p className="text-purple-200 text-sm mb-6 max-w-[80%] leading-relaxed">
              Dolabındaki parçayı yükle, sana en uygun kombini saniyeler içinde oluşturalım.
            </p>
            <button 
                onClick={onCameraClick}
                className="group flex items-center bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition shadow-lg shadow-white/10"
            >
                Analize Başla
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>

      {/* 3. Main Action Grid */}
      <div>
         <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Hızlı İşlemler</h3>
            <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">Yeni</span>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            {/* Camera Card */}
            <button 
              onClick={onCameraClick}
              className="group relative h-48 rounded-[2rem] bg-gradient-to-b from-purple-500 to-indigo-600 p-1 shadow-lg shadow-indigo-200 transition-transform active:scale-95 text-left"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-[2rem] transition-opacity"></div>
              <div className="h-full w-full bg-white/10 backdrop-blur-[2px] rounded-[1.8rem] p-5 flex flex-col justify-between border border-white/20">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Camera className="w-5 h-5 text-indigo-600" />
                 </div>
                 <div>
                    <h4 className="text-white font-bold text-lg mb-1">Fotoğraf<br/>Çek</h4>
                    <p className="text-indigo-100 text-[10px] opacity-80">Anlık Analiz</p>
                 </div>
              </div>
            </button>

            {/* Gallery Card */}
            <button 
              onClick={onGalleryClick}
              className="group relative h-48 rounded-[2rem] bg-white border border-gray-100 p-5 shadow-lg shadow-gray-100 transition-transform active:scale-95 text-left flex flex-col justify-between overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
               </div>
               <div className="relative z-10">
                  <h4 className="text-gray-800 font-bold text-lg mb-1">Galeriden<br/>Seç</h4>
                  <p className="text-gray-400 text-[10px]">Kayıtlı Fotoğraflar</p>
               </div>
            </button>
         </div>
      </div>

      {/* 4. Fashion News & Trends Section (Dynamic) */}
      <div>
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-800" />
                <h3 className="font-bold text-gray-800 text-lg">Moda Gündemi</h3>
            </div>
            <button 
                onClick={() => loadNews(true)}
                disabled={loadingNews}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loadingNews ? 'animate-spin' : ''}`} />
            </button>
         </div>

         {loadingNews && news.length === 0 ? (
             <div className="flex space-x-4 overflow-hidden">
                 {[1,2].map(i => (
                     <div key={i} className="flex-shrink-0 w-64 h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
                 ))}
             </div>
         ) : (
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
                {news.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 w-72 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${item.category === 'Trend' ? 'bg-purple-500' : item.category === 'Tip' ? 'bg-yellow-500' : 'bg-pink-500'}`}></div>
                        
                        <div className="flex items-center justify-between mb-3 pl-2">
                            <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded-full ${item.category === 'Trend' ? 'bg-purple-50' : item.category === 'Tip' ? 'bg-yellow-50' : 'bg-pink-50'}`}>
                                    {getCategoryIcon(item.category)}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.category}</span>
                            </div>
                            {item.source && <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{item.source}</span>}
                        </div>
                        
                        <div className="pl-2">
                            <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-tight">{item.title}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{item.summary}</p>
                        </div>
                    </div>
                ))}
            </div>
         )}
      </div>

    </div>
  );
};

export default HomeView;

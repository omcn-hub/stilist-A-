import React, { useEffect, useState, useRef } from 'react';
import { Settings, Heart, ChevronRight, Calendar, Trash2, ArrowLeft, Bell, Shield, HelpCircle, Moon, Globe, LogOut, Award, Filter, UserCircle, Check, Camera, Edit2 } from 'lucide-react';
import { StoredItem, UserPreferences, UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile | null;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onUpdateUser }) => {
  const [history, setHistory] = useState<StoredItem[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'settings'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Preference States
  const [preferences, setPreferences] = useState<UserPreferences>({
    bodyType: 'Belirtilmemiş',
    styleGoal: 'Belirtilmemiş',
    gender: 'Kadın'
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = [
      { id: 'all', label: 'Tümü' },
      { id: 'fav', label: 'Favoriler' },
      { id: 'Üst Giyim', label: 'Üst Giyim' },
      { id: 'Alt Giyim', label: 'Alt Giyim' },
      { id: 'Elbise', label: 'Elbise' },
      { id: 'Dış Giyim', label: 'Dış Giyim' },
      { id: 'Ayakkabı', label: 'Ayakkabı' }
  ];

  useEffect(() => {
    loadHistory();
    loadPreferences();
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem('stilai_wardrobe');
    if (stored) {
      try {
        setHistory(JSON.parse(stored).reverse()); // Show newest first
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  };

  const loadPreferences = () => {
    const stored = localStorage.getItem('stilai_user_prefs');
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (e) {}
    }
  };

  const savePreferences = () => {
    localStorage.setItem('stilai_user_prefs', JSON.stringify(preferences));
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleClearData = () => {
    if(confirm("Tüm gardırop geçmişiniz ve kayıtlı analizleriniz silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?")) {
      localStorage.removeItem('stilai_wardrobe');
      setHistory([]);
      alert("Tüm veriler başarıyla temizlendi.");
    }
  }

  const toggleFavorite = (id: string) => {
    const updatedHistory = history.map(item => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });

    // Save reversed back to storage (since history is displayed reversed)
    const storageOrder = [...updatedHistory].reverse();
    localStorage.setItem('stilai_wardrobe', JSON.stringify(storageOrder));
    setHistory(updatedHistory);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            
            // Note: Since we are using Firebase Auth, updating the avatar here 
            // only updates the local state for now. To persist this to Firebase Auth, 
            // we would need to upload the image to Firebase Storage and then call updateProfile().
            // For this demo, we keep the local simulation behavior for image display.
            const updatedUser = { ...user, avatar: base64 };
            onUpdateUser(updatedUser);
        };
        reader.readAsDataURL(file);
    }
  };

  const averageScore = history.length > 0 
    ? (history.reduce((acc, curr) => acc + curr.analysis.stil_puani, 0) / history.length).toFixed(1) 
    : "0.0";

  const favoritesCount = history.filter(h => h.isFavorite).length;

  // Complex Filtering Logic
  const getFilteredItems = () => {
      if (viewMode === 'favorites') return history.filter(i => i.isFavorite);
      
      let items = history;
      if (categoryFilter === 'fav') {
          items = items.filter(i => i.isFavorite);
      } else if (categoryFilter !== 'all') {
          items = items.filter(i => i.analysis.kategori === categoryFilter);
      }
      return items;
  }

  const displayedItems = getFilteredItems();

  return (
    <div className="px-5 pt-2 animate-fade-in pb-20">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Main Profile Header (Only show in main view) */}
      {viewMode === 'all' && (
        <>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center space-x-4">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl">😎</span>
                            )}
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                        <Edit2 className="w-3 h-3" />
                    </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{user?.name || user?.email || "Misafir Kullanıcı"}</h2>
                  <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
                  <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      {averageScore}
                    </span>
                    <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {preferences.styleGoal !== 'Belirtilmemiş' ? preferences.styleGoal : 'Stil Belirlenmedi'}
                    </span>
                  </div>
                </div>
            </div>

            {/* Direct Logout Button */}
            <button
                onClick={onLogout}
                className="p-2.5 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-100 shadow-sm transition-colors"
                title="Çıkış Yap"
            >
                <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-gray-800">{history.length}</span>
                <span className="text-xs text-gray-500 mt-1">Gardırop</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-pink-500">{favoritesCount}</span>
                <span className="text-xs text-gray-500 mt-1">Favori Parça</span>
            </div>
          </div>
        </>
      )}

      {/* Header for Sub Views (Favorites or Settings) */}
      {viewMode !== 'all' && (
         <div className="flex items-center mb-6">
            <button 
              onClick={() => setViewMode('all')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
            >
               <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 ml-2">
              {viewMode === 'favorites' ? 'Favorilerim' : 'Ayarlar'}
            </h2>
         </div>
      )}

      {/* Main List & Menu (viewMode === 'all') */}
      {viewMode === 'all' && (
        <>
            {/* Menu Links (Compact) */}
            <div className="flex space-x-3 mb-6">
                 <button 
                    onClick={() => setViewMode('settings')}
                    className="flex-1 flex items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition"
                >
                     <Settings className="w-4 h-4 text-gray-500 mr-2" />
                     <span className="text-sm font-medium text-gray-700">Ayarlar</span>
                </button>
            </div>

            {/* Filter Scroll View */}
            <div className="mb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${categoryFilter === cat.id ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-gray-600 border border-gray-200'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtered Items List */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                     <h3 className="font-bold text-gray-800">
                         {categoryFilter === 'all' ? 'Tüm Parçalar' : CATEGORIES.find(c => c.id === categoryFilter)?.label}
                     </h3>
                     <span className="text-xs text-gray-400">{displayedItems.length} adet</span>
                </div>
                
                {displayedItems.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200 mt-4">
                    <span className="text-2xl mb-2 block">🧥</span>
                    <p className="text-gray-500 text-sm">
                        {categoryFilter !== 'all' ? 'Bu kategoride parça bulunamadı.' : 'Henüz bir kıyafet analizi yapmadınız.'}
                    </p>
                </div>
                ) : (
                <div className="space-y-3">
                    {displayedItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-3 relative">
                        <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                           <img src={item.image} className="w-full h-full object-cover" alt="Kıyafet" />
                           {item.analysis.renk_kodu && (
                               <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.analysis.renk_kodu }}></div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                            <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-800 text-sm truncate pr-2">{item.analysis.parca_analizi.split(',')[0]}</h4>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.analysis.stil_puani >= 7 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {item.analysis.stil_puani}
                            </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                                {item.analysis.kategori && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.analysis.kategori}</span>}
                                {item.analysis.mevsim && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.analysis.mevsim}</span>}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{item.analysis.kombin_onerisi}</p>
                            <div className="flex items-center mt-2 text-[10px] text-gray-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(item.date).toLocaleDateString('tr-TR')}
                            </div>
                        </div>
                        <button 
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute bottom-3 right-3 text-gray-300 hover:text-pink-500 transition"
                        >
                        <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                        </button>
                    </div>
                    ))}
                </div>
                )}
            </div>
        </>
      )}

      {/* Favorites List View (Legacy/Direct Access) */}
      {viewMode === 'favorites' && (
        <div className="mb-6">
             {/* Same list code could be componentized, keeping simple for now */}
             <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200 mt-4">
                 <p className="text-gray-500 text-sm">Favorilerim bölümü</p>
            </div>
        </div>
      )}

      {/* Settings View */}
      {viewMode === 'settings' && (
        <div className="space-y-5">
           
           {/* Section: Kişiselleştirme */}
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
               <div className="flex items-center mb-3">
                  <UserCircle className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stil & Vücut Profili</h3>
               </div>
               
               <div className="space-y-4">
                   <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Cinsiyet</label>
                       <select 
                        value={preferences.gender}
                        onChange={(e) => setPreferences({...preferences, gender: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500"
                       >
                           <option value="Kadın">Kadın</option>
                           <option value="Erkek">Erkek</option>
                           <option value="Unisex">Unisex</option>
                       </select>
                   </div>
                   
                   <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Vücut Tipi</label>
                       <select 
                        value={preferences.bodyType}
                        onChange={(e) => setPreferences({...preferences, bodyType: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500"
                       >
                           <option value="Belirtilmemiş">Bilmiyorum / Farketmez</option>
                           <option value="Kum Saati">Kum Saati (Dengeli omuz/basen, ince bel)</option>
                           <option value="Armut">Armut (Geniş basen, dar omuz)</option>
                           <option value="Elma">Elma (Geniş bel/gövde, ince bacaklar)</option>
                           <option value="Dikdörtgen">Dikdörtgen (Düz hatlar)</option>
                           <option value="Ters Üçgen">Ters Üçgen (Geniş omuz, dar basen)</option>
                       </select>
                   </div>

                   <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Stil Hedefi</label>
                       <select 
                        value={preferences.styleGoal}
                        onChange={(e) => setPreferences({...preferences, styleGoal: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-purple-500 focus:border-purple-500"
                       >
                           <option value="Belirtilmemiş">Karışık / Günlük</option>
                           <option value="Minimalist">Minimalist (Sade, az renk)</option>
                           <option value="Klasik">Klasik / Business</option>
                           <option value="Sokak Modası">Sokak Modası (Streetwear)</option>
                           <option value="Bohem">Bohem / Vintage</option>
                           <option value="Tesettür">Tesettür Giyim</option>
                           <option value="Sportif">Sportif</option>
                       </select>
                   </div>

                   <button 
                    onClick={savePreferences}
                    className={`w-full py-2 rounded-lg font-medium text-sm transition flex items-center justify-center ${showSaveSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                   >
                       {showSaveSuccess ? <><Check className="w-4 h-4 mr-1"/> Kaydedildi</> : 'Tercihleri Kaydet'}
                   </button>
               </div>
           </div>
           
           {/* Section: Veri ve Gizlilik */}
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Hesap Ayarları</h3>
              
              <button onClick={handleClearData} className="w-full flex items-center justify-between py-2 text-left hover:bg-red-50 rounded-lg transition -mx-2 px-2 group mb-1">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <span className="text-red-600 font-medium text-sm">Geçmişi Temizle</span>
                  </div>
              </button>
              
              {/* Secondary Logout (Keep in settings as well) */}
              <button onClick={onLogout} className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded-lg transition -mx-2 px-2 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Çıkış Yap</span>
                  </div>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
import React, { useState, useEffect } from 'react';
import { Shirt, Sparkles, Wand2 } from 'lucide-react';
import { generateAppLogo } from '../services/geminiService';

const Header: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Check local storage for existing logo
    const savedLogo = localStorage.getItem('stilai_custom_logo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  const handleGenerateLogo = async () => {
    setIsGenerating(true);
    try {
      const generatedLogo = await generateAppLogo();
      if (generatedLogo) {
        setLogoUrl(generatedLogo);
        localStorage.setItem('stilai_custom_logo', generatedLogo);
      }
    } catch (error) {
      console.error("Failed to generate logo", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 group">
          <div className="relative">
            {logoUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-purple-100">
                <img src={logoUrl} alt="StilAI Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shirt className="w-6 h-6 text-purple-600" />
              </div>
            )}
            
            {/* Hidden magic button that appears on hover/focus to regenerate logo */}
            <button 
              onClick={handleGenerateLogo}
              disabled={isGenerating}
              className={`absolute -bottom-2 -right-2 bg-gradient-to-tr from-pink-500 to-purple-600 text-white p-1 rounded-full shadow-md transform scale-0 group-hover:scale-100 transition-transform ${isGenerating ? 'animate-spin' : ''}`}
              title="Logo Oluştur (AI)"
            >
              <Wand2 className="w-3 h-3" />
            </button>
          </div>

          <h1 className="text-xl font-bold text-gray-800 tracking-tight select-none">
            Stil<span className="text-purple-600">AI</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
            {!logoUrl && (
                <button 
                    onClick={handleGenerateLogo}
                    disabled={isGenerating}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-500 px-2 py-1 rounded-full transition flex items-center"
                >
                    {isGenerating ? 'Çiziliyor...' : 'Logo Yap'}
                </button>
            )}
            <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm border border-purple-100">
            <Sparkles className="w-3 h-3 mr-1" />
            Beta
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

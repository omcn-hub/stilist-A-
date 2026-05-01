import React, { useState, useRef, useEffect } from 'react';
import { FashionAnalysis, ChatMessage, StoredItem, WardrobeMatchResult } from '../types';
import { RotateCcw, Star, Calendar, ShoppingBag, Lightbulb, AlertCircle, X, Send, MessageCircle, Heart, Share2, CloudSun, Tag, Volume2, StopCircle, Palette, Hash, Check, Shirt, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { askStylist, findWardrobeMatch } from '../services/geminiService';

interface AnalysisDisplayProps {
  data: FashionAnalysis;
  onReset: () => void;
  imageSrc: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data, onReset, imageSrc, isFavorite, onToggleFavorite }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  
  // Wardrobe Matching State
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<WardrobeMatchResult | null>(null);
  const [matchedItemImage, setMatchedItemImage] = useState<string | null>(null);
  const [noWardrobeError, setNoWardrobeError] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [messages, chatOpen]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await askStylist(userMsg, data);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Üzgünüm, şu an cevap veremiyorum." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StilAI Analizi',
          text: `Bu parçayı StilAI ile analiz ettim!\n\n💡 İpucu: ${data.uzman_tuyosu}\n⭐ Puan: ${data.stil_puani}/10`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("Tarayıcınız paylaşım özelliğini desteklemiyor.");
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `İşte stil analizin. ${data.kombin_onerisi} Uzman tüyosu: ${data.uzman_tuyosu}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    });
  };

  const handleWardrobeMatch = async () => {
    setMatchingLoading(true);
    setMatchResult(null);
    setNoWardrobeError(false);

    try {
        // Get wardrobe from local storage
        const stored = localStorage.getItem('stilai_wardrobe');
        if (!stored) {
            setNoWardrobeError(true);
            setMatchingLoading(false);
            return;
        }

        const wardrobe: StoredItem[] = JSON.parse(stored);
        // Filter out the current item if it was just saved
        const otherItems = wardrobe.filter(i => i.analysis.parca_analizi !== data.parca_analizi);
        
        if (otherItems.length === 0) {
            setNoWardrobeError(true);
            setMatchingLoading(false);
            return;
        }

        const result = await findWardrobeMatch(data, otherItems);
        if (result) {
            setMatchResult(result);
            const matchedItem = otherItems.find(i => i.id === result.matchedItemId);
            if (matchedItem) {
                setMatchedItemImage(matchedItem.image);
            }
        }
    } catch (e) {
        console.error("Matching error", e);
    } finally {
        setMatchingLoading(false);
    }
  };

  if (data.hata) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl max-w-md mx-auto mt-4 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Ops! Bir Sorun Var</h3>
        <p className="text-gray-600 mb-6">{data.hata}</p>
        <button
          onClick={onReset}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition shadow-lg"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 animate-fade-in-up relative bg-gray-50 min-h-screen">
      
      {/* Header Controls Overlay */}
      <div className="fixed top-20 right-4 z-20 md:absolute md:top-4 md:right-4 flex space-x-2">
           <button 
            onClick={handleSpeak}
            className={`p-2 rounded-full backdrop-blur-sm transition ${isSpeaking ? 'bg-purple-600 text-white' : 'bg-black/50 hover:bg-black/70 text-white'}`}
          >
              {isSpeaking ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
          </button>
           <button 
            onClick={handleShare}
            className="p-2 rounded-full backdrop-blur-sm bg-black/50 hover:bg-black/70 text-white transition"
          >
              <Share2 className="w-5 h-5" />
          </button>
           <button 
            onClick={onToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition ${isFavorite ? 'bg-pink-500/80 text-white' : 'bg-black/50 hover:bg-black/70 text-white'}`}
          >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={onReset}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition"
          >
              <X className="w-5 h-5" />
          </button>
      </div>

      {/* Image Preview */}
      <div className="relative w-full h-80 bg-gray-100 mb-6 overflow-hidden md:rounded-b-2xl shadow-md">
        <img src={imageSrc} alt="Uploaded" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16">
          <div className="flex items-end justify-between">
            <div>
                 {data.kategori && (
                   <span className="text-white/90 text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 mb-2 inline-flex items-center">
                      <Tag className="w-3 h-3 mr-1" /> {data.kategori.toUpperCase()}
                   </span>
                 )}
                <h2 className="text-white font-bold text-lg drop-shadow-md">Stil Raporu</h2>
            </div>
             <div className="flex flex-col items-center bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Puan</span>
                <span className={`text-2xl font-bold ${data.stil_puani >= 8 ? 'text-green-600' : data.stil_puani >= 5 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {data.stil_puani}/10
                </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5 max-w-md mx-auto -mt-4 relative z-10 pb-10">
        
        {/* Style Tags */}
        {data.stil_etiketleri && data.stil_etiketleri.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {data.stil_etiketleri.map((tag, i) => (
              <span key={i} className="text-xs bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-200 shadow-sm flex items-center">
                <Hash className="w-3 h-3 mr-1 text-gray-400" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Quick Info & Main Color */}
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
             {data.mevsim && (
                <div className="flex items-center space-x-2">
                   <div className="p-2 bg-orange-50 rounded-full">
                     <CloudSun className="w-4 h-4 text-orange-400" />
                   </div>
                   <span className="text-sm font-medium text-gray-700">{data.mevsim}</span>
                </div>
             )}
             {data.renk_kodu && (
                <div className="flex items-center space-x-2 pl-4 border-l border-gray-100">
                   <span className="text-xs text-gray-400">Baskın Renk</span>
                   <button 
                     onClick={() => data.renk_kodu && handleCopyColor(data.renk_kodu)}
                     className="w-6 h-6 rounded-full border border-gray-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-200 transition" 
                     style={{ backgroundColor: data.renk_kodu }}
                   ></button>
                </div>
             )}
        </div>

        {/* WARDROBE MATCHER SECTION (NEW) */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 shadow-lg text-white">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                 <Shirt className="w-5 h-5 text-purple-300 mr-2" />
                 <h3 className="font-bold text-white text-sm">Gardırop Sinerjisi</h3>
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">BETA</span>
           </div>
           
           {!matchResult && !matchingLoading && (
               <>
                <p className="text-gray-300 text-xs mb-4">
                    Bu parçayı dolabındaki diğer kıyafetlerle eşleştirerek en iyi kombini bulalım mı?
                </p>
                <button 
                    onClick={handleWardrobeMatch}
                    className="w-full bg-white text-gray-900 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-100 transition flex items-center justify-center"
                >
                    <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                    Dolabımla Eşleştir
                </button>
                {noWardrobeError && (
                    <p className="text-red-300 text-xs mt-2 text-center">
                        Dolabında henüz yeterli parça yok. Biraz daha analiz yap!
                    </p>
                )}
               </>
           )}

           {matchingLoading && (
               <div className="flex flex-col items-center justify-center py-4">
                   <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                   <p className="text-xs text-gray-400 animate-pulse">Dolabın taranıyor...</p>
               </div>
           )}

           {matchResult && matchedItemImage && (
               <div className="animate-fade-in">
                   <div className="flex items-center justify-center space-x-2 mb-3">
                       <div className="w-14 h-14 rounded-lg bg-white/10 overflow-hidden border border-white/20">
                            <img src={imageSrc} className="w-full h-full object-cover opacity-80" />
                       </div>
                       <ArrowRight className="w-4 h-4 text-gray-500" />
                       <div className="w-16 h-16 rounded-lg bg-white overflow-hidden border-2 border-green-400 shadow-lg relative">
                            <img src={matchedItemImage} className="w-full h-full object-cover" />
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-1 rounded-bl">
                                %{matchResult.score}
                            </div>
                       </div>
                   </div>
                   <p className="text-sm font-medium text-white mb-1">Mükemmel Uyum Bulundu!</p>
                   <p className="text-xs text-gray-300 leading-relaxed">
                       {matchResult.reason}
                   </p>
               </div>
           )}
        </div>

        {/* Interactive Color Palette */}
        {data.renk_paleti && data.renk_paleti.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                   <Palette className="w-4 h-4 text-pink-500 mr-2" />
                   <h3 className="font-bold text-gray-800 text-sm">Uyumlu Renk Paleti</h3>
                </div>
                {copiedColor && (
                   <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center animate-fade-in">
                     <Check className="w-3 h-3 mr-1" /> Kopyalandı
                   </span>
                )}
             </div>
             <div className="flex justify-between items-center px-2">
                {data.renk_paleti.map((color, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleCopyColor(color)}
                    className="flex flex-col items-center group focus:outline-none"
                  >
                    <div 
                      className="w-10 h-10 rounded-full shadow-md border-2 border-white ring-1 ring-gray-100 mb-1 transition-transform group-hover:scale-110 active:scale-95" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-[10px] text-gray-400 font-mono uppercase group-hover:text-gray-600 transition-colors">{color}</span>
                  </button>
                ))}
             </div>
          </div>
        )}

        {/* Analysis Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center mb-3">
             <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
             </div>
             <h3 className="font-bold text-gray-800">Parça Analizi</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{data.parca_analizi}</p>
        </div>

        {/* Suggestion Card */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 shadow-sm border border-purple-100">
           <div className="flex items-center mb-3">
             <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Star className="w-5 h-5 text-purple-600" />
             </div>
             <h3 className="font-bold text-gray-800">Kombin Önerisi</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed font-medium">{data.kombin_onerisi}</p>
        </div>

        {/* Context & Accessories Grid */}
        <div className="grid grid-cols-1 gap-4">
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-orange-500 mr-2" />
                    <h4 className="font-semibold text-gray-700 text-sm">Ortam</h4>
                </div>
                <p className="text-gray-600 text-sm">{data.ortam}</p>
             </div>
             
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">👠</span>
                    <h4 className="font-semibold text-gray-700 text-sm">Aksesuar & Ayakkabı</h4>
                </div>
                <p className="text-gray-600 text-sm">{data.aksesuar_ayakkabi}</p>
             </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-gray-900 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="flex items-start">
                 <Lightbulb className="w-5 h-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                 <div>
                     <h4 className="font-bold text-sm uppercase tracking-wide text-gray-300 mb-1">Uzman Tüyosu</h4>
                     <p className="text-gray-200 text-sm italic">"{data.uzman_tuyosu}"</p>
                 </div>
            </div>
        </div>

        {/* Chat Section Accordion */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mb-6">
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition"
            >
              <div className="flex items-center space-x-2 text-purple-700 font-bold">
                 <MessageCircle className="w-5 h-5" />
                 <span>Stilistine Danış</span>
              </div>
              <span className="text-xs bg-white text-purple-600 px-2 py-1 rounded-full border border-purple-200">AI</span>
            </button>
            
            {chatOpen && (
              <div className="p-4 bg-gray-50 border-t border-purple-100">
                 {messages.length === 0 && (
                   <p className="text-center text-gray-400 text-sm mb-4">
                     Bu kombin hakkında aklına takılanları sorabilirsin.<br/>
                     Örnek: "Hangi renk çanta uyar?"
                   </p>
                 )}
                 
                 <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                   {messages.map((msg, idx) => (
                     <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-gray-800 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'}`}>
                         {msg.content}
                       </div>
                     </div>
                   ))}
                   {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none flex space-x-1 shadow-sm">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                   )}
                   <div ref={messagesEndRef} />
                 </div>

                 <div className="flex items-center space-x-2">
                   <input 
                     type="text" 
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                     placeholder="Bir soru sor..."
                     className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 text-sm"
                     disabled={isTyping}
                   />
                   <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition shadow-sm"
                   >
                     <Send className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            )}
        </div>

        {/* New Scan Button */}
        <button
            onClick={onReset}
            className="w-full bg-white border border-gray-200 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-50 transition shadow-sm flex items-center justify-center space-x-2 mb-4"
        >
            <RotateCcw className="w-4 h-4" />
            <span>Yeni Fotoğraf Çek</span>
        </button>

      </div>
    </div>
  );
};
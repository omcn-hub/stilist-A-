import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FashionAnalysis, StoredItem, UserPreferences, WardrobeMatchResult, FashionNewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the JSON response to ensure type safety from the model
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    parca_analizi: { type: Type.STRING, description: "Kıyafetin türü, rengi, deseni ve kumaş analizi." },
    kombin_onerisi: { type: Type.STRING, description: "Alt giyim, dış giyim önerileri." },
    ortam: { type: Type.STRING, description: "Bu kıyafetin uygun olduğu senaryolar." },
    aksesuar_ayakkabi: { type: Type.STRING, description: "Tamamlayıcı aksesuar ve ayakkabı önerileri." },
    stil_puani: { type: Type.INTEGER, description: "1 ile 10 arasında bir puan." },
    uzman_tuyosu: { type: Type.STRING, description: "Kısa bir stil ipucu." },
    kategori: { type: Type.STRING, description: "Kıyafet kategorisi: 'Üst Giyim', 'Alt Giyim', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar' veya 'Diğer'." },
    mevsim: { type: Type.STRING, description: "En uygun mevsim: 'Yaz', 'Kış', 'Bahar' veya 'Dört Mevsim'." },
    renk_kodu: { type: Type.STRING, description: "Kıyafetin baskın renginin yaklaşık HEX kodu (örn: #FF0000)." },
    renk_paleti: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "Bu kıyafetle kombinlenebilecek 4 adet uyumlu rengin HEX kodları." 
    },
    stil_etiketleri: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Bu tarzı tanımlayan 3-4 adet anahtar kelime (örn: Minimalist, Bohem, Casual, Vintage)."
    },
    hata: { type: Type.STRING, description: "Eğer görselde kıyafet yoksa hata mesajı.", nullable: true }
  },
  required: ["parca_analizi", "kombin_onerisi", "ortam", "aksesuar_ayakkabi", "stil_puani", "uzman_tuyosu", "kategori", "mevsim", "renk_paleti", "stil_etiketleri"],
};

const getStoredPreferences = (): string => {
  try {
    const prefs = localStorage.getItem('stilai_user_prefs');
    if (prefs) {
      const p: UserPreferences = JSON.parse(prefs);
      return `KULLANICI PROFİLİ (Buna Göre Yanıt Ver): Vücut Tipi: ${p.bodyType}, Stil Hedefi: ${p.styleGoal}, Cinsiyet: ${p.gender}.`;
    }
  } catch (e) {
    // ignore
  }
  return "";
};

export const analyzeClothingImage = async (base64Image: string, mimeType: string): Promise<FashionAnalysis> => {
  try {
    const model = "gemini-3-flash-preview";
    const userContext = getStoredPreferences();

    const prompt = `
    Sen profesyonel bir "AI Moda Danışmanı" ve "Görsel Stil Analiz Uzmanı"sın.
    ${userContext}
    
    Görevlerin:
    1. Görseli analiz et (tür, renk, desen, kumaş).
    2. Kullanıcının profiline (varsa) uygun Kombin önerisi yap.
    3. Kullanım alanını belirt.
    4. Kategori belirle.
    5. Mevsim belirle.
    6. Baskın rengin HEX kodunu tahmin et.
    7. Bu parça ile harika gidecek 4 adet "Tamamlayıcı Renk" (HEX kodu) öner.
    8. Tarzı tanımlayan etiketler (Keywords) oluştur.
    9. 1-10 arası puan ver.
    
    Mobil uyumlu, emoji içeren kısa yanıtlar ver.
    Eğer görselde bir kıyafet yoksa, "hata" alanını doldur.
    Yanıtı SADECE geçerli bir JSON objesi olarak ver.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "Sen Türk kültürüne ve modern moda trendlerine hakim, nazik ve yapıcı bir moda danışmanısın.",
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsedResponse = JSON.parse(text) as FashionAnalysis;
    return parsedResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const findWardrobeMatch = async (currentItem: FashionAnalysis, wardrobe: StoredItem[]): Promise<WardrobeMatchResult | null> => {
  if (wardrobe.length === 0) return null;

  try {
    const model = "gemini-3-flash-preview";
    
    // Prepare wardrobe summary efficiently
    const wardrobeList = wardrobe.map(item => 
      `ID: ${item.id}, Type: ${item.analysis.kategori}, Desc: ${item.analysis.parca_analizi}, Color: ${item.analysis.renk_kodu}`
    ).join('\n');

    const prompt = `
      Mevcut Parça: ${currentItem.parca_analizi} (Renk: ${currentItem.renk_kodu}, Kategori: ${currentItem.kategori})
      
      Aşağıdaki gardırop listesinden bu parçayla EN İYİ uyum sağlayacak TEK BİR parçayı seç:
      ${wardrobeList}

      Kurallar:
      1. Sadece listedeki ID'lerden birini seç.
      2. Renk ve stil uyumuna dikkat et.
      3. Neden seçtiğini 1 cümle ile açıkla.
      4. 1-100 arası uyum puanı ver.

      Yanıt Formatı (JSON):
      {
        "matchedItemId": "ID_HERE",
        "reason": "Neden...",
        "score": 95
      }
    `;
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text) as WardrobeMatchResult;
  } catch (e) {
    console.error("Wardrobe match error", e);
    return null;
  }
};

export const askStylist = async (
  question: string, 
  previousContext: FashionAnalysis
): Promise<string> => {
  try {
    const model = "gemini-3-flash-preview";
    const userContext = getStoredPreferences();
    
    const contextPrompt = `
      ${userContext}
      Önceki analiz verileri:
      - Parça: ${previousContext.parca_analizi}
      - Kategori: ${previousContext.kategori || 'Belirtilmemiş'}
      - Stil: ${previousContext.stil_etiketleri?.join(', ') || 'Belirtilmemiş'}
      - Mevcut Öneri: ${previousContext.kombin_onerisi}
      - Ortam: ${previousContext.ortam}
      
      Kullanıcı bu analiz üzerine şu soruyu soruyor: "${question}"
      
      Kısa, samimi ve uzman bir moda danışmanı gibi cevap ver. 2-3 cümleyi geçme. Emoji kullan.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: contextPrompt }]
      },
      config: {
        systemInstruction: "Sen kullanıcıyla sohbet eden bir stil danışmanısın. Yardımcı ve pozitif ol.",
      }
    });

    return response.text || "Şu an cevap veremiyorum, lütfen tekrar dene.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Bağlantıda bir sorun oluştu.";
  }
};

export const generateAppLogo = async (): Promise<string | null> => {
  try {
    const model = 'gemini-2.5-flash-image';
    const prompt = 'A minimalist, modern, vector art style app icon for a fashion stylist app named "StilAI". The logo should feature a sleek, abstract clothing hanger or a stylized letter "S" combined with a sparkle element. Color scheme: Shades of Purple, Indigo and White. Flat design, high quality, rounded corners.';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Logo Generation Error:", error);
    return null;
  }
};

export const fetchFashionNews = async (): Promise<FashionNewsItem[]> => {
  try {
    const model = "gemini-3-flash-preview";
    // Prompt is updated to strictly require Turkish content
    const prompt = `
      Bugün Türkiye'de veya dünyada öne çıkan en ilginç ve belirgin 3 moda haberini veya trendini bul.
      Konular şunlar olabilir: Yeni sezon renkleri, Ünlülerin sokak stili, TikTok/Instagram'da viral olan bir moda akımı veya şu anki hava durumu için pratik bir stil ipucu.
      
      ÖNEMLİ: Tüm başlıklar ve özetler kesinlikle TÜRKÇE olmalıdır. İngilizce kaynak kullansan bile çevirerek Türkçe sunmalısın.
      
      Çıktı JSON formatı:
      [
        {
          "title": "Başlık (Kısa, Çekici ve Türkçe)",
          "summary": "1 cümlelik açıklama (Türkçe).",
          "category": "Trend" | "Celebrity" | "News" | "Tip",
          "source": "Kaynak Adı (örn. Vogue, Elle)"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as FashionNewsItem[];
  } catch (error) {
    console.error("News Fetch Error:", error);
    // Fallback static data in case of API failure
    return [
      { title: "Mevsim Geçişi Başladı", summary: "Katmanlı giyim (layering) bu hafta hayat kurtarıcı olacak.", category: "Tip" },
      { title: "Kırmızı Alarmı", summary: "Bu sezonun en hit rengi 'Kiraz Kırmızısı' vitrinleri sardı.", category: "Trend" }
    ];
  }
};

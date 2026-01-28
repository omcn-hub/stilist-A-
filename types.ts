export interface FashionAnalysis {
  id?: string; // Unique ID for history
  date?: string; // Date for history
  parca_analizi: string;
  kombin_onerisi: string;
  ortam: string;
  aksesuar_ayakkabi: string;
  stil_puani: number; // 1-10
  uzman_tuyosu: string;
  // New Fields
  kategori?: string; // 'Üst Giyim', 'Alt Giyim', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar'
  mevsim?: string; // 'Yaz', 'Kış', 'Bahar', 'Sonbahar', 'Dört Mevsim'
  renk_kodu?: string; // Hex code example: #FF5733
  renk_paleti?: string[]; // Array of compatible hex codes
  stil_etiketleri?: string[]; // Array of style keywords (e.g. "Minimalist", "Vintage")
  hata?: string; 
}

export interface StoredItem {
  id: string;
  image: string;
  analysis: FashionAnalysis;
  date: string;
  isFavorite: boolean;
}

export interface ImageUploadProps {
  onImageSelect: (base64: string, mimeType: string) => void;
}

export interface AnalysisDisplayProps {
  data: FashionAnalysis;
  onReset: () => void;
  imageSrc: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserPreferences {
  bodyType: string;
  styleGoal: string;
  gender: string;
}

export interface WardrobeMatchResult {
  matchedItemId: string;
  reason: string;
  score: number;
}

export interface FashionNewsItem {
  title: string;
  summary: string;
  category: 'Trend' | 'Celebrity' | 'News' | 'Tip';
  source?: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar?: string | null; 
  joinDate?: string;
}
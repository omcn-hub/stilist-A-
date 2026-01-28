import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import BottomNavigation from './components/BottomNavigation';
import HomeView from './components/HomeView';
import ProfileView from './components/ProfileView';
import CameraView from './components/CameraView';
import AuthView from './components/AuthView';
import { analyzeClothingImage } from './services/geminiService';
import { FashionAnalysis, StoredItem, UserProfile } from './types';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FashionAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentIsFavorite, setCurrentIsFavorite] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Map Firebase user to app UserProfile
        const appUser: UserProfile = {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          joinDate: user.metadata.creationTime
        };
        setCurrentUser(appUser);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setActiveTab('home');
      setAnalysis(null);
      setImage(null);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
      // For a real app, you would update the Firebase profile here using updateProfile()
      // For UI responsiveness in this demo, we update local state
      setCurrentUser(updatedUser);
  };

  // Helper: Resize and Compress Image before sending to API
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024; // Limit width for performance
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Helper to save to local storage
  // NOTE: In a full production app, this should save to Firestore instead of LocalStorage
  const saveToWardrobe = (img: string, data: FashionAnalysis) => {
    try {
      const uniqueId = Date.now().toString();
      // Update the analysis object with the ID
      data.id = uniqueId;

      const newItem: StoredItem = {
        id: uniqueId,
        image: img,
        analysis: data,
        date: new Date().toISOString(),
        isFavorite: false
      };
      
      const existing = localStorage.getItem('stilai_wardrobe');
      const items: StoredItem[] = existing ? JSON.parse(existing) : [];
      
      // Limit to last 20 items to save space
      const updated = [...items, newItem].slice(-20);
      
      localStorage.setItem('stilai_wardrobe', JSON.stringify(updated));
    } catch (e) {
      console.error("Storage limit reached or error saving");
    }
  };

  const toggleCurrentFavorite = () => {
    if (!analysis || !analysis.id) return;

    try {
      const existing = localStorage.getItem('stilai_wardrobe');
      if (existing) {
        const items: StoredItem[] = JSON.parse(existing);
        const updatedItems = items.map(item => {
          if (item.analysis.id === analysis.id || item.id === analysis.id) {
            return { ...item, isFavorite: !item.isFavorite };
          }
          return item;
        });
        
        localStorage.setItem('stilai_wardrobe', JSON.stringify(updatedItems));
        setCurrentIsFavorite(!currentIsFavorite);
      }
    } catch (e) {
      console.error("Error toggling favorite");
    }
  };

  const performAnalysis = async (base64String: string) => {
    // Switch to home tab to see the result immediately
    setActiveTab('home'); 
    
    setImage(base64String);
    setError(null);
    setAnalysis(null);
    setLoading(true);
    setCurrentIsFavorite(false);

    try {
      const base64Data = base64String.split(',')[1];
      const mimeType = base64String.split(';')[0].split(':')[1];
      const result = await analyzeClothingImage(base64Data, mimeType);
      
      // Save valid results to wardrobe automatically if no error
      if (!result.hata) {
        saveToWardrobe(base64String, result);
      }
      
      setAnalysis(result);

    } catch (apiError) {
      setError("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      console.error(apiError);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true); // Show spinner while compressing
      const optimizedBase64 = await processImage(file);
      performAnalysis(optimizedBase64);
    } catch (e) {
      setError("Dosya işlenirken bir hata oluştu.");
      setLoading(false);
    }
    
    if (event.target) event.target.value = '';
  };

  const handleCameraCapture = (base64String: string) => {
    setShowCamera(false);
    performAnalysis(base64String);
  };

  const handleReset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setActiveTab('home');
    setCurrentIsFavorite(false);
  };

  const triggerCamera = () => {
    setShowCamera(true);
  };

  const triggerGallery = () => {
    fileInputRef.current?.click();
  };

  if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <LoadingSpinner />
        </div>
      );
  }

  // If user is not logged in, show Auth View
  if (!currentUser) {
      // Just a pass-through for state, logic is inside AuthView via Firebase
      return <AuthView onLoginSuccess={() => {}} />;
  }

  const renderContent = () => {
    if (activeTab === 'profile') {
      return <ProfileView user={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
    }

    if (loading) {
      return (
        <div className="mt-20">
          <LoadingSpinner />
        </div>
      );
    }

    if (image && analysis) {
      return (
        <AnalysisDisplay 
          data={analysis} 
          imageSrc={image} 
          onReset={handleReset}
          isFavorite={currentIsFavorite}
          onToggleFavorite={toggleCurrentFavorite}
        />
      );
    }

    if (error) {
       return (
         <div className="p-6 text-center mt-10">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 border border-red-100">
              {error}
            </div>
            <button 
              onClick={handleReset}
              className="text-gray-600 font-medium underline"
            >
              Ana Sayfaya Dön
            </button>
         </div>
       );
    }

    return <HomeView onCameraClick={triggerCamera} onGalleryClick={triggerGallery} />;
  };

  const shouldHideNav = showCamera;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Header />

      <main className="max-w-md mx-auto pt-4">
        {renderContent()}
      </main>

      {showCamera && (
        <CameraView 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden" 
      />

      {!shouldHideNav && (
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onScanClick={triggerCamera}
        />
      )}
    </div>
  );
};

export default App;
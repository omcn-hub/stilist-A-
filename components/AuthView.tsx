import React, { useState } from 'react';
import { Shirt, ArrowRight, Sparkles, Mail, Lock, User, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider, getFirebaseErrorMessage } from '../services/firebase';

interface AuthViewProps {
  onLoginSuccess: () => void; // Parent component handles state update via auth listener
}

// Google Logo Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onLoginSuccess();
      } else {
        // REGISTER
        if (!formData.name) {
            setError("Lütfen adınızı girin.");
            setLoading(false);
            return;
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Update profile with name
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
                displayName: formData.name
            });
        }
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 animate-fade-in relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>

      <div className="relative z-10 max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-200 mb-4 transform rotate-3">
            <Shirt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Stil<span className="text-purple-600">AI</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Yapay Zeka Destekli Moda Asistanın</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-8 relative">
           
           <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
             {isLogin ? 'Tekrar Hoşgeldin!' : 'Stil Yolculuğuna Başla'}
           </h2>

           {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 text-center">
               {error}
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
             {!isLogin && (
               <div className="relative group">
                 <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                 <input
                   type="text"
                   name="name"
                   placeholder="Adın Soyadın"
                   value={formData.name}
                   onChange={handleChange}
                   required
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                 />
               </div>
             )}

             <div className="relative group">
               <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
               <input
                 type="email"
                 name="email"
                 placeholder="E-posta Adresin"
                 value={formData.email}
                 onChange={handleChange}
                 required
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
               />
             </div>

             <div className="relative group">
               <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
               <input
                 type="password"
                 name="password"
                 placeholder="Şifren"
                 value={formData.password}
                 onChange={handleChange}
                 required
                 minLength={6}
                 className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
               />
             </div>

             <button
               type="submit"
               disabled={loading || googleLoading}
               className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center space-x-2 mt-2"
             >
               {loading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <>
                   <span>{isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}</span>
                   <ArrowRight className="w-4 h-4" />
                 </>
               )}
             </button>
           </form>

           <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-2 text-gray-400 backdrop-blur-sm">veya</span>
              </div>
           </div>

           <button
             type="button"
             onClick={handleGoogleLogin}
             disabled={loading || googleLoading}
             className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all flex items-center justify-center space-x-3"
           >
             {googleLoading ? (
               <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
             ) : (
               <>
                 <GoogleIcon />
                 <span>Google ile {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</span>
               </>
             )}
           </button>

           <div className="mt-6 text-center">
             <button
               onClick={() => { setIsLogin(!isLogin); setError(null); }}
               className="text-xs text-gray-500 hover:text-purple-600 font-medium transition-colors"
             >
               {isLogin ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"}
             </button>
           </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-2 text-[10px] text-gray-400">
           <Sparkles className="w-3 h-3" />
           <span>Kişiselleştirilmiş Moda Deneyimi</span>
           <Sparkles className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default AuthView;
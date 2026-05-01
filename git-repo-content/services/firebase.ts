import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// ------------------------------------------------------------------
// ÖNEMLİ: Kendi Firebase Projenizin bilgilerini buraya girmelisiniz.
// https://console.firebase.google.com/ adresinden proje oluşturup
// Authentication kısmını (Email/Password ve Google) aktif etmelisiniz.
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyDO2bszxX9KUbH4VnIPnz9j3q0k98Dz6bo", // 0 (Sıfır) yerine O (O harfi) düzeltildi
  authDomain: "stilai-app.firebaseapp.com",
  projectId: "stilai-app",
  storageBucket: "stilai-app.firebasestorage.app",
  messagingSenderId: "883192998070",
  appId: "1:883192998070:web:5d08e62e70ae92f208de17",
  measurementId: "G-BR47XGC0RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error mapping helper
export const getFirebaseErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda.';
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi.';
    case 'auth/operation-not-allowed':
      return 'Giriş yöntemi devre dışı bırakılmış.';
    case 'auth/weak-password':
      return 'Şifre çok zayıf. En az 6 karakter olmalı.';
    case 'auth/user-disabled':
      return 'Bu kullanıcı hesabı devre dışı bırakılmış.';
    case 'auth/user-not-found':
      return 'Kullanıcı bulunamadı.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Hatalı e-posta veya şifre.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Firebase API Anahtarı hatalı. Lütfen services/firebase.ts dosyasındaki apiKey değerini kontrol edin.';
    default:
      return 'Bir hata oluştu: ' + code;
  }
};
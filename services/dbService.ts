import { doc, getDoc, setDoc, getDocFromServer, collection, query, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { StoredItem, UserProfile, UserPreferences } from '../types';

export const handleFirestoreError = (error: any, operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write', path: string | null) => {
  if (error instanceof Error && (error.message.includes('Missing or insufficient permissions') || error.message.includes('missing or insufficient permissions') || error.message.includes('PERMISSION_DENIED'))) {
    const user = auth.currentUser;
    const errorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: user ? {
        userId: user.uid,
        email: user.email || '',
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
        providerInfo: user.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        }))
      } : null
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (err) {
      // Intentionally silented test errors.
  }
};

testConnection();

export const saveItemToFirestore = async (item: StoredItem): Promise<void> => {
  if (!auth.currentUser) throw new Error("Kullanıcı girişi yapılmamış.");
  
  const userId = auth.currentUser.uid;
  const itemRef = doc(db, 'users', userId, 'wardrobe', item.id);
  
  try {
      await setDoc(itemRef, {
        userId,
        image: item.image,
        date: item.date,
        isFavorite: item.isFavorite,
        analysis: item.analysis,
      });
  } catch(error) {
      handleFirestoreError(error, 'create', itemRef.path);
  }
};

export const getItemsFromFirestore = async (): Promise<StoredItem[]> => {
  if (!auth.currentUser) return [];

  const userId = auth.currentUser.uid;
  const q = query(collection(db, 'users', userId, 'wardrobe'));
  try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as StoredItem);
  } catch(error) {
      handleFirestoreError(error, 'list', `/users/${userId}/wardrobe`);
      return [];
  }
};

export const updateFavoriteInFirestore = async (itemId: string, isFavorite: boolean): Promise<void> => {
  if (!auth.currentUser) throw new Error("Kullanıcı girişi yapılmamış.");
  
  const userId = auth.currentUser.uid;
  const itemRef = doc(db, 'users', userId, 'wardrobe', itemId);
  
  try {
      await updateDoc(itemRef, {
        isFavorite,
      });
  } catch(error) {
      handleFirestoreError(error, 'update', itemRef.path);
  }
};

export const clearWardrobeHistory = async (): Promise<void> => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const q = query(collection(db, 'users', userId, 'wardrobe'));
    
    try {
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(document => deleteDoc(doc(db, 'users', userId, 'wardrobe', document.id)));
        await Promise.all(deletePromises);
    } catch(error) {
        handleFirestoreError(error, 'delete', `/users/${userId}/wardrobe`);
    }
};

export const syncLocalStorageToFirestore = async (): Promise<boolean> => {
  if (!auth.currentUser) return false;
  
  const existing = localStorage.getItem('stilai_wardrobe');
  if (existing) {
    try {
      const items: StoredItem[] = JSON.parse(existing);
      for (const item of items) {
        await saveItemToFirestore(item);
      }
      localStorage.removeItem('stilai_wardrobe'); // Clean after sync
      return true;
    } catch (e) {
      console.error("Migrasyon sırasında hata oluştu", e);
    }
  }
  return false;
};

export const createOrUpdateUserProfile = async (profile: UserProfile, preferences?: UserPreferences) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    
    try {
        const snap = await getDoc(userRef);
        if(snap.exists()) {
            const data = snap.data();
            await updateDoc(userRef, {
                name: profile.name || data.name || '',
                bodyType: preferences?.bodyType || data.bodyType || 'Belirtilmemiş',
                styleGoal: preferences?.styleGoal || data.styleGoal || 'Belirtilmemiş',
                gender: preferences?.gender || data.gender || 'Belirtilmemiş'
            });
        } else {
            await setDoc(userRef, {
                userId,
                email: profile.email || '',
                name: profile.name || '',
                bodyType: preferences?.bodyType || 'Belirtilmemiş',
                styleGoal: preferences?.styleGoal || 'Belirtilmemiş',
                gender: preferences?.gender || 'Kadın'
            });
        }
    } catch(error) {
        handleFirestoreError(error, 'update', userRef.path);
    }
};

export const loadUserProfile = async (): Promise<any> => {
    if(!auth.currentUser) return null;
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    try {
        const snap = await getDoc(userRef);
        if(snap.exists()) return snap.data();
        return null;
    } catch(error) {
        handleFirestoreError(error, 'get', userRef.path);
        return null;
    }
}

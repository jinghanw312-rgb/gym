import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface SportsLog {
  id?: string;
  timestamp: Date | Timestamp;
  category: string;
  name: string;
  value: number;
  kcal: number;
  score: string;
  userId: string;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

const handleFirestoreError = (error: any, operation: FirestoreErrorInfo['operationType'], path: string | null) => {
  const user = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error.message,
    operationType: operation,
    path: path,
    authInfo: {
      userId: user?.uid || 'anonymous',
      email: user?.email || 'none',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || true,
      providerInfo: user?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };
  throw new Error(JSON.stringify(errorInfo));
};

export const saveRecord = async (data: Omit<SportsLog, 'id' | 'timestamp' | 'userId'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const docRef = await addDoc(collection(db, 'sportsLogs'), {
      ...data,
      userId: user.uid,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', 'sportsLogs');
  }
};

export const deleteRecord = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'sportsLogs', id));
  } catch (error) {
    handleFirestoreError(error, 'delete', `sportsLogs/${id}`);
  }
};

export const subscribeToLogs = (userId: string, callback: (logs: SportsLog[]) => void) => {
  const q = query(
    collection(db, 'sportsLogs'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SportsLog[];
    callback(logs);
  }, (error) => {
    console.error('Snapshot error:', error);
  });
};

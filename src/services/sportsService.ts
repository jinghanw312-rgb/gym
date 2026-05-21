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

const getLocalRecords = (): SportsLog[] => {
  try {
    const raw = localStorage.getItem('neogym_local_logs');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((item: any) => ({
      ...item,
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
    }));
  } catch (e) {
    console.error('Error fetching local records:', e);
    return [];
  }
};

const saveLocalRecords = (logs: SportsLog[]) => {
  try {
    localStorage.setItem('neogym_local_logs', JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving local records:', e);
  }
};

export const saveRecord = async (data: Omit<SportsLog, 'id' | 'timestamp' | 'userId'>) => {
  const user = auth.currentUser;
  const isLocalGuest = !user || user.uid === 'local-guest-user';
  const userId = isLocalGuest ? 'local-guest-user' : user.uid;

  if (isLocalGuest) {
    const localLogs = getLocalRecords();
    const newLog: SportsLog = {
      ...data,
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      userId: 'local-guest-user',
      timestamp: new Date()
    };
    localLogs.unshift(newLog);
    saveLocalRecords(localLogs);
    // Trigger local storage change event for automatic sync
    window.dispatchEvent(new Event('local-logs-updated'));
    return newLog.id;
  }

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
  if (id.startsWith('local-')) {
    const localLogs = getLocalRecords();
    const filtered = localLogs.filter(log => log.id !== id);
    saveLocalRecords(filtered);
    window.dispatchEvent(new Event('local-logs-updated'));
    return;
  }

  try {
    await deleteDoc(doc(db, 'sportsLogs', id));
  } catch (error) {
    handleFirestoreError(error, 'delete', `sportsLogs/${id}`);
  }
};

export const subscribeToLogs = (userId: string, callback: (logs: SportsLog[]) => void) => {
  if (userId === 'local-guest-user') {
    // Return initial local logs immediately
    callback(getLocalRecords());

    // Listen to local log updates
    const handleUpdate = () => {
      callback(getLocalRecords());
    };
    window.addEventListener('local-logs-updated', handleUpdate);
    return () => {
      window.removeEventListener('local-logs-updated', handleUpdate);
    };
  }

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

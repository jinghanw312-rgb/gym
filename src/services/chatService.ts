import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  deleteDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface ChatMessage {
  id?: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

export const sendMessage = async (userId: string, role: 'user' | 'assistant', content: string) => {
  const path = `users/${userId}/chatHistory`;
  try {
    const chatRef = collection(db, 'users', userId, 'chatHistory');
    await addDoc(chatRef, {
      userId,
      role,
      content,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const subscribeToChat = (userId: string, callback: (messages: ChatMessage[]) => void) => {
  const path = `users/${userId}/chatHistory`;
  const chatRef = collection(db, 'users', userId, 'chatHistory');
  const q = query(chatRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const clearChat = async (userId: string) => {
  const path = `users/${userId}/chatHistory`;
  try {
    const chatRef = collection(db, 'users', userId, 'chatHistory');
    const snapshot = await getDocs(chatRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

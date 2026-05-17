import type { Commande, ChatMessage } from '../types';

const DB_NAME = 'kirei-pressing-db';
const DB_VERSION = 2;
const STORE_NAME = 'commandes';
const MSG_STORE_NAME = 'messages';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MSG_STORE_NAME)) {
        db.createObjectStore(MSG_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function initDb(): Promise<void> {
  await openDatabase();
}

export async function saveCommande(commande: Commande): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.put(commande);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAllCommandes(): Promise<Commande[]> {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Commande[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getCommandeById(id: string): Promise<Commande | undefined> {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Commande | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function updateCommande(commande: Commande): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.put(commande);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function saveMessage(message: ChatMessage): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(MSG_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(MSG_STORE_NAME);
  store.put(message);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAllMessages(): Promise<ChatMessage[]> {
  const db = await openDatabase();
  const transaction = db.transaction(MSG_STORE_NAME, 'readonly');
  const store = transaction.objectStore(MSG_STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as ChatMessage[]);
    request.onerror = () => reject(request.error);
  });
}

/**
 * IndexedDB persistence for the virtual workspace.
 * Survives refreshes; never leaves this browser. Keys are NOT stored here —
 * they stay in sessionStorage (see secrets.ts) and die with the tab.
 */

import type { VfsSnapshot } from './vfs'

const DB_NAME = 'bostonai'
const DB_VERSION = 1
const STORE = 'workspace'
const KEY = 'vfs'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

export async function loadWorkspaceSnapshot(): Promise<VfsSnapshot | null> {
  try {
    const db = await openDb()
    return await new Promise<VfsSnapshot | null>(resolve => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(KEY)
      req.onsuccess = () => {
        const value = req.result as VfsSnapshot | undefined
        resolve(value && value.version === 1 && Array.isArray(value.nodes) ? value : null)
      }
      req.onerror = () => resolve(null)
      tx.oncomplete = () => db.close()
    })
  } catch {
    return null
  }
}

export async function saveWorkspaceSnapshot(snapshot: VfsSnapshot): Promise<boolean> {
  try {
    const db = await openDb()
    return await new Promise<boolean>(resolve => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(snapshot, KEY)
      tx.oncomplete = () => {
        db.close()
        resolve(true)
      }
      tx.onerror = () => {
        db.close()
        resolve(false)
      }
    })
  } catch {
    return false
  }
}

export async function clearWorkspaceSnapshot(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>(resolve => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(KEY)
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        resolve()
      }
    })
  } catch {
    // Nothing to clear if the DB is unavailable.
  }
}

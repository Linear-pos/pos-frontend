import type { AxiosError } from 'axios';
import { axiosInstance } from './api';
import { useAuthStore } from '@/stores/auth.store';
import { useDeviceModeStore } from '@/stores/deviceMode.store';
import type { CreateSalePayload, Sale } from '@/types/sale';

const DB_NAME = 'omnipos_offline_sync_db';
const DB_VERSION = 1;
const KV_STORE = 'kv';

const LEGACY_STORAGE_KEY = 'omnipos_offline_sales_queue_v1';
const STORAGE_PREFIX = 'omnipos_offline_sales_queue_v2';
const CONFLICT_PREFIX = 'omnipos_offline_sales_conflicts_v1';
const SYNC_EVENT = 'omnipos:offline-sales-sync';
const SYNC_INTERVAL_MS = 30_000;

interface SyncScope {
  tenantId: string;
  branchId?: string;
  actorId: string;
  terminalId?: string;
}

interface CountSnapshot {
  pending: number;
  conflicts: number;
}

interface KVRecord<T = unknown> {
  key: string;
  value: T;
}

export interface QueuedSale {
  local_id: string;
  payload: CreateSalePayload;
  queued_at: string;
  attempts: number;
  last_error?: string;
  last_attempt_at?: string;
}

export interface ConflictedSale extends QueuedSale {
  conflict_reason: string;
  moved_to_conflicts_at: string;
}

interface SyncResultItem {
  client_txn_id?: string;
  success: boolean;
  error?: string;
  sale?: Sale;
  reason?: 'conflict' | 'validation' | 'server';
}

let initialized = false;
let syncInterval: number | undefined;
let inFlight = false;
let dbPromise: Promise<IDBDatabase> | null = null;
const countCache = new Map<string, CountSnapshot>();

function resolveSyncScope(): SyncScope | null {
  const { user, token } = useAuthStore.getState();
  if (!user || !token) return null;

  const deviceMode = useDeviceModeStore.getState().mode;
  const tenantId = user.tenant_id || (deviceMode.type === 'terminal' ? deviceMode.tenantId : undefined);
  if (!tenantId) return null;

  const branchId = user.branch_id || (deviceMode.type === 'terminal' ? deviceMode.branchId : undefined) || undefined;
  const terminalId = deviceMode.type === 'terminal' ? deviceMode.terminalId : undefined;

  return {
    tenantId,
    branchId,
    actorId: user.id,
    terminalId,
  };
}

function buildScopeId(scope: SyncScope): string {
  return [
    scope.tenantId,
    scope.branchId || 'no-branch',
    scope.actorId,
    scope.terminalId || 'no-terminal',
  ].join(':');
}

function queueStorageKey(scope: SyncScope): string {
  return `${STORAGE_PREFIX}:${buildScopeId(scope)}`;
}

function conflictStorageKey(scope: SyncScope): string {
  return `${CONFLICT_PREFIX}:${buildScopeId(scope)}`;
}

function updateCountCache(scope: SyncScope, update: Partial<CountSnapshot>) {
  const scopeId = buildScopeId(scope);
  const current = countCache.get(scopeId) || { pending: 0, conflicts: 0 };
  countCache.set(scopeId, {
    pending: update.pending ?? current.pending,
    conflicts: update.conflicts ?? current.conflicts,
  });
}

function dispatchSyncEvent() {
  if (typeof window === 'undefined') return;
  const scope = resolveSyncScope();
  const scopeId = scope ? buildScopeId(scope) : null;
  const cached = scopeId ? countCache.get(scopeId) : null;
  const detail = {
    pending: cached?.pending || 0,
    conflicts: cached?.conflicts || 0,
    scopeId,
    lastSyncedAt: new Date().toISOString(),
  };
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail }));
}

async function getDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB is not available');
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(KV_STORE)) {
          db.createObjectStore(KV_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    });
  }

  return dbPromise;
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KV_STORE, 'readonly');
    const store = tx.objectStore(KV_STORE);
    const req = store.get(key);

    req.onsuccess = () => {
      const row = req.result as KVRecord<T> | undefined;
      resolve(row?.value ?? null);
    };
    req.onerror = () => reject(req.error || new Error(`Failed to read key ${key}`));
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await getDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KV_STORE, 'readwrite');
    const store = tx.objectStore(KV_STORE);
    store.put({ key, value } as KVRecord<T>);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error(`Failed to write key ${key}`));
    tx.onabort = () => reject(tx.error || new Error(`Write transaction aborted for key ${key}`));
  });
}

async function readQueue(scope: SyncScope | null): Promise<QueuedSale[]> {
  if (!scope) return [];
  try {
    const queue = await idbGet<QueuedSale[]>(queueStorageKey(scope));
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}

async function writeQueue(scope: SyncScope, queue: QueuedSale[]) {
  await idbSet(queueStorageKey(scope), queue);
  updateCountCache(scope, { pending: queue.length });
  dispatchSyncEvent();
}

async function readConflicts(scope: SyncScope | null): Promise<ConflictedSale[]> {
  if (!scope) return [];
  try {
    const conflicts = await idbGet<ConflictedSale[]>(conflictStorageKey(scope));
    return Array.isArray(conflicts) ? conflicts : [];
  } catch {
    return [];
  }
}

async function writeConflicts(scope: SyncScope, conflicts: ConflictedSale[]) {
  await idbSet(conflictStorageKey(scope), conflicts);
  updateCountCache(scope, { conflicts: conflicts.length });
  dispatchSyncEvent();
}

async function refreshScopeCounts(scope: SyncScope) {
  const [queue, conflicts] = await Promise.all([
    readQueue(scope),
    readConflicts(scope),
  ]);
  updateCountCache(scope, { pending: queue.length, conflicts: conflicts.length });
  dispatchSyncEvent();
}

function toLocalSale(localId: string, payload: CreateSalePayload): Sale {
  const now = new Date().toISOString();
  const user = useAuthStore.getState().user;
  const subtotal = payload.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const tax = Number(payload.tax || 0);
  const total = subtotal + tax;

  return {
    id: localId,
    user_id: user?.id || '',
    branch_id: payload.branch_id || user?.branch_id || undefined,
    subtotal,
    tax,
    total,
    payment_method: payload.payment_method,
    status: payload.status || 'completed',
    reference: payload.reference,
    notes: payload.notes,
    created_at: now,
    updated_at: now,
    shift_id: payload.shift_id,
    cashier_id: payload.cashier_id,
    items: payload.items.map((item) => ({
      sale_id: localId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: Number(item.price || 0),
      total: Number(item.price || 0) * item.quantity,
    })),
  };
}

export function isNetworkOrOfflineError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }

  const axiosError = error as AxiosError | undefined;
  if (!axiosError) return false;
  if (!axiosError.response) return true;

  return axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNABORTED';
}

export function queueSaleForSync(payload: CreateSalePayload): Sale {
  const scope = resolveSyncScope();
  if (!scope) {
    throw new Error('Offline sync requires authenticated tenant context');
  }

  const localId = `offline-${crypto.randomUUID()}`;
  const item: QueuedSale = {
    local_id: localId,
    payload: {
      ...payload,
      reference: payload.reference || localId,
    },
    queued_at: new Date().toISOString(),
    attempts: 0,
  };

  void (async () => {
    const queue = await readQueue(scope);
    queue.push(item);
    await writeQueue(scope, queue);
    await syncQueuedSales();
  })();

  return toLocalSale(localId, item.payload);
}

export function getQueuedSalesCount(): number {
  const scope = resolveSyncScope();
  if (!scope) return 0;
  const scopeId = buildScopeId(scope);
  const cached = countCache.get(scopeId);
  if (!cached) {
    void refreshScopeCounts(scope);
    return 0;
  }
  return cached.pending;
}

export function getConflictedSalesCount(): number {
  const scope = resolveSyncScope();
  if (!scope) return 0;
  const scopeId = buildScopeId(scope);
  const cached = countCache.get(scopeId);
  if (!cached) {
    void refreshScopeCounts(scope);
    return 0;
  }
  return cached.conflicts;
}

function isFinalConflict(result: SyncResultItem): boolean {
  if (result.reason === 'conflict' || result.reason === 'validation') {
    return true;
  }

  const message = (result.error || '').toLowerCase();
  return (
    message.includes('insufficient stock') ||
    message.includes('invalid') ||
    message.includes('not found')
  );
}

async function moveToConflicts(scope: SyncScope, entry: QueuedSale, reason: string) {
  const conflicts = await readConflicts(scope);
  const deduped = conflicts.filter((item) => item.local_id !== entry.local_id);
  deduped.push({
    ...entry,
    conflict_reason: reason,
    moved_to_conflicts_at: new Date().toISOString(),
  });
  await writeConflicts(scope, deduped);
}

async function migrateLegacyQueue(scope: SyncScope) {
  if (typeof window === 'undefined') return;
  const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyRaw) return;

  try {
    const legacyQueue = JSON.parse(legacyRaw);
    if (!Array.isArray(legacyQueue) || legacyQueue.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }

    const existing = await readQueue(scope);
    await writeQueue(scope, [...existing, ...legacyQueue]);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

export async function syncQueuedSales() {
  if (inFlight) return;
  const scope = resolveSyncScope();
  if (!scope) return;
  await migrateLegacyQueue(scope);
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const queue = await readQueue(scope);
  if (queue.length === 0) {
    await refreshScopeCounts(scope);
    return;
  }

  inFlight = true;
  try {
    const response = await axiosInstance.post('/sales/sync', {
      sales: queue.map((entry) => ({
        ...entry.payload,
        client_txn_id: entry.local_id,
        reference: entry.payload.reference || entry.local_id,
      })),
    });

    const results = (response.data?.data?.results || []) as SyncResultItem[];
    const successfulIds = new Set(
      results.filter((result) => result.success).map((result) => result.client_txn_id).filter(Boolean)
    );
    const failedById = new Map(
      results
        .filter((result) => !result.success && result.client_txn_id)
        .map((result) => [result.client_txn_id as string, result.error || 'Sync failed'])
    );

    const remaining: QueuedSale[] = [];
    for (const entry of queue) {
      if (successfulIds.has(entry.local_id)) continue;

      const result = results.find((item) => item.client_txn_id === entry.local_id);
      const error = failedById.get(entry.local_id) || result?.error;
      if (!result || !error) {
        remaining.push(entry);
        continue;
      }

      if (isFinalConflict(result)) {
        await moveToConflicts(scope, entry, error);
        continue;
      }

      remaining.push({
        ...entry,
        attempts: entry.attempts + 1,
        last_error: error,
        last_attempt_at: new Date().toISOString(),
      });
    }

    await writeQueue(scope, remaining);
    await refreshScopeCounts(scope);
  } catch (error) {
    const axiosError = error as AxiosError | undefined;
    const status = axiosError?.response?.status;

    if (status === 401 || status === 403) {
      return;
    }

    if (!isNetworkOrOfflineError(error)) {
      const now = new Date().toISOString();
      const bumped = queue.map((entry) => ({
        ...entry,
        attempts: entry.attempts + 1,
        last_error: (error as Error)?.message || 'Failed to sync queued sale',
        last_attempt_at: now,
      }));
      await writeQueue(scope, bumped);
    }
  } finally {
    inFlight = false;
  }
}

export function initializeOfflineSalesSync() {
  if (initialized || typeof window === 'undefined') {
    return;
  }
  initialized = true;

  const scope = resolveSyncScope();
  if (scope) {
    void (async () => {
      await migrateLegacyQueue(scope);
      await refreshScopeCounts(scope);
    })();
  }

  window.addEventListener('online', () => {
    void syncQueuedSales();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void syncQueuedSales();
    }
  });

  syncInterval = window.setInterval(() => {
    void syncQueuedSales();
  }, SYNC_INTERVAL_MS);

  void syncQueuedSales();
  dispatchSyncEvent();
}

export function disposeOfflineSalesSync() {
  if (typeof window === 'undefined' || !initialized) return;
  if (syncInterval) {
    window.clearInterval(syncInterval);
  }
  initialized = false;
}

export const offlineSalesSyncEvents = {
  eventName: SYNC_EVENT,
};

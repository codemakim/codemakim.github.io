export const POST_READS_STORAGE_KEY = 'blog.postReads.v1';
export const POST_READS_CHANGED_EVENT = 'blog:postReadsChanged';

type PostReadsVersion = 1;

export interface PostReadsStateV1 {
  v: PostReadsVersion;
  /**
   * Key existence means "read".
   * Value is a dummy marker (1) to keep JSON small and ergonomic.
   */
  read: Record<string, 1>;
}

export type PostReadsState = PostReadsStateV1;

function isBrowser() {
  return typeof window !== 'undefined';
}

export function createEmptyPostReadsState(): PostReadsStateV1 {
  return { v: 1, read: {} };
}

export function loadPostReadsState(): PostReadsState {
  if (!isBrowser()) return createEmptyPostReadsState();

  try {
    const raw = window.localStorage.getItem(POST_READS_STORAGE_KEY);
    if (!raw) return createEmptyPostReadsState();

    const parsed = JSON.parse(raw) as Partial<PostReadsState>;
    if (parsed?.v !== 1 || typeof parsed.read !== 'object' || parsed.read === null) {
      return createEmptyPostReadsState();
    }

    // sanitize: keep only string keys with value 1
    const read: Record<string, 1> = {};
    for (const [k, v] of Object.entries(parsed.read)) {
      if (typeof k === 'string' && v === 1) read[k] = 1;
    }

    return { v: 1, read };
  } catch {
    return createEmptyPostReadsState();
  }
}

export function savePostReadsState(state: PostReadsState): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(POST_READS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(POST_READS_CHANGED_EVENT));
  } catch {
    // ignore write errors (quota, disabled storage, etc.)
  }
}

export function normalizePostPath(path: string): string {
  // Keep it simple: use the URL path string as-is, trimmed.
  // (Policy: if the path changes, read state is treated as new.)
  return path.trim();
}

export function isPostRead(path: string): boolean {
  const key = normalizePostPath(path);
  if (!key) return false;
  const state = loadPostReadsState();
  return state.read[key] === 1;
}

/**
 * Toggle read state for a given post path.
 * Returns the next read state after toggle.
 */
export function togglePostRead(path: string): boolean {
  const key = normalizePostPath(path);
  if (!key) return false;

  const state = loadPostReadsState();
  const next: PostReadsState = { ...state, read: { ...state.read } };

  if (next.read[key] === 1) {
    delete next.read[key];
    savePostReadsState(next);
    return false;
  }

  next.read[key] = 1;
  savePostReadsState(next);
  return true;
}

/**
 * Remove read state for all given post paths (series reset).
 */
export function resetPostsRead(paths: string[]): void {
  if (!paths.length) return;

  const state = loadPostReadsState();
  const next: PostReadsState = { ...state, read: { ...state.read } };

  let changed = false;
  for (const p of paths) {
    const key = normalizePostPath(p);
    if (!key) continue;
    if (next.read[key] === 1) {
      delete next.read[key];
      changed = true;
    }
  }

  if (changed) savePostReadsState(next);
}

/**
 * Subscribe to read-state changes (same tab + other tabs).
 * Returns an unsubscribe function.
 */
export function subscribePostReads(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};

  const handleCustom = () => onChange();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === POST_READS_STORAGE_KEY) onChange();
  };

  window.addEventListener(POST_READS_CHANGED_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(POST_READS_CHANGED_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}


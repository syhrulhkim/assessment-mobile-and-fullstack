function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredToken(): string {
  const storage = getStorage();
  if (!storage) return '';
  try {
    return Storage.prototype.getItem.call(storage, 'api_token') || '';
  } catch {
    return '';
  }
}

export function hasStoredToken(): boolean {
  return getStoredToken().length > 0;
}

export function setStoredToken(token: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    Storage.prototype.setItem.call(storage, 'api_token', token);
  } catch {
    // ignore storage write failures
  }
}

export function removeStoredToken(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    Storage.prototype.removeItem.call(storage, 'api_token');
  } catch {
    // ignore storage delete failures
  }
}

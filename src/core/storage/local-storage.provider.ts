import type { IStorageProvider } from "./interfaces/storage-provider.interface";

export class LocalStorageProvider implements IStorageProvider {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

export const localStorageProvider = new LocalStorageProvider();

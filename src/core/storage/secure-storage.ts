import type { IStorageProvider } from "./interfaces/storage-provider.interface";

// Lightweight secure wrapper - pluggable provider (can add crypto later)
export class SecureStorage {
  private provider: IStorageProvider;

  constructor(provider: IStorageProvider) {
    this.provider = provider;
  }

  get(key: string): string | null {
    return this.provider.get(key);
  }

  set(key: string, value: string): void {
    this.provider.set(key, value);
  }

  remove(key: string): void {
    this.provider.remove(key);
  }
}

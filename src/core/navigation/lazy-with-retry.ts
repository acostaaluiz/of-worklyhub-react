import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const CHUNK_RELOAD_KEY = "worklyhub.chunk-reload-once";

const shouldReloadForChunkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed")
  );
};

export const lazyWithRetry = <T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
): LazyExoticComponent<T> =>
  lazy(async () => {
    try {
      const loaded = await importer();
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return loaded;
    } catch (error) {
      const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1";
      if (!alreadyReloaded && shouldReloadForChunkError(error)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
        window.location.reload();
      }
      throw error;
    }
  });

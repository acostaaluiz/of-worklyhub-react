// Basic Jest setup for DOM and globals used by the app
// mock localStorage if not present
if (!globalThis.localStorage) {
  const storage: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (k: string) => (k in storage ? storage[k] : null),
    setItem: (k: string, v: string) => {
      storage[k] = String(v);
    },
    removeItem: (k: string) => {
      delete storage[k];
    },
    clear: () => {
      for (const k of Object.keys(storage)) delete storage[k];
    },
    key: (i: number) => Object.keys(storage)[i] ?? null,
    length: 0,
  } as unknown as Storage;
}

// testing-library DOM matchers
import '@testing-library/jest-dom';

// jest DOM utilities are provided by jest-environment-jsdom

// Provide matchMedia for tests (some components rely on it)
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

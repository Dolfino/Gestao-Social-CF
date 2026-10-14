// Armazenamento resiliente a iframes protegidos e sandboxes onde window.localStorage pode lançar SecurityError
const inMemoryFallback = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Ignora erro de sandbox/cross-origin
    }
    return inMemoryFallback.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Ignora erro de sandbox/cross-origin
    }
    inMemoryFallback.set(key, value);
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignora erro de sandbox/cross-origin
    }
    inMemoryFallback.delete(key);
  },
};

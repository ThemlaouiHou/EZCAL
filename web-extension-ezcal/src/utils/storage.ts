export const STORAGE_KEYS = {
  firecrawlKey: "fc_api_key",
  mistralKey: "mistral_api_key",
  settings: "app_settings"
} as const;

const getStorageArea = () => chrome.storage.sync || chrome.storage.local;

export function getSync<T = unknown>(key: string): Promise<T | undefined> {
  const storage = getStorageArea();
  return new Promise(resolve => {
    storage.get([key], (result: any) => resolve(result[key] as T));
  });
}

export function setSync(pairs: Record<string, unknown>): Promise<void> {
  const storage = getStorageArea();
  return new Promise(resolve => {
    storage.set(pairs, () => resolve());
  });
}

export async function getFromStorage(key: string): Promise<string | undefined> {
  const storage = getStorageArea();
  return new Promise(resolve => {
    storage.get({ [key]: "" }, (result: any) => {
      const value = result[key];
      resolve(typeof value === "string" && value.trim() ? value.trim() : undefined);
    });
  });
}
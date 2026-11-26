import { registerSW } from 'virtual:pwa-register';

// Hanya produksi: di dev/test tidak ada service worker. Mengembalikan fungsi muat-ulang-ke-versi-baru.
export function registerSw(onNeedRefresh: () => void): () => void {
  if (!import.meta.env.PROD) return () => {};
  const update = registerSW({ onNeedRefresh });
  return () => void update(true);
}

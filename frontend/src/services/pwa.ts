import { registerSW } from 'virtual:pwa-register';

// Hanya produksi: di dev/test tidak ada service worker. Mengembalikan fungsi muat-ulang-ke-versi-baru.
// Registrasi (dan precache) ditunda sampai browser idle supaya tidak bersaing dengan render pertama.
export function registerSw(onNeedRefresh: () => void): () => void {
  if (!import.meta.env.PROD) return () => {};
  let update: (reload?: boolean) => Promise<void> = () => Promise.resolve();
  const start = () => {
    update = registerSW({ immediate: true, onNeedRefresh });
  };
  const idle = () => setTimeout(start, 3000);
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
  return () => void update(true);
}

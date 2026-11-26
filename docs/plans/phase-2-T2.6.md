# T2.6 — Dexie + api.ts adapter lokal + antrian event idempoten

Acuan: ADR D-011 (c)(d), PRD §12.2, §10.2, §8.2, §8.4, FR-2. Tipe: `frontend/src/services/types.ts`.

## Langkah (TDD)
1. Dependency: `dexie` (runtime), `fake-indexeddb` (dev) + ADR D-013 (lisensi, ukuran).
2. `lib/uuid.ts`: `uuidV4()` = `crypto.randomUUID` bila ada, fallback v4 dari `crypto.getRandomValues` (Safari iOS 15.0–15.3). Test: format v4, fallback dipakai saat `randomUUID` tidak ada.
3. `services/db.ts`: `class StudyKidsDb extends Dexie`, nama `studykids`, `version(1)` persis tabel D-011 (c); `openDb()` singleton.
4. `services/sync.ts`: `recordAndEnqueue(db, event, mastery)` — satu transaksi rw; `clientEventId` sudah ada → no-op (mastery tidak ditimpa, antrian tidak ganda). `pendingCount` tidak dibuat (Fase 4).
5. `services/api.ts`: `localApi` (Dexie di-import dinamis), `remoteApi` stub (melempar "belum tersedia" — Fase 4), `api` dipilih dari `VITE_API_MODE`. `saveProfile` validasi nickname (trim, 1–20) & grade; profil pertama → `navigator.storage.persist()` (abaikan hasil/ketiadaan). `deleteProfile` hapus semua tabel via `profileId` dalam satu transaksi; hapus `activeProfileId` bila menunjuk profil itu. `getPublicSettings` dari `services/public-settings.local.json`.
6. Unit test (`fake-indexeddb/auto`, env node): CRUD profil, hapus berantai, settings, event ganda tidak terduplikasi, `fetch` tidak dipanggil, `persist()` hanya profil pertama.
7. E2E `tests/e2e/local-data.spec.ts`: bundle `api.ts` dengan Vite build API (in-memory), suntik ke halaman preview, simpan profil + event → reload → data masih ada; tidak ada request jaringan saat operasi data.
8. `npm run check`, `npm run test:e2e`; catat JS awal.

## Di luar scope
Pesan i18n "IndexedDB gagal" & handler `versionchange` di UI (store/T2.7, prompt T2.9; default Dexie sudah menutup DB saat `versionchange`). Pengiriman antrian (Fase 4).

# Rencana T2.0 — ADR arsitektur frontend Fase 2

Sumber: [phase-2.md](phase-2.md) T2.0; PRD §8.1, §8.4, §10.1, §10.2, §11, §12.2, FR-2, FR-3; D-004, D-005, D-007.

1. Tulis ADR **D-011** di `docs/DECISIONS.md` mencakup (a) route, (b) store, (c) skema Dexie v1 + migrasi, (d) `api.ts` + adapter, (e) ikon SVG, (f) DOM test env; tiap poin: keputusan, alasan, dampak budget JS awal (saat ini 16,81 KB gzip).
2. Tulis `frontend/src/services/types.ts`: hanya tipe (tanpa kode runtime). Tidak ada test perilaku karena tidak ada logika; `svelte-check` (bagian `npm run check`) yang memverifikasi.
3. Jalankan `npm run check`, cek link relatif di ADR & rencana ini.

Di luar scope: memasang dependency (T2.1/T2.5/T2.6), kode produksi selain tipe, update `PROGRESS.md` (sesi utama).

# Rencana T0.3 — ADR repo & tooling (22 Nov 2026)

Sumber: PRD §8.1, §10, §11, §17.1, §17.5; `docs/plans/phase-0.md` (T0.3). Dikerjakan subagent `architect` lewat `/next`.

1. Cek kondisi yang sudah ada: `.env.example` (root & backend), `.gitignore`, `scripts/doctor.mjs`, `README.md`.
2. Cek registry npm & Packagist (read-only, tanpa install): versi stabil terbaru, lisensi, syarat Node/PHP, peer dependency.
3. Tulis ADR D-001–D-007 di `docs/DECISIONS.md`: layout repo, kontrak script, kontrak env, versi runtime, dependency FE, dependency BE, cara cek budget.
4. Verifikasi: link relatif tidak rusak, tidak ada rahasia, `node scripts/doctor.mjs --quiet`.
5. Update `PROGRESS.md` (tick T0.3, bukti E4, posisi terakhir) → PR → auto-merge (PR docs).

Tidak ada kode/instalasi/scaffold (itu T0.4+).

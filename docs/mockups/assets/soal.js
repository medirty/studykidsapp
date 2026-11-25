// Interaksi contoh untuk mockup soal: pilih jawaban / ketik angka. Bukan engine soal.
document.querySelectorAll('[data-choices]').forEach((group) => {
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('.choice');
    if (!btn) return;
    group.querySelectorAll('.choice').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  });
});
document.querySelectorAll('[data-keypad]').forEach((pad) => {
  const out = document.getElementById(pad.dataset.keypad);
  pad.addEventListener('click', (e) => {
    const key = e.target.closest('[data-key]')?.dataset.key;
    if (key === undefined) return;
    const cur = out.textContent === '?' ? '' : out.textContent;
    out.textContent = (key === 'del' ? cur.slice(0, -1) : (cur + key).slice(0, 3)) || '?';
  });
});

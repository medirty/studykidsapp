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
// Tap-untuk-pilih (alternatif seret): pilih kartu → ketuk kotak tujuan.
document.querySelectorAll('[data-dropzones]').forEach((box) => {
  let picked = null;
  box.parentElement.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    const zone = e.target.closest('[data-zone]');
    if (chip && !chip.closest('[data-zone]')) {
      picked?.setAttribute('aria-pressed', 'false');
      picked = chip;
      chip.classList.remove('dragging');
      chip.setAttribute('aria-pressed', 'true');
    } else if (zone && picked) {
      picked.setAttribute('aria-pressed', 'false');
      zone.querySelector('.chips').append(picked.parentElement);
      picked = null;
    }
  });
});
// Urutkan: ketuk angka → kotak kosong berikutnya.
document.querySelectorAll('[data-slots]').forEach((slots) => {
  document.querySelector('[data-order-tray]').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-n]');
    const slot = slots.querySelector('.slot:not(.filled)');
    if (!btn || !slot) return;
    slot.textContent = btn.dataset.n;
    slot.classList.add('filled');
    btn.parentElement.remove();
  });
});

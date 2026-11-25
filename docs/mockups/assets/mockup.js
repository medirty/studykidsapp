// Toggle ID/EN untuk mockup (bukan sistem i18n; itu Fase 2).
(function () {
  var root = document.documentElement;
  var lang = 'id';
  try { lang = localStorage.getItem('mockup-lang') || 'id'; } catch (e) { /* abaikan */ }
  root.setAttribute('data-lang', lang);
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-lang-toggle]')) return;
    lang = root.getAttribute('data-lang') === 'id' ? 'en' : 'id';
    root.setAttribute('data-lang', lang);
    try { localStorage.setItem('mockup-lang', lang); } catch (err) { /* abaikan */ }
  });
})();

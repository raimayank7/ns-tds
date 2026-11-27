/* Old-to-new finder on tds.niveshsahayak.in: type an old section (194C, 194J, 194-IB...) or a word (rent, commission) and see where it
   sits in section 393 of the Income-tax Act 2025, the rates and the limit; plus the old and new numbers of the TDS forms. Data: the
   App's checked table NSTds.SEC (tdscore.js, checked 19 Nov 2026 in the gazetted Act and Rules). Screen words: NS.t('tf.*'). */
(function () {
  'use strict';
  var NS = window.NS, S = window.NSTds, host = document.getElementById('td');
  if (!NS || !S || !S.SEC || !host) return;
  function T(k, v) { return NS.t(k, v); }
  var esc = NS.esc, inr = function (x) { return Number(x).toLocaleString('en-IN'); };
  var FORMS = [['24Q', '138', 'tf.f.138'], ['26Q', '140', 'tf.f.140'], ['27Q', '144', 'tf.f.144'], ['27EQ', '143', 'tf.f.143'], ['16', '130', 'tf.f.130'], ['16A', '131', 'tf.f.131'], ['26AS', '168', 'tf.f.168'], ['13', '128', 'tf.f.128'], ['15G / 15H', '121', 'tf.f.121'], ['12BB', '124', 'tf.f.124'], ['27C', '127', 'tf.f.127']];
  function limit(s) {
    if (s[4] === 'c') return T('tf.l.c'); if (s[4] === 'none') return T('tf.l.none');
    return T('tf.l.' + s[4], { n: inr(s[5]) });
  }
  var box = document.createElement('section'); box.className = 'wrap tf-box'; box.setAttribute('aria-labelledby', 'tf-h');
  host.insertAdjacentElement('afterend', box);
  function draw() {
    var q = (box.querySelector('#tf-q') || {}).value || '', ql = q.toLowerCase().replace(/[\s-]/g, '');
    var rows = S.SEC.filter(function (s) { return !ql || (s[1] + s[6] + s[7]).toLowerCase().replace(/[\s-]/g, '').indexOf(ql) >= 0; });
    var focus = document.activeElement && document.activeElement.id === 'tf-q', pos = focus ? document.activeElement.selectionStart : 0;
    box.innerHTML = '<h2 id="tf-h">' + esc(T('tf.h')) + '</h2><p>' + esc(T('tf.lead')) + '</p><div class="f"><label for="tf-q">' + esc(T('tf.q')) + '</label><input id="tf-q" type="search" value="' + esc(q) + '" placeholder="194C"></div>' +
      '<div class="tf-scroll"><table class="gt-tbl"><thead><tr><th scope="col">' + esc(T('tf.c.old')) + '</th><th scope="col">' + esc(T('tf.c.new')) + '</th><th scope="col">' + esc(T('tf.c.what')) + '</th><th scope="col">' + esc(T('tf.c.rate')) + '</th><th scope="col">' + esc(T('tf.c.limit')) + '</th></tr></thead><tbody>' +
      rows.map(function (s) { return '<tr><td>' + esc(s[1]) + '</td><td>' + esc(s[6]) + '</td><td>' + esc(s[7]) + '</td><td>' + (s[2] === s[3] ? s[2] + '%' : esc(T('tf.r2', { a: s[2], b: s[3] }))) + '</td><td>' + esc(limit(s)) + '</td></tr>'; }).join('') +
      (rows.length ? '' : '<tr><td colspan="5">' + esc(T('tf.none')) + '</td></tr>') + '</tbody></table></div>' +
      '<h3>' + esc(T('tf.forms')) + '</h3><div class="tf-scroll"><table class="gt-tbl"><thead><tr><th scope="col">' + esc(T('tf.c.oldf')) + '</th><th scope="col">' + esc(T('tf.c.newf')) + '</th><th scope="col">' + esc(T('tf.c.what')) + '</th></tr></thead><tbody>' +
      FORMS.map(function (f) { return '<tr><td>' + esc(f[0]) + '</td><td>' + esc(T('tf.form', { n: f[1] })) + '</td><td>' + esc(T(f[2])) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<p class="note">' + esc(T('tf.src')) + '</p>';
    if (focus) { var i = box.querySelector('#tf-q'); i.focus(); i.setSelectionRange(pos, pos); }
  }
  box.addEventListener('input', function (e) { if (e.target.id === 'tf-q') draw(); });
  document.addEventListener('ns-lang', draw);
  draw();
})();

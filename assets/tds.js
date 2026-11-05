/* TDS calculator (tds.niveshsahayak.in): TDS on business payments under section 393 of the Income-tax Act, 2025 (in force from
   1 April 2026; old 1961 section in brackets), with the year-to-date threshold check, no-PAN rate, net payable and deposit date.
   Also a TDS register from payment vouchers saved in the data home (TDS you deducted, by section and month) and a list of
   receipts where customers deducted TDS from you. Rates and thresholds: Tax Year 2026-27 (Finance Act 2025 values carried into
   s.393; checked 5 Nov 2026 in NiveshSahayak/Tax research/area-6 and a section 393 rate chart). Screen words: NS.t('td.*'). */
(function () {
  'use strict';
  var $ = NS.$, $$ = NS.$$, esc = NS.esc, num = NS.num, r2 = NS.r2, t = NS.t, money = NS.money;
  var root = $('#td');
  if (!root) return;
  /* id, old section, rate for individual/HUF payee, rate for others, threshold kind and amount
     kinds: year = TDS when the year's total exceeds; month = when the month's payment exceeds; c = 194C (single bill over 30,000 or year over 1 lakh);
     over = only on the part of the year's total above the limit (194Q); none = always */
  var SEC = [
    ['c', '194C', 1, 2, 'c', 0], ['jp', '194J', 10, 10, 'year', 50000], ['jt', '194J', 2, 2, 'year', 50000], ['jd', '194J', 10, 10, 'none', 0],
    ['h', '194H', 2, 2, 'year', 20000], ['il', '194I', 10, 10, 'month', 50000], ['im', '194I', 2, 2, 'month', 50000], ['ib', '194-IB', 2, 2, 'month', 50000],
    ['a', '194A', 10, 10, 'year', 10000], ['m', '194M', 2, 2, 'year', 5000000], ['q', '194Q', 0.1, 0.1, 'over', 5000000], ['tp', '194T', 10, 10, 'year', 20000]
  ];
  var LOW5 = { q: 1 };   /* no PAN: higher of 20% or twice the rate; 5% for purchase of goods */
  function S(id) { return SEC.filter(function (s) { return s[0] === id; })[0]; }
  function m(n) { return money(n, false); }
  function key(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }

  function calc() {
    var s = S($('#td-sec').value), who = $('#td-who').value, pan = $('#td-pan').value === 'yes';
    var amt = num($('#td-amt').value), ytd = num($('#td-ytd').value), date = $('#td-date').value || NS.today();
    var rate = who === 'ind' ? s[2] : s[3], base = amt, apply = false, why = '', catchup = false;
    if (s[4] === 'none') apply = true;
    /* once the year's total crosses the limit, TDS is due on the whole total: earlier payments without TDS are caught up now */
    else if (s[4] === 'c') { apply = amt > 30000 || ytd + amt > 100000; why = apply ? '' : t('td.no.c'); if (ytd + amt > 100000 && ytd <= 100000) { base = ytd + amt; catchup = ytd > 0; } }
    else if (s[4] === 'month') { apply = amt > s[5]; why = apply ? '' : t('td.no.m', { l: money(s[5]) }); }
    else if (s[4] === 'year') { apply = ytd + amt > s[5]; why = apply ? '' : t('td.no.y', { l: money(s[5]) }); if (apply && ytd <= s[5]) { base = ytd + amt; catchup = ytd > 0; } }
    else if (s[4] === 'over') { base = Math.max(0, ytd + amt - s[5]) - Math.max(0, ytd - s[5]); apply = base > 0; why = apply ? '' : t('td.no.q', { l: money(s[5]) }); }
    if (!pan) rate = LOW5[s[0]] ? 5 : Math.max(20, rate * 2);
    var tds = apply ? Math.round(base * rate / 100) : 0, gst = num($('#td-gst').value), pay = r2(amt + gst - tds);
    var d = new Date(date), dep = d.getMonth() === 2 ? new Date(d.getFullYear(), 3, 30) : new Date(d.getFullYear(), d.getMonth() + 1, 7);
    var old = date < '2026-04-01';
    var label = old ? t('td.sec.old', { o: s[1] }) : t('td.sec.new', { o: s[1] });
    $('#td-out').innerHTML = '<div class="g1-tiles"><div class="hi"><span>' + esc(t('td.k.tds')) + '</span><b>' + m(tds) + '</b></div><div><span>' + esc(t('td.k.rate')) + '</span><b>' + (apply ? rate + '%' : '—') + '</b></div>' +
      '<div><span>' + esc(t('td.k.pay')) + '</span><b>' + m(pay) + '</b></div><div><span>' + esc(t('td.k.dep')) + '</span><b>' + (apply ? esc(NS.fmtDate(dep.getFullYear() + '-' + ('0' + (dep.getMonth() + 1)).slice(-2) + '-' + ('0' + dep.getDate()).slice(-2))) : '—') + '</b></div></div>' +
      '<p><b>' + esc(label) + '</b> · ' + esc(t('td.s.' + s[0])) + '</p>' +
      (why ? '<p class="callout">' + esc(why) + '</p>' : '') +
      (apply ? '<p>' + esc(t('td.line', { b: money(base), r: rate, t: money(tds), g: money(gst), p: money(pay) })) + '</p>' : '') +
      (apply && catchup ? '<p class="callout">' + esc(t('td.catch', { y: money(ytd) })) + '</p>' : '') +
      (!pan ? '<p class="callout">' + esc(t('td.nopan')) + '</p>' : '') +
      (s[0] === 'c' && who === 'ind' ? '<p class="soft">' + esc(t('td.trans')) + '</p>' : '') +
      (s[0] === 'q' ? '<p class="soft">' + esc(t('td.q')) + '</p>' : '') +
      (s[0] === 'ib' ? '<p class="soft">' + esc(t('td.ib')) + '</p>' : '') +
      (old ? '<p class="soft">' + esc(t('td.oldnote')) + '</p>' : '');
    try { localStorage.setItem('ns-td', JSON.stringify({ sec: $('#td-sec').value, who: who })); } catch (e) {}
  }

  /* ---------- registers from saved documents ---------- */
  var DOCS = [];
  function vtotal(d) { return r2((d.lines || []).reduce(function (a, l) { return a + num(l.amt); }, 0)); }
  function registers() {
    var y = $('#td-fy').value, from = y + '-04-01', to = (+y + 1) + '-03-31', out = [], cut = [];
    DOCS.forEach(function (d) {
      if (!(d.date >= from && d.date <= to)) return;
      if (d.type === 'voucher' && num(d.tdsRate)) { var g = vtotal(d); out.push({ d: d, base: g, tds: r2(g * num(d.tdsRate) / 100) }); }
      if (d.type === 'receipt' && num(d.tds)) cut.push(d);
    });
    var bym = {};
    out.forEach(function (x) { var k = x.d.date.slice(0, 7) + '|' + (x.d.tdsSec || '—'); var b = bym[k] || (bym[k] = { mon: x.d.date.slice(0, 7), sec: x.d.tdsSec || '—', n: 0, base: 0, tds: 0 }); b.n++; b.base = r2(b.base + x.base); b.tds = r2(b.tds + x.tds); });
    var rows = Object.keys(bym).sort().map(function (k) { return bym[k]; });
    var mon = function (s) { var d = new Date(s + '-01'); return d.toLocaleString('en-IN', { month: 'short', year: 'numeric' }); };
    var depOf = function (s) { var y2 = +s.slice(0, 4), mo = +s.slice(5, 7); return mo === 3 ? '30 Apr ' + y2 : '7 ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mo % 12] + ' ' + (mo === 12 ? y2 + 1 : y2); };
    var tbl = function (head, body) { return body.length ? '<div class="g1-tw"><table class="g1-t"><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + body.map(function (r) { return '<tr>' + r.map(function (c) { return '<td' + (typeof c === 'number' ? ' class="n"' : '') + '>' + esc(typeof c === 'number' ? m(c) : c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' : '<p class="soft">' + esc(t('g1.none')) + '</p>'; };
    $('#td-reg').innerHTML = '<h3>' + esc(t('td.h.reg')) + '</h3><p class="soft">' + esc(t('td.h.regh')) + '</p>' +
      tbl([t('td.c.mon'), t('td.c.sec'), t('td.c.n'), t('td.c.base'), t('td.k.tds'), t('td.k.dep')], rows.map(function (r) { return [mon(r.mon), r.sec, String(r.n), r.base, r.tds, depOf(r.mon)]; })) +
      '<h3>' + esc(t('td.h.cut')) + '</h3><p class="soft">' + esc(t('td.h.cuth')) + '</p>' +
      tbl([t('g1.c.date'), t('td.c.no'), t('td.c.from'), t('td.c.recd'), t('td.k.tds')], cut.map(function (d) { return [NS.fmtDate(d.date), d.no || '', d.buyer && d.buyer.name || '', num(d.amount), num(d.tds)]; }));
  }
  function start() {
    $('#td-sec').innerHTML = SEC.map(function (s) { return '<option value="' + s[0] + '">' + esc(t('td.s.' + s[0])) + ' (393, old ' + s[1] + ')</option>'; }).join('');
    $('#td-date').value = NS.today();
    var sv = {}; try { sv = JSON.parse(localStorage.getItem('ns-td') || '{}'); } catch (e) {}
    if (sv.sec && S(sv.sec)) $('#td-sec').value = sv.sec;
    if (sv.who) $('#td-who').value = sv.who;
    var d = new Date(), fy = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    $('#td-fy').innerHTML = [fy, fy - 1, fy - 2].map(function (y) { return '<option value="' + y + '">' + y + '-' + String(y + 1).slice(2) + '</option>'; }).join('');
    calc();
    root.addEventListener('input', function (e) { if (e.target.closest('.td-calc')) calc(); });
    root.addEventListener('change', function (e) { if (e.target.closest('.td-calc')) calc(); else if (e.target.id === 'td-fy') registers(); });
    root.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && b.dataset.do === 'print') window.print(); });
    NSStore.ready().then(function () { return NSStore.list('doc'); }).then(function (x) { DOCS = x || []; registers(); }).catch(function () { $('#td-reg').textContent = t('g1.fail'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

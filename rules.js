/*
 * IPilot KG — налоговые правила и расчёты.
 * Считает только этот модуль. ИИ получает готовые цифры и объясняет их.
 *
 * Источники (проверено 24.10.2026):
 *  - sti.gov.kg, раздел «Индивидуальные предприниматели»: «Единый налог» (ставки ст. 423 НК КР),
 *    «Единая налоговая декларация», «Налог на основе патента в сфере торговли»,
 *    «Порядок представления налоговой отчетности».
 *  - FORM STI-091_10 и порядок заполнения (приказ ГНС № П-354 от 27.08.2026).
 *  - economist.kg: сроки единого налога в 2026 году; ставки общепита с августа 2026.
 */
(function (root) {
  'use strict';

  var RULES_VERSION = '24.10.2026';

  var IP_SECTION = 'https://sti.gov.kg/section/' + encodeURIComponent('Индивидуальные предприниматели');

  var SOURCES = {
    rates: {
      title: 'Единый налог: ставки ст. 423 НК КР — sti.gov.kg',
      url: IP_SECTION + '?doc=01a0c31c-eb96-718c-ae42-6dc183d1d476'
    },
    form091: {
      title: 'FORM STI-091_10 и порядок заполнения (приказ ГНС № П-354 от 27.08.2026)',
      url: 'https://sti.gov.kg/'
    },
    end: {
      title: 'Единая налоговая декларация — sti.gov.kg',
      url: IP_SECTION + '?doc=01a0c294-836c-70f2-9290-cd0f5deb23b4'
    },
    patent: {
      title: 'Налог на основе патента в сфере торговли — sti.gov.kg',
      url: IP_SECTION + '?doc=01a070ec-196a-7a14-8361-114f5398c744'
    },
    submit: {
      title: 'Порядок представления налоговой отчетности — sti.gov.kg',
      url: IP_SECTION + '?doc=01a0aed0-4b66-7b2e-8716-7ad24867b8db'
    },
    deadlines: {
      title: 'Сроки единого налога в 2026 году — economist.kg',
      url: 'https://economist.kg/biznes/2026/02/27/kak-i-koghda-bizniesu-v-kyrghyzstanie-platit-iedinyi-nalogh-v-2026-ghodu-podrobnosti/'
    },
    catering: {
      title: 'Новые ставки единого налога (август 2026) — economist.kg',
      url: 'https://economist.kg/biznes/2026/08/08/novye-stavki-edinogo-naloga/'
    }
  };

  /* ---------- Границы категорий бизнеса (по выручке за 12 месяцев) ---------- */
  var SMALL_MAX = 8000000;     // до 8 млн — малый, квартальный период
  var MEDIUM_MAX = 50000000;   // 8–50 млн — средний, свыше — крупный; период — месяц

  function category(revenue12) {
    if (revenue12 <= SMALL_MAX) return 'small';
    if (revenue12 <= MEDIUM_MAX) return 'medium';
    return 'large';
  }

  /* ---------- Строки формы STI-091_10 ---------- */
  var ROWS = {
    tradeA: {
      label: 'Торговая деятельность (п. «А»: выручка до 50 000 000 сом за 12 месяцев)',
      split: false,
      cells: { base: '050', rate: '051', tax: '052' }
    },
    tradeB: {
      label: 'Торговая деятельность (п. «Б»)',
      split: true,
      cash: { base: '053', rate: '054', tax: '055' },
      noncash: { base: '056', rate: '057', tax: '058' },
      total: '059'
    },
    production: {
      label: 'Переработка с/х продукции, производство, туризм, разработка ПО',
      split: true,
      cash: { base: '060', rate: '061', tax: '062' },
      noncash: { base: '063', rate: '064', tax: '065' },
      total: '066'
    },
    services: {
      label: 'Остальные виды деятельности (услуги)',
      split: true,
      cash: { base: '067', rate: '068', tax: '069' },
      noncash: { base: '070', rate: '071', tax: '072' },
      total: '073'
    },
    catering: {
      label: 'Общественное питание',
      split: true,
      cash: { base: '074', rate: '075', tax: '076' },
      noncash: { base: '077', rate: '078', tax: '079' },
      total: '080'
    }
  };

  /* ---------- Патент в торговле: годовые суммы (sti.gov.kg) ---------- */
  var PATENT = {
    stall: [ { max: 4000000, sum: 18000 } ],
    container: [
      { max: 8000000, sum: 42000 },
      { max: 12000000, sum: 72000 },
      { max: 15000000, sum: 96000 },
      { max: 22000000, sum: 168000 },
      { max: 30000000, sum: 252000 },
      { max: 50000000, sum: 360000 },
      { max: 100000000, sum: 500000 },
      { max: 150000000, sum: 800000 },
      { max: 200000000, sum: 900000 },
      { max: Infinity, sum: 1000000 }
    ],
    shop30: [
      { max: 5000000, sum: 42000 },
      { max: 10000000, sum: 72000 },
      { max: 15000000, sum: 96000 }
    ]
  };

  /* ---------- Главная функция: что за ИП и по каким правилам он платит ---------- */
  function analyzeProfile(p) {
    var r = {
      supported: true,
      reason: '',
      regime: p.regime,
      category: category(p.revenue12 || 0),
      period: 'quarter',
      row: null,
      rowKey: null,
      rates: null,
      endRequired: true,
      endReason: '',
      sources: [],
      warnings: [],
      notes: [],
      patent: null,
      legalRates: null,
      customApplied: false
    };
    var custom = p.regime === 'patent' ? null : customRateOf(p);
    // Цикл отчёта и оплаты выбирает сам ИП: каждый месяц или раз в квартал
    r.period = p.cycle === 'month' ? 'month' : 'quarter';

    if (p.regime === 'patent') {
      r.period = 'month';
      r.endRequired = false;
      r.endReason = 'ИП на патенте освобождены от ЕНД.';
      r.sources = ['patent', 'end'];
      if (p.importExport || p.distributor) {
        r.supported = false;
        r.reason = 'Патент не применяют при импорте/экспорте и дистрибьюторам. Нужен единый налог или общий режим.';
        return r;
      }
      if (p.specialZone) {
        r.supported = false;
        r.reason = 'В зоне торговли с особым режимом (Дордой, Мадина, Туратали) действует отдельный налог. Мы его пока не считаем.';
        return r;
      }
      var tiers = PATENT[p.patentPlace || 'container'] || PATENT.container;
      var tier = null;
      for (var i = 0; i < tiers.length; i++) { if ((p.revenue12 || 0) <= tiers[i].max) { tier = tiers[i]; break; } }
      if (!tier) {
        r.supported = false;
        r.reason = 'Для такой выручки этот вид патента не подходит. Уточните в ГНС: 116.';
        return r;
      }
      r.patent = { annual: tier.sum, monthly: Math.round(tier.sum / 12), place: p.patentPlace || 'container' };
      return r;
    }

    // Единый налог
    if (p.specialZone) {
      r.supported = false;
      r.reason = 'В зоне торговли с особым режимом (Дордой, Мадина, Туратали) действует отдельный налог. Мы его пока не считаем.';
      return r;
    }

    switch (p.activity) {
      case 'trade':
        var isA = !p.importExport && !p.distributor && !p.pharmaFuel && (p.revenue12 || 0) <= MEDIUM_MAX;
        if (isA) { r.rowKey = 'tradeA'; r.rates = { cash: 0.5, noncash: 0.5 }; }
        else { r.rowKey = 'tradeB'; r.rates = { cash: 4, noncash: 2 }; }
        break;
      case 'production':
        r.rowKey = 'production'; r.rates = { cash: 4, noncash: 2 };
        break;
      case 'services':
        r.rowKey = 'services'; r.rates = { cash: 6, noncash: 4 };
        break;
      case 'catering':
        r.rowKey = 'catering';
        if (p.city === 'bishkek' || p.city === 'osh') {
          r.rates = { cash: 5, noncash: 5 };
          r.warnings.push('Ставка 5% для общепита в Бишкеке и Оше взята из закона от 06.08.2026 (economist.kg). На странице ГНС её пока нет. Уточните в 116.');
          r.sources.push('catering');
        } else {
          r.rates = { cash: 3, noncash: 3 };
        }
        break;
      default:
        if (!custom) {
          r.supported = false;
          r.reason = 'Этот вид деятельности (швейное, ювелирка, стройка, сауна и др.) мы пока не считаем. Укажите свою ставку в профиле или уточните в ГНС: 116.';
          return r;
        }
        r.rowKey = 'services'; r.rates = null;
        r.notes.push('Ваш вид деятельности не входит в таблицу приложения: налог считаем по вашей ставке в строке «Остальные виды деятельности». Проверьте строку формы в кабинете.');
    }
    r.row = ROWS[r.rowKey];
    r.legalRates = r.rates;

    if (custom) {
      // Своя ставка ИП: применяется вместо табличной
      var nc = r.row.split ? custom.noncash : custom.cash;
      r.rates = { cash: custom.cash, noncash: nc };
      r.customApplied = true;
      if (!r.legalRates || r.legalRates.cash !== r.rates.cash || r.legalRates.noncash !== r.rates.noncash) {
        r.notes.push('Своя ставка: ' + rateText(r.rates, r.row.split) + '.' +
          (r.legalRates ? ' По таблице ГНС для вашего вида деятельности: ' + rateText(r.legalRates, r.row.split) + '.' : '') +
          ' Если не уверены, уточните в ГНС: 116.');
      }
    }

    var anyRate = r.rates.cash;
    if (anyRate === 0 || anyRate === 0.1 || anyRate === 0.5) {
      r.endRequired = false;
      r.endReason = 'ИП на едином налоге по ставке ' + fmtRate(anyRate) + ' освобождены от ЕНД.';
    } else {
      r.endRequired = true;
      r.endReason = 'ЕНД за год нужно сдать до 1 мая следующего года.';
    }
    r.sources = ['rates', 'form091', 'deadlines', 'end'].concat(r.sources);
    return r;
  }

  // Своя ставка из профиля: { on: true, cash: 2, noncash: 1 } → числа или null
  function customRateOf(p) {
    var c = p && p.customRate;
    if (!c || !c.on) return null;
    var cash = toRate(c.cash);
    if (cash == null) return null;
    var non = toRate(c.noncash);
    return { cash: cash, noncash: non == null ? cash : non };
  }
  function toRate(v) {
    if (v === '' || v == null) return null;
    var n = parseFloat(String(v).replace(',', '.'));
    return isFinite(n) && n >= 0 && n <= 100 ? Math.round(n * 100) / 100 : null;
  }
  function rateText(rates, split) {
    return (!split || rates.cash === rates.noncash) ? fmtRate(rates.cash) : fmtRate(rates.cash) + ' наличными, ' + fmtRate(rates.noncash) + ' безналом';
  }

  /* ---------- Периоды и сроки ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseISO(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }

  // Период, в который входит дата
  function periodOf(date, kind) {
    var y = date.getFullYear(), m = date.getMonth();
    if (kind === 'month') {
      return { kind: 'month', year: y, index: m, start: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
    }
    var q = Math.floor(m / 3);
    return { kind: 'quarter', year: y, index: q, start: new Date(y, q * 3, 1), end: new Date(y, q * 3 + 3, 0) };
  }
  function shiftPeriod(per, delta) {
    var d = new Date(per.start.getFullYear(), per.start.getMonth() + (per.kind === 'month' ? delta : delta * 3), 1);
    return periodOf(d, per.kind);
  }
  // Срок отчёта и оплаты единого налога: 20 число месяца, следующего за периодом
  function deadlineOf(per) {
    return new Date(per.end.getFullYear(), per.end.getMonth() + 1, 20);
  }
  var MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  var MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var ROMAN = ['I', 'II', 'III', 'IV'];
  function periodLabel(per) {
    if (per.kind === 'month') return MONTHS[per.index].charAt(0).toUpperCase() + MONTHS[per.index].slice(1) + ' ' + per.year;
    return ROMAN[per.index] + ' квартал ' + per.year;
  }
  function dateLabel(d) { return d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + ' ' + d.getFullYear(); }
  function daysBetween(a, b) {
    var A = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var B = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((B - A) / 86400000);
  }

  /* ---------- Расчёт налога за период ---------- */
  function round2(x) { return Math.round(x * 100) / 100; }

  function sumRevenue(entries, per) {
    var s = { cash: 0, noncash: 0, count: 0 };
    var from = iso(per.start), to = iso(per.end);
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.date >= from && e.date <= to) {
        s.cash += +e.cash || 0;
        s.noncash += +e.noncash || 0;
        s.count++;
      }
    }
    s.cash = round2(s.cash); s.noncash = round2(s.noncash);
    s.total = round2(s.cash + s.noncash);
    return s;
  }

  function computeReport(profile, analysis, entries, per) {
    var s = sumRevenue(entries, per);
    var out = {
      period: per,
      periodLabel: periodLabel(per),
      from: iso(per.start),
      to: iso(per.end),
      deadline: iso(deadlineOf(per)),
      revenue: s,
      cells: [],
      tax: 0,
      formula: '',
      row: analysis.row
    };
    if (!analysis.supported || analysis.regime === 'patent') return out;

    var row = analysis.row, rates = analysis.rates;
    if (!row.split) {
      // Одна строка без деления на наличные/безналичные
      var base = s.total, tax = round2(base * rates.cash / 100);
      out.cells.push({ code: row.cells.base, label: 'Выручка за период', role: 'base', value: base, kind: 'money' });
      out.cells.push({ code: row.cells.rate, label: 'Ставка, %', role: 'rate', value: rates.cash, kind: 'rate' });
      out.cells.push({ code: row.cells.tax, label: 'Сумма единого налога', role: 'tax', value: tax, kind: 'money' });
      out.tax = tax;
      out.formula = fmtMoney(base) + ' × ' + fmtRate(rates.cash) + ' = ' + fmtMoney(tax);
    } else {
      var tc = round2(s.cash * rates.cash / 100), tn = round2(s.noncash * rates.noncash / 100);
      out.cells.push({ code: row.cash.base, label: 'Выручка наличными', role: 'base_cash', value: s.cash, kind: 'money' });
      out.cells.push({ code: row.cash.rate, label: 'Ставка (наличные), %', role: 'rate_cash', value: rates.cash, kind: 'rate' });
      out.cells.push({ code: row.cash.tax, label: 'Налог с наличных', role: 'tax_cash', value: tc, kind: 'money' });
      out.cells.push({ code: row.noncash.base, label: 'Выручка безналом', role: 'base_noncash', value: s.noncash, kind: 'money' });
      out.cells.push({ code: row.noncash.rate, label: 'Ставка (безнал), %', role: 'rate_noncash', value: rates.noncash, kind: 'rate' });
      out.cells.push({ code: row.noncash.tax, label: 'Налог с безнала', role: 'tax_noncash', value: tn, kind: 'money' });
      out.cells.push({ code: row.total, label: 'Итого по строке', role: 'row_total', value: round2(tc + tn), kind: 'money' });
      out.tax = round2(tc + tn);
      out.formula = fmtMoney(s.cash) + ' × ' + fmtRate(rates.cash) + ' + ' + fmtMoney(s.noncash) + ' × ' + fmtRate(rates.noncash) + ' = ' + fmtMoney(out.tax);
    }
    out.cells.push({ code: '193', label: 'Итого налогооблагаемая база', role: 'total_base', value: s.total, kind: 'money', total: true });
    out.cells.push({ code: '194', label: 'Общая сумма единого налога', role: 'total_tax', value: out.tax, kind: 'money', total: true });
    return out;
  }

  /* ---------- Ближайшие сроки (для напоминаний) ---------- */
  function upcomingDeadlines(profile, analysis, today, entries) {
    var list = [];
    if (!analysis.supported) return list;
    if (analysis.regime === 'patent') {
      for (var k = 1; k <= 3; k++) {
        var d = new Date(today.getFullYear(), today.getMonth() + k, 1);
        list.push({
          id: 'patent-' + iso(d), date: iso(d), kind: 'patent',
          title: 'Оплата патента за ' + MONTHS[d.getMonth()],
          detail: 'Сумма около ' + fmtMoney(analysis.patent.monthly) + ' (годовая ' + fmtMoney(analysis.patent.annual) + ' / 12). Отчёт не нужен.',
          amount: analysis.patent.monthly
        });
      }
      return list;
    }
    var cur = periodOf(today, analysis.period);
    var prev = shiftPeriod(cur, -1);
    var prevDl = deadlineOf(prev);
    if (daysBetween(today, prevDl) >= 0) {
      var rp = computeReport(profile, analysis, entries || [], prev);
      list.push({ id: 'en-' + iso(prev.start), date: iso(prevDl), kind: 'report',
        title: 'Отчёт STI-091 и оплата единого налога', periodLabel: periodLabel(prev),
        detail: 'За ' + periodLabel(prev) + '. Налог: ' + fmtMoney(rp.tax) + '.', amount: rp.tax });
    }
    var rc = computeReport(profile, analysis, entries || [], cur);
    list.push({ id: 'en-' + iso(cur.start), date: iso(deadlineOf(cur)), kind: 'report',
      title: 'Отчёт STI-091 и оплата единого налога', periodLabel: periodLabel(cur),
      detail: 'За ' + periodLabel(cur) + '. Пока набралось налога: ' + fmtMoney(rc.tax) + '.', amount: rc.tax, current: true });
    // Вперёд: при ежемесячном цикле — 2 следующих месяца, при квартальном — следующий квартал
    var ahead = analysis.period === 'month' ? 2 : 1;
    for (var k2 = 1; k2 <= ahead; k2++) {
      var next = shiftPeriod(cur, k2);
      list.push({ id: 'en-' + iso(next.start), date: iso(deadlineOf(next)), kind: 'report',
        title: 'Отчёт STI-091 и оплата единого налога', periodLabel: periodLabel(next),
        detail: 'За ' + periodLabel(next) + '.' });
    }
    var endDate = new Date(today.getFullYear() + (today.getMonth() >= 4 ? 1 : 0), 4, 1);
    list.push({ id: 'end-' + endDate.getFullYear(), date: iso(endDate), kind: 'end',
      title: 'Единая налоговая декларация (STI-102)',
      detail: analysis.endRequired ? 'За ' + (endDate.getFullYear() - 1) + ' год. ' + analysis.endReason : analysis.endReason + ' Подавать не нужно.',
      notRequired: !analysis.endRequired });
    list.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return list;
  }

  /* ---------- Форматирование ---------- */
  function fmtMoney(x) {
    var n = Math.round((+x || 0) * 100) / 100;
    var whole = Math.trunc(n), frac = Math.round(Math.abs(n - whole) * 100);
    var s = String(Math.abs(whole)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    return (n < 0 ? '−' : '') + s + (frac ? ',' + pad(frac) : '') + '\u00a0сом';
  }
  function fmtRate(r) { return String(r).replace('.', ',') + '%'; }

  /* ---------- Календарь: файл .ics и ссылка Google Календаря ---------- */
  function icsFor(events) {
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IPilot KG//RU', 'CALSCALE:GREGORIAN'];
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    events.forEach(function (e) {
      var d = e.date.replace(/-/g, '');
      var nd = iso(new Date(parseISO(e.date).getTime() + 86400000)).replace(/-/g, '');
      lines.push('BEGIN:VEVENT', 'UID:' + e.id + '@ipilot.kg', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + nd,
        'SUMMARY:' + icsEsc('IPilot: ' + e.title), 'DESCRIPTION:' + icsEsc(e.detail || ''),
        'BEGIN:VALARM', 'TRIGGER:-P5D', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc('Через 5 дней: ' + e.title), 'END:VALARM',
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc('Завтра: ' + e.title), 'END:VALARM',
        'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }
  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function googleCalUrl(e) {
    var d = e.date.replace(/-/g, '');
    var nd = iso(new Date(parseISO(e.date).getTime() + 86400000)).replace(/-/g, '');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent('IPilot: ' + e.title) +
      '&dates=' + d + '/' + nd +
      '&details=' + encodeURIComponent((e.detail || '') + '\nНапоминание от IPilot KG');
  }

  var api = {
    RULES_VERSION: RULES_VERSION, SOURCES: SOURCES, ROWS: ROWS, PATENT: PATENT,
    category: category, analyzeProfile: analyzeProfile,
    periodOf: periodOf, shiftPeriod: shiftPeriod, deadlineOf: deadlineOf, periodLabel: periodLabel,
    dateLabel: dateLabel, daysBetween: daysBetween, iso: iso, parseISO: parseISO,
    sumRevenue: sumRevenue, computeReport: computeReport, upcomingDeadlines: upcomingDeadlines,
    fmtMoney: fmtMoney, fmtRate: fmtRate, icsFor: icsFor, googleCalUrl: googleCalUrl, MONTHS: MONTHS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IPRules = api;
})(this);

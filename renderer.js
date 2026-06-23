const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
};

let store = { months: {}, currency: 'USD' };
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();
let editingDay = null;

const $ = (id) => document.getElementById(id);

function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function getMonthData() {
  const key = monthKey(viewYear, viewMonth);
  if (!store.months[key]) store.months[key] = {};
  return store.months[key];
}

function parseAmount(raw) {
  if (raw == null || String(raw).trim() === '') return null;
  let s = String(raw).trim().replace(/,/g, '').replace(/\$/g, '').replace(/[€£¥]/g, '');
  const negative = s.startsWith('-') || (s.startsWith('(') && s.endsWith(')'));
  s = s.replace(/[()]/g, '').replace(/^\+/, '').replace(/^-/, '');
  const match = s.match(/^([\d.]+)\s*([kKmMbB])?$/);
  if (!match) {
    const n = Number(s);
    if (Number.isNaN(n)) return NaN;
    return negative ? -n : n;
  }
  let val = parseFloat(match[1]);
  const suffix = (match[2] || '').toLowerCase();
  if (suffix === 'k') val *= 1e3;
  else if (suffix === 'm') val *= 1e6;
  else if (suffix === 'b') val *= 1e9;
  return negative ? -val : val;
}

function formatCompact(amount, { showSign = true } = {}) {
  const sym = CURRENCY_SYMBOLS[store.currency] || '$';
  const abs = Math.abs(amount);
  let text;
  if (abs >= 1e6) text = `${(abs / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  else if (abs >= 1e3) text = `${(abs / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  else if (store.currency === 'JPY') text = Math.round(abs).toLocaleString();
  else text = abs % 1 === 0 ? String(Math.round(abs)) : abs.toFixed(2);

  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  const prefix = showSign && amount !== 0 ? sign : amount < 0 ? '-' : '';
  return `${prefix}${sym}${text}`;
}

function formatStatTotal(amount) {
  const sym = CURRENCY_SYMBOLS[store.currency] || '$';
  const abs = Math.abs(amount);
  if (abs >= 1e6) return `${sym}${Math.round(abs / 1e6)}M`;
  if (abs >= 1e3) return `${sym}${Math.round(abs / 1e3)}K`;
  return `${sym}${Math.round(abs).toLocaleString()}`;
}

async function persist() {
  if (window.pnlApi) await window.pnlApi.saveData(store);
}

function computeStats(days) {
  let winCount = 0;
  let lossCount = 0;
  let winTotal = 0;
  let lossTotal = 0;
  let net = 0;
  let bestDay = null;
  let bestVal = -Infinity;

  for (const [day, val] of Object.entries(days)) {
    const n = Number(val);
    if (Number.isNaN(n) || n === 0) continue;
    net += n;
    if (n > 0) {
      winCount += 1;
      winTotal += n;
      if (n > bestVal) {
        bestVal = n;
        bestDay = Number(day);
      }
    } else {
      lossCount += 1;
      lossTotal += Math.abs(n);
    }
  }

  return { winCount, lossCount, winTotal, lossTotal, net, bestDay };
}

function renderSummary() {
  const days = getMonthData();
  const { winCount, lossCount, winTotal, lossTotal, net } = computeStats(days);

  const totalEl = $('total-pnl');
  totalEl.textContent = net === 0 ? `${CURRENCY_SYMBOLS[store.currency]}0` : formatCompact(net);
  totalEl.className = 'total-pnl ' + (net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral');

  const winBar = $('progress-win');
  const lossBar = $('progress-loss');
  const magnitude = winTotal + lossTotal;
  if (magnitude === 0) {
    winBar.style.width = net >= 0 ? '100%' : '0%';
    lossBar.style.width = net < 0 ? '100%' : '0%';
  } else {
    winBar.style.width = `${(winTotal / magnitude) * 100}%`;
    lossBar.style.width = `${(lossTotal / magnitude) * 100}%`;
  }

  $('stat-win').textContent = `${winCount} / ${formatStatTotal(winTotal)}`;
  $('stat-loss').textContent = `${lossCount} / ${formatStatTotal(lossTotal)}`;
}

function renderCalendar() {
  const cal = $('calendar');
  cal.innerHTML = '';

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mon=0
  const monthDays = getMonthData();
  const { bestDay } = computeStats(monthDays);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  for (let i = 0; i < 42; i++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    const dayNum = i - firstDow + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cell.classList.add('empty');
      cal.appendChild(cell);
      continue;
    }

    const val = monthDays[String(dayNum)];
    const hasValue = val != null && val !== '' && !Number.isNaN(Number(val)) && Number(val) !== 0;
    const num = hasValue ? Number(val) : 0;

    cell.dataset.day = String(dayNum);

    const numSpan = document.createElement('span');
    numSpan.className = 'day-num';
    numSpan.textContent = dayNum;
    cell.appendChild(numSpan);

    if (hasValue) {
      const pnlSpan = document.createElement('span');
      pnlSpan.className = 'pnl-value';
      pnlSpan.textContent = formatCompact(num);
      cell.appendChild(pnlSpan);

      if (num > 0) cell.classList.add('win');
      else cell.classList.add('loss');
      if (bestDay === dayNum && num > 0) cell.classList.add('best');
    }

    if (isCurrentMonth && dayNum === today.getDate()) {
      cell.classList.add('today');
    }

    cell.addEventListener('click', () => openEdit(dayNum, hasValue ? num : ''));
    cal.appendChild(cell);
  }

  $('month-label').textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  renderSummary();
}

function openEdit(day, current) {
  editingDay = day;
  const date = new Date(viewYear, viewMonth, day);
  $('edit-date-label').textContent = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  $('pnl-input').value = current === '' || current == null ? '' : String(current);
  $('edit-modal').classList.remove('hidden');
  $('pnl-input').focus();
  $('pnl-input').select();
}

function closeEdit() {
  editingDay = null;
  $('edit-modal').classList.add('hidden');
}

function saveEdit() {
  const raw = $('pnl-input').value;
  const days = getMonthData();
  const key = String(editingDay);

  if (raw.trim() === '') {
    delete days[key];
  } else {
    const parsed = parseAmount(raw);
    if (Number.isNaN(parsed)) {
      $('pnl-input').style.borderColor = 'var(--red)';
      return;
    }
    days[key] = parsed;
  }

  persist();
  closeEdit();
  renderCalendar();
}

function changeMonth(delta) {
  viewMonth += delta;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear += 1;
  } else if (viewMonth < 0) {
    viewMonth = 11;
    viewYear -= 1;
  }
  renderCalendar();
}

async function init() {
  if (window.pnlApi) {
    store = await window.pnlApi.loadData();
    if (!store.months) store.months = {};
    if (!store.currency) store.currency = 'USD';
  }

  $('currency-select').value = store.currency;

  $('prev-month').addEventListener('click', () => changeMonth(-1));
  $('next-month').addEventListener('click', () => changeMonth(1));
  $('currency-select').addEventListener('change', (e) => {
    store.currency = e.target.value;
    persist();
    renderCalendar();
  });

  $('save-edit').addEventListener('click', saveEdit);
  $('cancel-edit').addEventListener('click', closeEdit);
  $('modal-backdrop').addEventListener('click', closeEdit);
  $('clear-day').addEventListener('click', () => {
    $('pnl-input').value = '';
    saveEdit();
  });

  $('pnl-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') closeEdit();
  });

  $('close-btn').addEventListener('click', () => {
    if (window.pnlApi) window.pnlApi.closeWindow?.();
    else window.close();
  });

  $('export-btn').addEventListener('click', async () => {
    if (!window.pnlApi) return;
    await window.pnlApi.exportJson(JSON.stringify(store, null, 2));
  });

  $('import-btn').addEventListener('click', async () => {
    if (!window.pnlApi) return;
    const result = await window.pnlApi.importJson();
    if (result?.ok && result.data) {
      store = {
        months: result.data.months || result.data,
        currency: result.data.currency || store.currency,
      };
      $('currency-select').value = store.currency;
      await persist();
      renderCalendar();
    }
  });

  renderCalendar();
}

init();

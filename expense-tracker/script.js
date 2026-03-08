const STORAGE_KEY = 'expense-tracker-data';

const CATEGORY_COLORS = {
  food: '#f97316',
  transport: '#3b82f6',
  entertainment: '#a855f7',
  bills: '#ef4444',
  shopping: '#ec4899',
  salary: '#22c55e',
  other: '#6b7280',
};

const state = {
  transactions: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatCurrency(n) {
  return '$' + Math.abs(n).toFixed(2);
}

function getFiltered() {
  const cat = document.getElementById('filter-category').value;
  const from = document.getElementById('filter-from').value;
  const to = document.getElementById('filter-to').value;

  return state.transactions.filter(tx => {
    if (cat !== 'all' && tx.category !== cat) return false;
    if (from && tx.date < from) return false;
    if (to && tx.date > to) return false;
    return true;
  });
}

function updateSummary() {
  const txs = state.transactions;
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  document.getElementById('balance').textContent = formatCurrency(income - expense);
  document.getElementById('income').textContent = formatCurrency(income);
  document.getElementById('expenses').textContent = formatCurrency(expense);
}

function renderList() {
  const list = document.getElementById('tx-list');
  const filtered = getFiltered().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-msg">No transactions yet</div>';
    return;
  }

  list.innerHTML = filtered.map(tx => `
    <div class="tx-item" data-id="${tx.id}">
      <span class="tx-cat">${tx.category}</span>
      <div class="tx-info">
        <div class="tx-desc-text">${escapeHtml(tx.description || tx.category)}</div>
        <div class="tx-date-text">${tx.date}</div>
      </div>
      <span class="tx-amount ${tx.type === 'income' ? 'positive' : 'negative'}">
        ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
      </span>
      <button class="tx-delete" data-id="${tx.id}" aria-label="Delete">&times;</button>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ---- Pie Chart ---- */
function drawPieChart() {
  const canvas = document.getElementById('pie-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 300 * dpr;
  canvas.height = 300 * dpr;
  ctx.scale(dpr, dpr);

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 110;

  ctx.clearRect(0, 0, size, size);

  const expenses = state.transactions.filter(t => t.type === 'expense');
  const byCategory = {};
  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, e) => s + e[1], 0);

  const legend = document.getElementById('pie-legend');

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data', cx, cy + 5);
    legend.innerHTML = '';
    return;
  }

  let startAngle = -Math.PI / 2;
  entries.forEach(([cat, amount]) => {
    const slice = (amount / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = CATEGORY_COLORS[cat] || '#6b7280';
    ctx.fill();
    startAngle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(formatCurrency(total), cx, cy + 6);

  legend.innerHTML = entries.map(([cat, amount]) => `
    <div class="legend-item">
      <span class="swatch" style="background:${CATEGORY_COLORS[cat] || '#6b7280'}"></span>
      ${cat} (${Math.round((amount / total) * 100)}%)
    </div>
  `).join('');
}

/* ---- Bar Chart ---- */
function drawBarChart() {
  const canvas = document.getElementById('bar-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = 500;
  const h = 300;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const expenses = state.transactions.filter(t => t.type === 'expense');
  const byDay = {};
  expenses.forEach(t => {
    byDay[t.date] = (byDay[t.date] || 0) + t.amount;
  });

  const days = Object.keys(byDay).sort();
  const last7 = days.slice(-7);

  if (last7.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data', w / 2, h / 2);
    return;
  }

  const values = last7.map(d => byDay[d]);
  const maxVal = Math.max(...values, 1);

  const padding = { top: 20, right: 20, bottom: 50, left: 60 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const barW = Math.min(40, (chartW / last7.length) * 0.6);
  const gap = chartW / last7.length;

  // Grid lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(formatCurrency(maxVal - (maxVal / 4) * i), padding.left - 8, y + 4);
  }

  // Bars
  last7.forEach((day, i) => {
    const val = byDay[day];
    const barH = (val / maxVal) * chartH;
    const x = padding.left + gap * i + (gap - barW) / 2;
    const y = padding.top + chartH - barH;

    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, '#818cf8');
    grad.addColorStop(1, '#6366f1');
    ctx.fillStyle = grad;

    roundRect(ctx, x, y, barW, barH, 4);

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const label = day.slice(5); // MM-DD
    ctx.fillText(label, x + barW / 2, h - padding.bottom + 18);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  if (h < 1) return;
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function render() {
  updateSummary();
  renderList();
  drawPieChart();
  drawBarChart();
}

/* ---- Export CSV ---- */
function exportCSV() {
  if (state.transactions.length === 0) return;

  const header = 'Type,Amount,Category,Date,Description';
  const rows = state.transactions.map(t =>
    `${t.type},${t.amount},${t.category},${t.date},"${(t.description || '').replace(/"/g, '""')}"`
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tx-date').valueAsDate = new Date();

  document.getElementById('tx-form').addEventListener('submit', e => {
    e.preventDefault();
    const type = document.getElementById('tx-type').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    if (!amount || amount <= 0) return;

    state.transactions.push({
      id: generateId(),
      type,
      amount,
      category: document.getElementById('tx-category').value,
      date: document.getElementById('tx-date').value,
      description: document.getElementById('tx-desc').value.trim(),
    });

    save();
    render();
    e.target.reset();
    document.getElementById('tx-date').valueAsDate = new Date();
  });

  document.getElementById('tx-list').addEventListener('click', e => {
    const btn = e.target.closest('.tx-delete');
    if (!btn) return;
    state.transactions = state.transactions.filter(t => t.id !== btn.dataset.id);
    save();
    render();
  });

  document.getElementById('filter-category').addEventListener('change', renderList);
  document.getElementById('filter-from').addEventListener('change', renderList);
  document.getElementById('filter-to').addEventListener('change', renderList);

  document.getElementById('export-btn').addEventListener('click', exportCSV);

  render();
});

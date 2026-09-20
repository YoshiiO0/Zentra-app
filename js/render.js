/* ============================================
   RENDER.JS
   Todo lo que "dibuja" pantalla vive aquí. La regla de oro:
   estas funciones LEEN App.state pero nunca lo modifican.
   Quien modifica datos vive en modals.js, y siempre llama
   a App.renderAll() después para reflejar el cambio.
   ============================================ */

window.App = window.App || {};

// ---------- Fecha del mes que se está viendo ----------
App.currentMonthDate = function () {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + App.ui.monthOffset);
  return d;
};

App.monthTx = function () {
  const mk = App.monthKey(App.currentMonthDate());
  return App.state.transactions.filter(t => App.txMonthKey(t) === mk);
};

// ---------- Estructura general de la app (se llama 1 vez) ----------
App.render = function () {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header>
      <div class="month-row">
        <button id="prevMonth">‹</button>
        <div class="month-label serif" id="monthLabel"></div>
        <button id="nextMonth">›</button>
      </div>
      <div class="balance-label">Balance del mes</div>
      <div class="balance serif num" id="balanceEl"></div>
      <div class="io-row">
        <div class="io-item"><span class="dot" style="background:#8FD9B6"></span><span class="lbl">Ingresos</span><div class="val num" id="incomeEl"></div></div>
        <div class="io-item"><span class="dot" style="background:#E8A98A"></span><span class="lbl">Gastos</span><div class="val num" id="expenseEl"></div></div>
      </div>
    </header>
    <main>
      <section id="tab-resumen"></section>
      <section id="tab-movimientos"></section>
      <section id="tab-presupuestos"></section>
      <section id="tab-metas"></section>
    </main>
    <button class="fab" id="fabAdd">+</button>
    <nav class="tabbar">
      <button class="tab-btn" data-tab="resumen"><span class="ic">◐</span><span class="lb">Resumen</span></button>
      <button class="tab-btn" data-tab="movimientos"><span class="ic">≡</span><span class="lb">Movimientos</span></button>
      <button class="tab-btn" data-tab="presupuestos"><span class="ic">▭</span><span class="lb">Presupuestos</span></button>
      <button class="tab-btn" data-tab="metas"><span class="ic">◎</span><span class="lb">Metas</span></button>
    </nav>
    <div class="overlay" id="overlay"></div>
  `;

  document.getElementById('prevMonth').onclick = () => { App.ui.monthOffset--; App.renderAll(); };
  document.getElementById('nextMonth').onclick = () => { if (App.ui.monthOffset < 0) { App.ui.monthOffset++; App.renderAll(); } };
  document.querySelectorAll('.tab-btn').forEach(b => { b.onclick = () => App.setTab(b.dataset.tab); });
  document.getElementById('fabAdd').onclick = App.openAddTxModal;

  App.renderAll();
  App.setTab(App.ui.tab);
};

App.setTab = function (tab) {
  App.ui.tab = tab;
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
};

// Vuelve a calcular y dibujar TODO a partir de App.state.
// Se llama después de cualquier cambio en los datos.
App.renderAll = function () {
  const d = App.currentMonthDate();
  document.getElementById('monthLabel').textContent = App.MESES[d.getMonth()] + ' ' + d.getFullYear();

  const tx = App.monthTx();
  const income = tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const [whole, cents] = App.fmt(balance).split('.');
  document.getElementById('balanceEl').innerHTML = whole + '<span class="cents">.' + (cents || '00') + '</span>';
  document.getElementById('incomeEl').textContent = App.fmtInt(income);
  document.getElementById('expenseEl').textContent = App.fmtInt(expense);

  App.renderResumen(tx);
  App.renderMovimientos(tx);
  App.renderPresupuestos(tx);
  App.renderMetas();
};

// ---------- RESUMEN ----------
App.renderResumen = function (tx) {
  const el = document.getElementById('tab-resumen');
  const byCat = {};
  tx.filter(t => t.type === 'expense').forEach(t => { byCat[t.cat] = (byCat[t.cat] || 0) + t.amount; });
  const catEntries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const total = catEntries.reduce((s, [, v]) => s + v, 0);

  let donutSvg = '', legend = '';
  if (total > 0) {
    let acc = 0;
    const R = 42, CX = 54, CY = 54, STROKE = 16, circ = 2 * Math.PI * R;
    donutSvg = catEntries.map(([cid, val]) => {
      const c = App.catById(cid);
      const frac = val / total;
      const dash = frac * circ;
      const rotate = (acc / total) * 360 - 90;
      acc += val;
      return `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${c.color}" stroke-width="${STROKE}" stroke-dasharray="${dash} ${circ - dash}" transform="rotate(${rotate} ${CX} ${CY})" />`;
    }).join('');
    legend = catEntries.slice(0, 6).map(([cid, val]) => {
      const c = App.catById(cid);
      return `<div class="legend-item"><span class="sw" style="background:${c.color}"></span>${c.label}<span class="lv num">${App.fmtInt(val)}</span></div>`;
    }).join('');
  }

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const dd = new Date(); dd.setDate(1); dd.setMonth(dd.getMonth() + App.ui.monthOffset - i);
    months.push(dd);
  }
  const trendData = months.map(dd => {
    const mk = App.monthKey(dd);
    const mtx = App.state.transactions.filter(t => App.txMonthKey(t) === mk);
    return {
      label: App.MESES[dd.getMonth()].slice(0, 3),
      income: mtx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: mtx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });
  const maxV = Math.max(1, ...trendData.map(m => Math.max(m.income, m.expense)));
  const trendHtml = trendData.map(m => `
    <div class="trend-col">
      <div style="display:flex; gap:3px; align-items:flex-end; height:100px;">
        <div class="trend-bar" style="width:9px; height:${Math.max(2, (m.income / maxV) * 100)}px; background:var(--green);"></div>
        <div class="trend-bar" style="width:9px; height:${Math.max(2, (m.expense / maxV) * 100)}px; background:var(--rust);"></div>
      </div>
      <div class="trend-lbl">${m.label}</div>
    </div>`).join('');

  el.innerHTML = `
    <h2 class="section-title">Resumen</h2>
    <div class="chart-card">
      <h3>Gastos por categoría</h3>
      ${total > 0 ? `
        <div class="donut-wrap">
          <svg width="108" height="108" viewBox="0 0 108 108">${donutSvg}</svg>
          <div class="legend">${legend}</div>
        </div>` : `<div class="empty" style="padding:20px 0;"><div class="glyph">◐</div><p>Aún no hay gastos este mes.</p></div>`}
    </div>
    <div class="chart-card">
      <h3>Últimos 6 meses</h3>
      <div class="trend-bars">${trendHtml}</div>
      <div style="display:flex; gap:14px; margin-top:10px; font-size:11.5px; color:var(--muted);">
        <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--green);margin-right:5px;"></span>Ingresos</span>
        <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--rust);margin-right:5px;"></span>Gastos</span>
      </div>
    </div>
  `;
};

// ---------- MOVIMIENTOS ----------
App.renderMovimientos = function (tx) {
  const el = document.getElementById('tab-movimientos');
  if (tx.length === 0) {
    el.innerHTML = `<h2 class="section-title">Movimientos</h2><div class="empty"><div class="glyph">≡</div><p>Toca el botón + para registrar<br>tu primer movimiento del mes.</p></div>`;
    return;
  }
  const sorted = [...tx].sort((a, b) => new Date(b.date) - new Date(a.date));
  const groups = {};
  sorted.forEach(t => {
    const key = new Date(t.date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' });
    (groups[key] = groups[key] || []).push(t);
  });

  let html = `<h2 class="section-title">Movimientos</h2>`;
  Object.entries(groups).forEach(([day, items]) => {
    const dayTotal = items.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
    html += `<div class="day-group"><div class="day-head"><span>${day}</span><span class="num">${dayTotal >= 0 ? '+' : ''}${App.fmtInt(dayTotal)}</span></div>`;
    items.forEach(t => {
      const c = App.catById(t.cat);
      html += `
        <div class="row" data-id="${t.id}">
          <div class="cat-chip" style="background:${c.color}1A; color:${c.color};">${c.ab}</div>
          <div class="row-mid">
            <div class="row-title">${t.desc || c.label}</div>
            <div class="row-sub">${c.label}</div>
          </div>
          <div class="row-amt num ${t.type === 'income' ? 'pos' : 'neg'}">${t.type === 'income' ? '+' : '−'}${App.fmtInt(t.amount)}</div>
        </div>`;
    });
    html += `</div>`;
  });
  el.innerHTML = html;
  el.querySelectorAll('.row').forEach(r => r.addEventListener('click', () => App.confirmDeleteTx(r.dataset.id)));
};

// ---------- PRESUPUESTOS ----------
App.renderPresupuestos = function (tx) {
  const el = document.getElementById('tab-presupuestos');
  const spent = {};
  tx.filter(t => t.type === 'expense').forEach(t => { spent[t.cat] = (spent[t.cat] || 0) + t.amount; });

  let html = `<h2 class="section-title">Presupuestos</h2>`;
  if (App.state.budgets.length === 0) {
    html += `<div class="empty"><div class="glyph">▭</div><p>Define un límite mensual por categoría<br>para controlar tu gasto.</p></div>`;
  } else {
    App.state.budgets.forEach(b => {
      const c = App.catById(b.cat);
      const used = spent[b.cat] || 0;
      const pct = Math.min(100, Math.round((used / b.limit) * 100));
      const over = used > b.limit;
      html += `
        <div class="budget-card">
          <div class="budget-top">
            <div class="budget-name">${c.label}</div>
            <div class="budget-nums num">${App.fmtInt(used)} / ${App.fmtInt(b.limit)}</div>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${over ? 'var(--rust)' : 'var(--green)'};"></div></div>
        </div>`;
    });
  }
  html += `<button class="btn btn-ghost btn-block" id="addBudgetBtn" style="margin-top:6px;">+ Nuevo presupuesto</button>`;
  el.innerHTML = html;
  document.getElementById('addBudgetBtn').onclick = App.openAddBudgetModal;
};

// ---------- METAS ----------
App.renderMetas = function () {
  const el = document.getElementById('tab-metas');
  let html = `<h2 class="section-title">Metas de ahorro</h2>`;
  if (App.state.goals.length === 0) {
    html += `<div class="empty"><div class="glyph">◎</div><p>Crea una meta para ese viaje,<br>fondo de emergencia o compra grande.</p></div>`;
  } else {
    App.state.goals.forEach(g => {
      const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
      const R = 26, circ = 2 * Math.PI * R, dash = (pct / 100) * circ;
      html += `
        <div class="goal-card">
          <div class="ring-wrap">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--line-soft)" stroke-width="7"/>
              <circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--gold)" stroke-width="7"
                stroke-dasharray="${dash} ${circ - dash}" stroke-linecap="round" transform="rotate(-90 32 32)"/>
            </svg>
            <div class="pct">${pct}%</div>
          </div>
          <div class="goal-info">
            <div class="goal-name">${g.name}</div>
            <div class="goal-nums num">${App.fmtInt(g.saved)} de ${App.fmtInt(g.target)}</div>
            <div class="goal-actions">
              <button class="btn btn-ghost" data-add="${g.id}">+ Aportar</button>
              <button class="btn btn-rust" data-del="${g.id}">Eliminar</button>
            </div>
          </div>
        </div>`;
    });
  }
  html += `<button class="btn btn-ghost btn-block" id="addGoalBtn" style="margin-top:6px;">+ Nueva meta</button>`;
  el.innerHTML = html;
  document.getElementById('addGoalBtn').onclick = App.openAddGoalModal;
  el.querySelectorAll('[data-add]').forEach(b => b.onclick = () => App.openContributeModal(b.dataset.add));
  el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    App.state.goals = App.state.goals.filter(g => g.id !== b.dataset.del);
    App.saveData(); App.renderAll();
  });
};
/* ============================================
   MODALS.JS
   Todo lo que MODIFICA App.state vive aquí: los formularios
   para agregar movimientos, presupuestos, metas y aportes.
   Patrón fijo en cada acción:
     capturar → validar → modificar App.state →
     App.saveData() → cerrar → App.renderAll()
   ============================================ */

window.App = window.App || {};

App.openSheet = function (innerHtml) {
  const overlay = document.getElementById('overlay');
  overlay.innerHTML = `<div class="sheet">${innerHtml}</div>`;
  overlay.classList.add('show');
  overlay.onclick = (e) => { if (e.target === overlay) App.closeSheet(); };
};

App.closeSheet = function () {
  document.getElementById('overlay').classList.remove('show');
};

// ---------- Eliminar movimiento ----------
App.confirmDeleteTx = function (id) {
  const t = App.state.transactions.find(t => t.id === id);
  if (!t) return;
  const c = App.catById(t.cat);
  App.openSheet(`
    <h3>${t.desc || c.label}</h3>
    <p style="font-size:14px; color:var(--muted); margin:-8px 0 18px;">${App.fmtInt(t.amount)} · ${new Date(t.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</p>
    <div class="sheet-actions">
      <button class="btn btn-ghost btn-block" id="cancelDel">Cancelar</button>
      <button class="btn btn-rust btn-block" id="doDel">Eliminar</button>
    </div>
  `);
  document.getElementById('cancelDel').onclick = App.closeSheet;
  document.getElementById('doDel').onclick = () => {
    App.state.transactions = App.state.transactions.filter(x => x.id !== id);
    App.saveData(); App.closeSheet(); App.renderAll();
  };
};

// ---------- Nuevo movimiento (gasto/ingreso) ----------
App.openAddTxModal = function () {
  App.ui.txType = 'expense';
  App.ui.txCat = App.CATS[0].id;
  App.renderTxSheet();
};

App.renderTxSheet = function () {
  const cats = App.ui.txType === 'expense' ? App.CATS : App.INCOME_CATS;
  const catGrid = cats.map(c => `
    <div class="cat-pick ${App.ui.txCat === c.id ? 'on' : ''}" data-cat="${c.id}">
      <span class="ab" style="color:${c.color}">${c.ab}</span><span class="lb">${c.label}</span>
    </div>`).join('');

  App.openSheet(`
    <h3>Nuevo movimiento</h3>
    <div class="field">
      <div class="seg">
        <button type="button" id="segExpense" class="${App.ui.txType === 'expense' ? 'on expense' : ''}">Gasto</button>
        <button type="button" id="segIncome" class="${App.ui.txType === 'income' ? 'on income' : ''}">Ingreso</button>
      </div>
    </div>
    <div class="field"><label>Monto (MXN)</label><input type="number" id="tAmt" placeholder="0.00" inputmode="decimal"></div>
    <div class="field"><label>Descripción (opcional)</label><input type="text" id="tDesc" placeholder="Ej. Café con Ana"></div>
    <div class="field"><label>Fecha</label><input type="date" id="tDate" value="${new Date().toISOString().slice(0, 10)}"></div>
    <div class="field"><label>Categoría</label><div class="cat-grid" id="catGrid">${catGrid}</div></div>
    <div class="sheet-actions">
      <button class="btn btn-ghost btn-block" id="cancelT">Cancelar</button>
      <button class="btn btn-green btn-block" id="saveT">Guardar</button>
    </div>
  `);

  document.getElementById('segExpense').onclick = () => { App.ui.txType = 'expense'; App.ui.txCat = App.CATS[0].id; App.renderTxSheet(); };
  document.getElementById('segIncome').onclick = () => { App.ui.txType = 'income'; App.ui.txCat = App.INCOME_CATS[0].id; App.renderTxSheet(); };
  document.getElementById('catGrid').querySelectorAll('.cat-pick').forEach(el => {
    el.onclick = () => { App.ui.txCat = el.dataset.cat; App.renderTxSheet(); };
  });
  document.getElementById('cancelT').onclick = App.closeSheet;
  document.getElementById('saveT').onclick = () => {
    const amount = parseFloat(document.getElementById('tAmt').value);
    const desc = document.getElementById('tDesc').value.trim();
    const date = document.getElementById('tDate').value || new Date().toISOString().slice(0, 10);
    if (!amount || amount <= 0) return; // validación mínima
    App.state.transactions.push({ id: App.uid(), type: App.ui.txType, cat: App.ui.txCat, amount, desc, date });
    App.saveData(); App.closeSheet(); App.renderAll();
  };
};

// ---------- Nuevo presupuesto ----------
App.openAddBudgetModal = function () {
  const options = App.CATS.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  App.openSheet(`
    <h3>Nuevo presupuesto</h3>
    <div class="field"><label>Categoría</label><select id="bCat">${options}</select></div>
    <div class="field"><label>Límite mensual (MXN)</label><input type="number" id="bLimit" placeholder="0.00" inputmode="decimal"></div>
    <div class="sheet-actions">
      <button class="btn btn-ghost btn-block" id="cancelB">Cancelar</button>
      <button class="btn btn-green btn-block" id="saveB">Guardar</button>
    </div>
  `);
  document.getElementById('cancelB').onclick = App.closeSheet;
  document.getElementById('saveB').onclick = () => {
    const cat = document.getElementById('bCat').value;
    const limit = parseFloat(document.getElementById('bLimit').value);
    if (!limit || limit <= 0) return;
    App.state.budgets = App.state.budgets.filter(b => b.cat !== cat); // reemplaza si ya existía
    App.state.budgets.push({ cat, limit });
    App.saveData(); App.closeSheet(); App.renderAll();
  };
};

// ---------- Nueva meta ----------
App.openAddGoalModal = function () {
  App.openSheet(`
    <h3>Nueva meta</h3>
    <div class="field"><label>Nombre</label><input type="text" id="gName" placeholder="Ej. Viaje a Oaxaca"></div>
    <div class="field"><label>Monto objetivo (MXN)</label><input type="number" id="gTarget" placeholder="0.00" inputmode="decimal"></div>
    <div class="field"><label>Ya tienes ahorrado (opcional)</label><input type="number" id="gSaved" placeholder="0.00" inputmode="decimal"></div>
    <div class="sheet-actions">
      <button class="btn btn-ghost btn-block" id="cancelG">Cancelar</button>
      <button class="btn btn-green btn-block" id="saveG">Crear meta</button>
    </div>
  `);
  document.getElementById('cancelG').onclick = App.closeSheet;
  document.getElementById('saveG').onclick = () => {
    const name = document.getElementById('gName').value.trim();
    const target = parseFloat(document.getElementById('gTarget').value);
    const saved = parseFloat(document.getElementById('gSaved').value) || 0;
    if (!name || !target || target <= 0) return;
    App.state.goals.push({ id: App.uid(), name, target, saved });
    App.saveData(); App.closeSheet(); App.renderAll();
  };
};

// ---------- Aportar a una meta ----------
App.openContributeModal = function (goalId) {
  const g = App.state.goals.find(x => x.id === goalId);
  if (!g) return;
  App.openSheet(`
    <h3>Aportar a "${g.name}"</h3>
    <div class="field"><label>Monto a aportar (MXN)</label><input type="number" id="cAmt" placeholder="0.00" inputmode="decimal"></div>
    <div class="sheet-actions">
      <button class="btn btn-ghost btn-block" id="cancelC">Cancelar</button>
      <button class="btn btn-green btn-block" id="saveC">Aportar</button>
    </div>
  `);
  document.getElementById('cancelC').onclick = App.closeSheet;
  document.getElementById('saveC').onclick = () => {
    const amt = parseFloat(document.getElementById('cAmt').value);
    if (!amt || amt <= 0) return;
    g.saved += amt;
    App.saveData(); App.closeSheet(); App.renderAll();
  };
};
/* ============================================
   STORAGE.JS
   Aquí vive el "estado" de la app (los datos) y las dos
   únicas funciones que lo leen/escriben en el dispositivo:
   saveData() y loadData().

   Usamos localStorage: guarda datos en el propio navegador,
   sin necesidad de internet ni servidor. Los datos persisten
   aunque cierres la pestaña o el teléfono.
   ============================================ */

window.App = window.App || {};

// Estado principal: todo lo que la app necesita recordar
App.state = {
  transactions: [],  // [{ id, type, cat, amount, desc, date }]
  budgets: [],        // [{ cat, limit }]
  goals: [],           // [{ id, name, target, saved }]
};

// Estado de interfaz (qué pestaña, qué mes, etc.) — no se guarda
App.ui = {
  tab: 'resumen',
  monthOffset: 0,
  txType: 'expense',
  txCat: 'comida',
};

const STORAGE_KEY = 'finance-data';

App.saveData = function () {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(App.state));
  } catch (e) {
    console.error('No se pudo guardar:', e);
  }
};

App.loadData = function () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      App.state.transactions = parsed.transactions || [];
      App.state.budgets = parsed.budgets || [];
      App.state.goals = parsed.goals || [];
    }
  } catch (e) {
    console.warn('No había datos guardados aún, o el formato es inválido.', e);
  }
};
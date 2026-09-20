/* ============================================
   UTILS.JS
   Funciones pequeñas y reutilizables: formato de dinero,
   fechas y generación de ids. No dependen de nada más.
   ============================================ */

window.App = window.App || {};

App.MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Formatea con centavos: $1,234.50
App.fmt = n => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 2
}).format(n);

// Formatea sin centavos, para espacios chicos: $1,235
App.fmtInt = n => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0
}).format(n);

// Genera un id único simple, suficiente para uso local
App.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// 'YYYY-MM' de una fecha, usado para agrupar por mes
App.monthKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');

// 'YYYY-MM' de un movimiento (que guarda su fecha como texto)
App.txMonthKey = tx => App.monthKey(new Date(tx.date));
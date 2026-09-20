/* ============================================
   APP.JS
   Punto de entrada. Se ejecuta al final, cuando todos los
   demás archivos ya definieron sus funciones en "App".
   Solo hace dos cosas: cargar los datos guardados y
   pedirle a render.js que dibuje la app por primera vez.
   ============================================ */

window.App = window.App || {};

App.loadData();
App.render();

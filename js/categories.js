/* ============================================
   CATEGORIES.JS
   Aquí vive la lista de categorías, sus iniciales y colores.
   Para agregar una categoría nueva, solo agrega un objeto
   más a alguno de estos dos arreglos.
   ============================================ */

window.App = window.App || {};

App.CATS = [
  { id: 'comida',      label: 'Comida',       ab: 'Co', color: '#A6472B' },
  { id: 'transporte',  label: 'Transporte',   ab: 'Tr', color: '#3E6B8A' },
  { id: 'casa',        label: 'Vivienda',     ab: 'Vi', color: '#1F4E3D' },
  { id: 'ocio',        label: 'Ocio',         ab: 'Oc', color: '#C99A3B' },
  { id: 'salud',       label: 'Salud',        ab: 'Sa', color: '#7A4E9E' },
  { id: 'educacion',   label: 'Educación',    ab: 'Ed', color: '#4A7A5E' },
  { id: 'compras',     label: 'Compras',      ab: 'Cp', color: '#B05C8A' },
  { id: 'otros',       label: 'Otros',        ab: 'Ot', color: '#8A8570' },
];

App.INCOME_CATS = [
  { id: 'sueldo',      label: 'Sueldo',       ab: 'Su', color: '#1F4E3D' },
  { id: 'freelance',   label: 'Freelance',    ab: 'Fr', color: '#3E6B8A' },
  { id: 'regalo',      label: 'Regalo',       ab: 'Rg', color: '#C99A3B' },
  { id: 'otros_ing',   label: 'Otros',        ab: 'Ot', color: '#8A8570' },
];

// Busca una categoría (de gasto o ingreso) por su id
App.catById = function (id) {
  return [...App.CATS, ...App.INCOME_CATS].find(c => c.id === id) || App.CATS[App.CATS.length - 1];
};
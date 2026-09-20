# Libreta — app de finanzas personales

App de finanzas personales para usar desde el navegador. No necesita instalación,
servidor ni cuenta: todo se guarda en tu propio dispositivo con `localStorage`.

## Cómo abrirla

Simplemente abre `index.html` con doble clic. Se abrirá en tu navegador
predeterminado.

## Cómo usarla en iPhone

1. Sube la carpeta completa a iCloud Drive, OneDrive o Google Drive (o publícala
   gratis con GitHub Pages para tener una URL).
2. Ábrela con Safari en el iPhone.
3. Toca **Compartir → Añadir a pantalla de inicio**.

## Estructura del proyecto

```
finanzas-app/
├── index.html          # Estructura base, aquí se cargan todos los scripts
├── css/
│   └── styles.css      # Todos los estilos y variables de diseño (colores, tipografía)
├── js/
│   ├── categories.js   # Lista de categorías (comida, transporte, etc.) y colores
│   ├── utils.js        # Formato de dinero/fechas, generación de ids
│   ├── storage.js      # El "estado" de la app + guardar/cargar con localStorage
│   ├── render.js        # Funciones que DIBUJAN cada pantalla a partir del estado
│   ├── modals.js         # Formularios que MODIFICAN el estado (agregar, borrar, aportar)
│   └── app.js           # Arranca todo: carga datos y hace el primer render
└── README.md
```

## Por qué está organizado así

Cada archivo tiene una sola responsabilidad, para que sea fácil encontrar qué
tocar cuando quieras cambiar algo:

- ¿Quieres agregar una categoría? → `categories.js`
- ¿Quieres cambiar colores o tipografía? → `css/styles.css`
- ¿Quieres cambiar cómo se ve una pantalla? → `render.js`
- ¿Quieres agregar un campo a un formulario? → `modals.js`
- ¿Quieres cambiar cómo se guardan los datos (por ejemplo, sincronizarlos con un
  servidor en vez de localStorage)? → `storage.js`, sin tocar nada más.

Todos los archivos comparten un mismo objeto global llamado `App`, así que
cualquier función definida en un archivo (por ejemplo `App.saveData`) puede
usarse desde cualquier otro, siempre y cuando `index.html` lo haya cargado
antes con su `<script>`.

## Ideas para seguir extendiéndola

- Agregar un botón para exportar `App.state.transactions` a CSV.
- Agregar más categorías en `categories.js`.
- Cambiar `storage.js` para sincronizar con un backend propio en vez de
  `localStorage`, sin tener que tocar `render.js` ni `modals.js`.
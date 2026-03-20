# 📝 Lista de Bloc de Tareas

Gestor simple de tareas con panel de detalle, toasts y persistencia en localStorage. Incluye historiales separados para tareas realizadas y eliminadas.
## Requisitos
- Navegador moderno.
- Opcional: servidor estático para servir la carpeta (ej. `npx serve .` o `python -m http.server 8000`).
## Instalación y uso
1. Clonar: `git clone <URL_DEL_REPO>`
2. Entrar: `cd <carpeta>`
3. Abrir `index.html` en el navegador  
   - Opcional: servir: `npx serve .` (puerto 3000/5000 según herramienta) o `python -m http.server 8000`.
## Funcionalidades
- Agregar tarea con título y contenido (validaciones de longitud).
- Marcar como realizada (añade al historial de realizadas).
- Eliminar (añade al historial de eliminadas).
- Panel de detalle con título, contenido y fecha; scroll si crece.
- Toasts de feedback.
- Persistencia en `localStorage` de tareas y ambos historiales.
## Estructura de archivos
- `index.html` – layout, sprites SVG reutilizables.
- `style.css` – estilos, grillas responsivas, wraps y scrolls.
- `script.js` – lógica de tareas, detalle, historiales, persistencia.
## Notas de diseño
- Tipografía de sistema (sin dependencias externas).
- Iconos SVG embebidos (sin APIs).
- Dos historiales con botones de limpieza y scroll.
## Mejoras futuras
- Límite de registros en historiales.
- Restaurar tareas desde historial.
- Tests automáticos y linting.

## 👤 Autor
**Ludwing Jounney Silva Ramos**

const STORAGE_KEYS = {
    tareas: 'blocTareas',
    historial: 'blocTareasHistorial'
};

// Estado
let tareas = JSON.parse(localStorage.getItem(STORAGE_KEYS.tareas)) || [];
const historialStorage = JSON.parse(localStorage.getItem(STORAGE_KEYS.historial)) || {};
let historialReal = historialStorage.realizadas || [];
let historialElim = historialStorage.eliminadas || [];
let tareaSeleccionadaId = null;

// Selectores
const welcomeScreen = document.getElementById('welcome-screen');
const mainScreen = document.getElementById('main-screen');
const btnComenzar = document.getElementById('btn-comenzar');
const btnVolver = document.getElementById('btn-volver');
const tareaTitulo = document.getElementById('tarea-titulo');
const tareaContenido = document.getElementById('tarea-contenido');
const btnAgregar = document.getElementById('btn-agregar');
const tareasLista = document.getElementById('tareas-lista');
const emptyState = document.getElementById('empty-state');
const toast = document.getElementById('toast');
const btnLimpiarRealizadas = document.getElementById('btn-limpiar-realizadas');
const btnLimpiarEliminadas = document.getElementById('btn-limpiar-eliminadas');
const historialRealizadas = document.getElementById('historial-realizadas');
const historialEliminadas = document.getElementById('historial-eliminadas');
const historialRealizadasVacio = document.getElementById('historial-realizadas-vacio');
const historialEliminadasVacio = document.getElementById('historial-eliminadas-vacio');
const detalleVacio = document.getElementById('detalle-vacio');
const detalleContenido = document.getElementById('detalle-contenido');
const detalleTitulo = document.getElementById('detalle-titulo');
const detalleTexto = document.getElementById('detalle-texto');
const detalleFecha = document.getElementById('detalle-fecha');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    tareas.forEach(tarea => renderizarTarea(tarea));
    historialReal.forEach(item => renderizarHistorial(item, 'realizadas'));
    historialElim.forEach(item => renderizarHistorial(item, 'eliminadas'));
    actualizarEstadoVacio();
    actualizarHistorialVacio();

    btnComenzar.addEventListener('click', () => {
        transitionScreens(welcomeScreen, mainScreen);
        setTimeout(() => tareaTitulo.focus(), 600);
    });

    btnVolver.addEventListener('click', () => transitionScreens(mainScreen, welcomeScreen));
    btnAgregar.addEventListener('click', agregarTarea);
    tareaTitulo.addEventListener('keydown', (e) => e.key === 'Enter' && agregarTarea());

    if (btnLimpiarRealizadas) btnLimpiarRealizadas.addEventListener('click', () => limpiarHistorial('realizadas'));
    if (btnLimpiarEliminadas) btnLimpiarEliminadas.addEventListener('click', () => limpiarHistorial('eliminadas'));
});

function transitionScreens(from, to) {
    from.classList.add('fade-out');
    setTimeout(() => {
        from.classList.remove('active', 'fade-out');
        to.classList.add('active');
    }, 500);
}

function agregarTarea() {
    const titulo = tareaTitulo.value.trim();
    const contenido = tareaContenido.value.trim();

    if (!titulo) return mostrarToast('Agrega un título', 'error');
    if (!contenido) return mostrarToast('Agrega contenido', 'error');
    if (titulo.length > 120) return mostrarToast('Título muy largo (máx 120)', 'error');
    if (contenido.length > 300) return mostrarToast('Contenido muy largo (máx 300)', 'error');

    const nuevaTarea = {
        id: Date.now(),
        titulo,
        contenido,
        completada: false,
        creada: new Date().toISOString()
    };

    tareas.unshift(nuevaTarea);
    guardarTareas();
    renderizarTarea(nuevaTarea, true);
    
    tareaTitulo.value = '';
    tareaContenido.value = '';
    tareaTitulo.focus();
    mostrarToast('¡Tarea agregada!', 'success');
}

function renderizarTarea(tarea, esNueva = false) {
    const div = document.createElement('div');
    div.className = `tarea-item ${tarea.completada ? 'completed' : ''}`;
    div.dataset.id = tarea.id;
    
    div.innerHTML = `
        <div class="tarea-checkbox ${tarea.completada ? 'checked' : ''}"></div>
        <div class="tarea-textos">
            <span class="tarea-titulo">${escapeHtml(tarea.titulo)}</span>
            <span class="tarea-contenido">${escapeHtml(tarea.contenido)}</span>
        </div>
        <div class="tarea-actions">
            <button class="btn-action btn-delete">
                <svg width="18" height="18" aria-hidden="true"><use href="#icon-trash"/></svg>
            </button>
        </div>
    `;

    // Listeners optimizados
    div.querySelector('.tarea-checkbox').onclick = (e) => {
        e.stopPropagation();
        toggleCompletada(tarea.id, div);
    };
    div.querySelector('.btn-delete').onclick = (e) => {
        e.stopPropagation();
        eliminarTarea(tarea.id, div);
    };

    div.onclick = () => mostrarDetalle(tarea);

    // Insertar al inicio o al final según si es nueva o carga inicial
    esNueva ? tareasLista.prepend(div) : tareasLista.appendChild(div);
    actualizarEstadoVacio();
}

function mostrarDetalle(tarea) {
    tareaSeleccionadaId = tarea.id;
    detalleTitulo.textContent = tarea.titulo;
    detalleTexto.textContent = tarea.contenido;
    detalleFecha.textContent = formatearFecha(tarea.creada);

    detalleVacio.style.display = 'none';
    detalleContenido.style.display = 'flex';
    mostrarToast(`${tarea.titulo}\n\n${tarea.contenido}`, 'success');
}

function limpiarDetalleSiEsSeleccionada(idEliminado) {
    if (tareaSeleccionadaId !== idEliminado) return;
    tareaSeleccionadaId = null;
    detalleContenido.style.display = 'none';
    detalleVacio.style.display = 'flex';
    detalleTitulo.textContent = '';
    detalleTexto.textContent = '';
    detalleFecha.textContent = '';
}

function toggleCompletada(id, elemento) {
    let completadaAhora = false;
    tareas = tareas.map(t => {
        if (t.id === id) {
            completadaAhora = !t.completada;
            return { ...t, completada: !t.completada };
        }
        return t;
    });

    const tareaActual = tareas.find(t => t.id === id);
    elemento.classList.toggle('completed');
    elemento.querySelector('.tarea-checkbox').classList.toggle('checked');
    guardarTareas();

    if (completadaAhora && tareaActual) {
        registrarHistorial({ ...tareaActual }, 'realizadas');
        actualizarHistorialVacio();
    }
    mostrarToast(completadaAhora ? 'Tarea realizada' : 'Tarea pendiente de nuevo', 'success');
}

function eliminarTarea(id, elemento) {
    elemento.style.transform = 'translateX(100px)';
    elemento.style.opacity = '0';
    
    setTimeout(() => {
        const tareaEliminada = tareas.find(t => t.id === id);
        tareas = tareas.filter(t => t.id !== id);
        if (tareaEliminada) registrarHistorial({ ...tareaEliminada }, 'eliminadas');
        elemento.remove();
        guardarTareas();
        actualizarEstadoVacio();
        actualizarHistorialVacio();
        limpiarDetalleSiEsSeleccionada(id);
        mostrarToast('Tarea eliminada', 'success');
    }, 300);
}

function limpiarHistorial(tipo) {
    if (tipo === 'realizadas') {
        historialReal = [];
        historialRealizadas.innerHTML = '';
    } else {
        historialElim = [];
        historialEliminadas.innerHTML = '';
    }
    guardarHistorial();
    actualizarHistorialVacio();
    mostrarToast('Historial limpio', 'success');
}

function guardarTareas() {
    localStorage.setItem(STORAGE_KEYS.tareas, JSON.stringify(tareas));
}

function guardarHistorial() {
    localStorage.setItem(STORAGE_KEYS.historial, JSON.stringify({ realizadas: historialReal, eliminadas: historialElim }));
}

function actualizarEstadoVacio() {
    const isEmpty = tareas.length === 0;
    emptyState.style.display = isEmpty ? 'flex' : 'none';
    tareasLista.style.display = isEmpty ? 'none' : 'flex';
}

function mostrarToast(mensaje, tipo = 'success') {
    toast.textContent = mensaje;
    toast.className = `toast ${tipo} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatearFecha(isoString) {
    return new Date(isoString).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

function renderizarHistorial(item, tipo, esNuevo = false) {
    const contenedor = tipo === 'realizadas' ? historialRealizadas : historialEliminadas;
    const estado = tipo === 'realizadas' ? 'Realizada' : 'Eliminada';
    const referencia = item.evento || item.eliminada || item.creada;
    const nota = tipo === 'eliminadas'
        ? item.completada ? ' · ya estaba completada' : ' · estaba pendiente'
        : '';

    const card = document.createElement('div');
    card.className = 'historial-item';
    card.innerHTML = `
        <h4>${escapeHtml(item.titulo)}</h4>
        <p>${escapeHtml(item.contenido)}</p>
        <span>Creada: ${formatearFecha(item.creada)} · ${estado}: ${formatearFecha(referencia)}${nota}</span>
    `;
    esNuevo ? contenedor.prepend(card) : contenedor.appendChild(card);
}

function actualizarHistorialVacio() {
    const vacias = {
        realizadas: historialReal.length === 0,
        eliminadas: historialElim.length === 0
    };
    historialRealizadasVacio.style.display = vacias.realizadas ? 'flex' : 'none';
    historialRealizadas.style.display = vacias.realizadas ? 'none' : 'grid';
    historialEliminadasVacio.style.display = vacias.eliminadas ? 'flex' : 'none';
    historialEliminadas.style.display = vacias.eliminadas ? 'none' : 'grid';
}

function registrarHistorial(tarea, tipo) {
    const registro = {
        ...tarea,
        accion: tipo,
        evento: new Date().toISOString()
    };
    if (tipo === 'realizadas') {
        historialReal.unshift(registro);
        renderizarHistorial(registro, 'realizadas', true);
    } else {
        historialElim.unshift(registro);
        renderizarHistorial(registro, 'eliminadas', true);
    }
    guardarHistorial();
    actualizarHistorialVacio();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

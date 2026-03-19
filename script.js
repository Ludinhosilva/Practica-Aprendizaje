const welcomeScreen = document.getElementById('welcome-screen');
const mainScreen = document.getElementById('main-screen');
const btnComenzar = document.getElementById('btn-comenzar');
const btnVolver = document.getElementById('btn-volver');
const tareaInput = document.getElementById('tarea-input');
const btnAgregar = document.getElementById('btn-agregar');
const tareasLista = document.getElementById('tareas-lista');
const emptyState = document.getElementById('empty-state');
const toast = document.getElementById('toast');

let tareas = [];
let tareaSeleccionada = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarTareas();
});

btnComenzar.addEventListener('click', () => {
    transitionScreens(welcomeScreen, mainScreen);
    setTimeout(() => tareaInput.focus(), 600);
});

btnVolver.addEventListener('click', () => {
    transitionScreens(mainScreen, welcomeScreen);
});

btnAgregar.addEventListener('click', agregarTarea);
tareaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') agregarTarea();
});

function transitionScreens(from, to) {
    from.classList.add('fade-out');
    setTimeout(() => {
        from.classList.remove('active', 'fade-out');
        to.classList.add('active');
    }, 500);
}

function agregarTarea() {
    const texto = tareaInput.value.trim();
    
    if (!texto) {
        mostrarToast('Por favor, escribe una tarea', 'error');
        tareaInput.focus();
        return;
    }

    if (texto.length > 200) {
        mostrarToast('La tarea no puede superar 200 caracteres', 'error');
        return;
    }

    const tarea = {
        id: Date.now(),
        texto: texto,
        completada: false,
        creada: new Date().toISOString()
    };

    tareas.unshift(tarea);
    guardarTareas();
    renderizarTarea(tarea);
    tareaInput.value = '';
    tareaInput.focus();
    actualizarEstadoVacio();
    mostrarToast('Tarea agregada correctamente', 'success');
}

function renderizarTarea(tarea) {
    const div = document.createElement('div');
    div.className = `tarea-item${tarea.completada ? ' completed' : ''}`;
    div.dataset.id = tarea.id;
    
    div.innerHTML = `
        <div class="tarea-checkbox${tarea.completada ? ' checked' : ''}" title="Marcar como completada"></div>
        <span class="tarea-texto">${escapeHtml(tarea.texto)}</span>
        <div class="tarea-actions">
            <button class="btn-action btn-keep" title="Seleccionar tarea">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
            </button>
            <button class="btn-action btn-delete" title="Eliminar tarea">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/>
                </svg>
            </button>
        </div>
    `;

    const checkbox = div.querySelector('.tarea-checkbox');
    checkbox.addEventListener('click', () => toggleCompletada(tarea.id));

    const btnKeep = div.querySelector('.btn-keep');
    btnKeep.addEventListener('click', (e) => {
        e.stopPropagation();
        seleccionarTarea(tarea.id, div);
    });

    const btnDelete = div.querySelector('.btn-delete');
    btnDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        eliminarTarea(tarea.id, div);
    });

    div.addEventListener('click', () => {
        if (tareaSeleccionada === tarea.id) {
            tareaSeleccionada = null;
            div.classList.remove('selected');
        } else {
            seleccionarTarea(tarea.id, div);
        }
    });

    tareasLista.insertBefore(div, tareasLista.firstChild);
}

function seleccionarTarea(id, elemento) {
    if (tareaSeleccionada === id) {
        tareaSeleccionada = null;
        elemento.classList.remove('selected');
        mostrarToast('Tarea deseleccionada', 'success');
    } else {
        document.querySelectorAll('.tarea-item').forEach(el => el.classList.remove('selected'));
        tareaSeleccionada = id;
        elemento.classList.add('selected');
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mostrarToast('Tarea seleccionada', 'success');
    }
}

function toggleCompletada(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        guardarTareas();
        
        const elemento = document.querySelector(`.tarea-item[data-id="${id}"]`);
        if (elemento) {
            elemento.classList.toggle('completed');
            elemento.querySelector('.tarea-checkbox').classList.toggle('checked');
        }
    }
}

function eliminarTarea(id, elemento) {
    elemento.classList.add('deleting');
    
    setTimeout(() => {
        tareas = tareas.filter(t => t.id !== id);
        guardarTareas();
        elemento.remove();
        actualizarEstadoVacio();
        mostrarToast('Tarea eliminada', 'success');
    }, 400);
}

function guardarTareas() {
    localStorage.setItem('blocTareas', JSON.stringify(tareas));
}

function cargarTareas() {
    const guardadas = localStorage.getItem('blocTareas');
    if (guardadas) {
        tareas = JSON.parse(guardadas);
        tareas.forEach(tarea => renderizarTarea(tarea));
        actualizarEstadoVacio();
    }
}

function actualizarEstadoVacio() {
    if (tareas.length === 0) {
        emptyState.style.display = 'flex';
        tareasLista.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tareasLista.style.display = 'flex';
    }
}

function mostrarToast(mensaje, tipo = 'success') {
    toast.textContent = mensaje;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// Selección de elementos
const input = document.getElementById('nuevaTareaInput');
const btn = document.getElementById('botonAgregar');
const lista = document.getElementById('listaDeTareas');
const contador = document.getElementById('contadorTareas');

let numTareas = 0;

const manejarTarea = () => {
    const valor = input.value.trim();

    // Validación y alerta [cite: 27, 28]
    if (!valor) return alert("El campo está vacío");

    // Crear el elemento de lista
    const li = document.createElement('li');
    li.innerHTML = `<span>${valor}</span>`;
    
    // Marcar como completada al hacer clic [cite: 30]
    li.onclick = () => li.classList.toggle('completada');

    // Botón de eliminar (Punto extra)
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = "×";
    btnEliminar.className = "btn-borrar";
    btnEliminar.onclick = (e) => {
        e.stopPropagation(); // Evita que se tache al borrar
        li.remove();
        numTareas--;
        contador.textContent = numTareas;
    };
    // Armar y mostrar la tarea
    li.appendChild(btnEliminar);
    lista.appendChild(li); 
    // Limpiar y actualizar 
    input.value = "";
    numTareas++;
    contador.textContent = numTareas;
};
// Eventos
btn.addEventListener('click', manejarTarea);

// Agregar con Enter (Punto extra)
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') manejarTarea();
});
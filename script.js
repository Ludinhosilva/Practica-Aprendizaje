
const input = document.getElementById('nuevaTareaInput');
const btn = document.getElementById('botonAgregar');
const lista = document.getElementById('listaDeTareas');
const contador = document.getElementById('contadorTareas');

let numTareas = 0

const manejarTarea = () => {
    const valor = input.value.trim();

    if (!valor) return alert("El campo está vacío"); // Validación y alerta
    
    const li = document.createElement('li'); // Crear el elemento de lista
    li.innerHTML = `<span>${valor}</span>`;
    li.onclick = () => li.classList.toggle('completada'); // Marcar como completada al hacer clic

    // Botón de eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = "×";
    btnEliminar.className = "btn-borrar";
    btnEliminar.onclick = (e) => {
        e.stopPropagation(); // Evita que se tache al borrar
        li.remove();
        numTareas--;
        contador.textContent = numTareas;
    };
    
    li.appendChild(btnEliminar); // Armar y mostrar la tarea
    lista.appendChild(li); 
   
    input.value = "";  // Limpiar y actualizar 
    numTareas++;
    contador.textContent = numTareas;
};

btn.addEventListener('click', manejarTarea);
    
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') manejarTarea();
});
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/tareas'; // Ajustado con el prefijo /api

export default function ListaTareas() {
    const [tareas, setTareas] = useState([]);
    const [nuevoTitulo, setNuevoTitulo] = useState("");

    // 1. Cargar tareas (Read)
    const fetchTareas = async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        setTareas(data);
    };

    useEffect(() => { fetchTareas(); }, []);

    // 2. Agregar tarea (Create)
    const agregarTarea = async (e) => {
        if (e.key === 'Enter' && nuevoTitulo.trim()) {
            const nueva = {
                titulo: nuevoTitulo,
                usuario_id: 1, // Ejemplo
                fecha: new Date().toISOString().split('T')[0] // Hoy (renombrado de fecha_recordatorio)
            };
            const res = await fetch(API_URL + '/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nueva)
            });
            if (res.ok) {
                setNuevoTitulo("");
                fetchTareas();
            }
        }
    };

    // 3. Eliminar (Delete)
    const eliminarTarea = async (id) => {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setTareas(tareas.filter(t => t.id !== id));
    };

    // 4. Cambiar estado (Update)
    const toggleCompletada = async (tarea) => {
        const actualizado = { ...tarea, status: tarea.status === 'completada' ? 'pendiente' : 'completada' };
        await fetch(`${API_URL}/${tarea.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizado)
        });
        fetchTareas();
    };

    // LÓGICA DE VISUALIZACIÓN: Si no hay tareas, no renderizamos nada en la lista
    if (tareas.length === 0 && !nuevoTitulo) {
        // Solo mostramos el input para que puedan empezar a escribir
        return (
            <div className="container">
                <input
                    className="minimal-input"
                    placeholder="Escribe una tarea y presiona Enter..."
                    value={nuevoTitulo}
                    onChange={(e) => setNuevoTitulo(e.target.value)}
                    onKeyDown={agregarTarea}
                />
            </div>
        );
    }

    return (
        <div className="container">
            <input
                className="minimal-input"
                placeholder="Añadir tarea..."
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                onKeyDown={agregarTarea}
            />

            <div className="task-list">
                {tareas.map(tarea => (
                    <div key={tarea.id} className={`task-item ${tarea.status}`}>
                        <span onClick={() => toggleCompletada(tarea)}>
                            {tarea.titulo}
                        </span>
                        <button onClick={() => eliminarTarea(tarea.id)}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
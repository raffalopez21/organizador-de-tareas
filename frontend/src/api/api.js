// api.js - Usar rutas relativas (sin /api)
const API_URL = "";  // Rutas relativas al frontend

// Obtener tareas
export const getTareas = async () => {
  try {
    const response = await fetch(`${API_URL}/tareas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error ${response.status}: ${errorText}`);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tareas recibidas:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    // Datos de ejemplo para desarrollo
    return [
      {
        id: 1,
        titulo: "Tarea de ejemplo",
        descripcion: "Descripción de ejemplo",
        fecha: new Date().toISOString(),
        duracion: 60,
        color: "#3B82F6",
        completada: false,
        usuario_id: 1,
        proyecto_id: null
      }
    ];
  }
};

// Crear tarea
export const createTarea = async (tarea) => {
  try {
    const tareaData = {
      titulo: tarea.title,
      descripcion: tarea.description || '',
      fecha: tarea.date,
      completada: tarea.completed || false,
      usuario_id: tarea.usuario_id || 1,
      proyecto_id: tarea.proyecto_id || null
    };

    const response = await fetch(`${API_URL}/tareas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tareaData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error ${response.status}: ${errorText}`);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tarea creada exitosamente:', data);
    return data;

  } catch (error) {
    console.error("Error al crear tarea:", error);
    throw error;
  }
};

// Actualizar tarea
export const updateTarea = async (tareaId, tarea) => {
  try {
    const tareaData = {
      titulo: tarea.title,
      descripcion: tarea.description || '',
      fecha: tarea.date,
      completada: tarea.completed || false,
      usuario_id: tarea.usuario_id || 1,
      proyecto_id: tarea.proyecto_id || null
    };

    const response = await fetch(`${API_URL}/tareas/${tareaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tareaData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error ${response.status}: ${errorText}`);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tarea actualizada exitosamente:', data);
    return data;

  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    throw error;
  }
};

// Eliminar tarea
export const deleteTarea = async (tareaId) => {
  try {
    const response = await fetch(`${API_URL}/tareas/${tareaId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error ${response.status}: ${errorText}`);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tarea eliminada exitosamente:', data);
    return data;

  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    throw error;
  }
};

// Obtener proyectos
export const getProyectos = async () => {
  try {
    const response = await fetch(`${API_URL}/proyectos`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Proyectos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return [];
  }
};

// Obtener usuarios
export const getUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Usuarios recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

// Transformar tareas del backend al frontend
export const transformarTareaDelBackend = (tareaBackend) => {
  return {
    id: tareaBackend.id,
    title: tareaBackend.titulo || tareaBackend.title,
    description: tareaBackend.descripcion || tareaBackend.description,
    date: tareaBackend.fecha || tareaBackend.date,
    duration: tareaBackend.duracion || tareaBackend.duration || 60,
    color: tareaBackend.color || '#3B82F6',
    completed: tareaBackend.completada || tareaBackend.completed || false,
    proyecto_id: tareaBackend.proyecto_id || tareaBackend.proyecto_id,
    usuario_id: tareaBackend.usuario_id || tareaBackend.usuario_id || 1
  };
};
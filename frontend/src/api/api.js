// api.js - Usar rutas relativas (sin /api)
const API_URL = "https://organizador-de-tareas-hgpd.onrender.com/api";

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
    return [];
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
      usuario_id: tarea.usuario_id || 1
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
      usuario_id: tarea.usuario_id || 1
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

// Transformar tareas del backend al frontend
export const transformarTareaDelBackend = (tareaBackend) => {
  let fecha = tareaBackend.fecha || tareaBackend.date;
  // Normalizar formato de fecha: Reemplazar espacios por 'T' y limpiar formato ISO si existe
  if (fecha && typeof fecha === 'string') {
    fecha = fecha.replace(' ', 'T');
    // Si viene con milisegundos o Z (UTC), lo limpiamos para tener formato SQL estándar
    if (fecha.includes('.')) fecha = fecha.split('.')[0];
    if (fecha.endsWith('Z')) fecha = fecha.substring(0, fecha.length - 1);
  }

  return {
    id: tareaBackend.id,
    title: tareaBackend.titulo || tareaBackend.title,
    description: tareaBackend.descripcion || tareaBackend.description || '',
    date: fecha,
    duration: tareaBackend.duracion || tareaBackend.duration || 60,
    color: tareaBackend.color || '#3B82F6',
    completed: tareaBackend.completada || tareaBackend.completed || false,
    usuario_id: tareaBackend.usuario_id || 1
  };
};
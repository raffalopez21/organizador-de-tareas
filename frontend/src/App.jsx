import React, { useState, useEffect } from 'react';
import './App.css';
import * as api from './api/api';

function App() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('semana');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Función para cargar datos
  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar tareas
      const tareasData = await api.getTareas();
      const tareasTransformadas = Array.isArray(tareasData)
        ? tareasData.map(api.transformarTareaDelBackend)
        : [];
      setTasks(tareasTransformadas);

      // Cargar proyectos
      const proyectosData = await api.getProyectos();
      setProyectos(proyectosData || []);

      // Cargar usuarios
      const usuariosData = await api.getUsuarios();
      setUsuarios(usuariosData || []);

    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error conectando al backend. Usando datos de ejemplo.');
      // Datos de ejemplo para desarrollo
      setTasks(getDatosEjemplo());
    } finally {
      setLoading(false);
    }
  };

  // Datos de ejemplo (para cuando el backend no esté disponible)
  const getDatosEjemplo = () => {
    const hoy = new Date();
    const datos = [];

    for (let i = 0; i < 20; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + Math.floor(Math.random() * 7) - 3);
      fecha.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 4) * 15, 0);

      datos.push({
        id: i + 1,
        title: `Tarea de ejemplo ${i + 1}`,
        description: 'Descripción de la tarea de ejemplo',
        date: fecha.toISOString(),
        duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
        color: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
        completed: Math.random() > 0.5,
        proyecto_id: Math.floor(Math.random() * 3) + 1
      });
    }
    return datos;
  };

  // Obtener días de la semana actual
  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    // Encontrar el lunes de la semana actual
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  // Navegación de semanas
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Formatear fechas
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener tareas para un día específico
  const getTasksForDay = (day) => {
    let filteredTasks = tasks.filter(task => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      return taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear();
    });

    // Aplicar filtro de estado
    if (filterStatus === 'pendientes') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (filterStatus === 'completadas') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    }

    // Ordenar por hora
    filteredTasks.sort((a, b) => {
      const timeA = new Date(a.date);
      const timeB = new Date(b.date);
      return timeA - timeB;
    });

    return filteredTasks;
  };

  // Manejar tareas
  const toggleTaskCompletion = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    try {
      // En producción, descomentar esto:
      // await api.updateTarea(taskId, updatedTask);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error actualizando tarea:', error);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      // En producción, descomentar esto:
      // await api.deleteTarea(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      let response;

      if (editingTask) {
        // Editar tarea existente
        const updatedTask = { ...editingTask, ...taskData };
        response = await api.updateTarea(editingTask.id, updatedTask);

        // Transformar respuesta del backend
        const tareaTransformada = api.transformarTareaDelBackend(response);
        setTasks(tasks.map(task =>
          task.id === editingTask.id ? tareaTransformada : task
        ));
        setEditingTask(null);
        setSuccessMessage('Tarea actualizada correctamente');
      } else {
        // Crear nueva tarea
        response = await api.createTarea(taskData);

        // Transformar respuesta del backend
        const tareaTransformada = api.transformarTareaDelBackend(response);
        setTasks([...tasks, tareaTransformada]);
        setSuccessMessage('Tarea creada correctamente');
      }

      setShowTaskForm(false);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Recargar datos del backend para asegurar consistencia
      setTimeout(() => {
        loadData();
      }, 500);

    } catch (error) {
      console.error('Error al guardar tarea:', error);
      setError('Error al guardar tarea. Verifique la conexión con el backend.');
      setTimeout(() => setError(null), 5000);
    }
  };


  // Estadísticas
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  const stats = getTaskStats();

  // Si está cargando
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <h2>Cargando Calendario...</h2>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📅 Calendario Semanal</h1>
            <div className="header-subtitle">
              <span className="current-week">
                {formatFullDate(getWeekDays()[0])} - {formatFullDate(getWeekDays()[6])}
              </span>
              <span className="task-count">{tasks.length} tareas</span>
            </div>
          </div>

          <div className="header-controls">
            <div className="view-controls">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="dropdown"
              >
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
                <option value="dia">Día</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="dropdown"
              >
                <option value="todas">Todas</option>
                <option value="pendientes">Pendientes</option>
                <option value="completadas">Completadas</option>
              </select>
            </div>

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={goToCurrentWeek}>
                Hoy
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>
                + Nueva Tarea
              </button>
            </div>
          </div>
        </div>

        {/* Navegación de semana */}
        <div className="week-navigation">
          <button className="nav-btn" onClick={goToPreviousWeek}>
            ◀ Semana anterior
          </button>
          <span className="week-range">
            {formatFullDate(getWeekDays()[0])} - {formatFullDate(getWeekDays()[6])}
          </span>
          <button className="nav-btn" onClick={goToNextWeek}>
            Siguiente semana ▶
          </button>
        </div>
      </header>


      {successMessage && (
        <div className="success-message">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <main className="app-main">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>📊 Resumen</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.pending}</div>
                <div className="stat-label">Pendientes</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.completed}</div>
                <div className="stat-label">Completadas</div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>🎨 Proyectos</h3>
            <div className="project-list">
              {proyectos.length > 0 ? (
                proyectos.map(proyecto => (
                  <div key={proyecto.id} className="project-item">
                    <span
                      className="project-color"
                      style={{ backgroundColor: proyecto.color || '#3B82F6' }}
                    ></span>
                    <span className="project-name">{proyecto.nombre}</span>
                    <span className="project-count">
                      {tasks.filter(t => t.proyecto_id === proyecto.id).length}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-projects">
                  <p>No hay proyectos</p>
                  <button className="btn-small">+ Crear proyecto</button>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>👥 Usuarios</h3>
            <div className="user-list">
              {usuarios.length > 0 ? (
                usuarios.slice(0, 5).map(usuario => (
                  <div key={usuario.id} className="user-item">
                    <div className="user-avatar">
                      {usuario.nombre?.charAt(0) || 'U'}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{usuario.nombre || 'Usuario'}</div>
                      <div className="user-email">{usuario.email || 'Sin email'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-users">
                  <p>No hay usuarios</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Calendario Semanal */}
        <div className="calendar-container">
          <div className="week-header">
            {getWeekDays().map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayTasks = getTasksForDay(day);

              return (
                <div
                  key={index}
                  className={`day-header ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="day-name">{formatDate(day)}</div>
                  <div className="day-number">{day.getDate()}</div>
                  <div className="day-task-count">{dayTasks.length} tareas</div>
                </div>
              );
            })}
          </div>

          <div className="week-grid">
            {getWeekDays().map((day, index) => {
              const dayTasks = getTasksForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`day-column ${isToday ? 'today' : ''} ${selectedDay && selectedDay.getDate() === day.getDate() ? 'selected' : ''}`}
                >
                  <div className="day-content">
                    {dayTasks.length > 0 ? (
                      dayTasks.map(task => {
                        const taskDate = new Date(task.date);
                        return (
                          <div
                            key={task.id}
                            className={`task-item-simple ${task.completed ? 'completed' : ''}`}
                            style={{
                              borderLeftColor: '#3B82F6',
                              backgroundColor: `#3B82F615`
                            }}
                            onClick={(e) => {
                              // Marcar/desmarcar al hacer clic en la tarea
                              if (!e.target.closest('.task-delete')) {
                                toggleTaskCompletion(task.id);
                              }
                            }}
                            onDoubleClick={() => handleEditTask(task)}
                          >
                            {/* Contenido de la tarea */}
                            <div className="task-content-simple">
                              <div className="task-title">{task.title}</div>
                              <div className="task-time">{formatTime(taskDate)}</div>
                              {task.description && (
                                <div className="task-description">{task.description}</div>
                              )}
                              <div className="task-status-simple">
                                {task.completed ? '✅ Completada' : '⏳ Pendiente'}
                              </div>
                            </div>

                            {/* Botón de eliminar */}
                            <button
                              className="task-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-tasks">
                        <p>No hay tareas programadas</p>
                        <button
                          className="add-task-btn"
                          onClick={() => {
                            setSelectedDay(day);
                            setShowTaskForm(true);
                          }}
                        >
                          + Agregar tarea
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Formulario de tarea */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          selectedDay={selectedDay}
          proyectos={proyectos}
          usuarios={usuarios}
          onSave={handleSaveTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

// Componente del formulario de tarea
function TaskForm({ task, selectedDay, proyectos, usuarios, onSave, onCancel }) {
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [date, setDate] = useState(
    task && task.date ?
      new Date(task.date).toISOString().split('T')[0] :
      selectedDay ?
        selectedDay.toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    task && task.date ?
      new Date(task.date).toTimeString().substring(0, 5) :
      '09:00'
  );
  const [proyectoId, setProyectoId] = useState(task ? task.proyecto_id || '' : '');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Combinar fecha y hora
    const taskDateTime = new Date(`${date}T${time}`);

    onSave({
      title,
      description,
      date: taskDateTime.toISOString(),
      proyecto_id: proyectoId || null,
      usuario_id: usuarios.length > 0 ? usuarios[0].id : 1
    });
  };

  const colorOptions = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Púrpura', value: '#8B5CF6' },
    { name: 'Ámbar', value: '#F59E0B' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Cian', value: '#06B6D4' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué necesitas hacer?"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles de la tarea..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Hora *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

          </div>

          <div className="form-group">
            <label>Proyecto</label>
            <select
              value={proyectoId}
              onChange={(e) => setProyectoId(e.target.value)}
            >
              <option value="">Sin proyecto</option>
              {proyectos.map(proyecto => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Actualizar' : 'Crear'} Tarea
            </button>
          </div>
        </form>
      </div >
    </div >
  );
}

export default App;
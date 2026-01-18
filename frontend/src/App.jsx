import React, { useState, useEffect } from 'react';
import './App.css';
import * as api from './api/api';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('semana');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const tareasData = await api.getTareas();
      const tareasTransformadas = Array.isArray(tareasData)
        ? tareasData.map(api.transformarTareaDelBackend)
        : [];
      setTasks(tareasTransformadas);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error conectando al backend.');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setHours(0, 0, 0, 0);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const getMonthDays = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Ajustar para empezar en el lunes de la primera semana
    const startDay = startOfMonth.getDay();
    const diff = (startDay === 0 ? -6 : 1) - startDay;
    const calendarStart = new Date(startOfMonth);
    calendarStart.setDate(startOfMonth.getDate() + diff);

    const calendarDays = [];
    const totalDays = 42; // 6 semanas para cubrir todos los meses
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(calendarStart);
      d.setDate(calendarStart.getDate() + i);
      calendarDays.push(d);
    }
    return calendarDays;
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'semana') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'semana') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatMonthName = (date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getTasksForDay = (day) => {
    let filteredTasks = tasks.filter(task => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      return taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear();
    });

    if (filterStatus === 'pendientes') filteredTasks = filteredTasks.filter(task => !task.completed);
    else if (filterStatus === 'completadas') filteredTasks = filteredTasks.filter(task => task.completed);

    filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    return filteredTasks;
  };

  const toggleTaskCompletion = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Actualización optimista
    const originalTasks = [...tasks];
    const newStatus = !task.completed;
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));

    try {
      const updatedTask = { ...task, completed: newStatus };
      const response = await api.updateTarea(taskId, updatedTask);
      const tareaTransformada = api.transformarTareaDelBackend(response);

      // Sincronizar con la respuesta real del servidor
      setTasks(prev => prev.map(t => t.id === taskId ? tareaTransformada : t));
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      setError('No se pudo actualizar el estado de la tarea.');
      setTasks(originalTasks); // Revertir en caso de error
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        await api.deleteTarea(taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
        setSuccessMessage('Tarea eliminada correctamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        setError('Error al eliminar tarea.');
      }
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
        const taskToUpdate = { ...editingTask, ...taskData };
        response = await api.updateTarea(editingTask.id, taskToUpdate);
        const tareaTransformada = api.transformarTareaDelBackend(response);
        setTasks(tasks.map(task => task.id === editingTask.id ? tareaTransformada : task));
        setEditingTask(null);
        setSuccessMessage('Tarea actualizada correctamente');
      } else {
        response = await api.createTarea(taskData);
        const tareaTransformada = api.transformarTareaDelBackend(response);
        setTasks(prevTasks => [...prevTasks, tareaTransformada]);
        setSuccessMessage('Tarea creada correctamente');
      }
      setShowTaskForm(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      setError('Error al guardar tarea.');
    }
  };

  if (loading) return <div className="app-loading"><div className="spinner"></div><h2>Cargando...</h2></div>;

  const displayDays = viewMode === 'semana' ? getWeekDays() : getMonthDays();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📅 {viewMode === 'semana' ? 'Calendario Semanal' : 'Calendario Mensual'}</h1>
            <div className="header-subtitle">
              <span className="current-week">
                {viewMode === 'semana'
                  ? `${formatFullDate(displayDays[0])} - ${formatFullDate(displayDays[6])}`
                  : formatMonthName(currentDate)}
              </span>
              <span className="task-count">{tasks.length} tareas</span>
            </div>
          </div>

          <div className="header-controls">
            <div className="view-controls">
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="dropdown">
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
              </select>

              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="dropdown">
                <option value="todas">Todas</option>
                <option value="pendientes">Pendientes</option>
                <option value="completadas">Completadas</option>
              </select>
            </div>

            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={goToToday}>Hoy</button>
              <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>+ Nueva Tarea</button>
            </div>
          </div>
        </div>

        <div className="week-navigation">
          <button className="nav-btn" onClick={goToPrevious}>◀ Anterior</button>
          <span className="week-range">{viewMode === 'semana' ? 'Semana' : 'Mes'}</span>
          <button className="nav-btn" onClick={goToNext}>Siguiente ▶</button>
        </div>
      </header>

      {successMessage && <div className="success-message"><span>{successMessage}</span></div>}
      {error && <div className="error-banner"><span>{error}</span></div>}

      <main className="app-main">
        <div className={`calendar-container ${viewMode}`}>
          <div className="calendar-grid-header">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="grid-header-cell">{day}</div>
            ))}
          </div>
          <div className={`calendar-grid ${viewMode}`}>
            {displayDays.map((day, index) => {
              const dayTasks = getTasksForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isOtherMonth = day.getMonth() !== currentDate.getMonth();

              return (
                <div key={index} className={`day-cell ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}`}>
                  <div className="day-number-header">
                    <span>{day.getDate()}</span>
                    {dayTasks.length > 0 && <span className="cell-task-count">{dayTasks.length}</span>}
                  </div>
                  <div className="day-cell-content">
                    {dayTasks.map(task => (
                      <div key={task.id} className={`mini-task ${task.completed ? 'completed' : ''}`} onClick={() => toggleTaskCompletion(task.id)}>
                        <div className="mini-task-left">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleTaskCompletion(task.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="task-checkbox"
                          />
                          <span className="mini-task-title">{task.title}</span>
                        </div>
                        <div className="mini-task-actions">
                          <button
                            className="btn-view"
                            title="Ver detalles"
                            onClick={(e) => { e.stopPropagation(); setViewingTask(task); }}
                          >
                            👁️
                          </button>
                          <button
                            className="btn-edit"
                            title="Editar"
                            onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            title="Eliminar"
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="add-task-mini" onClick={() => { setSelectedDay(day); setShowTaskForm(true); }}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          selectedDay={selectedDay}
          onSave={handleSaveTask}
          onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
        />
      )}

      {viewingTask && (
        <TaskDetails
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={() => {
            handleEditTask(viewingTask);
            setViewingTask(null);
          }}
          onDelete={() => {
            handleDeleteTask(viewingTask.id);
            setViewingTask(null);
          }}
        />
      )}
    </div>
  );
}

function TaskDetails({ task, onClose, onEdit, onDelete }) {
  const taskDate = new Date(task.date);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-details-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles de la Tarea</h2>
        </div>
        <div className="task-details-body">
          <div className="detail-item">
            <span className="detail-label">Título:</span>
            <div className="detail-value title">{task.title}</div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fecha y Hora:</span>
            <div className="detail-value">
              {taskDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} a las {taskDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estado:</span>
            <div className={`detail-value status ${task.completed ? 'completed' : 'pending'}`}>
              {task.completed ? '✅ Completada' : '⏳ Pendiente'}
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Descripción:</span>
            <div className="detail-value description">
              {task.description || 'Sin descripción'}
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn btn-edit-detail" onClick={onEdit}>Editar</button>
          <button className="btn btn-delete-detail" onClick={onDelete}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function TaskForm({ task, selectedDay, onSave, onCancel }) {
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [date, setDate] = useState(
    task && task.date ? new Date(task.date).toISOString().split('T')[0] :
      selectedDay ? selectedDay.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    task && task.date ? new Date(task.date).toTimeString().substring(0, 5) : '09:00'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskDateTime = new Date(`${date}T${time}`);
    onSave({ title, description, date: taskDateTime.toISOString(), usuario_id: 1 });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Título *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div className="form-group"><label>Descripción</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" /></div>
          <div className="form-row">
            <div className="form-group"><label>Fecha *</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            <div className="form-group"><label>Hora *</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{task ? 'Actualizar' : 'Crear'} Tarea</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
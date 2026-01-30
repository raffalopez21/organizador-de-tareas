import React, { useState, useEffect } from 'react';
import * as api from './api/api';
import { Background } from './components/Background';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { CalendarView } from './components/CalendarView';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list'); // 'list', 'semana', 'mes'
  const [filter, setFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const handleAddTask = async (taskData) => {
    try {
      const response = await api.createTarea(taskData);
      const tareaTransformada = api.transformarTareaDelBackend(response);
      setTasks(prev => [...prev, tareaTransformada]);
      showSuccess('Tarea creada correctamente');
    } catch (err) {
      setError('Error al crear tarea');
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const response = await api.updateTarea(taskId, updatedData);
      const tareaTransformada = api.transformarTareaDelBackend(response);
      setTasks(prev => prev.map(t => t.id === taskId ? tareaTransformada : t));
      showSuccess('Tarea actualizada');
    } catch (err) {
      setError('Error al actualizar tarea');
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = !task.completed;
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));

    try {
      const response = await api.updateTarea(taskId, { ...task, completed: newStatus });
      const tareaTransformada = api.transformarTareaDelBackend(response);
      setTasks(prev => prev.map(t => t.id === taskId ? tareaTransformada : t));
    } catch (err) {
      setTasks(tasks); // Revert
      setError('Error al actualizar estado');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      await api.deleteTarea(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showSuccess('Tarea eliminada');
    } catch (err) {
      setError('Error al eliminar tarea');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pendientes') return !task.completed;
    if (filter === 'completadas') return task.completed;
    return true;
  }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  if (loading && !mounted) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-mono">Iniciando sistema...</div>;

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-900/50 selection:text-emerald-50 text-slate-200">
      <Background />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col min-h-screen">

        {/* Header */}
        <header className={`mb-8 transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
            <div>
              <h1 className="text-6xl font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-900 tracking-tighter drop-shadow-lg">
                tilde.
              </h1>
              <div className="h-1 w-20 bg-emerald-500/50 mt-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>

            <div className="flex gap-2 bg-black/40 p-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
              <ViewModeButton active={viewMode === 'list'} onClick={() => setViewMode('list')} label="Lista" icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>} />
              <ViewModeButton active={viewMode === 'semana'} onClick={() => setViewMode('semana')} label="Semana" icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>} />
              <ViewModeButton active={viewMode === 'mes'} onClick={() => setViewMode('mes')} label="Mes" icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} />
            </div>
          </div>
        </header>

        {/* Input */}
        <div className={`transition-all duration-1000 delay-100 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <TaskInput onAdd={handleAddTask} />
        </div>

        {/* Feedback Messages */}
        {successMessage && <div className="fixed top-4 right-4 bg-emerald-900/80 border border-emerald-500/50 text-emerald-100 px-4 py-2 rounded-lg backdrop-blur-md z-50 animate-bounce">{successMessage}</div>}
        {error && <div className="fixed top-4 right-4 bg-rose-900/80 border border-rose-500/50 text-rose-100 px-4 py-2 rounded-lg backdrop-blur-md z-50">{error}</div>}

        {/* View Content */}
        {viewMode === 'list' ? (
          <div className="flex-grow">
            {/* List Filters */}
            <div className={`flex items-center gap-4 mb-6 overflow-x-auto pb-2 transition-all duration-1000 delay-200 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <FilterButton active={filter === 'todas'} onClick={() => setFilter('todas')} label="Todas" count={tasks.length} />
              <FilterButton active={filter === 'pendientes'} onClick={() => setFilter('pendientes')} label="Pendientes" count={tasks.filter(t => !t.completed).length} />
              <FilterButton active={filter === 'completadas'} onClick={() => setFilter('completadas')} label="Completadas" count={tasks.filter(t => t.completed).length} />
            </div>

            <div className="space-y-1 pb-20">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTaskCompletion}
                    onDelete={handleDeleteTask}
                    onUpdate={handleUpdateTask}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <span className="text-gray-500 font-light italic">No hay señales detectadas.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-grow pb-20">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => {
                const d = new Date(currentDate);
                if (viewMode === 'semana') d.setDate(d.getDate() - 7);
                else d.setMonth(d.getMonth() - 1);
                setCurrentDate(d);
              }} className="p-2 hover:bg-white/5 rounded-full transition-colors text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <h2 className="text-lg font-light tracking-widest uppercase text-emerald-100/80">
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => {
                const d = new Date(currentDate);
                if (viewMode === 'semana') d.setDate(d.getDate() + 7);
                else d.setMonth(d.getMonth() + 1);
                setCurrentDate(d);
              }} className="p-2 hover:bg-white/5 rounded-full transition-colors text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
            <CalendarView
              tasks={tasks}
              mode={viewMode}
              currentDate={currentDate}
              onTaskClick={(task) => {
                setViewMode('list');
              }}
            />
          </div>
        )}

        <footer className="mt-auto pt-8 pb-4 text-center text-[10px] text-emerald-900/40 font-mono uppercase tracking-widest">
          System.Override.Initiated // Organizador de Tareas v2.0
        </footer>

      </main>
    </div>
  );
}

const ViewModeButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all duration-300 pioneer-hover ${active
        ? 'bg-[#00322e] text-emerald-100 border border-emerald-500/20 shadow-[0_0_15px_rgba(1,49,16,0.5)]'
        : 'text-gray-500 hover:text-emerald-300'
      }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const FilterButton = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-all duration-300 border whitespace-nowrap ${active
        ? 'bg-white/10 border-white/20 text-white shadow-lg'
        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
      }`}
  >
    <span>{label}</span>
    <span className={`ml-1 px-1.5 rounded-full text-[10px] ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600'}`}>{count}</span>
  </button>
);

export default App;
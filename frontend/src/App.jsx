import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Background } from './components/Background';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { CalendarView } from './components/CalendarView';
import { CommandPalette } from './components/CommandPalette';
import { LayoutList, CalendarDays, CalendarRange, CheckCircle2, Circle, ListFilter } from 'lucide-react';
import { getTareas, createTarea, updateTarea, deleteTarea, transformarTareaDelBackend } from './api/api';

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('active');
    const [viewMode, setViewMode] = useState('list');
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [focusedTaskId, setFocusedTaskId] = useState(null);
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const toggleFocus = (id) => {
        setFocusedTaskId(prev => prev === id ? null : id);
    };

    useEffect(() => {
        setMounted(true);
        fetchTasks();

        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const backendTasks = await getTareas();
            // Map backend tasks to UI format
            const mappedTasks = backendTasks.map(t => {
                const transformed = transformarTareaDelBackend(t);
                return {
                    id: transformed.id,
                    text: transformed.title,
                    notes: transformed.description,
                    completed: transformed.completed,
                    // Parse date string to timestamp if possible, else now
                    dueDate: transformed.date ? new Date(transformed.date).getTime() : Date.now(),
                    // Try to infer category or default to personal
                    category: 'personal', // Ideally we'd store this in the backend
                    createdAt: Date.now()
                };
            });
            setTasks(mappedTasks);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTask = async (text, category, dueDate, notes = '') => {
        try {
            const localDate = new Date(dueDate);
            const offset = localDate.getTimezoneOffset() * 60000;
            const localISOTime = new Date(localDate - offset).toISOString().slice(0, -1);

            const newTaskPayload = {
                title: text,
                description: notes,
                date: localISOTime,
                completed: false
            };

            await createTarea(newTaskPayload);
            await fetchTasks();
            showToast('Tarea desplegada con éxito');
        } catch (error) {
            showToast('Error en la secuencia de guardado', 'error');
        }
    };

    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            const updatedStatus = !task.completed;
            const localDate = new Date(task.dueDate);
            const offset = localDate.getTimezoneOffset() * 60000;
            const localISOTime = new Date(localDate - offset).toISOString().slice(0, -1);

            await updateTarea(id, {
                title: task.text,
                description: task.notes,
                date: localISOTime,
                completed: updatedStatus
            });
            setTasks(tasks.map(t => t.id === id ? { ...t, completed: updatedStatus } : t));
            showToast(updatedStatus ? 'Misión cumplida' : 'Tarea reactivada');
        } catch (error) {
            showToast('Error en la sincronización', 'error');
            fetchTasks();
        }
    };

    const deleteTask = async (id) => {
        try {
            await deleteTarea(id);
            setTasks(tasks.filter(t => t.id !== id));
            showToast('Tarea eliminada del sistema');
        } catch (error) {
            showToast('No se pudo purgar la tarea', 'error');
        }
    };

    const updateTaskContent = async (updatedTask) => {
        try {
            const localDate = new Date(updatedTask.dueDate);
            const offset = localDate.getTimezoneOffset() * 60000;
            const localISOTime = new Date(localDate - offset).toISOString().slice(0, -1);

            await updateTarea(updatedTask.id, {
                title: updatedTask.text,
                description: updatedTask.notes,
                date: localISOTime,
                completed: updatedTask.completed
            });
            setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
            showToast('Registros actualizados');
        } catch (error) {
            showToast('Error al actualizar datos', 'error');
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => a.dueDate - b.dueDate);

    const filteredTasks = sortedTasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    return (
        <div className="min-h-screen font-sans selection:bg-emerald-900/50 selection:text-emerald-50 text-slate-200">
            <Background />

            <main className="relative z-10 max-w-full mx-auto px-4 md:px-12 py-8 md:py-16 flex flex-col min-h-screen">

                {/* Header */}
                <header className={`mb-8 transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${focusedTaskId ? 'blur-md pointer-events-none opacity-20' : ''}`}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                        <div className="group cursor-default">
                            <h1 className="text-7xl font-sans font-black tracking-tighter text-gradient-animate leading-none">
                                tilde.
                            </h1>
                            <div className="h-1.5 w-12 bg-emerald-500/50 mt-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] group-hover:w-24 transition-all duration-500"></div>
                        </div>

                        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                            <ViewModeButton active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={<LayoutList size={14} />} label="List" />
                            <ViewModeButton active={viewMode === 'week'} onClick={() => setViewMode('week')} icon={<CalendarDays size={14} />} label="Week" />
                            <ViewModeButton active={viewMode === 'month'} onClick={() => setViewMode('month')} icon={<CalendarRange size={14} />} label="Month" />
                        </div>
                    </div>
                </header>

                {/* Input */}
                <div className={`transition-all duration-1000 delay-100 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${focusedTaskId ? 'blur-md pointer-events-none opacity-20' : ''}`}>
                    <TaskInput onAdd={addTask} />
                </div>

                {/* View Content */}
                {viewMode === 'list' ? (
                    <>
                        <ProductivityStats tasks={tasks} />

                        {/* List Filters */}
                        <div className={`flex items-center gap-4 mb-4 overflow-x-auto pb-2 transition-all duration-1000 delay-200 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<ListFilter size={14} />} label="All Tasks" />
                            <FilterButton active={filter === 'active'} onClick={() => setFilter('active')} icon={<Circle size={14} />} label="In Progress" />
                            <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')} icon={<CheckCircle2 size={14} />} label="Completed" />
                        </div>

                        <div className="flex-grow space-y-3 pb-20">
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-16 w-full rounded-2xl glass-panel skeleton-box border-transparent shadow-none" />
                                    ))}
                                    <div className="flex flex-col items-center justify-center py-10">
                                        <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando Sistema</p>
                                    </div>
                                </div>
                            ) : filteredTasks.length > 0 ? (
                                <AnimatePresence mode="popLayout">
                                    {filteredTasks.map((task, index) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            index={index}
                                            onToggle={toggleTask}
                                            onDelete={deleteTask}
                                            onUpdate={updateTaskContent}
                                            isFocused={focusedTaskId === task.id}
                                            isAnyFocused={focusedTaskId !== null}
                                            onFocus={() => toggleFocus(task.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-24 border border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01] group hover:bg-white/[0.02] transition-colors duration-700"
                                >
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                                        <div className="relative w-20 h-20 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                                            <CheckCircle2 size={32} className="text-emerald-500/40 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-700" />
                                        </div>
                                    </div>
                                    <h3 className="text-emerald-100/60 font-medium tracking-tight text-lg">Silencio Operativo</h3>
                                    <p className="text-gray-500 text-sm mt-1 font-light italic">No hay señales detectadas en el cuadrante actual.</p>
                                    <button
                                        onClick={() => window.document.getElementById('task-input-field')?.focus()}
                                        className="mt-8 px-6 py-2 rounded-full border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500/10 transition-all duration-300"
                                    >
                                        Iniciar Secuencia
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-grow pb-20"
                    >
                        <CalendarView
                            tasks={tasks}
                            mode={viewMode}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onUpdate={updateTaskContent}
                            onTaskClick={(id) => {
                                setViewMode('list');
                                setTimeout(() => {
                                    const element = document.querySelector(`[data-task-id="${id}"]`);
                                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                            }}
                        />
                    </motion.div>
                )}

                <footer className="mt-auto pt-8 text-center text-[10px] text-emerald-900/40 font-mono uppercase tracking-widest">
                    System.Override.Initiated
                </footer>

                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    tasks={tasks}
                    onAction={(action) => {
                        if (action.type === 'view') {
                            setViewMode(action.value);
                        } else if (action.type === 'command') {
                            if (action.value === 'new') {
                                window.document.getElementById('task-input-field')?.focus();
                                setViewMode('list');
                            }
                        }
                    }}
                    onSelectTask={(id) => {
                        setViewMode('list');
                        setTimeout(() => {
                            const element = document.querySelector(`[data-task-id="${id}"]`);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                element.classList.add('ring-2', 'ring-emerald-500/50', 'bg-emerald-500/5');
                                setTimeout(() => {
                                    element.classList.remove('ring-2', 'ring-emerald-500/50', 'bg-emerald-500/5');
                                }, 2000);
                            }
                        }, 100);
                    }}
                />

                <ToastContainer toasts={toasts} />
            </main>
        </div>
    );
};

const ToastContainer = ({ toasts }) => {
    return (
        <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[240px] ${toast.type === 'error'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <span className="text-xs font-medium uppercase tracking-[0.1em]">{toast.message}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

const ProductivityStats = ({ tasks }) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Total', value: total, color: 'text-emerald-100' },
                { label: 'Completas', value: completed, color: 'text-emerald-400' },
                { label: 'Pendientes', value: pending, color: 'text-rose-400' },
                { label: 'Eficiencia', value: `${percent}%`, color: 'text-cyan-400' }
            ].map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="glass-panel p-4 rounded-2xl border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                </motion.div>
            ))}
        </div>
    );
};

const ViewModeButton = ({ active, onClick, icon, label }) => (
    <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all duration-500 overflow-hidden ${active
            ? 'text-emerald-400 font-bold'
            : 'text-gray-500 hover:text-emerald-300'
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeTabMode"
                className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            {icon}
            <span className="hidden sm:inline uppercase tracking-widest text-[10px]">{label}</span>
        </span>
    </motion.button>
);

const FilterButton = ({ active, onClick, icon, label }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all duration-300 border whitespace-nowrap ${active
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : 'border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
    >
        {icon}
        <span>{label}</span>
    </motion.button>
);

export default App;

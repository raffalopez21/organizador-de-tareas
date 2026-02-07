import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TaskInput from './components/TaskInput';
import TaskItem from './components/TaskItem';
import MiniTaskCard from './components/MiniTaskCard';
import { Layout, Zap, CalendarDays, List, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTareas, createTarea, updateTarea, deleteTarea, transformarTareaDelBackend } from './api/api';

// Helper for date manipulation
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState({
        search: '',
        status: 'active', // Set "active" by default
    });

    const [view, setView] = useState('list');
    const [currentDate, setCurrentDate] = useState(new Date());

    // States for editing and selection
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const backendTasks = await getTareas();
            const mappedTasks = backendTasks.map(t => {
                const transformed = transformarTareaDelBackend(t);
                return {
                    id: transformed.id,
                    title: transformed.title,
                    notes: transformed.description,
                    isCompleted: transformed.completed,
                    dueDate: transformed.date ? new Date(transformed.date).getTime() : null,
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

    useEffect(() => {
        fetchTasks();
    }, []);

    const formatToBackendDate = (timestamp) => {
        if (!timestamp) return null;
        const localDate = new Date(timestamp);
        const offset = localDate.getTimezoneOffset() * 60000;
        return new Date(localDate - offset).toISOString().slice(0, -1);
    };

    // Handle Create or Update
    const handleSaveTask = useCallback(async (taskData) => {
        try {
            if (taskData.id) {
                // Edit existing
                await updateTarea(taskData.id, {
                    title: taskData.title,
                    description: taskData.notes,
                    date: formatToBackendDate(taskData.dueDate),
                    completed: taskData.isCompleted
                });
                setTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
                setTaskToEdit(null);
            } else {
                // Create new
                const newTaskPayload = {
                    title: taskData.title,
                    description: taskData.notes,
                    date: formatToBackendDate(taskData.dueDate),
                    completed: false
                };
                await createTarea(newTaskPayload);
                await fetchTasks();
            }
        } catch (error) {
            console.error("Error saving task:", error);
        }
    }, []);

    const handleToggleTask = useCallback(async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            const updatedStatus = !task.isCompleted;
            await updateTarea(id, {
                title: task.title,
                description: task.notes,
                date: formatToBackendDate(task.dueDate),
                completed: updatedStatus
            });
            setTasks(prev => prev.map(t =>
                t.id === id ? { ...t, isCompleted: updatedStatus } : t
            ));
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    }, [tasks]);

    const handleDeleteTask = useCallback(async (id) => {
        try {
            await deleteTarea(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            if (taskToEdit?.id === id) setTaskToEdit(null);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }, [taskToEdit]);

    const handleEditTask = useCallback((task) => {
        setTaskToEdit(task);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const clearCompleted = async () => {
        const completedTasks = tasks.filter(t => t.isCompleted);
        for (const task of completedTasks) {
            await handleDeleteTask(task.id);
        }
    };

    // Filtering Logic
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(filter.search.toLowerCase());
            const matchesStatus = filter.status === 'all'
                ? true
                : filter.status === 'completed' ? t.isCompleted : !t.isCompleted;

            return matchesSearch && matchesStatus;
        });
    }, [tasks, filter]);

    // Sorting
    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate - b.dueDate;
        });
    }, [filteredTasks]);

    // --- Views Rendering ---

    const renderListView = () => (
        <div className="space-y-1 pb-20 animate-fade-in">
            {isLoading ? (
                <div className="text-center py-20 opacity-50">
                    <Loader2 className="w-8 h-8 text-neon-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Cargando tareas...</p>
                </div>
            ) : sortedTasks.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-800 mb-4 border border-dark-700">
                        <Layout className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm">Nada por aquí aún.</p>
                </div>
            ) : (
                sortedTasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                        onEdit={handleEditTask}
                    />
                ))
            )}
        </div>
    );

    const renderWeekView = () => {
        const startOfWeek = getStartOfWeek(currentDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });

        return (
            <div className="animate-fade-in pb-20">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-2 hover:bg-dark-800 rounded-lg text-slate-400"><ChevronLeft /></button>
                    <h3 className="text-white font-medium">{startOfWeek.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-2 hover:bg-dark-800 rounded-lg text-slate-400"><ChevronRight /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {weekDays.map((day) => {
                        const dayTasks = tasks.filter(t => {
                            if (!t.dueDate) return false;
                            const tDate = new Date(t.dueDate);
                            return tDate.getDate() === day.getDate() && tDate.getMonth() === day.getMonth() && tDate.getFullYear() === day.getFullYear();
                        });
                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                            <div key={day.toISOString()} className={`bg-dark-800/50 rounded-xl p-3 border ${isToday ? 'border-neon-500/50' : 'border-dark-700'} min-h-[150px]`}>
                                <div className={`text-xs font-bold mb-3 uppercase tracking-wider ${isToday ? 'text-neon-400' : 'text-slate-500'}`}>
                                    {day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                </div>
                                <div className="space-y-2">
                                    {dayTasks.map(t => (
                                        <MiniTaskCard
                                            key={t.id}
                                            task={t}
                                            onToggle={handleToggleTask}
                                            onDelete={handleDeleteTask}
                                            onEdit={handleEditTask}
                                        />
                                    ))}
                                    {dayTasks.length === 0 && <div className="text-[10px] text-slate-700 text-center py-2">Sin tareas</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);

        // Create an array of all days in the current month
        const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
            return new Date(year, month, i + 1);
        });

        return (
            <div className="animate-fade-in pb-20">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-dark-800 rounded-lg text-slate-400"><ChevronLeft /></button>
                    <h3 className="text-white font-medium capitalize text-lg">{new Date(year, month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-dark-800 rounded-lg text-slate-400"><ChevronRight /></button>
                </div>

                {/* 7 columns grid for a traditional calendar layout but with detailed boxes like week view */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {monthDays.map((day) => {
                        const dayTasks = tasks.filter(t => {
                            if (!t.dueDate) return false;
                            const tDate = new Date(t.dueDate);
                            return tDate.getDate() === day.getDate() && tDate.getMonth() === day.getMonth() && tDate.getFullYear() === day.getFullYear();
                        });
                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                            <div key={day.toISOString()} className={`bg-dark-800/50 rounded-xl p-2.5 border transition-colors ${isToday ? 'border-neon-500/50 hover:bg-dark-800/80' : 'border-dark-700 hover:border-dark-600'} min-h-[140px] flex flex-col`}>
                                <div className={`text-[10px] font-bold mb-2 uppercase tracking-tight flex justify-between items-center ${isToday ? 'text-neon-400' : 'text-slate-500'}`}>
                                    <span>{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                    <span className={`w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-neon-500 text-dark-900' : ''}`}>{day.getDate()}</span>
                                </div>
                                <div className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar max-h-[250px]">
                                    {dayTasks.map(t => (
                                        <MiniTaskCard
                                            key={t.id}
                                            task={t}
                                            onToggle={handleToggleTask}
                                            onDelete={handleDeleteTask}
                                            onEdit={handleEditTask}
                                        />
                                    ))}
                                    {dayTasks.length === 0 && <div className="text-[9px] text-slate-700 text-center py-2 italic font-light">Libre</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-dark-900 selection:bg-neon-500/30 selection:text-neon-200">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-neon-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">

                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-neon-500/10 p-1.5 rounded-lg">
                                <Zap className="w-5 h-5 text-neon-400 fill-neon-400/20" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-white">
                                tilde<span className="text-neon-400">AI</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-xs md:text-sm font-light">
                            Organizador de tareas minimalista
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-dark-800/50 p-1 rounded-xl border border-dark-700/50">
                        <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-neon-500/20 text-neon-400' : 'text-slate-500 hover:text-slate-300'}`} title="Lista">
                            <List className="w-5 h-5" />
                        </button>
                        <button onClick={() => setView('week')} className={`p-2 rounded-lg transition-all ${view === 'week' ? 'bg-neon-500/20 text-neon-400' : 'text-slate-500 hover:text-slate-300'}`} title="Semana">
                            <CalendarDays className="w-5 h-5" />
                        </button>
                        <button onClick={() => setView('month')} className={`p-2 rounded-lg transition-all ${view === 'month' ? 'bg-neon-500/20 text-neon-400' : 'text-slate-500 hover:text-slate-300'}`} title="Mes">
                            <CalendarIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <TaskInput
                    onSaveTask={handleSaveTask}
                    taskToEdit={taskToEdit}
                    onCancelEdit={() => setTaskToEdit(null)}
                />

                {view === 'list' && (
                    <div className="sticky top-4 z-30 mb-6 -mx-2 px-2 py-3 bg-dark-900/80 backdrop-blur-xl border-y border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between rounded-xl transition-all duration-300">
                        <div className="relative w-full md:w-auto md:flex-1">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={filter.search}
                                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-3 pr-4 py-1.5 text-sm text-slate-300 focus:border-neon-500/50 focus:ring-1 focus:ring-neon-500/20 outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex bg-dark-800 p-1 rounded-lg border border-dark-700">
                                {['all', 'active', 'completed'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(prev => ({ ...prev, status }))}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${filter.status === status
                                            ? 'bg-slate-700 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {status === 'all' ? 'Todo' : status === 'active' ? 'Activo' : 'Listo'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'list' && renderListView()}
                {view === 'week' && renderWeekView()}
                {view === 'month' && renderMonthView()}

                {view === 'list' && tasks.some(t => t.isCompleted) && (
                    <div className="pt-8 text-center pb-20">
                        <button
                            onClick={clearCompleted}
                            className="text-xs text-slate-600 hover:text-red-400 transition-colors duration-300"
                        >
                            Eliminar tareas completadas
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

const Loader2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default App;

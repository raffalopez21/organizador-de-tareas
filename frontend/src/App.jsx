import React, { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { CalendarView } from './components/CalendarView';
import { LayoutList, CalendarDays, CalendarRange, CheckCircle2, Circle, ListFilter } from 'lucide-react';
import { getTareas, createTarea, updateTarea, deleteTarea, transformarTareaDelBackend } from './api/api';

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
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
        }
    };

    const addTask = async (text, category, dueDate) => {
        try {
            // Create payload for backend
            // We are losing 'category' as backend doesn't support it explicitly yet.
            // We could prepend it to description if we wanted to persist it.
            const newTaskPayload = {
                title: text,
                description: '', // We could store category here
                date: new Date(dueDate).toISOString(),
                completed: false
            };

            await createTarea(newTaskPayload);
            await fetchTasks(); // Refresh list to get ID from backend
        } catch (error) {
            console.error("Error adding task", error);
        }
    };

    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            // Toggle locally first for responsiveness (though we refresh after)
            const updatedStatus = !task.completed;

            await updateTarea(id, {
                title: task.text,
                description: task.notes,
                date: new Date(task.dueDate).toISOString(),
                completed: updatedStatus
            });

            // Optimistic update
            setTasks(tasks.map(t => t.id === id ? { ...t, completed: updatedStatus } : t));
        } catch (error) {
            console.error("Error toggling task", error);
            fetchTasks(); // Revert on error
        }
    };

    const deleteTask = async (id) => {
        try {
            await deleteTarea(id);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting task", error);
        }
    };

    const updateTaskContent = async (updatedTask) => {
        try {
            await updateTarea(updatedTask.id, {
                title: updatedTask.text,
                description: updatedTask.notes,
                date: new Date(updatedTask.dueDate).toISOString(),
                completed: updatedTask.completed
            });
            // Update local state
            setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
        } catch (error) {
            console.error("Error updating task", error);
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
                            <ViewModeButton active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={<LayoutList size={14} />} label="List" />
                            <ViewModeButton active={viewMode === 'week'} onClick={() => setViewMode('week')} icon={<CalendarDays size={14} />} label="Week" />
                            <ViewModeButton active={viewMode === 'month'} onClick={() => setViewMode('month')} icon={<CalendarRange size={14} />} label="Month" />
                        </div>
                    </div>
                </header>

                {/* Input */}
                <div className={`transition-all duration-1000 delay-100 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <TaskInput onAdd={addTask} />
                </div>

                {/* View Content */}
                {viewMode === 'list' ? (
                    <>
                        {/* List Filters */}
                        <div className={`flex items-center gap-4 mb-4 overflow-x-auto pb-2 transition-all duration-1000 delay-200 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<ListFilter size={14} />} label="All Tasks" />
                            <FilterButton active={filter === 'active'} onClick={() => setFilter('active')} icon={<Circle size={14} />} label="In Progress" />
                            <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')} icon={<CheckCircle2 size={14} />} label="Completed" />
                        </div>

                        <div className="flex-grow space-y-1 pb-20">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task, index) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={toggleTask}
                                        onDelete={deleteTask}
                                        onUpdate={updateTaskContent}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
                                    <span className="text-gray-500 font-light italic">No signals detected.</span>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow pb-20 animate-[fadeIn_0.5s_ease-out]">
                        <CalendarView
                            tasks={tasks}
                            mode={viewMode}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onUpdate={updateTaskContent}
                            onTaskClick={(id) => {
                                setViewMode('list');
                            }}
                        />
                    </div>
                )}

                <footer className="mt-auto pt-8 text-center text-[10px] text-emerald-900/40 font-mono uppercase tracking-widest">
                    System.Override.Initiated
                </footer>

            </main>
        </div>
    );
};

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

const FilterButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-300 border whitespace-nowrap ${active
            ? 'bg-white/10 border-white/20 text-white'
            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default App;

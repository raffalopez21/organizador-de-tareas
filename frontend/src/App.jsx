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
            // Create payload for backend
            const newTaskPayload = {
                title: text,
                description: notes,
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

            <main className="relative z-10 max-w-full mx-auto px-4 md:px-12 py-8 md:py-16 flex flex-col min-h-screen">

                {/* Header */}
                <header className={`mb-8 transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
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
                                            onToggle={toggleTask}
                                            onDelete={deleteTask}
                                            onUpdate={updateTaskContent}
                                            index={index}
                                        />
                                    ))}
                                </AnimatePresence>
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

                <CommandPalette
                    isOpen={isCommandPaletteOpen}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    tasks={tasks}
                    onSelectTask={(id) => {
                        // For now we just stay in list view or highlight it
                        setViewMode('list');
                        // Potential scroll to task
                    }}
                />
            </main>
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

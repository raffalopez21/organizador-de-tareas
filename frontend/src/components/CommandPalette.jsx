import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, CheckCircle2, Circle, Calendar, Clock, CornerDownLeft, ArrowUp, ArrowDown, LayoutList, CalendarRange, CalendarDays, Plus } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, tasks, onSelectTask, onAction }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const ACTIONS = [
        { id: 'act-new', text: 'Nueva Tarea', type: 'command', value: 'new', category: 'Sistema', icon: <Plus size={14} className="text-emerald-400" /> },
        { id: 'act-list', text: 'Ver Vista Lista', type: 'view', value: 'list', category: 'Vista', icon: <LayoutList size={14} className="text-cyan-400" /> },
        { id: 'act-week', text: 'Ver Vista Semana', type: 'view', value: 'week', category: 'Vista', icon: <CalendarRange size={14} className="text-cyan-400" /> },
        { id: 'act-month', text: 'Ver Vista Mes', type: 'view', value: 'month', category: 'Vista', icon: <CalendarDays size={14} className="text-cyan-400" /> },
    ];

    const filteredItems = useMemo(() => {
        const q = query.toLowerCase();
        const matchedActions = ACTIONS.filter(a => a.text.toLowerCase().includes(q));
        const matchedTasks = tasks.filter(t => t.text.toLowerCase().includes(q))
            .slice(0, 6)
            .map(t => ({ ...t, type: 'task' }));

        return [...matchedActions, ...matchedTasks];
    }, [query, tasks]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
                const item = filteredItems[selectedIndex];
                if (item.type === 'task') {
                    onSelectTask(item.id);
                } else {
                    onAction(item);
                }
                onClose();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredItems, selectedIndex, onSelectTask, onAction, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-2xl glass-panel-heavy rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden border-white/10 relative z-10"
                    >
                        <div className="flex items-center p-6 border-b border-white/10">
                            <div className="p-2 bg-emerald-500/10 rounded-xl mr-4">
                                <Command size={20} className="text-emerald-500" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar tareas o comandos (ej: 'Nueva', 'Mes')..."
                                className="flex-grow bg-transparent border-none outline-none text-white text-xl placeholder-gray-600 font-light"
                            />
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[10px] text-gray-400 font-mono shadow-inner">
                                ESC
                            </div>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto p-3 custom-scrollbar">
                            {filteredItems.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredItems.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            onClick={() => {
                                                if (item.type === 'task') onSelectTask(item.id);
                                                else onAction(item);
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 ${index === selectedIndex ? 'bg-white/10' : 'bg-transparent'
                                                }`}
                                        >
                                            {index === selectedIndex && (
                                                <motion.div
                                                    layoutId="paletteActive"
                                                    className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}

                                            <div className="flex items-center gap-4 min-w-0 relative z-10">
                                                {item.type === 'task' ? (
                                                    <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-gray-600' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`} />
                                                ) : (
                                                    <div className="p-2 bg-white/5 rounded-lg">
                                                        {item.icon}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className={`text-base font-medium truncate tracking-tight ${item.completed ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                                                        {item.text}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        {item.type === 'task' ? (
                                                            <>
                                                                <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                                                                    <Calendar size={12} className="text-gray-600" />
                                                                    {new Date(item.dueDate).toLocaleDateString()}
                                                                </span>
                                                                <span className="px-2 py-0.5 bg-emerald-500/10 rounded-full text-[9px] text-emerald-500 font-bold uppercase tracking-widest border border-emerald-500/10">
                                                                    {item.category || 'personal'}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-[0.2em]">
                                                                Comando de Sistema • {item.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {index === selectedIndex && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="relative z-10 flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-bold border border-emerald-500/20"
                                                >
                                                    <CornerDownLeft size={10} />
                                                    {item.type === 'task' ? 'ABRIR' : 'EJECUTAR'}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <Command className="mx-auto mb-4 text-gray-700" size={40} />
                                    <p className="text-gray-500 italic text-sm font-light">
                                        No se detectaron señales operativas para "{query}".
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-600 font-mono tracking-[0.2em] uppercase">
                            <div className="flex gap-6">
                                <span className="flex items-center gap-2"><ArrowUp size={10} /><ArrowDown size={10} /> NAVEGAR</span>
                                <span className="flex items-center gap-2"><CornerDownLeft size={10} /> EJECUTAR</span>
                            </div>
                            <span className="text-emerald-900/40">Command Engine v2.1.0</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

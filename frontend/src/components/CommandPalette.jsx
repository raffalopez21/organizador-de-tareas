import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, CheckCircle2, Circle, Calendar, Clock, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, tasks, onSelectTask }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const filteredTasks = tasks.filter(task =>
        task.text.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

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
                setSelectedIndex(prev => (prev < filteredTasks.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter' && filteredTasks[selectedIndex]) {
                onSelectTask(filteredTasks[selectedIndex].id);
                onClose();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredTasks, selectedIndex, onSelectTask, onClose]);

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
                            <Search size={22} className="text-emerald-500 mr-4" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar tareas o comandos..."
                                className="flex-grow bg-transparent border-none outline-none text-white text-xl placeholder-gray-600 font-light"
                            />
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[10px] text-gray-400 font-mono shadow-inner">
                                ESC
                            </div>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto p-3 custom-scrollbar">
                            {filteredTasks.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredTasks.map((task, index) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            onClick={() => {
                                                onSelectTask(task.id);
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
                                                <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-gray-600' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`} />
                                                <div className="min-w-0">
                                                    <p className={`text-base font-medium truncate tracking-tight ${task.completed ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                                                        {task.text}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                                                            <Calendar size={12} className="text-gray-600" />
                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-emerald-500/10 rounded-full text-[9px] text-emerald-500 font-bold uppercase tracking-widest border border-emerald-500/10">
                                                            {task.category || 'personal'}
                                                        </span>
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
                                                    SELECCIONAR
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <Command className="mx-auto mb-4 text-gray-700" size={40} />
                                    <p className="text-gray-500 italic text-sm font-light">
                                        No se detectaron señales operativas.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-600 font-mono tracking-[0.2em] uppercase">
                            <div className="flex gap-6">
                                <span className="flex items-center gap-2"><ArrowUp size={10} /><ArrowDown size={10} /> NAVEGAR</span>
                                <span className="flex items-center gap-2"><CornerDownLeft size={10} /> EJECUTAR</span>
                            </div>
                            <span className="text-emerald-900/40">Command Engine v2.0.4</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

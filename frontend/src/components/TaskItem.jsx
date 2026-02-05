import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Pencil, Eye, EyeOff, Save, Calendar, Clock, Target } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import { format } from 'date-fns';

const Particle = ({ color }) => (
    <motion.div
        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        animate={{
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            scale: 0,
            opacity: 0
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`absolute w-1.5 h-1.5 rounded-full ${color}`}
        style={{ left: '50%', top: '50%' }}
    />
);

export const TaskItem = ({ task, onToggle, onDelete, onUpdate, index, isFocused, isAnyFocused, onFocus }) => {
    const categoryConfig = CATEGORIES[task.category] || CATEGORIES['personal'];
    const [isEditing, setIsEditing] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showParticles, setShowParticles] = useState(false);

    // Editing states
    const [editedText, setEditedText] = useState(task.text);
    const [editedNotes, setEditedNotes] = useState(task.notes || '');

    // Date/Time editing states
    const initialDate = new Date(task.dueDate || Date.now());
    const [editedDate, setEditedDate] = useState(initialDate.toISOString().split('T')[0]);
    const [editedHour, setEditedHour] = useState(initialDate.getHours().toString().padStart(2, '0'));
    const [editedMinute, setEditedMinute] = useState(initialDate.getMinutes().toString().padStart(2, '0'));

    const handleToggle = () => {
        if (!task.completed) {
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 800);
        }
        onToggle(task.id);
    };

    const handleSave = () => {
        const newDueStamp = new Date(`${editedDate}T${editedHour}:${editedMinute}:00`).getTime();
        onUpdate({
            ...task,
            text: editedText,
            notes: editedNotes,
            dueDate: newDueStamp
        });
        setIsEditing(false);
    };

    const formattedDate = task.dueDate ? format(new Date(task.dueDate), "MMM d, h:mm a") : '';
    const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;
    const isNearDeadline = task.dueDate && task.dueDate > Date.now() && task.dueDate - Date.now() < 24 * 60 * 60 * 1000 && !task.completed;

    // Generate options for hours and minutes
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
                opacity: isAnyFocused && !isFocused ? 0.2 : 1,
                scale: isFocused ? 1.05 : 1,
                y: 0,
                filter: isAnyFocused && !isFocused ? 'blur(8px)' : 'blur(0px)',
                zIndex: isFocused ? 50 : 0
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.6,
                delay: isAnyFocused ? 0 : index * 0.05,
                type: "spring",
                stiffness: 260,
                damping: 20
            }}
            id={`task-${task.id}`}
            data-task-id={task.id}
            className={`relative mb-4 rounded-[2.5rem] glass-panel-heavy border-l-[3px] group p-1 ${task.completed ? 'border-l-gray-700 opacity-50' : `border-l-${categoryConfig.color.split('-')[1]}-500 shadow-[0_4px_20px_rgba(0,0,0,0.3)]`
                } ${isFocused ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : ''} ${(isOverdue || isNearDeadline) && !isFocused ? 'glow-border-emerald' : ''} hover:translate-x-1 hover:bg-white/[0.05] transition-all duration-500 target:ring-2 target:ring-emerald-500/50 target:bg-emerald-500/5`}
        >
            <div className="flex items-center p-5">
                {/* Checkbox */}
                {!isEditing && (
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleToggle}
                            className={`flex-shrink-0 w-8 h-8 rounded-2xl border-2 transition-all duration-500 flex items-center justify-center mr-6 ${task.completed
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : 'border-white/10 hover:border-emerald-500/40 text-transparent'
                                }`}
                        >
                            <Check size={16} strokeWidth={3} className={`transform transition-all duration-500 ${task.completed ? 'scale-100 rotate-0' : 'scale-0 -rotate-45'}`} />
                        </motion.button>
                        {showParticles && (
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(8)].map((_, i) => (
                                    <Particle key={i} color={categoryConfig.color} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-grow min-w-0 mr-4">
                    {isEditing ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="w-full bg-black/40 border-b-2 border-emerald-500/20 py-2 text-lg text-white font-medium focus:border-emerald-500/80 outline-none transition-all"
                                placeholder="Título de la misión..."
                            />

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Date Selector */}
                                <div className="relative group flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px]">
                                    <Calendar size={14} className="text-emerald-500 mr-2" />
                                    <input
                                        type="date"
                                        value={editedDate}
                                        onChange={(e) => setEditedDate(e.target.value)}
                                        className="bg-transparent border-none text-gray-200 focus:outline-none w-[110px] [color-scheme:dark] font-mono"
                                    />
                                </div>

                                {/* Time Selector */}
                                <div className="relative group flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px]">
                                    <Clock size={14} className="text-emerald-500 mr-2" />
                                    <div className="flex items-center gap-2 font-mono">
                                        <select
                                            value={editedHour}
                                            onChange={(e) => setEditedHour(e.target.value)}
                                            className="bg-transparent border-none text-gray-200 focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                                        >
                                            {hours.map(h => <option key={h} value={h} className="bg-[#030303] text-white p-2">{h}</option>)}
                                        </select>
                                        <span className="text-gray-600 font-bold">:</span>
                                        <select
                                            value={editedMinute}
                                            onChange={(e) => setEditedMinute(e.target.value)}
                                            className="bg-transparent border-none text-gray-200 focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                                        >
                                            {minutes.map(m => <option key={m} value={m} className="bg-[#030303] text-white p-2">{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className={`text-base font-medium tracking-tight transition-all duration-300 whitespace-normal ${task.completed ? 'text-gray-600 line-through' : 'text-gray-100'
                                } ${isFocused ? 'text-xl' : ''}`}>
                                {task.text}
                            </p>
                            <div className="flex items-center mt-2 gap-4">
                                <div className={`flex items-center text-[10px] font-mono uppercase tracking-[0.1em] ${isOverdue ? 'text-rose-500 font-bold' : 'text-emerald-500/60'}`}>
                                    <Calendar size={12} className="mr-1.5 opacity-60" />
                                    {formattedDate}
                                    {isOverdue && (
                                        <span className="ml-2 px-2 py-0.5 bg-rose-500/10 rounded-full text-[9px] animate-pulse">
                                            vencida
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[9px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 rounded-full border border-white/5 bg-white/5 ${task.completed ? 'text-gray-700' : 'text-emerald-900/40'}`}>
                                    {categoryConfig.label}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions - Right Aligned */}
                <div className={`flex items-center gap-2 transition-all duration-500 ${isFocused ? 'opacity-100' : 'opacity-100 md:opacity-0 group-hover:opacity-100'}`}>
                    {isEditing ? (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSave}
                                className="p-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-all"
                                title="Guardar cambios"
                            >
                                <Save size={16} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsEditing(false)}
                                className="p-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all"
                                title="Cancelar"
                            >
                                <X size={16} />
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onFocus}
                                className={`p-2 rounded-xl border transition-all ${isFocused ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-white/5 text-gray-400 border-white/5 hover:text-emerald-300 hover:border-emerald-500/20'}`}
                                title={isFocused ? "Salir del enfoque" : "Enfocar tarea (Zen Mode)"}
                            >
                                <Target size={16} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-gray-400 bg-white/5 border border-white/5 hover:text-emerald-300 hover:border-emerald-500/20 rounded-xl transition-all"
                                title="Editar tarea"
                            >
                                <Pencil size={16} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowNotes(!showNotes)}
                                className={`p-2 rounded-xl border transition-all ${showNotes ? 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30' : 'text-gray-400 bg-white/5 border-white/5 hover:text-emerald-300 hover:border-emerald-500/20'}`}
                                title="Ver notas"
                            >
                                {showNotes ? <EyeOff size={16} /> : <Eye size={16} />}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onDelete(task.id)}
                                className="p-2 text-gray-400 bg-white/5 border border-white/5 hover:text-rose-400 hover:border-rose-500/20 rounded-xl transition-all"
                                title="Eliminar"
                            >
                                <X size={16} />
                            </motion.button>
                        </>
                    )}
                </div>
            </div>

            {/* Expandable Notes Section */}
            {(showNotes || isEditing) && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6 pt-2 ml-14"
                >
                    {isEditing ? (
                        <textarea
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            placeholder="Aumentar detalles del informe..."
                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-gray-300 focus:border-emerald-500/30 outline-none h-32 resize-none transition-all placeholder:text-gray-700 font-sans"
                        />
                    ) : (
                        <div className="text-xs text-gray-400 bg-black/30 p-5 rounded-[1.5rem] border border-white/5 italic whitespace-pre-wrap flex justify-between items-start leading-relaxed shadow-inner">
                            <span className="opacity-80 font-light">{task.notes ? task.notes : "No se han registrado observaciones adicionales."}</span>
                            <span className="text-emerald-500/40 font-mono text-[10px] ml-6 flex-shrink-0 tracking-widest uppercase">
                                sync_id: {task.id.slice(0, 8)} • {format(new Date(task.dueDate), "HH:mm")}
                            </span>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};


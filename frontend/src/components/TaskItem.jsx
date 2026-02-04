import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Pencil, Eye, EyeOff, Save, Calendar, Clock } from 'lucide-react';
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

export const TaskItem = ({ task, onToggle, onDelete, onUpdate, index }) => {
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`relative mb-4 rounded-2xl glass-panel-heavy border-l-[3px] group ${task.completed ? 'border-l-gray-700 opacity-50' : `border-l-${categoryConfig.color.split('-')[1]}-500 shadow-[0_4px_20px_rgba(0,0,0,0.3)]`
                } ${(isOverdue || isNearDeadline) ? 'glow-border-emerald' : ''} hover:translate-x-1 hover:bg-white/[0.05]`}
        >
            <div className="flex items-center p-4">
                {/* Checkbox */}
                {!isEditing && (
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleToggle}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-500 flex items-center justify-center mr-5 ${task.completed
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : 'border-white/10 hover:border-emerald-500/40 text-transparent'
                                }`}
                        >
                            <Check size={14} strokeWidth={3} className={`transform transition-all duration-500 ${task.completed ? 'scale-100 rotate-0' : 'scale-0 -rotate-45'}`} />
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
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
                                placeholder="Task title..."
                            />

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Date Selector */}
                                <div className="relative group flex items-center bg-black/40 border border-white/10 rounded-lg px-2 text-[10px]">
                                    <Calendar size={12} className="text-emerald-500/70 mr-1" />
                                    <input
                                        type="date"
                                        value={editedDate}
                                        onChange={(e) => setEditedDate(e.target.value)}
                                        className="bg-transparent border-none py-1.5 text-gray-300 focus:outline-none w-[100px] [color-scheme:dark]"
                                    />
                                </div>

                                {/* Time Selector */}
                                <div className="relative group flex items-center bg-black/40 border border-white/10 rounded-lg px-2 text-[10px]">
                                    <Clock size={12} className="text-emerald-500/70 mr-1" />
                                    <div className="flex items-center gap-1">
                                        <select
                                            value={editedHour}
                                            onChange={(e) => setEditedHour(e.target.value)}
                                            className="bg-transparent border-none py-1.5 text-gray-300 focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                                        >
                                            {hours.map(h => <option key={h} value={h} className="bg-[#001d11]">{h}</option>)}
                                        </select>
                                        <span className="text-gray-600">:</span>
                                        <select
                                            value={editedMinute}
                                            onChange={(e) => setEditedMinute(e.target.value)}
                                            className="bg-transparent border-none py-1.5 text-gray-300 focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                                        >
                                            {minutes.map(m => <option key={m} value={m} className="bg-[#001d11]">{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className={`text-sm font-medium tracking-wide transition-all duration-300 whitespace-normal ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
                                }`}>
                                {task.text}
                            </p>
                            <div className="flex items-center mt-1 gap-3">
                                <div className={`flex items-center text-[10px] font-mono tracking-tight ${isOverdue ? 'text-rose-500' : 'text-emerald-500/80'}`}>
                                    <Calendar size={10} className="mr-1 opacity-70" />
                                    {formattedDate}
                                    {isOverdue && (
                                        <span className="ml-2 px-1.5 py-px bg-rose-500/10 rounded-full text-[8px] font-bold uppercase animate-pulse">
                                            vencida
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-px rounded bg-white/5 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {categoryConfig.label}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions - Right Aligned */}
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                title="Save"
                            >
                                <Save size={14} />
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                title="Cancel"
                            >
                                <X size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 text-gray-400 hover:text-emerald-300 hover:bg-white/5 rounded transition-colors"
                                title="Edit"
                            >
                                <Pencil size={14} />
                            </button>

                            <button
                                onClick={() => setShowNotes(!showNotes)}
                                className={`p-1.5 rounded transition-colors ${showNotes ? 'text-emerald-400 bg-emerald-900/20' : 'text-gray-400 hover:text-emerald-300 hover:bg-white/5'}`}
                                title="Notes"
                            >
                                {showNotes ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>

                            <button
                                onClick={() => onDelete(task.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-900/20 rounded transition-colors"
                                title="Delete"
                            >
                                <X size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Expandable Notes Section */}
            {(showNotes || isEditing) && (
                <div className="px-4 pb-4 pl-12 animate-[fadeIn_0.2s_ease-out]">
                    {isEditing ? (
                        <textarea
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            placeholder="Add notes..."
                            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs text-gray-300 focus:border-emerald-500/50 outline-none h-24 resize-none"
                        />
                    ) : (
                        <div className="text-xs text-gray-400 bg-black/20 p-3 rounded border border-white/5 italic whitespace-pre-wrap flex justify-between items-start">
                            <span>{task.notes ? task.notes : "No notes added."}</span>
                            <span className="text-emerald-500/80 font-mono text-[10px] ml-4 flex-shrink-0">
                                {format(new Date(task.dueDate), "HH:mm")}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};


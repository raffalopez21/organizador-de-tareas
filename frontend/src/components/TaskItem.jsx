import React, { useState, useMemo } from 'react';
import { Trash2, Calendar, Clock, Pencil, CheckSquare, Square } from 'lucide-react';

// Formatting utilities
const formatDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
const formatTime = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (date.getHours() === 12 && date.getMinutes() === 0) return null; // Assume default noon is unset time
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const TaskItem = React.memo(({ task, onToggle, onDelete, onEdit }) => {
    const [showNotes, setShowNotes] = useState(false);
    const formattedDate = formatDate(task.dueDate);
    const formattedTime = formatTime(task.dueDate);

    const isOverdue = useMemo(() => {
        if (!task.dueDate || task.isCompleted) return false;
        return new Date(task.dueDate).getTime() < new Date().getTime();
    }, [task.dueDate, task.isCompleted]);

    return (
        <div
            className={`group relative mb-3 transition-all duration-300 ease-out 
            ${task.isCompleted ? 'opacity-50' : 'opacity-100 hover:transform hover:translate-x-1'}`}
        >
            <div className={`
                relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300
                ${task.isCompleted
                    ? 'bg-dark-900/40 border-dark-700/50'
                    : isOverdue
                        ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50 shadow-[0_0_20px_-10px_rgba(239,68,68,0.3)]'
                        : 'bg-dark-800 border-dark-700 hover:border-neon-500/30 hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)]'
                }
            `}>
                {isOverdue && !task.isCompleted && (
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider rounded-bl-lg border-l border-b border-red-500/30 animate-pulse">
                        Vencida
                    </div>
                )}

                <div className="p-4">
                    <div className="flex justify-between items-start gap-4">
                        {/* Checkbox and Title Row */}
                        <div className="flex items-start gap-3 flex-1 overflow-hidden">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggle(task.id);
                                }}
                                className={`mt-0.5 p-0.5 rounded-md transition-colors ${task.isCompleted ? 'text-neon-500 bg-neon-500/10' : 'text-slate-500 hover:text-neon-400 hover:bg-neon-400/5'}`}
                                title={task.isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
                            >
                                {task.isCompleted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </button>

                            <h3
                                onClick={() => setShowNotes(!showNotes)}
                                className={`
                                    text-base font-medium leading-tight truncate transition-all duration-300 cursor-pointer select-none flex-1
                                    ${task.isCompleted ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200 hover:text-neon-400'}
                                `}
                                title="Ver detalles"
                            >
                                {task.title}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(task);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                                title="Editar"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(task.id);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Metadata Row: Date, Notes Toggle indicator */}
                    <div className="flex items-center gap-3 mt-2 min-h-[20px] ml-8">
                        {formattedDate && (
                            <div className="flex items-center gap-1 text-[11px] text-neon-400/80 font-medium">
                                <Calendar className="w-3 h-3" />
                                <span>{formattedDate}</span>
                                {formattedTime && (
                                    <span className="flex items-center gap-1 ml-1 text-slate-500">
                                        <Clock className="w-3 h-3" /> {formattedTime}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notes Section (Toggleable) */}
                    {showNotes && task.notes && (
                        <div className="mt-3 text-sm text-slate-400 font-light whitespace-pre-wrap leading-relaxed border-l-2 border-neon-500/30 pl-3 py-1 bg-white/5 rounded-r-lg animate-fade-in italic ml-8">
                            {task.notes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return (
        prev.task.id === next.task.id &&
        prev.task.isCompleted === next.task.isCompleted &&
        prev.task.title === next.task.title &&
        prev.task.notes === next.task.notes &&
        prev.task.dueDate === next.task.dueDate
    );
});

export default TaskItem;

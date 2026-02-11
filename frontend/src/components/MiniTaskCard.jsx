import React, { useState } from 'react';
import { Pencil, X, FileText, CheckSquare, Square, Clock } from 'lucide-react';

const MiniTaskCard = ({ task, onToggle, onDelete, onEdit }) => {
    const [showNote, setShowNote] = useState(false);

    const formatTime = (timestamp) => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        // If it's exactly midnight or 12:00, we check if it's likely a date-only task
        // but typically we just show the time if scheduled.
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    const formattedTime = formatTime(task.dueDate);

    return (
        <div className={`
        rounded-lg border transition-all duration-300 overflow-hidden group/card
        ${task.isCompleted
                ? 'bg-dark-900/60 border-dark-700/50 opacity-60'
                : 'bg-dark-800 border-dark-700 hover:border-neon-500/50 shadow-lg'
            }
    `}>
            {/* Main Content Area */}
            <div className="p-2.5">
                <div className="flex items-start gap-2">
                    {/* Checkbox */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(task.id);
                        }}
                        className={`mt-0.5 p-0.5 rounded transition-colors ${task.isCompleted ? 'text-neon-500 bg-neon-500/10' : 'text-slate-500 hover:text-neon-400'}`}
                    >
                        {task.isCompleted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>

                    {/* Title and Time - Click to Toggle Note */}
                    <div
                        onClick={() => setShowNote(!showNote)}
                        className="cursor-pointer mb-2 min-h-[1.5rem] flex-1 overflow-hidden"
                    >
                        <span className={`text-xs font-medium leading-relaxed block transition-colors ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200 group-hover/card:text-neon-400'}`}>
                            {task.title}
                        </span>
                        {formattedTime && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-light">
                                <Clock className="w-3 h-3" /> {formattedTime}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center pt-1.5 border-t border-white/5 justify-end">
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                            title="Editar"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Borrar"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Note */}
            {showNote && task.notes && (
                <div className="bg-dark-950/80 px-3 py-2 text-[11px] text-slate-400 border-t border-white/5 font-light leading-relaxed animate-fade-in whitespace-pre-wrap italic">
                    <div className="flex items-center gap-1 mb-1 text-slate-500 uppercase tracking-wider text-[8px] font-bold">
                        <FileText className="w-3 h-3 text-neon-500/50" /> Detalle
                    </div>
                    {task.notes}
                </div>
            )}
        </div>
    );
};

export default MiniTaskCard;

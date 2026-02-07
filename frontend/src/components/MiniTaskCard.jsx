import React, { useState } from 'react';
import { Priority } from '../types';
import { Eye, Pencil, X, Check, FileText } from 'lucide-react';

const MiniTaskCard = ({ task, onToggle, onDelete, onEdit }) => {
    const [showNote, setShowNote] = useState(false);

    return (
        <div className={`
        rounded-lg border transition-all duration-300 overflow-hidden
        ${task.isCompleted
                ? 'bg-dark-900/40 border-dark-700/50 opacity-60'
                : 'bg-dark-800/60 border-dark-700 hover:border-neon-500/30'
            }
    `}>
            {/* Title Row */}
            <div className="p-2.5">
                <div className="flex items-start gap-2 mb-2">
                    <button
                        onClick={() => onToggle(task.id)}
                        className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-neon-500 border-neon-500 text-dark-900' : 'border-slate-600'}`}
                    >
                        {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className={`text-xs font-medium leading-tight ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {task.title}
                    </span>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-end gap-1 pt-1 border-t border-white/5">
                    {task.notes && (
                        <button
                            onClick={() => setShowNote(!showNote)}
                            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${showNote ? 'text-neon-400' : 'text-slate-500 hover:text-neon-400'}`}
                            title="Ver nota"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                    )}

                    <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 rounded text-slate-500 hover:text-blue-400 hover:bg-white/10 transition-colors"
                        title="Editar"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors"
                        title="Borrar"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Expanded Note */}
            {showNote && task.notes && (
                <div className="bg-dark-900/50 px-3 py-2 text-[11px] text-slate-400 border-t border-white/5 font-light leading-relaxed animate-fade-in">
                    <div className="flex items-center gap-1 mb-1 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                        <FileText className="w-3 h-3" /> Nota
                    </div>
                    {task.notes}
                </div>
            )}
        </div>
    );
};

export default MiniTaskCard;

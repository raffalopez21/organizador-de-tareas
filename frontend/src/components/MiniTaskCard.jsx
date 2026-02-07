import React, { useState } from 'react';
import { Eye, Pencil, X, FileText } from 'lucide-react';

const MiniTaskCard = ({ task, onToggle, onDelete, onEdit }) => {
    const [showNote, setShowNote] = useState(false);

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
                {/* Title - Click to Toggle */}
                <div
                    onClick={() => onToggle(task.id)}
                    className="cursor-pointer mb-2 min-h-[1.5rem]"
                >
                    <span className={`text-xs font-medium leading-relaxed block transition-colors ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200 group-hover/card:text-neon-400'}`}>
                        {task.title}
                    </span>
                </div>

                {/* Footer Actions */}
                <div className={`flex items-center pt-1.5 border-t border-white/5 ${task.notes ? 'justify-between' : 'justify-end'}`}>
                    {task.notes && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNote(!showNote);
                            }}
                            className={`p-1 rounded hover:bg-neon-500/10 transition-colors ${showNote ? 'text-neon-400' : 'text-slate-500 hover:text-neon-400'}`}
                            title="Ver nota"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                    )}

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

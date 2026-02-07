import React, { useState } from 'react';
import { Trash2, Calendar, Clock, Eye } from 'lucide-react';

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

const TaskItem = React.memo(({ task, onToggle, onDelete }) => {
    const [showNotes, setShowNotes] = useState(false);
    const formattedDate = formatDate(task.dueDate);
    const formattedTime = formatTime(task.dueDate);

    return (
        <div
            className={`group relative mb-3 transition-all duration-300 ease-out 
        ${task.isCompleted ? 'opacity-40' : 'opacity-100 hover:transform hover:translate-x-1'}`}
        >
            <div className={`
        relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300
        ${task.isCompleted
                    ? 'bg-dark-800/30 border-dark-700/50'
                    : 'bg-dark-800/80 border-dark-700 hover:border-neon-500/30 hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]'
                }
      `}>

                <div className="p-4">
                    <div className="flex justify-between items-start gap-4">
                        {/* Title - Click to Toggle */}
                        <h3
                            onClick={() => onToggle(task.id)}
                            className={`
                text-base font-medium leading-tight truncate pr-2 transition-all duration-300 cursor-pointer select-none flex-1
                ${task.isCompleted ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200 hover:text-neon-400'}
              `}
                            title="Click para completar"
                        >
                            {task.title}
                        </h3>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(task.id);
                                }}
                                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Metadata Row: Date, Notes Toggle */}
                    <div className="flex items-center gap-3 mt-2 min-h-[20px]">
                        {formattedDate && (
                            <div className="flex items-center gap-1 text-xs text-neon-400/80">
                                <Calendar className="w-3 h-3" />
                                <span>{formattedDate}</span>
                                {formattedTime && (
                                    <span className="flex items-center gap-1 ml-1 text-slate-500">
                                        <Clock className="w-3 h-3" /> {formattedTime}
                                    </span>
                                )}
                            </div>
                        )}
                        {task.notes && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowNotes(!showNotes);
                                }}
                                className={`flex items-center gap-1 text-xs transition-colors ${showNotes ? 'text-neon-400' : 'text-slate-500 hover:text-slate-300'}`}
                                title={showNotes ? "Ocultar notas" : "Ver notas"}
                            >
                                <Eye className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Notes Section (Toggleable) */}
                    {showNotes && task.notes && (
                        <div className="mt-2 text-sm text-slate-400 font-light whitespace-pre-wrap leading-relaxed border-l-2 border-slate-700 pl-2 animate-fade-in">
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

import React, { useState } from 'react';

const CATEGORIES = {
    personal: { label: 'Personal', color: 'border-l-emerald-500' },
    work: { label: 'Trabajo', color: 'border-l-blue-500' },
    urgent: { label: 'Urgente', color: 'border-l-rose-500' },
};

export const TaskItem = ({ task, onToggle, onDelete, onUpdate, index }) => {
    const categoryConfig = CATEGORIES[task.category] || CATEGORIES.personal;
    const [isEditing, setIsEditing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(task.description || '');

    const handleSave = () => {
        onUpdate(task.id, {
            ...task,
            title: editedTitle,
            description: editedDescription
        });
        setIsEditing(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            className={`relative mb-3 rounded-lg glass-panel transition-all duration-500 ease-out border-l-2 pioneer-hover group ${task.completed ? 'border-l-gray-700 opacity-60' : categoryConfig.color
                }`}
            style={{
                animation: `float 0.5s ease-out backwards`,
                animationDelay: `${index * 50}ms`
            }}
        >
            <div className="flex items-center p-4">
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(task.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border transition-all duration-300 flex items-center justify-center mr-4 ${task.completed
                            ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400'
                            : 'border-white/20 hover:border-emerald-500/50 text-transparent'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform duration-300 ${task.completed ? 'scale-100' : 'scale-0'}`}><polyline points="20 6 9 17 4 12" /></svg>
                </button>

                {/* Content Area */}
                <div className="flex-grow min-w-0 mr-4 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-emerald-500/50 outline-none"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    ) : (
                        <div>
                            <p className={`text-sm font-medium tracking-wide transition-all duration-300 truncate ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
                                }`}>
                                {task.title}
                            </p>
                            <div className="flex items-center mt-1 gap-3">
                                <div className="flex items-center text-[10px] text-emerald-500/80 font-mono tracking-tight">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 opacity-70"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    {formatDate(task.date)}
                                </div>
                                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-px rounded bg-white/5 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {CATEGORIES[task.category]?.label || 'Personal'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isEditing ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSave(); }}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            title="Guardar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                className="p-1.5 text-gray-400 hover:text-emerald-300 hover:bg-white/5 rounded transition-colors"
                                title="Editar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-900/20 rounded transition-colors"
                                title="Eliminar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Expandable Details */}
            {showDetails && (
                <div className="px-4 pb-4 pl-12 animate-[fadeIn_0.2s_ease-out]">
                    {isEditing ? (
                        <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Añadir descripción..."
                            className="w-full bg-black/30 border border-white/10 rounded px-2 py-2 text-xs text-gray-300 focus:border-emerald-500/50 outline-none h-20 resize-none"
                        />
                    ) : (
                        <div className="text-xs text-gray-400 bg-black/20 p-3 rounded border border-white/5 italic">
                            {task.description ? task.description : "Sin descripción."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

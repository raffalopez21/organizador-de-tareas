import React, { useState } from 'react';
import { Check, X, Pencil, Eye, EyeOff, Save, Calendar } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import { format } from 'date-fns';

export const TaskItem = ({ task, onToggle, onDelete, onUpdate, index }) => {
    const categoryConfig = CATEGORIES[task.category] || CATEGORIES['personal'];
    const [isEditing, setIsEditing] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [editedText, setEditedText] = useState(task.text);
    const [editedNotes, setEditedNotes] = useState(task.notes || '');

    const handleSave = () => {
        onUpdate({
            ...task,
            text: editedText,
            notes: editedNotes
        });
        setIsEditing(false);
    };

    const formattedDate = task.dueDate ? format(new Date(task.dueDate), "MMM d, h:mm a") : '';

    return (
        <div
            className={`relative mb-3 rounded-lg glass-panel transition-all duration-500 ease-out border-l-2 pioneer-hover group ${task.completed ? 'border-l-gray-700 opacity-60' : `border-l-${categoryConfig.color.split('-')[1]}-500`
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
                    <Check size={12} className={`transform transition-transform duration-300 ${task.completed ? 'scale-100' : 'scale-0'}`} />
                </button>

                {/* Content Area */}
                <div className="flex-grow min-w-0 mr-4">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-emerald-500/50 outline-none"
                            />
                        </div>
                    ) : (
                        <div>
                            <p className={`text-sm font-medium tracking-wide transition-all duration-300 truncate ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
                                }`}>
                                {task.text}
                            </p>
                            <div className="flex items-center mt-1 gap-3">
                                <div className="flex items-center text-[10px] text-emerald-500/80 font-mono tracking-tight">
                                    <Calendar size={10} className="mr-1 opacity-70" />
                                    {formattedDate}
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
                        <button
                            onClick={handleSave}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            title="Save"
                        >
                            <Save size={14} />
                        </button>
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
            {(showNotes || (isEditing && showNotes)) && (
                <div className="px-4 pb-4 pl-12 animate-[fadeIn_0.2s_ease-out]">
                    {isEditing ? (
                        <textarea
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            placeholder="Add notes..."
                            className="w-full bg-black/30 border border-white/10 rounded px-2 py-2 text-xs text-gray-300 focus:border-emerald-500/50 outline-none h-20 resize-none"
                        />
                    ) : (
                        <div className="text-xs text-gray-400 bg-black/20 p-3 rounded border border-white/5 italic">
                            {task.notes ? task.notes : "No notes added."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

import React, { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { Check, Pencil, Eye, X, Save, Calendar as CalendarIcon, Clock, Square, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

export const CalendarView = ({ tasks, mode, onToggle, onDelete, onUpdate, onTaskClick }) => {
    const [currentReferenceDate, setCurrentReferenceDate] = useState(new Date());
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [showNotesTaskId, setShowNotesTaskId] = useState(null);

    // Editing states (mini-form)
    const [editedText, setEditedText] = useState('');
    const [editedNotes, setEditedNotes] = useState('');
    const [editedDate, setEditedDate] = useState('');
    const [editedHour, setEditedHour] = useState('00');
    const [editedMinute, setEditedMinute] = useState('00');

    // Generate days based on mode
    let days = [];
    if (mode === 'week') {
        const start = startOfWeek(currentReferenceDate, { weekStartsOn: 1 }); // Monday start
        days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    } else {
        const start = startOfWeek(startOfMonth(currentReferenceDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentReferenceDate), { weekStartsOn: 1 });
        days = eachDayOfInterval({ start, end });
    }

    const navigate = (direction) => {
        if (mode === 'week') {
            setCurrentReferenceDate(direction === 'next' ? addWeeks(currentReferenceDate, 1) : subWeeks(currentReferenceDate, 1));
        } else {
            setCurrentReferenceDate(direction === 'next' ? addMonths(currentReferenceDate, 1) : subMonths(currentReferenceDate, 1));
        }
    };

    const goToToday = () => setCurrentReferenceDate(new Date());

    const getTasksForDay = (date) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            return isSameDay(new Date(task.dueDate), date);
        });
    };

    const startEditing = (task) => {
        setEditingTaskId(task.id);
        setEditedText(task.text);
        setEditedNotes(task.notes || '');
        const d = new Date(task.dueDate);
        setEditedDate(d.toISOString().split('T')[0]);
        setEditedHour(d.getHours().toString().padStart(2, '0'));
        setEditedMinute(d.getMinutes().toString().padStart(2, '0'));
    };

    const handleSave = (task) => {
        const newDueStamp = new Date(`${editedDate}T${editedHour}:${editedMinute}:00`).getTime();
        onUpdate({
            ...task,
            text: editedText,
            notes: editedNotes,
            dueDate: newDueStamp
        });
        setEditingTaskId(null);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <div className="w-full h-full pb-10 overflow-x-auto">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-serif italic text-emerald-100 min-w-[180px]">
                        {format(currentReferenceDate, mode === 'week' ? 'MMMM yyyy' : 'MMMM yyyy')}
                    </h2>
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        <button onClick={() => navigate('prev')} className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-emerald-400 transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={goToToday} className="px-3 text-[10px] uppercase tracking-widest text-gray-500 hover:text-emerald-400 transition-colors font-mono">
                            Hoy
                        </button>
                        <button onClick={() => navigate('next')} className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-emerald-400 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={`grid gap-2 min-w-[1000px] ${mode === 'month' ? 'grid-cols-7 grid-flow-row auto-rows-min' : 'grid-cols-1 md:grid-cols-7'}`}>
                {/* Headers for Month View */}
                {mode === 'month' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-[10px] uppercase tracking-widest text-emerald-500/60 py-2">
                        {day}
                    </div>
                ))}

                {days.map((day) => {
                    const dayTasks = getTasksForDay(day);
                    const isCurrentMonth = mode === 'week' || isSameMonth(day, currentReferenceDate);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[150px] h-auto glass-panel rounded-lg p-2 flex flex-col transition-all duration-300 hover:bg-white/5 ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'
                                } ${isCurrentDay ? 'border-emerald-500/30 bg-emerald-900/10' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-mono ${isCurrentDay ? 'text-emerald-400 font-bold' : 'text-gray-500'}`}>
                                    {format(day, mode === 'week' ? 'EEEE d' : 'd')}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-[9px] bg-white/10 px-1.5 rounded-full text-gray-300">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>

                            <div className="flex-grow space-y-2 pr-1">
                                {dayTasks.map(task => {
                                    const categoryConfig = CATEGORIES[task.category] || CATEGORIES['personal'];
                                    const categoryColor = categoryConfig.color.replace('bg-', '');
                                    const isEditing = editingTaskId === task.id;
                                    const isShowingNotes = showNotesTaskId === task.id;
                                    const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`group relative text-xs p-2 rounded border-l-2 transition-all ${task.completed ? 'bg-emerald-950/20 opacity-60' : 'bg-black/40'
                                                } border-l-${categoryColor}-500 hover:bg-black/60 shadow-sm`}
                                        >
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <input
                                                        value={editedText}
                                                        onChange={(e) => setEditedText(e.target.value)}
                                                        className="w-full bg-black/60 border border-white/10 rounded px-1 py-0.5 text-white outline-none"
                                                    />
                                                    <textarea
                                                        value={editedNotes}
                                                        onChange={(e) => setEditedNotes(e.target.value)}
                                                        placeholder="Notes..."
                                                        className="w-full bg-black/60 border border-white/10 rounded px-1 py-0.5 text-gray-400 outline-none h-10 resize-none"
                                                    />
                                                    <div className="flex flex-wrap gap-1">
                                                        <input
                                                            type="date"
                                                            value={editedDate}
                                                            onChange={(e) => setEditedDate(e.target.value)}
                                                            className="bg-black/40 border border-white/10 rounded px-1 py-0.5 text-[8px] [color-scheme:dark]"
                                                        />
                                                        <div className="flex items-center bg-black/40 rounded px-1">
                                                            <select value={editedHour} onChange={(e) => setEditedHour(e.target.value)} className="bg-transparent border-none p-0 outline-none">
                                                                {hours.map(h => <option key={h} value={h} className="bg-[#001d11]">{h}</option>)}
                                                            </select>
                                                            <span>:</span>
                                                            <select value={editedMinute} onChange={(e) => setEditedMinute(e.target.value)} className="bg-transparent border-none p-0 outline-none">
                                                                {minutes.map(m => <option key={m} value={m} className="bg-[#001d11]">{m}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-1 pt-1 border-t border-white/5">
                                                        <button onClick={() => handleSave(task)} className="text-emerald-400 p-0.5 hover:bg-emerald-500/20 rounded"><Save size={10} /></button>
                                                        <button onClick={() => setEditingTaskId(null)} className="text-rose-400 p-0.5 hover:bg-rose-500/20 rounded"><X size={10} /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-start gap-1 justify-between">
                                                        <div className="flex items-start gap-2 flex-grow min-w-0">
                                                            {/* Checkbox on the left */}
                                                            <button
                                                                onClick={() => onToggle(task.id)}
                                                                className={`mt-0.5 flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}
                                                            >
                                                                {task.completed ? <CheckSquare size={12} /> : <Square size={12} />}
                                                            </button>

                                                            {/* Task text wraps as needed */}
                                                            <div
                                                                className={`flex-grow cursor-pointer break-words leading-tight py-0.5 min-w-0 ${task.completed ? 'line-through text-gray-500' : isOverdue ? 'text-rose-500 font-bold' : 'text-gray-100'}`}
                                                                onClick={() => onTaskClick(task.id)}
                                                            >
                                                                {task.text}
                                                                {isOverdue && <span className="ml-1 text-[10px] bg-rose-500/20 px-1.5 rounded-full uppercase tracking-tighter text-rose-400 font-bold whitespace-nowrap">!</span>}
                                                            </div>
                                                        </div>

                                                        {/* Actions on the right - dedicated space */}
                                                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity ml-2 mt-0.5 bg-black/20 md:bg-transparent rounded-md p-0.5">
                                                            <button
                                                                onClick={() => setShowNotesTaskId(isShowingNotes ? null : task.id)}
                                                                className={`p-1 rounded hover:bg-white/10 ${isShowingNotes ? 'text-emerald-400 bg-emerald-900/20' : 'text-gray-400 hover:text-emerald-300'}`}
                                                                title="Notes"
                                                            >
                                                                <Eye size={11} />
                                                            </button>
                                                            <button
                                                                onClick={() => startEditing(task)}
                                                                className="p-1 text-gray-400 hover:text-emerald-300 hover:bg-white/10 rounded"
                                                                title="Edit"
                                                            >
                                                                <Pencil size={11} />
                                                            </button>
                                                            <button
                                                                onClick={() => onDelete(task.id)}
                                                                className="p-1 text-gray-400 hover:text-rose-400 hover:bg-rose-900/10 rounded"
                                                                title="Delete"
                                                            >
                                                                <X size={11} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {isShowingNotes && (
                                                        <div className="mt-1 p-1 bg-black/30 rounded border border-white/5 text-[8px] text-gray-400 italic break-words flex items-center justify-between">
                                                            <span>{task.notes || "No notes."}</span>
                                                            <span className="text-emerald-500/80 font-mono ml-2 flex-shrink-0">
                                                                {format(new Date(task.dueDate), "HH:mm")}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )
                                            }
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


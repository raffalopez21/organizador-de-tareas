import React, { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Check, Pencil, Eye, X, Save, Calendar as CalendarIcon, Clock } from 'lucide-react';

export const CalendarView = ({ tasks, mode, onToggle, onDelete, onUpdate, onTaskClick }) => {
    const today = new Date();
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
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    } else {
        const start = startOfWeek(startOfMonth(today), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(today), { weekStartsOn: 1 });
        days = eachDayOfInterval({ start, end });
    }

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
        <div className="w-full">
            <div className={`grid gap-2 ${mode === 'month' ? 'grid-cols-7' : 'grid-cols-1 md:grid-cols-7'}`}>
                {/* Headers for Month View */}
                {mode === 'month' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-[10px] uppercase tracking-widest text-emerald-500/60 py-2">
                        {day}
                    </div>
                ))}

                {days.map((day) => {
                    const dayTasks = getTasksForDay(day);
                    const isCurrentMonth = mode === 'week' || isSameMonth(day, today);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[120px] glass-panel rounded-lg p-2 flex flex-col transition-all duration-300 hover:bg-white/5 ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'
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

                            <div className="flex-grow space-y-1.5 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                                {dayTasks.map(task => {
                                    let borderColor = 'border-emerald-500';
                                    if (task.category === 'urgent') borderColor = 'border-rose-500';
                                    if (task.category === 'work') borderColor = 'border-blue-500';

                                    const isEditing = editingTaskId === task.id;
                                    const isShowingNotes = showNotesTaskId === task.id;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`group relative text-[9px] p-2 rounded border-l-2 transition-all ${task.completed ? 'opacity-50' : ''
                                                } ${borderColor} bg-black/20 hover:bg-black/40`}
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
                                                    <div className="flex items-center justify-between gap-1">
                                                        <div
                                                            className={`whitespace-normal line-clamp-2 flex-grow cursor-pointer ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}
                                                            onClick={() => onTaskClick(task.id)}
                                                        >
                                                            {task.text}
                                                        </div>
                                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => onToggle(task.id)}
                                                                className={`p-0.5 rounded ${task.completed ? 'text-emerald-400 bg-emerald-900/20' : 'text-gray-500 hover:text-emerald-400'}`}
                                                            >
                                                                <Check size={9} />
                                                            </button>
                                                            <button
                                                                onClick={() => startEditing(task)}
                                                                className="p-0.5 text-gray-500 hover:text-emerald-300 hover:bg-white/10 rounded"
                                                            >
                                                                <Pencil size={9} />
                                                            </button>
                                                            <button
                                                                onClick={() => setShowNotesTaskId(isShowingNotes ? null : task.id)}
                                                                className={`p-0.5 rounded ${isShowingNotes ? 'text-emerald-400 bg-emerald-900/20' : 'text-gray-500 hover:text-emerald-300'}`}
                                                            >
                                                                <Eye size={9} />
                                                            </button>
                                                            <button
                                                                onClick={() => onDelete(task.id)}
                                                                className="p-0.5 text-gray-500 hover:text-rose-400 hover:bg-rose-900/10 rounded"
                                                            >
                                                                <X size={9} />
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


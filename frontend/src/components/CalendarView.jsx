import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
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

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over) {
            const taskId = active.id;
            const newDateStr = over.id;
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const oldDate = new Date(task.dueDate);
                const newDate = new Date(newDateStr);
                // Keep the same time
                newDate.setHours(oldDate.getHours());
                newDate.setMinutes(oldDate.getMinutes());

                onUpdate({
                    ...task,
                    dueDate: newDate.getTime()
                });
            }
        }
    };

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="w-full h-full pb-10">
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

                <div className={`grid gap-3 w-full ${mode === 'month' ? 'grid-cols-7 grid-flow-row auto-rows-min' : 'grid-cols-1 md:grid-cols-7'}`}>
                    {/* Headers for Month View */}
                    {mode === 'month' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center text-[10px] uppercase tracking-widest text-emerald-500/60 py-2">
                            {day}
                        </div>
                    ))}

                    {days.map((day) => (
                        <DroppableDay
                            key={day.toISOString()}
                            day={day}
                            isCurrentMonth={mode === 'week' || isSameMonth(day, currentReferenceDate)}
                            isCurrentDay={isToday(day)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-mono uppercase tracking-widest ${isToday(day) ? 'text-emerald-400 font-bold' : 'text-gray-500'}`}>
                                    {format(day, mode === 'week' ? 'EEEE d' : 'd')}
                                </span>
                                {getTasksForDay(day).length > 0 && (
                                    <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-bold border border-emerald-500/20">
                                        {getTasksForDay(day).length}
                                    </span>
                                )}
                            </div>

                            <div className="flex-grow space-y-2 pr-1">
                                {getTasksForDay(day).map(task => (
                                    <DraggableTask
                                        key={task.id}
                                        task={task}
                                        isEditing={editingTaskId === task.id}
                                        isShowingNotes={showNotesTaskId === task.id}
                                        onToggle={onToggle}
                                        onDelete={onDelete}
                                        onTaskClick={onTaskClick}
                                        startEditing={startEditing}
                                        handleSave={handleSave}
                                        setEditingTaskId={setEditingTaskId}
                                        setShowNotesTaskId={setShowNotesTaskId}
                                        editedText={editedText}
                                        setEditedText={setEditedText}
                                        editedNotes={editedNotes}
                                        setEditedNotes={setEditedNotes}
                                        editedDate={editedDate}
                                        setEditedDate={setEditedDate}
                                        editedHour={editedHour}
                                        setEditedHour={setEditedHour}
                                        editedMinute={editedMinute}
                                        setEditedMinute={setEditedMinute}
                                        hours={hours}
                                        minutes={minutes}
                                    />
                                ))}
                            </div>
                        </DroppableDay>
                    ))}
                </div>
            </div>
        </DndContext>
    );
};

const DroppableDay = ({ day, isCurrentMonth, isCurrentDay, children }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: day.toISOString(),
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[220px] h-auto glass-panel rounded-2xl p-4 flex flex-col transition-all duration-500 border-white/5 ${!isCurrentMonth ? 'opacity-20 saturate-0' : 'opacity-100'
                } ${isCurrentDay ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''} ${isOver ? 'bg-emerald-500/10 scale-[1.02] border-emerald-500/40' : 'hover:glass-panel-heavy'}`}
        >
            {children}
        </div>
    );
};

const DraggableTask = ({
    task, isEditing, isShowingNotes, onToggle, onDelete, onTaskClick,
    startEditing, handleSave, setEditingTaskId, setShowNotesTaskId,
    editedText, setEditedText, editedNotes, setEditedNotes,
    editedDate, setEditedDate, editedHour, setEditedHour,
    editedMinute, setEditedMinute, hours, minutes
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        disabled: isEditing
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: 0.8,
    } : undefined;

    const categoryConfig = CATEGORIES[task.category] || CATEGORIES['personal'];
    const categoryColor = categoryConfig.color.replace('bg-', '');
    const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;
    const isNearDeadline = task.dueDate && task.dueDate > Date.now() && task.dueDate - Date.now() < 24 * 60 * 60 * 1000 && !task.completed;

    return (
        <div ref={setNodeRef} style={style} className={`${isDragging ? 'pointer-events-none' : ''}`}>
            <div
                className={`group relative text-[13px] p-3 rounded-xl border-l-[3px] transition-all duration-300 ${task.completed ? 'bg-emerald-950/10 opacity-40' : 'bg-white/[0.04]'
                    } border-l-${categoryColor}-500 hover:bg-white/[0.08] hover:translate-x-1 shadow-md mb-2 ${(isOverdue || isNearDeadline) ? 'glow-border-emerald' : ''}`}
            >
                {isEditing ? (
                    <div className="space-y-2">
                        <input
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-white outline-none"
                        />
                        <textarea
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            placeholder="Notes..."
                            className="w-full bg-black/60 border border-white/10 rounded px-2 py-1 text-gray-400 outline-none h-10 resize-none"
                        />
                        <div className="flex flex-wrap gap-1">
                            <input
                                type="date"
                                value={editedDate}
                                onChange={(e) => setEditedDate(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded px-1 py-0.5 text-[10px] [color-scheme:dark]"
                            />
                            <div className="flex items-center bg-black/40 rounded px-1 text-[10px]">
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
                            <button onClick={() => handleSave(task)} className="text-emerald-400 p-0.5 hover:bg-emerald-500/20 rounded"><Save size={14} /></button>
                            <button onClick={() => setEditingTaskId(null)} className="text-rose-400 p-0.5 hover:bg-rose-500/20 rounded"><X size={14} /></button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            {/* Titulo en la parte superior y medio */}
                            <div
                                className="w-full text-center px-1"
                                {...listeners}
                                {...attributes}
                            >
                                <div
                                    className={`cursor-grab active:cursor-grabbing break-words leading-[1.4] py-1 min-w-0 font-medium tracking-tight inline-block mx-auto ${task.completed ? 'line-through text-gray-500 font-normal' : isOverdue ? 'text-rose-400 font-bold' : 'text-slate-100'}`}
                                    onClick={() => onTaskClick(task.id)}
                                >
                                    {task.text}
                                    {isOverdue && (
                                        <div className="mt-1">
                                            <span className="text-[8px] bg-rose-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest text-rose-400 font-bold border border-rose-500/20">
                                                vencida
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botones en la fila inferior */}
                            <div className="flex items-center justify-center gap-1 flex-wrap pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                                    className={`p-1.5 rounded-md transition-all duration-300 hover:scale-110 ${task.completed ? 'text-emerald-400' : 'text-gray-400 hover:text-emerald-400'}`}
                                    title={task.completed ? "Reactivar" : "Completar"}
                                >
                                    {task.completed ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2} />}
                                </button>

                                <button
                                    onClick={() => setShowNotesTaskId(isShowingNotes ? null : task.id)}
                                    className={`p-1.5 rounded-md hover:bg-white/10 ${isShowingNotes ? 'text-emerald-400 bg-emerald-900/20' : 'text-gray-400 hover:text-emerald-300'}`}
                                    title="Notas"
                                >
                                    <Eye size={14} strokeWidth={2} />
                                </button>

                                <button
                                    onClick={() => startEditing(task)}
                                    className="p-1.5 text-gray-400 hover:text-emerald-300 hover:bg-white/10 rounded-md transition-colors"
                                    title="Editar"
                                >
                                    <Pencil size={14} strokeWidth={2} />
                                </button>

                                <button
                                    onClick={() => onDelete(task.id)}
                                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-900/20 rounded-md transition-colors"
                                    title="Eliminar"
                                >
                                    <X size={14} strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                        {isShowingNotes && (
                            <div className="mt-2 p-2 bg-black/40 rounded-lg border border-white/5 text-[10px] text-gray-400 italic break-words flex items-center justify-between">
                                <span>{task.notes || "Sin notas."}</span>
                                <span className="text-emerald-500/80 font-mono ml-2 flex-shrink-0">
                                    {format(new Date(task.dueDate), "HH:mm")}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};


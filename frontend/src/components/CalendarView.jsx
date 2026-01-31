import React from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

export const CalendarView = ({ tasks, mode, onTaskClick }) => {
    const today = new Date();

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

    return (
        <div className={`grid gap-2 ${mode === 'month' ? 'grid-cols-7' : 'grid-cols-1 md:grid-cols-7'}`}>
            {/* Headers for Month View */}
            {mode === 'month' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-[10px] uppercase tracking-widest text-emerald-500/60 py-2">
                    {day}
                </div>
            ))}

            {days.map((day, idx) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = mode === 'week' || isSameMonth(day, today);
                const isCurrentDay = isToday(day);

                return (
                    <div
                        key={day.toISOString()}
                        className={`min-h-[100px] glass-panel rounded-lg p-2 flex flex-col transition-all duration-300 hover:bg-white/5 ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'
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

                        <div className="flex-grow space-y-1 overflow-y-auto max-h-[120px] custom-scrollbar">
                            {dayTasks.map(task => {
                                let borderColor = 'border-emerald-500';
                                if (task.category === 'urgent') borderColor = 'border-rose-500';
                                if (task.category === 'work') borderColor = 'border-blue-500';

                                return (
                                    <div
                                        key={task.id}
                                        className={`text-[9px] p-1.5 rounded border-l-2 truncate cursor-pointer transition-colors hover:bg-white/10 ${task.completed ? 'opacity-50 line-through' : ''
                                            } ${borderColor}`}
                                        onClick={() => onTaskClick(task.id)}
                                        title={task.text}
                                    >
                                        {task.text}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

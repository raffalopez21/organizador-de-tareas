import React from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

export const CalendarView = ({ tasks, mode, onTaskClick, currentDate }) => {
    const referenceDate = currentDate || new Date();

    let days = [];
    if (mode === 'semana') {
        const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
        days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    } else {
        const start = startOfWeek(startOfMonth(referenceDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(referenceDate), { weekStartsOn: 1 });
        days = eachDayOfInterval({ start, end });
    }

    const getTasksForDay = (date) => {
        return tasks.filter(task => {
            if (!task.date) return false;
            const taskDate = new Date(task.date);
            return isSameDay(taskDate, date);
        });
    };

    return (
        <div className={`grid gap-2 ${mode === 'mes' ? 'grid-cols-7' : 'grid-cols-1 md:grid-cols-7'}`}>
            {mode === 'mes' && ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center text-[10px] uppercase tracking-widest text-emerald-500/60 py-2">
                    {day}
                </div>
            ))}

            {days.map((day) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = mode === 'semana' || isSameMonth(day, referenceDate);
                const isCurrentDay = isToday(day);

                return (
                    <div
                        key={day.toISOString()}
                        className={`min-h-[100px] glass-panel rounded-lg p-2 flex flex-col transition-all duration-300 hover:bg-white/5 ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'
                            } ${isCurrentDay ? 'border-emerald-500/30 bg-emerald-900/10' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-mono capitalize ${isCurrentDay ? 'text-emerald-400 font-bold' : 'text-gray-500'}`}>
                                {format(day, mode === 'semana' ? 'EEEE d' : 'd', { locale: es })}
                            </span>
                            {dayTasks.length > 0 && (
                                <span className="text-[9px] bg-white/10 px-1.5 rounded-full text-gray-300">
                                    {dayTasks.length}
                                </span>
                            )}
                        </div>

                        <div className="flex-grow space-y-1 overflow-y-auto max-h-[120px]">
                            {dayTasks.map(task => (
                                <div
                                    key={task.id}
                                    className={`text-[9px] p-1.5 rounded border-l-2 truncate cursor-pointer transition-colors hover:bg-white/10 ${task.completed ? 'opacity-50 line-through' : ''
                                        } ${task.category === 'urgent' ? 'border-rose-500' : task.category === 'work' ? 'border-blue-500' : 'border-emerald-500'}`}
                                    onClick={() => onTaskClick(task)}
                                    title={task.title}
                                >
                                    {task.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

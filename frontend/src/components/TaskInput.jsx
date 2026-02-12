import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus, Loader2, Command, Calendar as CalendarIcon, FileText, X, Clock, ChevronDown, Save, Pencil } from 'lucide-react';
import { breakdownTask, isAIReady } from '../services/geminiService';

// Generate time arrays
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

const TaskInput = ({ onSaveTask, taskToEdit, onCancelEdit }) => {
    const [input, setInput] = useState('');
    const [notes, setNotes] = useState('');

    // Helper to get professional default time (next full hour)
    const getCurrentTime = () => {
        const now = new Date();
        // Professional apps typically suggest the next full hour
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1);
        nextHour.setMinutes(0);

        const year = nextHour.getFullYear();
        const month = String(nextHour.getMonth() + 1).padStart(2, '0');
        const day = String(nextHour.getDate()).padStart(2, '0');
        const hour = String(nextHour.getHours()).padStart(2, '0');
        const minute = String(nextHour.getMinutes()).padStart(2, '0');
        return {
            date: `${year}-${month}-${day}`,
            hour,
            minute
        };
    };

    const initialTime = getCurrentTime();
    const [date, setDate] = useState(initialTime.date);
    const [hour, setHour] = useState(initialTime.hour);
    const [minute, setMinute] = useState(initialTime.minute);

    const [isProcessing, setIsProcessing] = useState(false);
    const [useAI, setUseAI] = useState(isAIReady);
    const [showOptions, setShowOptions] = useState(false);
    const dropdownRef = useRef(null);

    // Populate form when editing
    useEffect(() => {
        if (taskToEdit) {
            setInput(taskToEdit.title);
            setNotes(taskToEdit.notes || '');

            if (taskToEdit.dueDate) {
                const d = new Date(taskToEdit.dueDate);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                setDate(`${year}-${month}-${day}`);
                setHour(String(d.getHours()).padStart(2, '0'));
                setMinute(String(d.getMinutes()).padStart(2, '0'));
            } else {
                const now = getCurrentTime();
                setDate(now.date);
                setHour(now.hour);
                setMinute(now.minute);
            }
            setShowOptions(true);
        } else {
            setInput('');
            setNotes('');
            const now = getCurrentTime();
            setDate(now.date);
            setHour(now.hour);
            setMinute(now.minute);
        }
    }, [taskToEdit]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const rawTitle = input.trim();
        const currentNotes = notes.trim();

        let dueDate = null;
        if (date) {
            const timeStr = (hour !== '' && minute !== '') ? `${hour}:${minute}` : '12:00';
            const dateStr = `${date}T${timeStr}`;
            dueDate = new Date(dateStr).getTime();
        }

        const baseData = {
            title: rawTitle,
            notes: currentNotes,
            dueDate: dueDate
        };

        setInput('');
        setNotes('');
        const now = getCurrentTime();
        setDate(now.date);
        setHour(now.hour);
        setMinute(now.minute);
        setShowOptions(false);

        if (taskToEdit) {
            onSaveTask({ ...taskToEdit, ...baseData });
            if (onCancelEdit) onCancelEdit();
            return;
        }

        if (useAI) {
            setIsProcessing(true);
            try {
                const analysis = await breakdownTask(rawTitle);
                const aiNotes = analysis.subtasks && analysis.subtasks.length > 0
                    ? `\n\nDesglose IA:\n${analysis.subtasks.map(s => `- ${s}`).join('\n')}`
                    : '';

                onSaveTask({
                    ...baseData,
                    notes: (baseData.notes + aiNotes).trim(),
                    isCompleted: false,
                });
            } catch (err) {
                onSaveTask({ ...baseData, isCompleted: false });
            } finally {
                setIsProcessing(false);
            }
        } else {
            onSaveTask({ ...baseData, isCompleted: false });
        }
    };

    const toggleAI = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!taskToEdit) {
            setUseAI(!useAI);
        }
    };

    return (
        <>
            {showOptions && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[35] transition-all animate-fade-in duration-300"></div>
            )}

            <div className="relative mb-8 group z-40" ref={dropdownRef}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500 ${taskToEdit ? 'from-blue-500 to-indigo-500' : 'from-neon-500/50 to-teal-500/50'}`}></div>

                {/* Using body background color #020617 for consistency */}
                <div className={`relative bg-[#020617] border border-dark-700 shadow-2xl transition-all duration-300 rounded-2xl ${showOptions ? 'ring-2 ring-neon-500/20' : ''}`}>
                    <form onSubmit={handleSubmit} className="flex items-center">
                        <div className="pl-4 text-slate-500">
                            {taskToEdit ? <Pencil className="w-5 h-5 text-blue-400" /> : <Command className="w-5 h-5" />}
                        </div>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => setShowOptions(true)}
                            placeholder={taskToEdit ? "Editando tarea..." : "Presiona '/' para buscar o escribe..."}
                            className="w-full bg-transparent text-slate-100 placeholder-slate-600 px-4 py-4 text-lg outline-none font-light"
                            disabled={isProcessing}
                        />

                        <div className="pr-2 flex items-center gap-1">
                            {taskToEdit && (
                                <button
                                    type="button"
                                    onClick={() => { onCancelEdit(); setShowOptions(false); }}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors mr-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowOptions(!showOptions)}
                                className={`p-2 rounded-lg transition-all duration-300 ${showOptions || date ? 'text-neon-400 bg-neon-400/10' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </button>

                            {/* Corrected AI Toggle button - explicitly type="button" */}
                            <button
                                type="button"
                                onClick={toggleAI}
                                disabled={!isAIReady}
                                className={`p-2 rounded-lg transition-all duration-300 ${!isAIReady ? 'opacity-30 cursor-not-allowed grayscale' : useAI ? 'text-neon-400 bg-neon-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-600 hover:text-slate-400 bg-white/5'}`}
                                title={!isAIReady ? "IA No configurada (Falta API Key)" : useAI ? "Análisis IA ACTIVADO" : "Análisis IA DESACTIVADO"}
                            >
                                <Sparkles className={`w-5 h-5 ${useAI && isAIReady ? 'animate-pulse' : ''}`} />
                            </button>

                            <button
                                type="submit"
                                disabled={!input.trim() || isProcessing}
                                className={`p-2 rounded-lg transition-all duration-300 border border-slate-700 ${taskToEdit ? 'bg-blue-600/30 text-blue-400 hover:bg-blue-600/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50'}`}
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-neon-400" /> : taskToEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showOptions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-4 py-4 border-t border-dark-700 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1 flex items-center gap-1">
                                        <CalendarIcon className="w-3 h-3" /> Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-neon-500 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Hora
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={hour}
                                                onChange={(e) => setHour(e.target.value)}
                                                className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-2 pr-6 py-2 text-sm text-slate-100 outline-none cursor-pointer"
                                            >
                                                <option value="">--</option>
                                                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                        <div className="text-slate-600 flex items-center">:</div>
                                        <div className="relative flex-1">
                                            <select
                                                value={minute}
                                                onChange={(e) => setMinute(e.target.value)}
                                                className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-2 pr-6 py-2 text-sm text-slate-100 outline-none cursor-pointer"
                                            >
                                                <option value="">--</option>
                                                {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Notas / Descripción
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Detalles adicionales para tildeAI..."
                                    rows={2}
                                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-neon-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskInput;

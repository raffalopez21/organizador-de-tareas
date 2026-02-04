import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

export const TaskInput = ({ onAdd }) => {
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState('personal');

    // Initialize with current date and time
    const now = new Date();
    const [date, setDate] = useState(now.toISOString().split('T')[0]);
    const [hour, setHour] = useState(now.getHours().toString().padStart(2, '0'));
    const [minute, setMinute] = useState(now.getMinutes().toString().padStart(2, '0'));

    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            const dueStamp = new Date(`${date}T${hour}:${minute}:00`).getTime();
            onAdd(text, category, dueStamp, notes);
            setText('');
            setNotes('');
            setIsExpanded(false);

            const nextNow = new Date();
            setDate(nextNow.toISOString().split('T')[0]);
            setHour(nextNow.getHours().toString().padStart(2, '0'));
            setMinute(nextNow.getMinutes().toString().padStart(2, '0'));
        }
    };

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <form onSubmit={handleSubmit} className="relative z-10 mb-8">
            <div
                className={`glass-panel rounded-2xl p-2 transition-all duration-500 pioneer-hover ${isExpanded ? 'ring-1 ring-white/20 shadow-[0_0_40px_rgba(1,49,16,0.4)]' : ''
                    }`}
            >
                <div className="flex flex-col px-4 py-2 gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            if (e.target.value.length > 0) setIsExpanded(true);
                        }}
                        onFocus={() => {
                            if (text.length > 0) setIsExpanded(true);
                        }}
                        placeholder="New task..."
                        className="flex-grow bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg font-light tracking-wide h-10 md:h-12"
                    />

                    {/* Expandable Notes Area */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-32 opacity-100 mt-2 mb-4' : 'max-h-0 opacity-0'}`}>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add more details or notes..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-emerald-500/30 transition-colors h-24 resize-none italic"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Date Selector */}
                        <div className="relative group flex items-center bg-black/20 border border-white/10 rounded-lg px-2 overflow-hidden hover:border-emerald-500/30 transition-colors">
                            <Calendar size={14} className="text-emerald-500/70 mr-1" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent border-none py-1.5 text-xs text-gray-300 focus:outline-none w-[110px] [color-scheme:dark]"
                            />
                        </div>

                        {/* Time Selector */}
                        <div className="relative group flex items-center bg-black/20 border border-white/10 rounded-lg px-2 hover:border-emerald-500/30 transition-colors">
                            <Clock size={14} className="text-emerald-500/70 mr-1" />
                            <div className="flex items-center gap-1">
                                <select
                                    value={hour}
                                    onChange={(e) => setHour(e.target.value)}
                                    className="bg-transparent border-none py-1.5 text-xs text-gray-300 focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                                >
                                    {hours.map(h => <option key={h} value={h} className="bg-[#001d11]">{h}</option>)}
                                </select>
                                <span className="text-gray-600 text-[10px]">:</span>
                                <select
                                    value={minute}
                                    onChange={(e) => setMinute(e.target.value)}
                                    className="bg-transparent border-none py-1.5 text-xs text-gray-300 focus:outline-none cursor-pointer hover:text-emerald-400 transition-colors"
                                >
                                    {minutes.map(m => <option key={m} value={m} className="bg-[#001d11]">{m}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 pb-2 border-t border-white/5 pt-3">
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(CATEGORIES).map((cat) => (
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full transition-all duration-300 border ${category === cat
                                    ? `bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]`
                                    : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                    }`}
                            >
                                {CATEGORIES[cat].label}
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {isExpanded && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(false)}
                                className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors px-2"
                            >
                                Simple view
                            </button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            type="submit"
                            disabled={!text.trim()}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${text.trim()
                                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95'
                                : 'bg-white/5 text-gray-700 cursor-not-allowed'
                                }`}
                        >
                            <Plus size={20} strokeWidth={3} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </form>
    );
};


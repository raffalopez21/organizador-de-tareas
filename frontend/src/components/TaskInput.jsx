import React, { useState } from 'react';

const CATEGORIES = {
    personal: { label: 'Personal', color: 'bg-emerald-500' },
    work: { label: 'Trabajo', color: 'bg-blue-500' },
    urgent: { label: 'Urgente', color: 'bg-rose-500' },
};

export const TaskInput = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('personal');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            const localDateTime = date ? date : new Date().toISOString().slice(0, 16);
            onAdd({
                title,
                description,
                date: localDateTime,
                category,
                usuario_id: 1
            });
            setTitle('');
            setDescription('');
            setDate('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative z-10 mb-8">
            <div
                className={`glass-panel rounded-2xl p-2 transition-all duration-500 pioneer-hover ${isFocused ? 'ring-1 ring-white/20 shadow-[0_0_30px_rgba(1,49,16,0.3)]' : ''
                    }`}
            >
                <div className="flex flex-col md:flex-row md:items-center px-4 py-2 gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="¿Qué hay que hacer?..."
                        className="flex-grow bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg font-light tracking-wide h-10 md:h-12"
                        required
                    />

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/70"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <input
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg py-1.5 pl-8 pr-2 text-xs text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-colors w-44"
                                aria-label="Fecha de vencimiento"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between px-4 pb-2 border-t border-white/5 pt-3 gap-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                        {Object.keys(CATEGORIES).map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all duration-300 border whitespace-nowrap ${category === cat
                                        ? `bg-[#00322e] border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.1)]`
                                        : 'bg-transparent border-white/5 text-gray-500 hover:border-white/20'
                                    }`}
                            >
                                {CATEGORIES[cat].label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className={`w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 self-end md:self-auto ${title.trim()
                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                </div>
            </div>
        </form>
    );
};

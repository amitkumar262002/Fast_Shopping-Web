import React from 'react';
import { RotateCcw } from 'lucide-react';

const FilterReset = ({ onReset }) => {
    return (
        <button
            onClick={onReset}
            className="group flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all duration-500 border border-slate-100 hover:border-red-100 shadow-sm"
        >
            <RotateCcw size={14} className="group-hover:rotate-[-180deg] transition-transform duration-700" />
            <span className="text-[10px] font-black uppercase tracking-[2px] italic">Clear Analytics</span>
        </button>
    );
};

export default FilterReset;

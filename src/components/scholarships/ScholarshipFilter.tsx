'use client';

import { motion } from 'framer-motion';
import { Filter, Search, X, ChevronDown, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDIAN_STATES, COURSES, INCOME_RANGES, CATEGORIES, GENDERS } from '@/lib/constants';
import type { ScholarshipFilters } from '@/types';

interface ScholarshipFilterProps {
  filters: ScholarshipFilters;
  onChange: (filters: ScholarshipFilters) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSavedOnly: boolean;
  onSavedOnlyChange: (value: boolean) => void;
}

function GlassSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl',
            'px-3.5 py-2.5 pr-9 text-sm text-slate-200',
            'outline-none focus:border-blue-500/30 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)]',
            'transition-all duration-300 cursor-pointer',
            value ? 'text-slate-200' : 'text-slate-500'
          )}
        >
          <option value="" className="bg-slate-950 text-slate-400">
            All
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-950 text-slate-200">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

export default function ScholarshipFilter({
  filters,
  onChange,
  searchQuery,
  onSearchChange,
  showSavedOnly,
  onSavedOnlyChange,
}: ScholarshipFilterProps) {
  const updateFilter = (key: keyof ScholarshipFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      state: '',
      course: '',
      incomeRange: '',
      category: '',
      gender: '',
    });
    onSearchChange('');
    onSavedOnlyChange(false);
  };

  const hasFilters =
    Object.values(filters).some((v) => v !== '') ||
    searchQuery !== '' ||
    showSavedOnly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-200">Filter & Search Scholarships</h3>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* Saved only Toggle */}
          <button
            onClick={() => onSavedOnlyChange(!showSavedOnly)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-300",
              showSavedOnly
                ? "bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-slate-500 hover:text-slate-200"
            )}
            title="Toggle saved scholarships list only"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved Only
          </button>

          {hasFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </motion.button>
          )}
        </div>
      </div>

      {/* Real-time search bar */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search scholarships by title, provider, or tags (e.g. AICTE, NSP, DST)..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 pl-11 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500/30 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] transition-all duration-300"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Select dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <GlassSelect
          label="State"
          value={filters.state}
          options={INDIAN_STATES}
          onChange={(v) => updateFilter('state', v)}
        />
        <GlassSelect
          label="Course"
          value={filters.course}
          options={COURSES}
          onChange={(v) => updateFilter('course', v)}
        />
        <GlassSelect
          label="Income Range"
          value={filters.incomeRange}
          options={INCOME_RANGES}
          onChange={(v) => updateFilter('incomeRange', v)}
        />
        <GlassSelect
          label="Category"
          value={filters.category}
          options={CATEGORIES}
          onChange={(v) => updateFilter('category', v)}
        />
        <GlassSelect
          label="Gender"
          value={filters.gender}
          options={GENDERS}
          onChange={(v) => updateFilter('gender', v)}
        />
      </div>
    </motion.div>
  );
}

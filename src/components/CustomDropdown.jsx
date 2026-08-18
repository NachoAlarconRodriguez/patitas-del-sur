import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  label,
  icon: Icon,
  value,
  options = [],
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  rightAction = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard interaction
  useEffect(() => {
    function handleKeyDown(event) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Find currently selected option
  const selectedOption = options.find((opt) =>
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const getLabel = (opt) => {
    if (!opt) return placeholder;
    return typeof opt === 'object' ? opt.label : opt;
  };

  return (
    <div className={`relative w-full select-none ${className}`} ref={dropdownRef}>
      {/* Label and optional right action */}
      {(label || rightAction) && (
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          {label && (
            <label className="flex items-center gap-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
              {Icon && <Icon className="w-3.5 h-3.5 text-[#0E8388]" />}
              <span>{label}</span>
            </label>
          )}
          {rightAction}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-3.5 py-3 rounded-2xl bg-white border text-left flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer shadow-xs ${
          isOpen
            ? 'border-[#0E8388] ring-4 ring-[#0E8388]/10 bg-white shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
        }`}
      >
        <span className="text-xs font-bold text-slate-800 truncate block">
          {getLabel(selectedOption)}
        </span>

        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isOpen ? 'bg-[#0E8388]/10 text-[#0E8388]' : 'text-slate-400'}`}>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-[#0E8388]' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl p-1.5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto space-y-0.5">
          {options.map((option) => {
            const optVal = typeof option === 'object' ? option.value : option;
            const optLabel = typeof option === 'object' ? option.label : option;
            const isSelected = optVal === value;

            return (
              <div
                key={optVal}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(optVal, option);
                  setIsOpen(false);
                }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0E8388]/10 text-[#0A3E40] font-black'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                }`}
              >
                <span className="truncate block">{optLabel}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#0E8388] stroke-[2.5] shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

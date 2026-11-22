import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({
  id,
  label,
  icon: Icon,
  value,
  options = [],
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  buttonClassName = '',
  labelClassName = '',
  popoverClassName = '',
  rightAction = null,
  disabled = false,
  usePortal = false,
  align = 'left',
  minMenuWidth = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [portalCoords, setPortalCoords] = useState(null);

  // Position calculation for portal mode
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vpWidth = window.visualViewport?.width || window.innerWidth;
    const vpHeight = window.visualViewport?.height || window.innerHeight;
    const spaceBelow = vpHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;

    const menuWidth = Math.min(Math.max(rect.width, minMenuWidth || 0), vpWidth - 24);
    const preferredLeft = align === 'right' ? rect.right - menuWidth : rect.left;
    const clampedLeft = Math.min(
      Math.max(12, preferredLeft),
      Math.max(12, vpWidth - menuWidth - 12)
    );

    setPortalCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left: clampedLeft,
      openUp,
      width: menuWidth,
      maxWidth: vpWidth - 24,
    });
  }, [align, minMenuWidth]);

  useEffect(() => {
    if (!isOpen) return;

    if (usePortal) {
      updatePosition();
      const handleScroll = (e) => {
        if (menuRef.current && menuRef.current.contains(e.target)) return;
        updatePosition();
      };
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', handleScroll, true);
      const vv = window.visualViewport;
      if (vv) {
        vv.addEventListener('resize', updatePosition);
        vv.addEventListener('scroll', updatePosition);
      }
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', handleScroll, true);
        if (vv) {
          vv.removeEventListener('resize', updatePosition);
          vv.removeEventListener('scroll', updatePosition);
        }
      };
    }
  }, [isOpen, usePortal, updatePosition]);

  // Close when clicking or tapping outside (attached only while open; ignores touch scroll)
  useEffect(() => {
    if (!isOpen) return;

    let touchStartPos = null;
    let touchMoved = false;

    const isInside = (target) => {
      const inTrigger = triggerRef.current && triggerRef.current.contains(target);
      const inMenu = menuRef.current && menuRef.current.contains(target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      return inTrigger || inMenu || inDropdown;
    };

    const handleMouseDown = (event) => {
      if (!isInside(event.target)) {
        setIsOpen(false);
      }
    };

    const handleTouchStart = (event) => {
      const touch = event.touches?.[0];
      touchStartPos = touch ? { x: touch.clientX, y: touch.clientY } : null;
      touchMoved = false;
    };

    const handleTouchMove = (event) => {
      if (!touchStartPos) return;
      const touch = event.touches?.[0];
      if (!touch) return;
      if (Math.abs(touch.clientX - touchStartPos.x) > 8 || Math.abs(touch.clientY - touchStartPos.y) > 8) {
        touchMoved = true;
      }
    };

    const handleTouchEnd = (event) => {
      if (!touchMoved && !isInside(event.target)) {
        setIsOpen(false);
      }
      touchStartPos = null;
      touchMoved = false;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  // Handle keyboard interaction
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
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
    if (opt === undefined || opt === null) return placeholder;
    return typeof opt === 'object' ? opt.label : opt;
  };

  const menuContent = (
    <div
      ref={menuRef}
      style={
        usePortal && portalCoords
          ? {
              position: 'fixed',
              top: portalCoords.openUp ? undefined : `${portalCoords.top}px`,
              bottom: portalCoords.openUp ? `${window.innerHeight - portalCoords.top}px` : undefined,
              left: `${portalCoords.left}px`,
              minWidth: portalCoords.width ? `${portalCoords.width}px` : undefined,
              maxWidth: portalCoords.maxWidth ? `${portalCoords.maxWidth}px` : undefined,
              zIndex: 99999,
            }
          : undefined
      }
      className={
        usePortal
          ? `bg-white rounded-2xl p-1.5 shadow-2xl border border-slate-200/90 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto space-y-0.5 select-none ${popoverClassName}`
          : `absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 z-[60] bg-white rounded-2xl p-1.5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto space-y-0.5 select-none ${popoverClassName}`
      }
    >
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
              if (onChange) onChange(optVal, option);
              setIsOpen(false);
            }}
            className={`group flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-xs transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#F5BA13]/15 text-amber-950 font-black'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className="truncate block font-bold text-slate-800">{optLabel}</span>
              {typeof option === 'object' && option.desc && (
                <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                  {option.desc}
                </span>
              )}
            </div>
            {isSelected && (
              <Check className="w-3.5 h-3.5 text-amber-700 stroke-[2.5] shrink-0 ml-2" />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div id={id} className={`relative select-none ${className}`} ref={dropdownRef}>
      {/* Label and optional right action */}
      {(label || rightAction) && (
        <div className="flex items-center justify-between mb-1 px-0.5">
          {label && (
            <label className={labelClassName || "flex items-center gap-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]"}>
              {Icon && <Icon className="w-3.5 h-3.5 text-amber-700" />}
              <span>{label}</span>
            </label>
          )}
          {rightAction}
        </div>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full text-left flex items-center justify-between gap-1.5 transition-all duration-200 cursor-pointer shadow-xs ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${
          buttonClassName
            ? (typeof buttonClassName === 'function'
                ? buttonClassName(isOpen)
                : `${buttonClassName} ${isOpen ? 'border-[#F5BA13] ring-3 ring-[#F5BA13]/20 bg-white shadow-sm' : ''}`)
            : `px-3.5 py-3 rounded-2xl bg-white border ${
                isOpen
                  ? 'border-[#F5BA13] ring-4 ring-[#F5BA13]/15 bg-white shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
              }`
        }`}
      >
        <span className={`truncate block ${!value ? 'text-slate-400 font-semibold text-xs' : 'text-slate-900 font-bold text-xs'}`}>
          {getLabel(selectedOption)}
        </span>

        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${isOpen ? 'bg-[#F5BA13]/15 text-[#D97706]' : 'text-slate-400'}`}>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-[#D97706]' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown Menu (inline or portal) */}
      {isOpen && (usePortal ? createPortal(menuContent, document.body) : menuContent)}
    </div>
  );
}

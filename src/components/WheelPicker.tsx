import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { playTickFeedback } from '../utils/audio';

interface WheelPickerProps {
  label: string;
  value: number;
  min?: number;
  max: number;
  onChange: (val: number) => void;
  soundFeedback?: boolean;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  label,
  value,
  min = 0,
  max,
  onChange,
  soundFeedback = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 48; // px

  const range: number[] = [];
  for (let i = min; i <= max; i++) {
    range.push(i);
  }

  // Scroll to active item on mount or external value change
  useEffect(() => {
    if (containerRef.current) {
      const targetScroll = (value - min) * ITEM_HEIGHT;
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }
  }, [value, min]);

  const handleStep = (delta: number) => {
    const nextVal = Math.min(max, Math.max(min, value + delta));
    if (nextVal !== value) {
      if (soundFeedback) playTickFeedback();
      onChange(nextVal);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.min(range.length - 1, Math.max(0, index));
    const selectedNum = range[clampedIndex];
    if (selectedNum !== value) {
      if (soundFeedback) playTickFeedback();
      onChange(selectedNum);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </span>

      {/* Up Stepper Button */}
      <button
        type="button"
        onClick={() => handleStep(-1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="w-12 h-8 flex items-center justify-center text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 disabled:opacity-20 active:scale-90 transition-transform cursor-pointer"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Wheel Container */}
      <div className="relative w-20 h-[144px] overflow-hidden select-none">
        {/* Top & Bottom Gradient Fades */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/90 dark:from-slate-900/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/90 dark:from-slate-900/90 to-transparent z-10" />

        {/* Center Active Selection Pill */}
        <div
          className="pointer-events-none absolute inset-x-1 top-[48px] h-[48px] rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 z-0"
          aria-hidden="true"
        />

        {/* Scrollable list */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory relative z-10 py-[48px]"
          tabIndex={0}
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={label}
        >
          {range.map((num) => {
            const isSelected = num === value;
            return (
              <div
                key={num}
                onClick={() => {
                  if (num !== value) {
                    if (soundFeedback) playTickFeedback();
                    onChange(num);
                  }
                }}
                className={`h-[48px] flex items-center justify-center snap-center cursor-pointer font-bold transition-all duration-150 ${
                  isSelected
                    ? 'text-3xl text-orange-600 dark:text-orange-500 scale-110'
                    : 'text-lg text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              >
                {String(num).padStart(2, '0')}
              </div>
            );
          })}
        </div>
      </div>

      {/* Down Stepper Button */}
      <button
        type="button"
        onClick={() => handleStep(1)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="w-12 h-8 flex items-center justify-center text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 disabled:opacity-20 active:scale-90 transition-transform cursor-pointer"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
};

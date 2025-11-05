
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  colorClass?: string;
  heightClass?: string;
  barStyle?: React.CSSProperties;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  colorClass = 'bg-brand-accent',
  heightClass = 'h-2.5',
  barStyle,
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-slate-800 dark:text-brand-text">{label}</span>
          <span className="text-sm font-medium text-slate-500 dark:text-brand-text-secondary">{`${Math.round(percentage)}%`}</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-brand-border rounded-full ${heightClass}`}>
        <div
          className={`${colorClass} ${heightClass} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%`, ...barStyle }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-brand-secondary p-6 rounded-xl border border-slate-200 dark:border-brand-border shadow-lg hover:shadow-xl dark:hover:shadow-brand-accent/20 hover:border-slate-300 dark:hover:border-brand-accent/70 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
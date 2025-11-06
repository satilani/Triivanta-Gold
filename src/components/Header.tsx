import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Notification, NotificationType, UserRole } from '../types.ts';
// FIX: Updated import path for contexts to break circular dependency.
import { ThemeContext, RoleContext } from '../types.ts';

interface HeaderProps {
  title: string;
  currentView: View;
  notifications: Notification[];
  onDismissNotification: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onToggleSidebar: () => void;
  currentRole: UserRole;
}

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            className="text-slate-500 dark:text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-brand-border rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
        </button>
    );
};

const RoleSwitcher: React.FC = () => {
    const { role, setRole } = useContext(RoleContext);
    
    return (
        <div className="relative">
            <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border text-slate-900 dark:text-brand-text text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full p-2 pr-8 appearance-none"
            >
                {Object.values(UserRole).map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-brand-text-secondary">
                
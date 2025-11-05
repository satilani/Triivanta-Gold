import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Notification, NotificationType, UserRole } from '../types';
import { ThemeContext, RoleContext } from '../App';

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
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};


const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    const baseClasses = "h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0";
    switch (type) {
        case NotificationType.Alert:
            return <div className={`${baseClasses} bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>;
        case NotificationType.Info:
            return <div className={`${baseClasses} bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
        case NotificationType.Success:
            return <div className={`${baseClasses} bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
        default:
            return null;
    }
}

function formatDistanceToNow(date: Date): string {
    const demoNow = new Date('2026-02-15');
    const seconds = Math.floor((demoNow.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}


const Header: React.FC<HeaderProps> = ({ title, currentView, notifications, onDismissNotification, onMarkAsRead, onMarkAllAsRead, onToggleSidebar, currentRole }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleNotificationClick = (notification: Notification) => {
      if (!notification.read) {
          onMarkAsRead(notification.id);
      }
  }

  return (
    <header className="bg-white/80 dark:bg-brand-secondary/80 backdrop-blur-sm border-b border-slate-200 dark:border-brand-border p-4 shadow-md sticky top-0 z-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
            <button onClick={onToggleSidebar} className="text-slate-500 dark:text-brand-text-secondary mr-4 md:hidden" aria-label="Open sidebar">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-brand-text">{title}</h1>
                <p className="text-sm text-slate-500 dark:text-brand-text-secondary hidden sm:block">{currentView}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(prev => !prev)} className="text-slate-500 dark:text-brand-text-secondary hover:text-slate-900 dark:hover:text-brand-text transition-colors" aria-label={`View notifications. ${unreadCount} unread.`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white dark:ring-brand-secondary">{unreadCount}</span>
                    )}
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-brand-secondary rounded-lg shadow-2xl border border-slate-200 dark:border-brand-border origin-top-right animate-fade-in-down">
                        <div className="p-3 flex justify-between items-center border-b border-slate-200 dark:border-brand-border">
                            <h4 className="font-semibold text-slate-800 dark:text-brand-text">Notifications</h4>
                            {unreadCount > 0 && <button onClick={onMarkAllAsRead} className="text-sm text-brand-accent hover:underline">Mark all as read</button>}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 flex items-start border-b border-slate-200/50 dark:border-brand-border/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer ${!n.read ? 'bg-brand-accent/5 dark:bg-brand-accent/10' : ''}`}>
                                    <NotificationIcon type={n.type} />
                                    <div className="flex-1">
                                        <p className={`text-sm ${!n.read ? 'text-slate-800 dark:text-brand-text' : 'text-slate-500 dark:text-brand-text-secondary'}`}>{n.message}</p>
                                        <p className={`text-xs mt-1 ${!n.read ? 'text-brand-accent' : 'text-slate-400 dark:text-slate-500'}`}>{formatDistanceToNow(n.date)}</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); onDismissNotification(n.id); }} className="ml-2 text-slate-400 hover:text-slate-800 dark:hover:text-brand-text opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Dismiss notification: ${n.message}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )) : (
                                <p className="text-center text-slate-500 dark:text-brand-text-secondary p-8">No new notifications.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
             <div className="hidden sm:block">
                <RoleSwitcher />
            </div>
            <div className="flex items-center">
                <div className="relative">
                    <img className="h-10 w-10 rounded-full object-cover" src="https://picsum.photos/100" alt="User" />
                    <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-brand-secondary"></span>
                </div>
                 <div className="ml-3 hidden lg:block">
                    <p className="font-semibold text-sm text-slate-800 dark:text-brand-text">Project Admin</p>
                    <p className="text-xs text-slate-500 dark:text-brand-text-secondary">{currentRole}</p>
                 </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

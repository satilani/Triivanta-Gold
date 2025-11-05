import React from 'react';
import { View, UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../constants';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  role: UserRole;
}

const Icon: React.FC<{ view: View, className: string }> = ({ view, className }) => {
    switch (view) {
        case View.Dashboard:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
        case View.SiteLayout:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
        case View.Financials:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
        case View.Sales:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
        case View.Timeline:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case View.SalesPipeline:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
        case View.Brokers:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
        case View.Documents:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
        case View.Inventory:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
        case View.DPR:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
        case View.Employees:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
        case View.Messaging:
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
        default:
            return <></>;
    }
}

const NavItem: React.FC<{
  view: View;
  label: string;
  currentView: View;
  onClick: (view: View) => void;
}> = ({ view, label, currentView, onClick }) => {
  const isActive = view === currentView;
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 group ${
        isActive
          ? 'bg-brand-accent text-white font-semibold shadow-lg shadow-brand-accent/30'
          : 'text-slate-500 dark:text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-brand-border/50 hover:text-slate-800 dark:hover:text-brand-text'
      }`}
      onClick={() => onClick(view)}
    >
      <Icon view={view} className="h-5 w-5 mr-4" />
      <span className="font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, setIsOpen, role }) => {
  const allNavItems = [
    { view: View.Dashboard, label: 'Dashboard' },
    { view: View.SiteLayout, label: 'Site Layout' },
    { view: View.Financials, label: 'Financials' },
    { view: View.Sales, label: 'Sales' },
    { view: View.Timeline, label: 'Timeline' },
    { view: View.DPR, label: 'Daily Progress Report'},
    { view: View.SalesPipeline, label: 'Sales Pipeline' },
    { view: View.Brokers, label: 'Broker Management' },
    { view: View.Inventory, label: 'Inventory' },
    { view: View.Documents, label: 'Documents' },
    { view: View.Employees, label: 'Employee Management' },
    { view: View.Messaging, label: 'Messaging' },
  ];

  const allowedViews = ROLE_PERMISSIONS[role];
  const visibleNavItems = allNavItems.filter(item => allowedViews.includes(item.view));

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <aside className={`w-64 bg-white dark:bg-brand-secondary p-4 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-200 dark:border-brand-border z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center mb-10 pt-2">
              <div className="h-10 w-10 mr-3 p-1 bg-brand-dark rounded-md flex items-center justify-center">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJ3aGl0ZSI+PHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0iSW50ZXIsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5URzwvdGV4dD48L3N2Zz4=" alt="TRIIVANTA GOLD Logo" className="h-full w-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-brand-text">TRIIVANTA GOLD</h1>
          </div>
          <nav>
              <ul>
                  {visibleNavItems.map(item => (
                      <NavItem 
                          key={item.view}
                          view={item.view}
                          label={item.label}
                          currentView={currentView}
                          onClick={onViewChange}
                      />
                  ))}
              </ul>
          </nav>
          <div className="mt-auto pb-4">
              <div className="bg-slate-100 dark:bg-brand-dark ring-1 ring-slate-200 dark:ring-brand-border/60 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-slate-800 dark:text-brand-text">Project Progress</h4>
                  <p className="text-xs text-slate-500 dark:text-brand-text-secondary mt-1">On track for August 2026 completion.</p>
              </div>
          </div>
      </aside>
    </>
  );
};

export default Sidebar;
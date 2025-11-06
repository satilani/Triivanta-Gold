import React, { useState, useCallback, useEffect, useContext } from 'react';
// FIX: Remove file extensions from imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Financials from './components/Financials';
import Sales from './components/Sales';
import Timeline from './components/Timeline';
import { SalesPipeline } from './components/CRM';
import Brokers from './components/Brokers';
import SiteLayout from './components/SiteLayout';
import Documents from './components/Documents';
import Inventory from './components/Inventory';
import DPR from './components/DPR';
import Employees from './components/Employees';
import Messaging from './components/Messaging';
// FIX: Import contexts and related types from ./types to break circular dependency.
// FIX: Remove file extensions from imports
import { View, Notification, NotificationType, UserRole, DPREntry, ProjectPhase, Theme, ThemeContext, RoleContext } from './types';
import { ROLE_PERMISSIONS, DPR_DATA, PROJECT_TIMELINE } from './constants';

// The context definitions have been moved to types.ts to break a circular dependency.

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CEO);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};


const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { role } = useContext(RoleContext);
  
  // State lifted from DPR and Timeline components
  const [dprEntries, setDprEntries] = useState<DPREntry[]>(DPR_DATA);
  const [timelineData, setTimelineData] = useState<ProjectPhase[]>(PROJECT_TIMELINE);

  useEffect(() => {
    const allowedViews = ROLE_PERMISSIONS[role];
    if (!allowedViews.includes(currentView)) {
      setCurrentView(allowedViews[0] || View.Dashboard);
    }
  }, [role, currentView]);
  
  // Effect to synchronize timeline with the latest DPR
  useEffect(() => {
    if (dprEntries.length === 0) return;

    // 1. Find the latest DPR entry by date
    const latestDpr = [...dprEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    // 2. Create a Set of completed task IDs from this DPR for efficient lookup
    const completedDprTaskIds = new Set<string>();
    latestDpr.workProgress.forEach(task => {
      if (task.completed) {
        completedDprTaskIds.add(task.id);
      }
    });

    // 3. Update timeline data based on the completed DPR tasks
    const updatedTimeline = timelineData.map(phase => ({
      ...phase,
      keyActions: phase.keyActions.map(action => ({
        ...action,
        details: action.details.map(detail => ({
          ...detail,
          // The source of truth is the DPR. A task is complete if the latest DPR says so.
          completed: completedDprTaskIds.has(detail.id)
        }))
      }))
    }));
    
    // 4. Set the new state for the timeline
    // Note: A deep comparison could be added here to prevent re-renders if nothing changed,
    // but for this app's scale, it's efficient enough.
    setTimelineData(updatedTimeline);

  }, [dprEntries]); // This effect runs whenever DPR entries change

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: NotificationType.Success, message: 'Zila Panchayat final approval has been received.', date: new Date('2025-11-28'), read: false },
    { id: '2', type: NotificationType.Info, message: 'Founder\'s Tier is now 100% sold out.', date: new Date('2025-12-31'), read: false },
    { id: '3', type: NotificationType.Alert, message: 'Infrastructure budget for road construction is nearing 85% utilization.', date: new Date('2026-02-14'), read: false },
    { id: '5', type: NotificationType.Alert, message: 'Low stock alert: TMT Steel Bars (8mm) are below reorder level.', date: new Date('2026-02-15'), read: false },
    { id: '6', type: NotificationType.Info, message: 'DPR for 14th Feb has been submitted by the site supervisor.', date: new Date('2026-02-14'), read: false },
    { id: '4', type: NotificationType.Info, message: 'UPRERA registration has been successfully completed.', date: new Date('2026-01-14'), read: true },
  ]);

  const handleDismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard />;
      case View.SiteLayout:
        return <SiteLayout />;
      case View.Financials:
        return <Financials />;
      case View.Sales:
        return <Sales />;
      case View.Timeline:
        return <Timeline timelineData={timelineData} setTimelineData={setTimelineData} />;
      case View.SalesPipeline:
        return <SalesPipeline />;
      case View.Brokers:
        return <Brokers />;
      case View.Documents:
        return <Documents />;
      case View.Inventory:
        return <Inventory />;
      case View.DPR:
        return <DPR dprEntries={dprEntries} setDprEntries={setDprEntries} />;
      case View.Employees:
        return <Employees />;
      case View.Messaging:
        return <Messaging />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-brand-dark text-slate-800 dark:text-brand-text min-h-screen font-sans">
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        role={role}
      />
      <div className="md:ml-64 transition-all duration-300 ease-in-out">
        <Header 
          title="TRIIVANTA GOLD"
          currentView={currentView}
          notifications={notifications}
          onDismissNotification={handleDismissNotification}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentRole={role}
        />
        <main className="p-4 sm:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  </ThemeProvider>
);

export default App;

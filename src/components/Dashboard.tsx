import React, { useContext, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// FIX: Remove file extensions from imports
import {
  TOTAL_PROJECT_BUDGET,
  TOTAL_PLOTS,
  PROJECT_AREA_ACRES,
  PROJECT_DURATION_MONTHS,
  CURRENT_SPEND,
  SALES_TIERS,
  TOTAL_PLOTTED_AREA_SQFT,
  DPR_DATA,
  DPR_WORK_ITEMS,
  EMPLOYEE_DATA,
} from '../constants';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
// FIX: Updated import path for contexts to break circular dependency.
import { ThemeContext, RoleContext } from '../types';
import WorkProgressSummary from './WorkProgressSummary';
import { UserRole } from '../types';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="flex items-center">
        <div className="p-3 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 text-brand-accent dark:text-brand-accent mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-brand-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-brand-text">{value}</p>
        </div>
    </Card>
);

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
};


const Dashboard: React.FC = () => {
    const { theme } = useContext(ThemeContext);
    const { role } = useContext(RoleContext);

    const totalBudgetForDisplay = TOTAL_PROJECT_BUDGET;

    const totalSoldSqFt = SALES_TIERS.reduce((sum, tier) => sum + tier.soldSqFt, 0);
    const totalRevenue = SALES_TIERS.reduce((sum, tier) => sum + (tier.soldSqFt * tier.pricePerSqFt), 0);

    const plotSalesData = SALES_TIERS.map(tier => ({
        name: tier.name.replace(' Tier', ''),
        'Sold (sq.ft.)': tier.soldSqFt,
        'Target (sq.ft.)': tier.targetSqFt,
    })).sort((a, b) => a.name.localeCompare(b.name));

    const handleExportPdf = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("TRIIVANTA GOLD - Dashboard Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 14, 29);

        const projectMetricsData = [
            ['Total Project Cost', formatCurrency(totalBudgetForDisplay)],
            ['Total Plots', `${TOTAL_PLOTS}`],
            ['Project Area', `${PROJECT_AREA_ACRES} Acres`],
            ['Project Duration', `${PROJECT_DURATION_MONTHS} Months`],
        ];
        autoTable(doc, {
            startY: 35,
            head: [['Project Metric', 'Value']],
            body: projectMetricsData,
            theme: 'striped',
            headStyles: { fillColor: [197, 165, 101] },
        });

        const summaryData = [
            ['Budget Utilization', `${((CURRENT_SPEND / totalBudgetForDisplay) * 100).toFixed(1)}% (${formatCurrency(CURRENT_SPEND)})`],
            ['Plot Sales (by Area)', `${((totalSoldSqFt / TOTAL_PLOTTED_AREA_SQFT) * 100).toFixed(1)}% (${totalSoldSqFt.toLocaleString()} sq.ft.)`],
            ['Total Revenue Generated', formatCurrency(totalRevenue)],
        ];
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Summary Item', 'Value']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] }, 
        });
        
         const salesTiersBody = SALES_TIERS.map(tier => [
            tier.name,
            `${tier.soldSqFt.toLocaleString()} / ${tier.targetSqFt.toLocaleString()} sq.ft.`,
            formatCurrency(tier.soldSqFt * tier.pricePerSqFt)
        ]);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Sales Tier', 'Progress', 'Revenue']],
            body: salesTiersBody,
            theme: 'striped',
            headStyles: { fillColor: [197, 165, 101] },
        });

        doc.save('triivanta-gold-dashboard-report.pdf');
    };

    // Reusable component definitions for different dashboard sections
    const ProjectStatCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Project Cost" value={formatCurrency(totalBudgetForDisplay)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
            <StatCard title="Total Plots" value={`${TOTAL_PLOTS}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>} />
            <StatCard title="Project Area" value={`${PROJECT_AREA_ACRES} Acres`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            <StatCard title="Project Duration" value={`${PROJECT_DURATION_MONTHS} Months`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>
    );

    const ProgressAndFinancials = () => (
        <Card>
            <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-brand-text">Overall Progress</h3>
            <div className="space-y-6">
                <ProgressBar
                    value={CURRENT_SPEND}
                    max={totalBudgetForDisplay}
                    label="Budget Utilization"
                />
                <ProgressBar
                    value={totalSoldSqFt}
                    max={TOTAL_PLOTTED_AREA_SQFT}
                    label="Plot Sales (by Area)"
                    colorClass="bg-brand-accent-light"
                />
                <div>
                    <h4 className="text-lg font-medium text-slate-800 dark:text-brand-text mb-2">Financials</h4>
                    <p className="text-sm text-slate-500 dark:text-brand-text-secondary">Total Revenue</p>
                    <p className="text-2xl font-bold text-brand-accent">{formatCurrency(totalRevenue)}</p>
                    <p className="text-sm text-slate-500 dark:text-brand-text-secondary mt-2">Current Spend</p>
                    <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{formatCurrency(CURRENT_SPEND)}</p>
                </div>
            </div>
        </Card>
    );
    
    const PlotSalesChart = () => (
      <Card>
        <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-brand-text">Plot Sales Progress</h3>
         <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={plotSalesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" stroke={theme === 'dark' ? "#a99268" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={theme === 'dark' ? "#a99268" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} unit="k" tickFormatter={(value) => `${value/1000}`} />
              <Tooltip 
                  cursor={{fill: 'rgba(197, 165, 101, 0.1)'}} 
                  contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff', 
                      border: '1px solid #c5a565', 
                      color: theme === 'dark' ? '#f0e6d2' : '#1a1a1a', 
                      borderRadius: '0.5rem' 
                  }} 
                  formatter={(value: number) => `${value.toLocaleString()} sq.ft.`}
              />
              <Bar dataKey="Sold (sq.ft.)" fill="#c5a565" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );

    const SiteWorkProgress = () => (
        <WorkProgressSummary dprEntries={DPR_DATA} dprWorkItems={DPR_WORK_ITEMS} />
    );

    const HrStatCards = () => {
        const stats = useMemo(() => {
            const activeStaff = EMPLOYEE_DATA.filter(e => e.status === 'Active');
            const monthlyPayroll = activeStaff.reduce((sum, e) => sum + e.salary, 0);
            return { total: EMPLOYEE_DATA.length, active: activeStaff.length, payroll: monthlyPayroll };
        }, []);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Employees" value={`${stats.total}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>} />
                <StatCard title="Active Staff" value={`${stats.active}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>} />
                <StatCard title="Est. Monthly Payroll" value={formatCurrency(stats.payroll)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.133 0V7.418zM12.5 8.513V10a2.5 2.5 0 00-1.133 0V8.513a2.5 2.5 0 001.133 0zM8.433 10v1.698a2.5 2.5 0 001.133 0V10a2.5 2.5 0 00-1.133 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.876.763.5.5 0 00.655.753A3.5 3.5 0 018 7.5v1a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-1a3.5 3.5 0 01-1.124-2.144.5.5 0 00.655-.753A4.5 4.5 0 0011 5.092V5zM10 14a3.5 3.5 0 01-3.5-3.5V10a.5.5 0 01.5-.5h6a.5.5 0 01.5.5v.5a3.5 3.5 0 01-3.5 3.5z" clipRule="evenodd" /></svg>} />
            </div>
        );
    };

    const renderDashboardForRole = () => {
        switch(role) {
            case UserRole.CEO:
            case UserRole.ProjectManager:
                return (
                    <>
                        <ProjectStatCards />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ProgressAndFinancials />
                            <PlotSalesChart />
                            <div className="lg:col-span-2">
                                <SiteWorkProgress />
                            </div>
                        </div>
                    </>
                );

            case UserRole.Supervisor:
                return (
                     <>
                        <ProjectStatCards />
                        <SiteWorkProgress />
                    </>
                );
            
            case UserRole.HR:
                 return (
                     <>
                        <HrStatCards />
                        <Card>
                            <p className="text-center text-slate-500 dark:text-brand-text-secondary p-8">HR-specific widgets can be added here.</p>
                        </Card>
                     </>
                 );

            case UserRole.StoreManager:
                 return (
                     <>
                        <Card>
                            <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-brand-text">Welcome, Store Manager</h3>
                            <p className="text-slate-500 dark:text-brand-text-secondary">Please navigate to the Inventory section to manage site materials.</p>
                        </Card>
                     </>
                 );

            default:
                return <ProjectStatCards />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">Dashboard Overview</h2>
                { (role === UserRole.CEO || role === UserRole.ProjectManager) &&
                    <button
                        onClick={handleExportPdf}
                        className="bg-brand-accent/10 hover:bg-brand-accent/20 dark:bg-brand-accent/20 dark:hover:bg-brand-accent/30 text-brand-accent dark:text-brand-accent-light font-bold py-2 px-4 rounded-lg flex items-center transition-colors text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export PDF Report
                    </button>
                }
            </div>
            {renderDashboardForRole()}
        </div>
    );
};

export default Dashboard;

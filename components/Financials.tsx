
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, ComposedChart, Bar, Line, XAxis, YAxis } from 'recharts';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
import { COST_BREAKDOWN, FUNDING_SOURCES, SALES_TIERS, CASH_FLOW_DATA, COST_BREAKDOWN_COLORS, FUNDING_SOURCES_COLORS } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ThemeContext } from '../contexts';
import { CostCategory, Department } from '../types';

const departments: Department[] = ['Management', 'Engineering', 'Sales', 'HR & Admin', 'Site Operations'];

const EditBudgetModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<CostCategory, 'color'>) => void;
    itemToEdit: Omit<CostCategory, 'color'> | null;
}> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [formData, setFormData] = useState<Omit<CostCategory, 'color'>>({ name: '', value: 0, actual: 0, department: 'Management' });

    useEffect(() => {
        if (itemToEdit) {
            setFormData(itemToEdit);
        }
    }, [itemToEdit]);
    
    if (!isOpen || !itemToEdit) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['value', 'actual'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value as Department }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-brand-text">Edit Cost Category</h2>
                <p className="text-brand-accent mb-6">{formData.name}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Budgeted Value (INR)</label>
                        <input type="number" name="value" value={formData.value} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Actual Spend (INR)</label>
                        <input type="number" name="actual" value={formData.actual} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Assigned Department</label>
                        <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent">
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-slate-600 dark:text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                         <button type="submit" className="px-4 py-2 rounded-md bg-brand-accent text-white font-bold hover:bg-brand-accent-light">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Financials: React.FC = () => {
    const { theme } = useContext(ThemeContext);
    const [costItems, setCostItems] = useState(COST_BREAKDOWN);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Omit<CostCategory, 'color'> | null>(null);

    const costBreakdownData = useMemo(() => {
        return costItems.map(item => ({...item, color: COST_BREAKDOWN_COLORS[theme][item.colorKey]}))
    }, [costItems, theme]);
    
    const fundingSourcesData = FUNDING_SOURCES.map(item => ({...item, color: FUNDING_SOURCES_COLORS[theme][item.colorKey]}));
    
    const formatCurrency = (value: number) => `₹${(value / 10000000).toFixed(2)} Cr`;
    
    const formatSmallCurrency = (value: number) => {
        if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
        if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const totalBudget = useMemo(() => costItems.reduce((sum, item) => sum + item.value, 0), [costItems]);
    const currentSpend = useMemo(() => costItems.reduce((sum, item) => sum + item.actual, 0), [costItems]);

    const totalRevenue = SALES_TIERS.reduce((sum, tier) => sum + (tier.soldSqFt * tier.pricePerSqFt), 0);
    const potentialRevenue = SALES_TIERS.reduce((sum, tier) => sum + (tier.targetSqFt * tier.pricePerSqFt), 0);
    const projectedProfit = potentialRevenue - totalBudget;
    const profitMargin = potentialRevenue > 0 ? (projectedProfit / potentialRevenue) * 100 : 0;
    
    const handleEdit = (item: Omit<CostCategory, 'color'>) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleSave = (updatedItem: Omit<CostCategory, 'color'>) => {
        setCostItems(prevData => prevData.map(item => item.name === updatedItem.name ? {...item, ...updatedItem} : item));
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const CustomCashFlowTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const inflowData = payload.find(p => p.dataKey === 'inflow');
            const outflowData = payload.find(p => p.dataKey === 'outflow');
            const netData = payload.find(p => p.dataKey === 'net');
            
            return (
              <div className="bg-white dark:bg-brand-secondary p-3 rounded-lg border border-slate-200 dark:border-brand-border shadow-lg text-sm">
                <p className="font-bold mb-2 text-slate-800 dark:text-brand-text">{label}</p>
                {inflowData && <p style={{ color: inflowData.color }}>{`${inflowData.name}: ${formatSmallCurrency(inflowData.value)}`}</p>}
                {outflowData && <p style={{ color: outflowData.color }}>{`${outflowData.name}: ${formatSmallCurrency(Math.abs(outflowData.value))}`}</p>}
                {netData && <p className="font-semibold text-slate-800 dark:text-brand-text mt-1 pt-1 border-t border-slate-200 dark:border-brand-border">{`${netData.name}: ${formatSmallCurrency(netData.value)}`}</p>}
              </div>
            );
        }
        return null;
    };

    const handleExportCostAnalysis = () => {
        const headers = ['Category', 'Department', 'Budget (INR)', 'Actual Spend (INR)', 'Utilization (%)', 'Variance (INR)'];
        const data = costBreakdownData.map(item => {
            const variance = item.value - item.actual;
            const utilization = item.value > 0 ? (item.actual / item.value) * 100 : 0;
            return [
                item.name,
                item.department,
                item.value,
                item.actual,
                utilization.toFixed(2),
                variance
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + data.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "cost-analysis.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPdf = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("TRIIVANTA GOLD - Financial Summary", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 14, 29);

        const kpiData = [
            ['Total Budget', formatCurrency(totalBudget)],
            ['Actual Spend', formatCurrency(currentSpend)],
            ['Revenue Generated', formatCurrency(totalRevenue)],
            ['Projected Profit', formatCurrency(projectedProfit)],
            ['Profit Margin', `${profitMargin.toFixed(1)}%`],
        ];
        autoTable(doc, {
            startY: 35,
            head: [['Key Performance Indicator', 'Value']],
            body: kpiData,
            theme: 'striped',
            headStyles: { fillColor: [197, 165, 101] }, 
        });

        const costTableHeaders = ['Category', 'Department', 'Budget', 'Actual Spend', 'Variance'];
        const costTableBody = costBreakdownData.map(item => [
            item.name,
            item.department,
            formatSmallCurrency(item.value),
            formatSmallCurrency(item.actual),
            formatSmallCurrency(item.value - item.actual),
        ]);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [costTableHeaders],
            body: costTableBody,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] },
        });

        doc.save('financial-summary.pdf');
    };


  return (
    <>
    <div className="space-y-8">
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-brand-text">Financial Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
                <div>
                    <p className="text-slate-500 dark:text-brand-text-secondary text-sm">Total Budget</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-brand-text">{formatCurrency(totalBudget)}</p>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-brand-text-secondary text-sm">Actual Spend</p>
                    <p className="text-3xl font-bold text-orange-500 dark:text-orange-400">{formatCurrency(currentSpend)}</p>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-brand-text-secondary text-sm">Revenue Generated</p>
                    <p className="text-3xl font-bold text-brand-accent">{formatCurrency(totalRevenue)}</p>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-brand-text-secondary text-sm">Projected Profit</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(projectedProfit)}</p>
                </div>
                 <div>
                    <p className="text-slate-500 dark:text-brand-text-secondary text-sm">Profit Margin</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{profitMargin.toFixed(1)}%</p>
                </div>
            </div>
            <div className="mt-6">
                <ProgressBar value={currentSpend} max={totalBudget} label="Budget Utilization" heightClass="h-4" />
            </div>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-brand-text">Detailed Cost Analysis</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportPdf} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-bold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export PDF
                    </button>
                    <button onClick={handleExportCostAnalysis} className="bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 dark:text-slate-300 font-bold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-border">
                  <thead className="bg-slate-100 dark:bg-slate-900/60">
                      <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Department</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Budget</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Actual Spend</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Utilization</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Variance</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-brand-secondary divide-y divide-slate-200 dark:divide-brand-border">
                      {costBreakdownData.map((item) => {
                          const variance = item.value - item.actual;
                          const isOverBudget = variance < 0;
                          const utilization = item.value > 0 ? (item.actual / item.value) * 100 : 0;
                          
                          let utilizationColor = 'bg-brand-accent';
                          if (utilization > 100) {
                              utilizationColor = 'bg-red-500';
                          } else if (utilization >= 90) {
                              utilizationColor = 'bg-yellow-400';
                          }

                          return (
                              <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-brand-text">{item.name}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-brand-text-secondary">{item.department}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-brand-text-secondary">{formatSmallCurrency(item.value)}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-brand-text">{formatSmallCurrency(item.actual)}</td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                                      <div className="flex items-center">
                                          <div className="w-full max-w-[100px] bg-slate-200 dark:bg-brand-border rounded-full h-2.5 mr-3">
                                              <div
                                                  className={`${utilizationColor} h-2.5 rounded-full transition-all duration-500`}
                                                  style={{ width: `${Math.min(utilization, 100)}%` }}
                                              ></div>
                                          </div>
                                          <span className="text-slate-500 dark:text-brand-text-secondary font-medium w-12 text-right">
                                              {utilization.toFixed(1)}%
                                          </span>
                                      </div>
                                  </td>
                                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                      {formatSmallCurrency(variance)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                                      <button onClick={() => handleEdit(item)} className="text-brand-accent hover:text-brand-accent-light" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                      </button>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
                   <tfoot className="bg-slate-100 dark:bg-slate-900/60">
                        <tr>
                            <td colSpan={2} className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-brand-text">Total</td>
                            <td className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-brand-text">{formatCurrency(totalBudget)}</td>
                            <td className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-brand-text">{formatCurrency(currentSpend)}</td>
                            <td></td>
                            <td className={`px-4 py-3 text-left text-sm font-bold ${(totalBudget - currentSpend) < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {formatCurrency(totalBudget - currentSpend)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
              </table>
            </div>
        </Card>

        <div className="lg:col-span-2 space-y-8">
            <Card>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-brand-text mb-4">Funding Sources</h3>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                    <PieChart>
                        <Pie data={fundingSourcesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {fundingSourcesData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} formatter={(value: number) => `${value}%`} />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-brand-text mb-4">Projected Cash Flow</h3>
                 <div style={{ width: '100%', height: 250 }}>
                     <ResponsiveContainer>
                        <ComposedChart data={CASH_FLOW_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <XAxis dataKey="month" stroke={theme === 'dark' ? "#a99268" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis stroke={theme === 'dark' ? "#a99268" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value/100000}L`} />
                             <Tooltip content={<CustomCashFlowTooltip />} cursor={{ fill: 'rgba(197, 165, 101, 0.1)' }}/>
                             <Legend iconType="circle" wrapperStyle={{fontSize: "12px"}}/>
                             <Bar dataKey="inflow" name="Inflow" fill="#c5a565" radius={[4, 4, 0, 0]} />
                             <Bar dataKey="outflow" name="Outflow" fill="#a99268" radius={[4, 4, 0, 0]} />
                             <Line type="monotone" dataKey="net" name="Net Flow" stroke={theme === 'dark' ? "#f0e6d2" : "#1a1a1a"} strokeWidth={2} dot={{ r: 4 }} />
                        </ComposedChart>
                     </ResponsiveContainer>
                 </div>
            </Card>
        </div>
      </div>
    </div>
    <EditBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        itemToEdit={currentItem}
    />
    </>
  );
};

export default Financials;

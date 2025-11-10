
import React, { useState, useMemo, useContext } from 'react';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
import { 
    SALES_TIERS, 
    TOTAL_PLOTTED_AREA_SQFT, 
    SALES_VELOCITY_DATA, 
    PLOT_INVENTORY_DATA, 
    PLOT_DATA,
    SALES_PIPELINE_DATA,
    BROKER_DATA,
    SALES_TIERS_COLORS,
    PLOT_INVENTORY_COLORS
} from '../constants';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { PlotStatus } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ThemeContext } from '../contexts';

// Custom Tooltip for the Pie Chart
const CustomPieTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload }) => {
    const { theme } = useContext(ThemeContext);
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-brand-secondary p-3 rounded-lg border border-slate-200 dark:border-brand-border shadow-lg">
          <p className="text-sm text-slate-800 dark:text-brand-text">{`${payload[0].name}: ${payload[0].value} plots`}</p>
        </div>
      );
    }
    return null;
};


const Sales: React.FC = () => {
    const { theme } = useContext(ThemeContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PlotStatus | 'All'>('All');

    const themeSalesTiersColors = SALES_TIERS_COLORS[theme];
    const salesTiersWithColors = SALES_TIERS.map(tier => ({ ...tier, color: themeSalesTiersColors[tier.colorKey] }));
    const themePlotInventoryColors = PLOT_INVENTORY_COLORS[theme];
    const plotInventoryDataWithColors = PLOT_INVENTORY_DATA.map(d => ({ ...d, color: themePlotInventoryColors[d.colorKey]}));
    
    const totalSoldSqFt = salesTiersWithColors.reduce((sum, tier) => sum + tier.soldSqFt, 0);
    const totalRevenue = salesTiersWithColors.reduce((sum, tier) => sum + (tier.soldSqFt * tier.pricePerSqFt), 0);
    const potentialRevenue = salesTiersWithColors.reduce((sum, tier) => sum + (tier.targetSqFt * tier.pricePerSqFt), 0);
    
    const formatCurrencyInCr = (value: number) => `₹${(value / 10000000).toFixed(2)} Cr`;
    
    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const buyerMap = useMemo(() => new Map(SALES_PIPELINE_DATA.map(lead => [lead.id, lead.name])), []);
    const brokerMap = useMemo(() => new Map(BROKER_DATA.map(broker => [broker.id, broker.name])), []);

    const filteredPlots = useMemo(() => {
        return PLOT_DATA
            .filter(plot => statusFilter === 'All' || plot.status === statusFilter)
            .filter(plot => {
                if (!searchTerm.trim()) return true;
                const lowercasedTerm = searchTerm.toLowerCase();
                const buyerName = plot.buyerId ? buyerMap.get(plot.buyerId)?.toLowerCase() : '';
                const brokerName = plot.brokerId ? brokerMap.get(plot.brokerId)?.toLowerCase() : '';

                return (
                    plot.id.toLowerCase().includes(lowercasedTerm) ||
                    (buyerName && buyerName.includes(lowercasedTerm)) ||
                    (brokerName && brokerName.includes(lowercasedTerm))
                );
            });
    }, [searchTerm, statusFilter, buyerMap, brokerMap]);

    const statusColor = {
        Available: { bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400' },
        Booked: { bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400' },
        Sold: { bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400' },
    };

    const handleExport = () => {
        const headers = ['Plot ID', 'Size (sq.ft.)', 'Status', 'Price (INR)', 'Buyer', 'Broker'];
        const data = filteredPlots.map(plot => {
            const rowData = [
                plot.id,
                plot.size,
                plot.status,
                plot.size * plot.pricePerSqFt,
                plot.buyerId ? `"${buyerMap.get(plot.buyerId)}"` : '',
                plot.brokerId ? `"${brokerMap.get(plot.brokerId)}"` : ''
            ];
            return rowData.join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + data.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "plot-inventory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPdf = () => {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(18);
        doc.text("TRIIVANTA GOLD - Sales Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 14, 29);

        // Sales KPIs
        const salesKpis = [
            ['Total Area Sold', `${totalSoldSqFt.toLocaleString()} sq.ft. (${((totalSoldSqFt / TOTAL_PLOTTED_AREA_SQFT) * 100).toFixed(1)}%)`],
            ['Current Revenue Generated', formatCurrencyInCr(totalRevenue)],
            ['Total Potential Revenue', formatCurrencyInCr(potentialRevenue)],
        ];
        autoTable(doc, {
            startY: 35,
            head: [['Key Sales Metric', 'Value']],
            body: salesKpis,
            theme: 'striped',
            headStyles: { fillColor: [20, 184, 166] }, // brand-accent
        });

        // Sales Tiers
        const salesTiersBody = salesTiersWithColors.map(tier => [
            tier.name,
            `${tier.soldSqFt.toLocaleString()} / ${tier.targetSqFt.toLocaleString()} sq.ft.`,
            `${((tier.soldSqFt / tier.targetSqFt) * 100).toFixed(0)}%`,
            formatCurrencyInCr(tier.soldSqFt * tier.pricePerSqFt)
        ]);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Sales Tier', 'Progress', 'Completion', 'Revenue']],
            body: salesTiersBody,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] },
        });
        
        // Plot Inventory Status
        const plotInventoryBody = plotInventoryDataWithColors.map(item => [
            item.name,
            item.value.toString(),
            `${((item.value / PLOT_DATA.length) * 100).toFixed(1)}%`
        ]);
         autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Status', 'Number of Plots', '% of Total']],
            body: plotInventoryBody,
            theme: 'striped',
            headStyles: { fillColor: [20, 184, 166] },
        });

        doc.save('triivanta-gold-sales-report.pdf');
    };


    const TierCard: React.FC<{ tier: typeof salesTiersWithColors[0] }> = ({ tier }) => {
        const revenue = tier.soldSqFt * tier.pricePerSqFt;
        return (
            <Card className="flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold" style={{color: tier.color}}>{tier.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-brand-text-secondary mb-4">@ ₹{tier.pricePerSqFt.toLocaleString()}/sq.ft.</p>
                    <ProgressBar 
                        value={tier.soldSqFt} 
                        max={tier.targetSqFt} 
                        label="Sales Progress (sq.ft.)"
                        colorClass=""
                        barStyle={{ backgroundColor: tier.color }}
                    />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-brand-border flex justify-between items-baseline">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-brand-text-secondary">Revenue</p>
                        <p className="text-2xl font-semibold text-slate-800 dark:text-brand-text">{formatCurrencyInCr(revenue)}</p>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-brand-text-secondary">{tier.soldSqFt.toLocaleString()}/{tier.targetSqFt.toLocaleString()} sq.ft.</p>
                </div>
            </Card>
        );
    };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">Sales Dashboard</h2>
        <button
          onClick={handleExportPdf}
          className="bg-brand-accent/10 hover:bg-brand-accent/20 dark:bg-brand-accent/20 dark:hover:bg-brand-accent/30 text-brand-accent dark:text-brand-accent-light font-bold py-2 px-4 rounded-lg flex items-center transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export PDF Report
        </button>
      </div>
      <Card>
        <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-brand-text">Sales & Revenue Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
                <p className="text-slate-500 dark:text-brand-text-secondary text-sm">Total Area Sold</p>
                <p className="text-3xl font-bold text-brand-accent dark:text-brand-accent-light">{totalSoldSqFt.toLocaleString()} sq.ft.</p>
            </div>
            <div>
                <p className="text-slate-500 dark:text-brand-text-secondary text-sm">Current Revenue</p>
                <p className="text-3xl font-bold text-brand-accent dark:text-brand-accent-light">{formatCurrencyInCr(totalRevenue)}</p>
            </div>
            <div>
                <p className="text-slate-500 dark:text-brand-text-secondary text-sm">Potential Revenue</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-brand-text">{formatCurrencyInCr(potentialRevenue)}</p>
            </div>
        </div>
        <div className="mt-6">
            <ProgressBar value={totalSoldSqFt} max={TOTAL_PLOTTED_AREA_SQFT} heightClass="h-4" />
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesTiersWithColors.map(tier => <TierCard key={tier.name} tier={tier} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
           <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-brand-text">Sales Velocity (sq. ft. sold per month)</h3>
           <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={SALES_VELOCITY_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="month" stroke={theme === 'dark' ? "#a99268" : "#64748b"} fontSize={12} />
                    {/* FIX: Explicitly type 'value' as a number to resolve TypeScript error. */}
                    <YAxis stroke={theme === 'dark' ? "#a99268" : "#64748b"} fontSize={12} unit="k" tickFormatter={(value: number) => `${value / 1000}`} />
                    <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff', border: '1px solid #c5a565', color: theme === 'dark' ? '#f0e6d2' : '#1a1a1a', borderRadius: '0.5rem' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Sq.Ft. Sold" stroke="#c5a565" strokeWidth={2} dot={{ r: 4, fill: '#c5a565' }} activeDot={{ r: 8, stroke: '#e0c48a' }} />
                </LineChart>
            </ResponsiveContainer>
           </div>
        </Card>
        <Card className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-brand-text mb-4">Plot Inventory Status</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie 
                            data={plotInventoryDataWithColors} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={100} 
                            paddingAngle={5} 
                            labelLine={false}
                            label={({ name, value, percent }) => `${name} - ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                            className="text-xs fill-current text-slate-700 dark:text-brand-text"
                        >
                        {plotInventoryDataWithColors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                         <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </div>

       <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-brand-text whitespace-nowrap">Plot Inventory Details</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </div>
                      <input 
                          type="text" 
                          placeholder="Search Plot, Buyer, Broker..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border text-slate-900 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full pl-10 p-2.5"
                          aria-label="Search plots"
                      />
                  </div>
                  <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as PlotStatus | 'All')}
                      className="bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border text-slate-900 dark:text-brand-text text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full sm:w-auto p-2.5"
                      aria-label="Filter plots by status"
                  >
                      <option value="All">All Statuses</option>
                      <option value="Available">Available</option>
                      <option value="Booked">Booked</option>
                      <option value="Sold">Sold</option>
                  </select>
                  <button onClick={handleExport} className="bg-slate-200 dark:bg-brand-border hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-brand-text-secondary font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Export
                  </button>
              </div>
          </div>
          <div className="overflow-x-auto relative border border-slate-200 dark:border-brand-border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-border">
                  <thead className="bg-slate-100 dark:bg-slate-900/60">
                      <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Plot ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Size</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Price</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Buyer</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Broker</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-brand-secondary divide-y divide-slate-200 dark:divide-brand-border">
                      {filteredPlots.length > 0 ? filteredPlots.map((plot) => (
                          <tr key={plot.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-500 dark:text-brand-text-secondary">{plot.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-brand-text">{plot.size.toLocaleString()} sq.ft.</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor[plot.status].bg} ${statusColor[plot.status].text}`}>
                                      {plot.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-brand-text">{formatCurrency(plot.size * plot.pricePerSqFt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-brand-text">{plot.buyerId ? buyerMap.get(plot.buyerId) : '—'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-brand-text-secondary">{plot.brokerId ? brokerMap.get(plot.brokerId) : '—'}</td>
                          </tr>
                      )) : (
                        <tr>
                            <td colSpan={6} className="text-center py-10 text-slate-500 dark:text-brand-text-secondary">
                                No plots match your criteria.
                            </td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  );
};

export default Sales;

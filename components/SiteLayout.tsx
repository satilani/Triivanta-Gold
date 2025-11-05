import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { PLOT_DATA, SALES_PIPELINE_DATA, BROKER_DATA } from '../constants';
import { Plot, PlotStatus } from '../types';

const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
};

const statusConfig: { [key in PlotStatus]: { bg: string; text: string; border: string; darkBg: string; darkText: string; darkBorder: string;} } = {
    Available: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400', darkBg: 'dark:bg-blue-500/20', darkText: 'dark:text-blue-400', darkBorder: 'dark:border-blue-500' },
    Booked: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400', darkBg: 'dark:bg-amber-500/20', darkText: 'dark:text-amber-400', darkBorder: 'dark:border-amber-500' },
    Sold: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400', darkBg: 'dark:bg-emerald-500/20', darkText: 'dark:text-emerald-400', darkBorder: 'dark:border-emerald-500' },
};

const buyerMap = new Map(SALES_PIPELINE_DATA.map(lead => [lead.id, lead.name]));
const brokerMap = new Map(BROKER_DATA.map(broker => [broker.id, broker.name]));

const SiteLayout: React.FC = () => {
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(PLOT_DATA[0]);
    const [filters, setFilters] = useState({
        status: 'All',
        size: 'All',
        isCorner: false,
        isParkFacing: false,
    });

    const plotSizes = useMemo(() => [...new Set(PLOT_DATA.map(p => p.size))].sort((a,b) => a - b), []);

    const filteredPlots = useMemo(() => {
        return PLOT_DATA.filter(plot => {
            if (filters.status !== 'All' && plot.status !== filters.status) return false;
            if (filters.size !== 'All' && plot.size !== parseInt(filters.size)) return false;
            if (filters.isCorner && !plot.isCorner) return false;
            if (filters.isParkFacing && !plot.isParkFacing) return false;
            return true;
        });
    }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFilters(prev => ({ ...prev, [name]: checked }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow">
                <Card>
                    <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-brand-text">Interactive Site Layout</h2>
                    <p className="text-sm text-slate-500 dark:text-brand-text-secondary mb-4">Click on a plot to view its details. Total plots showing: {filteredPlots.length}</p>
                    
                    <div className="bg-slate-100 dark:bg-brand-dark p-3 rounded-lg mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                       <select name="status" value={filters.status} onChange={handleFilterChange} className="bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border rounded p-2 focus:ring-brand-accent focus:border-brand-accent">
                           <option value="All">All Statuses</option>
                           <option value="Available">Available</option>
                           <option value="Booked">Booked</option>
                           <option value="Sold">Sold</option>
                       </select>
                        <select name="size" value={filters.size} onChange={handleFilterChange} className="bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border rounded p-2 focus:ring-brand-accent focus:border-brand-accent">
                           <option value="All">All Sizes</option>
                           {plotSizes.map(size => <option key={size} value={size}>{size} sq.ft.</option>)}
                       </select>
                       <div className="flex items-center justify-center bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border rounded p-2">
                           <input type="checkbox" id="isCorner" name="isCorner" checked={filters.isCorner} className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-brand-accent focus:ring-brand-accent focus:ring-offset-white dark:focus:ring-offset-brand-secondary"/>
                           <label htmlFor="isCorner" className="ml-2 text-slate-800 dark:text-brand-text">Corner Plot</label>
                       </div>
                        <div className="flex items-center justify-center bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border rounded p-2">
                           <input type="checkbox" id="isParkFacing" name="isParkFacing" checked={filters.isParkFacing} onChange={handleFilterChange} className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-brand-accent focus:ring-brand-accent focus:ring-offset-white dark:focus:ring-offset-brand-secondary"/>
                           <label htmlFor="isParkFacing" className="ml-2 text-slate-800 dark:text-brand-text">Park Facing</label>
                       </div>
                    </div>

                    <div className="grid grid-cols-9 gap-1 bg-slate-100 dark:bg-brand-dark p-2 rounded-lg">
                        {PLOT_DATA.map(plot => {
                            const isVisible = filteredPlots.some(p => p.id === plot.id);
                            const isSelected = selectedPlot?.id === plot.id;
                            const config = statusConfig[plot.status];
                            return (
                                <div 
                                    key={plot.id}
                                    onClick={() => setSelectedPlot(plot)}
                                    className={`aspect-square flex items-center justify-center text-center text-[10px] font-mono cursor-pointer transition-all duration-200 border-2
                                        ${!isVisible ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-brand-border opacity-40' : `${config.bg} ${config.border} ${config.darkBg} ${config.darkBorder}`}
                                        ${isSelected ? 'ring-4 ring-offset-2 ring-brand-accent-light scale-110 ring-offset-slate-100 dark:ring-offset-brand-dark' : ''}
                                        ${plot.isCorner ? 'rounded-tl-lg rounded-br-lg' : 'rounded-sm'}`
                                    }
                                    title={`Plot ${plot.id} - ${plot.size} sq.ft. (${plot.status})`}
                                >
                                    {plot.id.split('-')[1]}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
            <div className="lg:w-96 flex-shrink-0">
                <Card className="sticky top-28">
                    {selectedPlot ? (
                         <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-brand-text">Plot {selectedPlot.id}</h3>
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[selectedPlot.status].bg} ${statusConfig[selectedPlot.status].text} ${statusConfig[selectedPlot.status].darkBg.replace('dark:','')} ${statusConfig[selectedPlot.status].darkText.replace('dark:','')}`}>
                                      {selectedPlot.status}
                                  </span>
                                </div>
                                <div className="text-right">
                                    {selectedPlot.isCorner && <span className="text-xs font-bold text-brand-accent dark:text-brand-accent-light bg-brand-accent/10 px-2 py-1 rounded-full">CORNER</span>}
                                    {selectedPlot.isParkFacing && <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full ml-1">PARK</span>}
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-brand-border space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-brand-text-secondary">Plot Size:</span>
                                    <span className="font-semibold text-slate-800 dark:text-brand-text">{selectedPlot.size.toLocaleString()} sq.ft.</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-brand-text-secondary">Rate:</span>
                                    <span className="font-semibold text-slate-800 dark:text-brand-text">₹{selectedPlot.pricePerSqFt.toLocaleString()}/sq.ft.</span>
                                </div>
                                 <div className="flex justify-between text-lg">
                                    <span className="text-slate-500 dark:text-brand-text-secondary">Total Price:</span>
                                    <span className="font-bold text-brand-accent dark:text-brand-accent-light">{formatCurrency(selectedPlot.size * selectedPlot.pricePerSqFt)}</span>
                                </div>
                            </div>

                            {(selectedPlot.status === 'Booked' || selectedPlot.status === 'Sold') && (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-brand-border space-y-3 text-sm">
                                    <h4 className="font-semibold text-slate-800 dark:text-brand-text">Ownership Details</h4>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-brand-text-secondary">Buyer:</span>
                                        <span className="font-semibold text-slate-800 dark:text-brand-text">{selectedPlot.buyerId ? buyerMap.get(selectedPlot.buyerId) : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-brand-text-secondary">Broker:</span>
                                        <span className="font-semibold text-slate-800 dark:text-brand-text">{selectedPlot.brokerId ? brokerMap.get(selectedPlot.brokerId) : 'Direct Sale'}</span>
                                    </div>
                                </div>
                            )}
                         </div>
                    ) : (
                        <div className="text-center py-10">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-brand-text">Select a Plot</h3>
                            <p className="text-sm text-slate-500 dark:text-brand-text-secondary">Click on any plot on the map to see its details here.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SiteLayout;
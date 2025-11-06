import React, { useState, useMemo } from 'react';
// FIX: Remove file extensions from imports
import { SALES_PIPELINE_DATA, BROKER_DATA, PLOT_DATA } from '../constants';
import { Lead, LeadStatus, ActivityType, Broker } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value: number) => {
    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString()}`;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
};

const InterestIndicator: React.FC<{ value: number }> = ({ value }) => {
    const iconBaseClass = "h-4 w-4 mr-2 flex-shrink-0";
    if (value >= 10000000) { // High value (>= 1 Cr)
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBaseClass} text-red-500`} viewBox="0 0 20 20" fill="currentColor">
                <title>High Value Lead (≥ 1 Cr)</title>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        );
    }
    if (value > 5000000) { // Medium value (> 50 L)
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBaseClass} text-amber-500`} viewBox="0 0 20 20" fill="currentColor">
                <title>Medium Value Lead (&gt; 50 L)</title>
                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L7.03 7.78a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.06 0l3.25 3.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
            </svg>
        );
    }
    // Standard value
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBaseClass} text-sky-500`} viewBox="0 0 20 20" fill="currentColor">
            <title>Standard Value Lead</title>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
        </svg>
    );
};

const LeadCard: React.FC<{ 
    lead: Lead; 
    onDragStart: (e: React.DragEvent<HTMLDivElement>, lead: Lead) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onClick: (lead: Lead) => void;
    leadToPlotMap: Map<number, string[]>;
}> = ({ lead, onDragStart, onDragEnd, onClick, leadToPlotMap }) => {
    const broker = lead.brokerId ? BROKER_DATA.find(b => b.id === lead.brokerId) : null;
    const plotIds = leadToPlotMap.get(lead.id);
    const showPlotInfo = plotIds && ['Booked', 'Converted'].includes(lead.status);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            onDragEnd={onDragEnd}
            onClick={() => onClick(lead)}
            className="bg-white dark:bg-brand-secondary p-3 rounded-lg border border-slate-200 dark:border-brand-border cursor-grab active:cursor-grabbing mb-3 transition-all duration-200 hover:shadow-xl dark:hover:shadow-brand-accent/20 hover:border-slate-300 dark:hover:border-brand-accent/50 hover:-translate-y-1"
        >
            <div className="flex justify-between items-start">
                 <div className="flex items-center w-4/5">
                    <InterestIndicator value={lead.value} />
                    <p className="font-bold text-slate-800 dark:text-brand-text truncate">{lead.name}</p>
                </div>
                <p className="font-semibold text-sm text-brand-accent">{formatCurrency(lead.value)}</p>
            </div>
             <p className="text-sm text-slate-500 dark:text-brand-text-secondary mt-1 pl-[1.5rem] truncate">
                {lead.interest}
            </p>
            {showPlotInfo && (
                <div className="mt-2 pl-[1.5rem] flex items-center text-xs text-slate-500 dark:text-brand-text-secondary font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Plot: {plotIds.join(', ')}
                </div>
            )}
            {broker && (
                <div className="mt-2 pl-[1.5rem]">
                    <span className="inline-flex items-center bg-brand-accent/10 text-brand-accent dark:text-brand-accent-light text-xs font-semibold px-2 py-0.5 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 -ml-0.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                         </svg>
                        {broker.name}
                    </span>
                </div>
            )}
            <div className="flex justify-between items-center text-xs text-slate-400 dark:text-brand-text-secondary/70 mt-2 pt-2 border-t border-slate-200 dark:border-brand-border">
                <span>Source: {lead.source}</span>
                <span className="font-medium">{formatDate(lead.lastContacted)}</span>
            </div>
        </div>
    );
};


const MobileLeadCard: React.FC<{ 
    lead: Lead; 
    onClick: (lead: Lead) => void;
    onStatusChange: (leadId: number, newStatus: LeadStatus) => void;
    statuses: LeadStatus[];
    leadToPlotMap: Map<number, string[]>;
}> = ({ lead, onClick, onStatusChange, statuses, leadToPlotMap }) => {
    const broker = lead.brokerId ? BROKER_DATA.find(b => b.id === lead.brokerId) : null;
    const plotIds = leadToPlotMap.get(lead.id);
    const showPlotInfo = plotIds && ['Booked', 'Converted'].includes(lead.status);

    return (
        <div
            className="bg-white dark:bg-brand-secondary p-3 rounded-lg border border-slate-200 dark:border-brand-border mb-3 transition-all duration-200 active:border-brand-accent/50"
        >
            <div onClick={() => onClick(lead)}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center w-4/5">
                        <InterestIndicator value={lead.value} />
                        <p className="font-bold text-slate-800 dark:text-brand-text truncate">{lead.name}</p>
                    </div>
                    <p className="font-semibold text-sm text-brand-accent">{formatCurrency(lead.value)}</p>
                </div>
                <p className="text-sm text-slate-500 dark:text-brand-text-secondary mt-1 pl-[1.5rem] truncate">
                    {lead.interest}
                </p>
                {showPlotInfo && (
                    <div className="mt-2 pl-[1.5rem] flex items-center text-xs text-slate-500 dark:text-brand-text-secondary font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Plot: {plotIds.join(', ')}
                    </div>
                )}
                {broker && (
                    <div className="mt-2 pl-[1.5rem]">
                        <span className="inline-flex items-center bg-brand-accent/10 text-brand-accent dark:text-brand-accent-light text-xs font-semibold px-2 py-0.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 -ml-0.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {broker.name}
                        </span>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 dark:text-brand-text-secondary/70 mt-2 pt-2 border-t border-slate-200 dark:border-brand-border">
                 <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                    onClick={(e) => e.stopPropagation()} // Prevent modal from opening
                    className="bg-slate-100 dark:bg-brand-dark border-0 text-slate-600 dark:text-brand-text-secondary rounded text-xs p-1 focus:ring-brand-accent"
                >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="font-medium">{formatDate(lead.lastContacted)}</span>
            </div>
        </div>
    );
};

const ActivityTypeIcon: React.FC<{type: ActivityType}> = ({ type }) => {
    const baseClass = "h-5 w-5 mr-3 flex-shrink-0";
    switch(type) {
        case 'Call': return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} text-sky-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
        case 'Email': return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} text-teal-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
        case 'Meeting': return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} text-violet-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
        case 'Note': return <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} text-slate-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        default: return null;
    }
}

const LeadDetailModal: React.FC<{ lead: Lead | null; onClose: () => void, leadToPlotMap: Map<number, string[]> }> = ({ lead, onClose, leadToPlotMap }) => {
    if (!lead) return null;

    const broker = lead.brokerId ? BROKER_DATA.find(b => b.id === lead.brokerId) : null;
    const plotIds = leadToPlotMap.get(lead.id);
    const showPlotInfo = plotIds && ['Booked', 'Converted'].includes(lead.status);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-brand-border">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">{lead.name}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-brand-text">&times;</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-sm">
                    <div>
                        <p className="text-slate-500 dark:text-brand-text-secondary">Status: <span className="font-semibold text-slate-800 dark:text-brand-text">{lead.status}</span></p>
                        <p className="text-slate-500 dark:text-brand-text-secondary">Value: <span className="font-semibold text-brand-accent">{formatCurrency(lead.value)}</span></p>
                        <p className="text-slate-500 dark:text-brand-text-secondary">Source: <span className="font-semibold text-slate-800 dark:text-brand-text">{lead.source}</span></p>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-brand-text-secondary">Interest: <span className="font-semibold text-slate-800 dark:text-brand-text">{lead.interest}</span></p>
                        {broker && <p className="text-slate-500 dark:text-brand-text-secondary">Broker: <span className="font-semibold text-slate-800 dark:text-brand-text">{broker.name}</span></p>}
                        {showPlotInfo && <p className="text-slate-500 dark:text-brand-text-secondary">Plot(s): <span className="font-semibold text-slate-800 dark:text-brand-text">{plotIds.join(', ')}</span></p>}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-brand-border">
                    <h3 className="font-bold text-slate-800 dark:text-brand-text mb-2">Activity Log</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {lead.activities?.length ? lead.activities.map(activity => (
                             <div key={activity.id} className="flex items-start">
                                <ActivityTypeIcon type={activity.type} />
                                <div className="flex-1">
                                    <p className="text-sm text-slate-800 dark:text-brand-text">{activity.notes}</p>
                                    <p className="text-xs text-slate-400 dark:text-brand-text-secondary mt-1">{formatDate(activity.date)} - {activity.agent}</p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500 italic">No activities logged yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

type AddLeadFormData = {
    name: string;
    interest: string;
    value: string;
    source: string;
    brokerId: string;
};

const AddLeadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddLead: (leadData: AddLeadFormData) => void;
}> = ({ isOpen, onClose, onAddLead }) => {
    const [formData, setFormData] = useState<AddLeadFormData>({
        name: '',
        interest: '',
        value: '',
        source: 'Website',
        brokerId: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.interest || !formData.value) {
            // Basic validation
            alert('Please fill out all required fields.');
            return;
        }
        onAddLead(formData);
        onClose(); // Close modal after submission
    };
    
    // Reset form when modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', interest: '', value: '', source: 'Website', brokerId: '' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-brand-text">Add New Lead</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Lead Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Interest</label>
                        <input type="text" name="interest" value={formData.interest} onChange={handleChange} placeholder="e.g., 2-3 plots, corner preferred" className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Potential Value (INR)</label>
                        <input type="number" name="value" value={formData.value} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Source</label>
                        <select name="source" value={formData.source} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent">
                            {['Website', 'Broker', 'Social Media', 'Referral', 'Walk-in'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Associated Broker (Optional)</label>
                        <select name="brokerId" value={formData.brokerId} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent">
                            <option value="">Direct / No Broker</option>
                            {BROKER_DATA.map((broker: Broker) => <option key={broker.id} value={broker.id}>{broker.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-slate-600 dark:text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                         <button type="submit" className="px-4 py-2 rounded-md bg-brand-accent text-white font-bold hover:bg-brand-accent-light">Add Lead</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const SalesPipeline: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>(SALES_PIPELINE_DATA);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const statuses: LeadStatus[] = ['New Lead', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Booked', 'Converted', 'Lost'];

    const leadToPlotMap = useMemo(() => {
        const map = new Map<number, string[]>();
        PLOT_DATA.forEach(plot => {
            if (plot.buyerId) {
                if (!map.has(plot.buyerId)) {
                    map.set(plot.buyerId, []);
                }
                map.get(plot.buyerId)?.push(plot.id);
            }
        });
        return map;
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lead: Lead) => {
        e.dataTransfer.setData("leadId", lead.id.toString());
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50');
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: LeadStatus) => {
        const leadId = parseInt(e.dataTransfer.getData("leadId"));
        setLeads(prevLeads => prevLeads.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
    };
    
    const handleStatusChange = (leadId: number, newStatus: LeadStatus) => {
         setLeads(prevLeads => prevLeads.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
    }

    const handleAddLead = (formData: AddLeadFormData) => {
        const newLead: Lead = {
            id: Math.max(...leads.map(l => l.id), 0) + 1, // Simple ID generation
            name: formData.name,
            status: 'New Lead',
            source: formData.source,
            lastContacted: new Date().toISOString().split('T')[0], // Today's date
            interest: formData.interest,
            value: Number(formData.value),
            brokerId: formData.brokerId ? Number(formData.brokerId) : undefined,
            activities: [], // Start with no activities
        };
        setLeads(prevLeads => [newLead, ...prevLeads]);
    };
    
    const totalPipelineValue = useMemo(() => leads.reduce((sum, lead) => lead.status !== 'Converted' && lead.status !== 'Lost' ? sum + lead.value : sum, 0), [leads]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">Sales Pipeline</h2>
                 <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-brand-accent hover:bg-brand-accent-light text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Lead
                </button>
            </div>
            <div className="p-4 bg-white dark:bg-brand-secondary rounded-lg border border-slate-200 dark:border-brand-border">
                Total Pipeline Value: <span className="font-bold text-brand-accent">{formatCurrency(totalPipelineValue)}</span>
            </div>
            {/* Desktop Kanban View */}
            <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
                {statuses.map(status => (
                    <div 
                        key={status}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
                        className="bg-slate-50 dark:bg-brand-dark p-3 rounded-lg w-72 flex-shrink-0"
                    >
                        <h3 className="font-bold text-slate-800 dark:text-brand-text mb-3">{status}</h3>
                        <div className="space-y-3 min-h-[100px]">
                            {leads.filter(lead => lead.status === status).map(lead => (
                                <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onClick={setSelectedLead} leadToPlotMap={leadToPlotMap} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {/* Mobile List View */}
            <div className="md:hidden">
                {leads.map(lead => (
                    <MobileLeadCard key={lead.id} lead={lead} onClick={setSelectedLead} onStatusChange={handleStatusChange} statuses={statuses} leadToPlotMap={leadToPlotMap} />
                ))}
            </div>
            <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} leadToPlotMap={leadToPlotMap}/>
            <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddLead={handleAddLead} />
        </div>
    );
};

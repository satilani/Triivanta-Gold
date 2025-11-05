
import React, { useState, useMemo, useContext } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Card from './ui/Card';
import { BROKER_DATA } from '../constants';
import { Broker } from '../types';
import { ThemeContext } from '../App';

const formatCurrency = (value: number) => {
    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString()}`;
};

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

const AddBrokerModal: React.FC<{ onClose: () => void; onAddBroker: (broker: Omit<Broker, 'id' | 'dealsClosed' | 'totalBusiness'>) => void; }> = ({ onClose, onAddBroker }) => {
    const [formData, setFormData] = useState({
        name: '',
        reraNo: '',
        contactPerson: '',
        phone: '',
        email: '',
        commissionRate: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddBroker({
            ...formData,
            commissionRate: parseFloat(formData.commissionRate),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-brand-text">Add New Broker</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Brokerage Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                    <div>
                        <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Contact Person</label>
                        <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                    <div>
                        <label htmlFor="reraNo" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">RERA No.</label>
                        <input type="text" id="reraNo" name="reraNo" value={formData.reraNo} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Phone</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                     <div>
                        <label htmlFor="commissionRate" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Commission Rate (%)</label>
                        <input type="number" step="0.1" id="commissionRate" name="commissionRate" value={formData.commissionRate} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-slate-600 dark:text-brand-text-secondary hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                         <button type="submit" className="px-4 py-2 rounded-md bg-brand-accent text-white font-bold hover:bg-brand-accent-light">Add Broker</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Brokers: React.FC = () => {
    const { theme } = useContext(ThemeContext);
    const [brokers, setBrokers] = useState<Broker[]>(BROKER_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const brokerStats = useMemo(() => {
        const totalBrokers = brokers.length;
        const activeBrokers = brokers.filter(b => b.status === 'Active').length;
        const totalBusiness = brokers.reduce((sum, b) => sum + b.totalBusiness, 0);
        return { totalBrokers, activeBrokers, totalBusiness };
    }, [brokers]);
    
    const topBrokersData = useMemo(() => {
        return [...brokers]
            .sort((a, b) => b.totalBusiness - a.totalBusiness)
            .slice(0, 5)
            .map(broker => ({
                name: broker.name.split(' ')[0], // Shorten name for chart axis
                'Total Business': broker.totalBusiness,
                'Deals Closed': broker.dealsClosed,
            }));
    }, [brokers]);

    const handleAddBroker = (newBrokerData: Omit<Broker, 'id' | 'dealsClosed' | 'totalBusiness'>) => {
        const newBroker: Broker = {
            ...newBrokerData,
            id: Math.max(...brokers.map(b => b.id), 0) + 1,
            dealsClosed: 0,
            totalBusiness: 0,
        };
        setBrokers(prev => [...prev, newBroker]);
    };

    const handleExportBrokers = () => {
        const headers = ['Name', 'RERA No', 'Contact Person', 'Phone', 'Email', 'Status', 'Deals Closed', 'Total Business (INR)', 'Commission Rate (%)'];
        const data = brokers.map(b => 
            [
                `"${b.name}"`, 
                b.reraNo, 
                `"${b.contactPerson}"`, 
                b.phone, 
                b.email, 
                b.status, 
                b.dealsClosed, 
                b.totalBusiness, 
                b.commissionRate
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + data.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "brokers-list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">Broker & Channel Partner Management</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportBrokers} className="bg-slate-200 dark:bg-brand-border hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-brand-text-secondary font-bold py-2 px-4 rounded-lg flex items-center transition-colors text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-brand-accent hover:bg-brand-accent-light text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add Broker
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Brokers" value={`${brokerStats.totalBrokers}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <StatCard title="Active Brokers" value={`${brokerStats.activeBrokers}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Total Business Generated" value={formatCurrency(brokerStats.totalBusiness)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
            </div>

            <Card>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-brand-text">Top 5 Broker Performance</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <ComposedChart data={topBrokersData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke={theme === 'dark' ? "#a99268" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis 
                                yAxisId="left"
                                orientation="left"
                                stroke={theme === 'dark' ? "#a99268" : "#64748b"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <YAxis 
                                yAxisId="right"
                                orientation="right"
                                stroke={theme === 'dark' ? "#e0c48a" : "#c5a565"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff', 
                                    border: `1px solid #c5a565`, 
                                    borderRadius: '0.5rem' 
                                }}
                                formatter={(value: number, name: string) => {
                                    if (name === 'Total Business') {
                                        return formatCurrency(value);
                                    }
                                    return value;
                                }}
                            />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Bar yAxisId="left" dataKey="Total Business" fill="#c5a565" name="Total Business" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="Deals Closed" fill="#e0c48a" name="Deals Closed" radius={[4, 4, 0, 0]} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-border">
                        <thead className="bg-slate-100 dark:bg-slate-900/60">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Broker / RERA No.</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Performance</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-brand-secondary divide-y divide-slate-200 dark:divide-brand-border">
                            {brokers.map((broker) => (
                                <tr key={broker.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900 dark:text-brand-text">{broker.name}</div>
                                        <div className="text-sm text-slate-500 dark:text-brand-text-secondary">{broker.reraNo}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-800 dark:text-brand-text">{broker.contactPerson}</div>
                                        <div className="text-sm text-slate-500 dark:text-brand-text-secondary">{broker.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${broker.status === 'Active' ? 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-500/10 text-slate-800 dark:text-slate-400'}`}>
                                            {broker.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-brand-text">
                                        <div>Deals Closed: <span className="font-bold">{broker.dealsClosed}</span></div>
                                        <div>Total Business: <span className="font-bold">{formatCurrency(broker.totalBusiness)}</span></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-brand-text font-semibold">{broker.commissionRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && <AddBrokerModal onClose={() => setIsModalOpen(false)} onAddBroker={handleAddBroker} />}
        </div>
    );
};

export default Brokers;

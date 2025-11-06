import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import { EMPLOYEE_DATA } from '../constants';
import { Employee, Department } from '../types';

// Helper Components & Logic
// ===============================================

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="flex items-center">
        <div className="p-3 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 text-brand-accent dark:text-brand-accent-light mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-brand-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-brand-text">{value}</p>
        </div>
    </Card>
);

const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
};

const statusConfig: { [key in Employee['status']]: { bg: string; text: string; } } = {
    'Active': { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-800 dark:text-green-400' },
    'On Leave': { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-800 dark:text-yellow-400' },
    'Terminated': { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-800 dark:text-red-400' },
};

// Modal Components
// ===============================================

const AddEditEmployeeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id'> & { id?: string }) => void;
    employeeToEdit: Employee | null;
}> = ({ isOpen, onClose, onSave, employeeToEdit }) => {
    
    const getInitialState = () => ({
        name: '',
        photoUrl: `https://picsum.photos/seed/${Math.random()}/100`,
        role: '',
        department: 'Site Operations' as Department,
        email: '',
        phone: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: '',
        status: 'Active' as Employee['status'],
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (employeeToEdit) {
            setFormData({
                ...employeeToEdit,
                salary: employeeToEdit.salary.toString(),
            });
        } else {
            setFormData(getInitialState());
        }
    }, [employeeToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(employeeToEdit ? { id: employeeToEdit.id } : {}),
            ...formData,
            salary: parseInt(formData.salary) || 0,
        });
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-brand-text">{employeeToEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Role / Position</label>
                        <input type="text" name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Department</label>
                        <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent">
                            {(['Management', 'Engineering', 'Sales', 'HR & Admin', 'Site Operations'] as Department[]).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Hire Date</label>
                        <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Monthly Salary (INR)</label>
                        <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent" required />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent">
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Terminated">Terminated</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-brand-accent text-white font-bold hover:bg-brand-accent-light">Save Employee</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmDeleteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    employeeName: string;
}> = ({ isOpen, onClose, onConfirm, employeeName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-brand-text">Confirm Deletion</h2>
                <p className="text-slate-600 dark:text-brand-text-secondary mb-6">Are you sure you want to remove <strong className="text-slate-800 dark:text-brand-text">"{employeeName}"</strong> from the system? This cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white font-bold hover:bg-red-700">Remove</button>
                </div>
            </div>
        </div>
    );
};

// Main Component
// ===============================================

const Employees: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>(EMPLOYEE_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'delete' | null, employee: Employee | null }>({ type: null, employee: null });
    
    const stats = useMemo(() => {
        const activeStaff = employees.filter(e => e.status === 'Active');
        const monthlyPayroll = activeStaff.reduce((sum, e) => sum + e.salary, 0);
        return {
            total: employees.length,
            active: activeStaff.length,
            payroll: monthlyPayroll
        };
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return employees;
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(lowercasedTerm) ||
            emp.role.toLowerCase().includes(lowercasedTerm) ||
            emp.department.toLowerCase().includes(lowercasedTerm) ||
            emp.email.toLowerCase().includes(lowercasedTerm)
        );
    }, [employees, searchTerm]);

    const handleSave = (employeeData: Omit<Employee, 'id'> & { id?: string }) => {
        setEmployees(prev => {
            if (employeeData.id) { // Edit
                return prev.map(e => e.id === employeeData.id ? { ...e, ...employeeData } as Employee : e);
            } else { // Add
                const newEmployee: Employee = {
                    ...(employeeData as Omit<Employee, 'id'>),
                    id: `EMP-${String(prev.length + 1).padStart(3, '0')}`,
                };
                return [newEmployee, ...prev];
            }
        });
    };
    
    const handleDelete = () => {
        if (!modalState.employee) return;
        setEmployees(prev => prev.filter(e => e.id !== modalState.employee?.id));
        setModalState({ type: null, employee: null });
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">Employee Management</h2>
                    <button
                      onClick={() => setModalState({ type: 'add', employee: null })}
                      className="bg-brand-accent hover:bg-brand-accent-light text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Add Employee
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Employees" value={`${stats.total}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>} />
                    <StatCard title="Active Staff" value={`${stats.active}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>} />
                    <StatCard title="Est. Monthly Payroll" value={formatCurrency(stats.payroll)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.133 0V7.418zM12.5 8.513V10a2.5 2.5 0 00-1.133 0V8.513a2.5 2.5 0 001.133 0zM8.433 10v1.698a2.5 2.5 0 001.133 0V10a2.5 2.5 0 00-1.133 0z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.876.763.5.5 0 00.655.753A3.5 3.5 0 018 7.5v1a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-1a3.5 3.5 0 01-1.124-2.144.5.5 0 00.655-.753A4.5 4.5 0 0011 5.092V5zM10 14a3.5 3.5 0 01-3.5-3.5V10a.5.5 0 01.5-.5h6a.5.5 0 01.5.5v.5a3.5 3.5 0 01-3.5 3.5z" clipRule="evenodd" /></svg>} />
                </div>

                <Card>
                    <div className="flex justify-end mb-4">
                        <div className="relative w-full sm:w-64">
                            <input 
                                type="text" 
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border text-slate-900 dark:text-brand-text placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-lg focus:ring-brand-accent block w-full p-2.5"
                            />
                        </div>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-border">
                            <thead className="bg-slate-100 dark:bg-slate-900/60">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase">Hire Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase">Salary</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-brand-secondary divide-y divide-slate-200 dark:divide-brand-border">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-full object-cover" src={emp.photoUrl} alt={emp.name} />
                                                <div className="ml-4">
                                                    <div className="font-medium text-slate-900 dark:text-brand-text">{emp.name}</div>
                                                    <div className="text-sm text-slate-500 dark:text-brand-text-secondary">{emp.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-800 dark:text-brand-text">{emp.role}</div>
                                            <div className="text-sm text-slate-500 dark:text-brand-text-secondary">{emp.department}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-brand-text-secondary">
                                            <div>{emp.email}</div>
                                            <div>{emp.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-brand-text-secondary">{new Date(emp.hireDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-brand-text">{formatCurrency(emp.salary)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[emp.status].bg} ${statusConfig[emp.status].text}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setModalState({ type: 'edit', employee: emp })} className="text-slate-500 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-brand-border" title="Edit Employee">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => setModalState({ type: 'delete', employee: emp })} className="text-red-500 p-2 rounded-md hover:bg-red-500/10" title="Remove Employee">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <AddEditEmployeeModal
                isOpen={modalState.type === 'add' || modalState.type === 'edit'}
                onClose={() => setModalState({ type: null, employee: null })}
                onSave={handleSave}
                employeeToEdit={modalState.type === 'edit' ? modalState.employee : null}
            />
            
            <ConfirmDeleteModal
                isOpen={modalState.type === 'delete'}
                onClose={() => setModalState({ type: null, employee: null })}
                onConfirm={handleDelete}
                employeeName={modalState.employee?.name || ''}
            />
        </>
    );
};

export default Employees;
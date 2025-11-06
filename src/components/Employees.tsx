import React, { useState, useMemo, useEffect } from 'react';
// FIX: Remove file extensions from imports
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
                    
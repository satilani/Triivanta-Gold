import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import { INVENTORY_DATA } from '../constants';
import { InventoryItem, InventoryStatus, InventoryCategory } from '../types';

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

const getStatus = (item: InventoryItem): InventoryStatus => {
    if (item.quantityInStock <= 0) return 'Out of Stock';
    if (item.quantityInStock <= item.reorderLevel) return 'Low Stock';
    return 'In Stock';
};

const statusConfig: { [key in InventoryStatus]: { bg: string; text: string; } } = {
    'In Stock': { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-800 dark:text-green-400' },
    'Low Stock': { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-800 dark:text-yellow-400' },
    'Out of Stock': { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-800 dark:text-red-400' },
};

// Modal Components
// ===============================================

const AddEditItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<InventoryItem, 'id' | 'quantityInStock' | 'lastOrdered'> & { id?: string }) => void;
    itemToEdit: InventoryItem | null;
}> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Civil Works' as InventoryCategory,
        unit: 'Units' as InventoryItem['unit'],
        reorderLevel: '',
        supplier: '',
    });

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name,
                category: itemToEdit.category,
                unit: itemToEdit.unit,
                reorderLevel: itemToEdit.reorderLevel.toString(),
                supplier: itemToEdit.supplier,
            });
        } else {
            setFormData({
                name: '', category: 'Civil Works', unit: 'Units', reorderLevel: '', supplier: '',
            });
        }
    }, [itemToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(itemToEdit ? { id: itemToEdit.id } : {}),
            ...formData,
            reorderLevel: parseInt(formData.reorderLevel) || 0,
        });
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-brand-text">{itemToEdit ? 'Edit Item' : 'Add New Item'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Item Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent">
                            {(['Civil Works', 'Electrical', 'Plumbing', 'Finishing', 'Machinery'] as InventoryCategory[]).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Unit</label>
                        <select name="unit" value={formData.unit} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent">
                             {(['Bags', 'Tons', 'Meters', 'Liters', 'Units', 'Hours'] as InventoryItem['unit'][]).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="reorderLevel" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Reorder Level</label>
                        <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                     <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Supplier</label>
                        <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border rounded-md p-2 focus:ring-brand-accent focus:border-brand-accent" required />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                         <button type="submit" className="px-4 py-2 rounded-md bg-brand-accent text-white font-bold hover:bg-brand-accent-light">Save Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UpdateStockModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (change: number) => void;
    item: InventoryItem | null;
}> = ({ isOpen, onClose, onUpdate, item }) => {
    const [changeAmount, setChangeAmount] = useState('');
    
    if (!isOpen || !item) return null;

    const handleUpdate = (multiplier: 1 | -1) => {
        const amount = parseInt(changeAmount) * multiplier;
        if (!isNaN(amount)) {
            onUpdate(amount);
            setChangeAmount('');
            onClose();
        }
    };
    
    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-brand-text">Update Stock</h2>
                <p className="text-slate-600 dark:text-brand-text-secondary mb-4">Item: <strong className="text-slate-800 dark:text-brand-text">{item.name}</strong></p>
                <p className="text-center text-3xl font-bold mb-4 text-slate-800 dark:text-brand-text">{item.quantityInStock} <span className="text-lg font-medium text-slate-500 dark:text-brand-text-secondary">{item.unit}</span></p>
                <div>
                    <label htmlFor="changeAmount" className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Quantity</label>
                    <input type="number" id="changeAmount" value={changeAmount} onChange={e => setChangeAmount(e.target.value)} placeholder="e.g., 50" className="w-full bg-slate-50 dark:bg-brand-dark border border-slate-300 dark:border-brand-border rounded-md p-2 text-center focus:ring-brand-accent focus:border-brand-accent" />
                </div>
                 <div className="grid grid-cols-2 gap-4 mt-6">
                    <button onClick={() => handleUpdate(1)} className="px-4 py-2 rounded-md bg-green-600 text-white font-bold hover:bg-green-700 disabled:bg-slate-400" disabled={!changeAmount}>Add to Stock</button>
                    <button onClick={() => handleUpdate(-1)} className="px-4 py-2 rounded-md bg-yellow-500 text-white font-bold hover:bg-yellow-600 disabled:bg-slate-400" disabled={!changeAmount}>Remove from Stock</button>
                </div>
            </div>
        </div>
    );
};

const ConfirmDeleteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}> = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-brand-text">Confirm Deletion</h2>
                <p className="text-slate-600 dark:text-brand-text-secondary mb-6">Are you sure you want to remove <strong className="text-slate-800 dark:text-brand-text">"{itemName}"</strong> from inventory? This cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white font-bold hover:bg-red-700">Remove Item</button>
                </div>
            </div>
        </div>
    );
};


// Main Component
// ===============================================

const Inventory: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>(INVENTORY_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const stats = useMemo(() => {
        const lowStockCount = inventory.filter(item => getStatus(item) === 'Low Stock').length;
        const outOfStockCount = inventory.filter(item => getStatus(item) === 'Out of Stock').length;
        const totalItems = inventory.length;
        const suppliers = new Set(inventory.map(i => i.supplier)).size;
        return { totalItems, lowStockCount, outOfStockCount, suppliers };
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        return inventory.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [inventory, searchTerm]);

    const handleOpenAddModal = () => {
        setSelectedItem(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsAddEditModalOpen(true);
    };

    const handleOpenUpdateStockModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsUpdateStockModalOpen(true);
    };

    const handleOpenDeleteModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleAddOrUpdateItem = (itemData: Omit<InventoryItem, 'quantityInStock' | 'lastOrdered'>) => {
        setInventory(prev => {
            if (itemData.id) { // Editing
                return prev.map(item => item.id === itemData.id ? { ...item, ...itemData } : item);
            } else { // Adding
                const newItem: InventoryItem = {
                    ...itemData,
                    id: `inv-${Date.now()}`,
                    quantityInStock: 0,
                    lastOrdered: new Date().toISOString().split('T')[0],
                };
                return [newItem, ...prev];
            }
        });
    };
    
    const handleUpdateStock = (change: number) => {
        if (!selectedItem) return;
        setInventory(prev => prev.map(item =>
            item.id === selectedItem.id
                ? { ...item, quantityInStock: Math.max(0, item.quantityInStock + change) }
                : item
        ));
    };

    const handleDeleteItem = () => {
        if (!selectedItem) return;
        setInventory(prev => prev.filter(item => item.id !== selectedItem.id));
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">Site Inventory Management</h2>
                    <button
                      onClick={handleOpenAddModal}
                      className="bg-brand-accent hover:bg-brand-accent-light text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Add Item
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Items" value={`${stats.totalItems}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7l8 4v10" /></svg>} />
                    <StatCard title="Low Stock Items" value={`${stats.lowStockCount}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                    <StatCard title="Out of Stock" value={`${stats.outOfStockCount}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
                    <StatCard title="Total Suppliers" value={`${stats.suppliers}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10" /></svg>} />
                </div>

                <Card>
                    <div className="flex justify-end mb-4">
                         <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border text-slate-900 dark:text-brand-text placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full pl-10 p-2.5"
                            />
                        </div>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-border">
                            <thead className="bg-slate-100 dark:bg-slate-900/60">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Item Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Stock Level</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Supplier</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-brand-text-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-brand-secondary divide-y divide-slate-200 dark:divide-brand-border">
                                {filteredInventory.map((item) => {
                                    const status = getStatus(item);
                                    const stockPercentage = Math.min((item.quantityInStock / (item.reorderLevel * 1.5)) * 100, 100);
                                    return (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900 dark:text-brand-text">{item.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-brand-text-secondary">ID: {item.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-brand-text-secondary">{item.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-24">
                                                    <div className="w-full bg-slate-200 dark:bg-brand-border rounded-full h-2">
                                                        <div className={`h-2 rounded-full ${status === 'In Stock' ? 'bg-green-500' : status === 'Low Stock' ? 'bg-yellow-400' : 'bg-red-500'}`} style={{width: `${stockPercentage}%`}}></div>
                                                    </div>
                                                </div>
                                                <div className="ml-3 text-sm font-medium text-slate-800 dark:text-brand-text w-20 text-right">{item.quantityInStock} <span className="text-slate-500 dark:text-brand-text-secondary">{item.unit}</span></div>
                                            </div>
                                            <div className="text-xs text-slate-400 dark:text-brand-text-secondary/80 mt-1">Reorder at {item.reorderLevel}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[status].bg} ${statusConfig[status].text}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-brand-text">{item.supplier}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenUpdateStockModal(item)} className="text-brand-accent hover:text-brand-accent-light p-1.5 rounded-md hover:bg-brand-accent/10" title="Update Stock">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
                                                </button>
                                                <button onClick={() => handleOpenEditModal(item)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-brand-border" title="Edit Item">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleOpenDeleteModal(item)} className="text-red-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10" title="Remove Item">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                </Card>
            </div>

            <AddEditItemModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleAddOrUpdateItem}
                itemToEdit={selectedItem}
            />

            <UpdateStockModal
                isOpen={isUpdateStockModalOpen}
                onClose={() => setIsUpdateStockModalOpen(false)}
                onUpdate={handleUpdateStock}
                item={selectedItem}
            />
            
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteItem}
                itemName={selectedItem?.name || ''}
            />
        </>
    );
};

export default Inventory;
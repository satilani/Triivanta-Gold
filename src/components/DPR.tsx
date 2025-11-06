import React, { useState, useMemo } from 'react';
// FIX: Remove file extensions from imports
import Card from './ui/Card';
import { INVENTORY_DATA, DPR_WORK_ITEMS } from '../constants';
import { DPREntry, WorkProgress } from '../types';

interface DPRProps {
    dprEntries: DPREntry[];
    setDprEntries: React.Dispatch<React.SetStateAction<DPREntry[]>>;
}

const WeatherIcon: React.FC<{ weather: DPREntry['weather'] }> = ({ weather }) => {
    const iconBase = "h-5 w-5 mr-2";
    switch (weather) {
        case 'Sunny': return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBase} text-yellow-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        case 'Cloudy': return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBase} text-slate-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
        case 'Rainy': return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBase} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10a4 4 0 11-8 0 4 4 0 018 0zM12 10v12M16 16l-4 4-4-4" /></svg>;
        case 'Windy': return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBase} text-cyan-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 19.07a10 10 0 1114.14-14.14A10 10 0 014.93 19.07z" /></svg>;
        default: return null;
    }
}

const inventoryMap = new Map(INVENTORY_DATA.map(i => [i.id, i.name]));

const generateInitialWorkProgress = (): WorkProgress[] => {
  return Object.entries(DPR_WORK_ITEMS).flatMap(([category, items]) => 
    items.map((item, index) => ({
      id: `${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
      text: item,
      completed: false,
      category,
    }))
  );
};

const AddEditDPRModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<DPREntry, 'id' | 'submittedBy'> & { id?: string }) => void;
    entryToEdit: DPREntry | null;
}> = ({ isOpen, onClose, onSave, entryToEdit }) => {
    
    const getInitialState = () => ({
        date: new Date().toISOString().split('T')[0],
        weather: 'Sunny' as DPREntry['weather'],
        manpower: { supervisors: 0, skilledWorkers: 0, unskilledWorkers: 0 },
        workProgress: generateInitialWorkProgress(),
        materialsConsumed: [],
        equipmentUsed: [],
        hindrances: '',
    });

    const [entry, setEntry] = useState<Omit<DPREntry, 'id' | 'submittedBy'>>(getInitialState());

    React.useEffect(() => {
        if (isOpen) {
            if (entryToEdit) {
                 // Merge saved progress with the master list to account for new checklist items
                const masterWorkItems = generateInitialWorkProgress();
                const savedProgressMap = new Map(entryToEdit.workProgress.map(p => [p.id, p]));
                const mergedWorkProgress = masterWorkItems.map(masterItem => 
                    savedProgressMap.has(masterItem.id) 
                        ? savedProgressMap.get(masterItem.id)! 
                        : masterItem
                );
                setEntry({ ...entryToEdit, workProgress: mergedWorkProgress });
            } else {
                setEntry(getInitialState());
            }
        }
    }, [entryToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEntry(prev => ({ ...prev, [name]: value }));
    };
    
    const handleManpowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntry(prev => ({...prev, manpower: {...prev.manpower, [name]: parseInt(value) || 0 }}));
    };

    const handleWorkProgressChange = (itemId: string) => {
        setEntry(prev => ({
            ...prev,
            workProgress: prev.workProgress.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
            )
        }));
    };
    
    // Material Handlers
    // FIX: Refactored `handleMaterialChange` to use the previous state from the `setEntry` callback. This prevents stale state and potential type inference failures.
    const handleMaterialChange = (index: number, field: string, value: string | number) => {
        setEntry(prev => {
            const updatedMaterials = [...prev.materialsConsumed];
            if (field === 'itemId') {
                const selectedItem = INVENTORY_DATA.find(i => i.id === value);
                updatedMaterials[index] = { ...updatedMaterials[index], itemId: value as string, unit: selectedItem?.unit || 'Units' };
            } else if (field === 'quantity') {
                updatedMaterials[index] = { ...updatedMaterials[index], quantity: value as number };
            }
            return { ...prev, materialsConsumed: updatedMaterials };
        });
    };
    const addMaterial = () => setEntry(prev => ({...prev, materialsConsumed: [...prev.materialsConsumed, { itemId: '', quantity: 0, unit: 'Units' }]}));
    const removeMaterial = (index: number) => setEntry(prev => ({...prev, materialsConsumed: prev.materialsConsumed.filter((_, i) => i !== index)}));

    // Equipment Handlers
    // FIX: Refactored `handleEquipmentChange` to use the previous state from the `setEntry` callback to prevent stale state.
    const handleEquipmentChange = (index: number, field: string, value: string | number) => {
        setEntry(prev => {
            const updatedEquipment = [...prev.equipmentUsed];
            if (field === 'equipmentName') {
                updatedEquipment[index] = { ...updatedEquipment[index], equipmentName: value as string };
            } else if (field === 'hours') {
                updatedEquipment[index] = { ...updatedEquipment[index], hours: value as number };
            }
            return { ...prev, equipmentUsed: updatedEquipment };
        });
    };
    const addEquipment = () => setEntry(prev => ({...prev, equipmentUsed: [...prev.equipmentUsed, { equipmentName: '', hours: 0 }]}));
    const removeEquipment = (index: number) => setEntry(prev => ({...prev, equipmentUsed: prev.equipmentUsed.filter((_, i) => i !== index)}));
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...(entryToEdit && { id: entryToEdit.id }), ...entry });
        onClose();
    };

    if (!isOpen) return null;

    const groupedWorkProgress = entry.workProgress.reduce((acc: Record<string, WorkProgress[]>, item) => {
        const category = item.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, WorkProgress[]>);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary p-8 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-brand-text">{entryToEdit ? 'Edit' : 'Add'} DPR</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Date</label>
                            <input type="date" name="date" value={entry.date} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Weather</label>
                            <select name="weather" value={entry.weather} onChange={handleChange} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2">
                                <option>Sunny</option><option>Cloudy</option><option>Rainy</option><option>Windy</option>
                            </select>
                        </div>
                    </div>
                    <fieldset className="border p-4 rounded-md border-slate-300 dark:border-brand-border">
                        <legend className="text-sm font-medium px-2 text-slate-600 dark:text-brand-text-secondary">Manpower</legend>
                        <div className="grid grid-cols-3 gap-4">
                            <input type="number" name="supervisors" value={entry.manpower.supervisors} onChange={handleManpowerChange} placeholder="Supervisors" className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2" />
                            <input type="number" name="skilledWorkers" value={entry.manpower.skilledWorkers} onChange={handleManpowerChange} placeholder="Skilled" className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2" />
                            <input type="number" name="unskilledWorkers" value={entry.manpower.unskilledWorkers} onChange={handleManpowerChange} placeholder="Unskilled" className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2" />
                        </div>
                    </fieldset>
                    
                    <fieldset className="border p-4 rounded-md border-slate-300 dark:border-brand-border">
                        <legend className="text-sm font-medium px-2 text-slate-600 dark:text-brand-text-secondary">Work Progress Checklist</legend>
                        <div className="space-y-4">
                            {Object.entries(groupedWorkProgress).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="font-semibold text-slate-800 dark:text-brand-text mb-2">{category}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                        {items.map(item => (
                                            <div key={item.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={item.id}
                                                    checked={item.completed}
                                                    onChange={() => handleWorkProgressChange(item.id)}
                                                    className="h-4 w-4 rounded border-slate-300 dark:border-brand-border bg-slate-100 dark:bg-slate-700 text-brand-accent focus:ring-brand-accent focus:ring-offset-white dark:focus:ring-offset-brand-secondary"
                                                />
                                                <label htmlFor={item.id} className="ml-3 text-sm text-slate-700 dark:text-brand-text-secondary cursor-pointer select-none">
                                                    {item.text}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </fieldset>

                     <fieldset className="border p-4 rounded-md border-slate-300 dark:border-brand-border">
                        <legend className="text-sm font-medium px-2 text-slate-600 dark:text-brand-text-secondary">Materials Consumed</legend>
                        <div className="space-y-2">
                            {entry.materialsConsumed.map((mat, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <select value={mat.itemId} onChange={e => handleMaterialChange(index, 'itemId', e.target.value)} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2">
                                        <option value="">Select Item</option>
                                        {INVENTORY_DATA.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                    </select>
                                    <input type="number" value={mat.quantity} onChange={e => handleMaterialChange(index, 'quantity', parseInt(e.target.value) || 0)} className="w-32 flex-shrink-0 bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2" placeholder="Qty"/>
                                    <span className="text-sm text-slate-500 w-16 text-center flex-shrink-0">{mat.unit}</span>
                                    <button type="button" onClick={() => removeMaterial(index)} className="text-red-500 p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-full flex-shrink-0" title="Remove Material">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addMaterial} className="text-sm mt-3 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent font-semibold py-2 px-3 rounded-lg flex items-center transition-colors w-max">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add Material
                        </button>
                    </fieldset>
                    
                    <fieldset className="border p-4 rounded-md border-slate-300 dark:border-brand-border">
                        <legend className="text-sm font-medium px-2 text-slate-600 dark:text-brand-text-secondary">Equipment Used</legend>
                        <div className="space-y-2">
                            {entry.equipmentUsed.map((eq, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" value={eq.equipmentName} onChange={e => handleEquipmentChange(index, 'equipmentName', e.target.value)} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2" placeholder="Equipment Name" />
                                    <input type="number" value={eq.hours} onChange={e => handleEquipmentChange(index, 'hours', parseInt(e.target.value) || 0)} className="w-32 flex-shrink-0 bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2" placeholder="Hours"/>
                                    <span className="text-sm text-slate-500 w-16 text-center flex-shrink-0">Hours</span>
                                    <button type="button" onClick={() => removeEquipment(index)} className="text-red-500 p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-full flex-shrink-0" title="Remove Equipment">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addEquipment} className="text-sm mt-3 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent font-semibold py-2 px-3 rounded-lg flex items-center transition-colors w-max">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add Equipment
                        </button>
                    </fieldset>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-brand-text-secondary mb-1">Hindrances or Remarks</label>
                        <textarea name="hindrances" value={entry.hindrances} onChange={handleChange} rows={3} className="w-full bg-slate-50 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-md p-2"></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-brand-accent text-white font-bold hover:bg-brand-accent-light">Save Report</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const DPR: React.FC<DPRProps> = ({ dprEntries, setDprEntries }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<DPREntry | null>(null);

    const sortedEntries = useMemo(() => {
        return [...dprEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [dprEntries]);

    const handleOpenAddModal = () => {
        setEntryToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (entry: DPREntry) => {
        setEntryToEdit(entry);
        setIsModalOpen(true);
    };

    const handleSave = (entryData: Omit<DPREntry, 'id' | 'submittedBy'> & { id?: string }) => {
        setDprEntries(prev => {
            if (entryData.id) { // Editing
                return prev.map(e => e.id === entryData.id ? { ...e, ...entryData } as DPREntry : e);
            } else { // Adding
                const newEntry: DPREntry = {
                    ...(entryData as Omit<DPREntry, 'id' | 'submittedBy'>),
                    id: `dpr-${Date.now()}`,
                    submittedBy: 'Supervisor', // Placeholder
                };
                return [newEntry, ...prev];
            }
        });
    };
    
    return (
        <>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-brand-text">Daily Progress Reports (DPR)</h2>
                     <button
                      onClick={handleOpenAddModal}
                      className="bg-brand-accent hover:bg-brand-accent-light text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Submit DPR
                    </button>
                </div>

                <div className="space-y-6">
                    {sortedEntries.map(entry => (
                        <Card key={entry.id}>
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-200 dark:border-brand-border mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-800 dark:text-brand-text">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                    <p className="text-sm text-slate-500 dark:text-brand-text-secondary">Submitted by: {entry.submittedBy}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                    <span className="flex items-center text-sm text-slate-600 dark:text-brand-text-secondary"><WeatherIcon weather={entry.weather} /> {entry.weather}</span>
                                    <button onClick={() => handleOpenEditModal(entry)} className="text-brand-accent hover:underline text-sm font-semibold">Edit</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-brand-text">Manpower</h4>
                                    <p className="text-sm text-slate-600 dark:text-brand-text-secondary">Supervisors: <span className="font-bold">{entry.manpower.supervisors}</span></p>
                                    <p className="text-sm text-slate-600 dark:text-brand-text-secondary">Skilled: <span className="font-bold">{entry.manpower.skilledWorkers}</span></p>
                                    <p className="text-sm text-slate-600 dark:text-brand-text-secondary">Unskilled: <span className="font-bold">{entry.manpower.unskilledWorkers}</span></p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-brand-text">Materials Consumed</h4>
                                    <ul className="text-sm list-disc list-inside text-slate-600 dark:text-brand-text-secondary">
                                        {entry.materialsConsumed.map(mat => <li key={mat.itemId}>{inventoryMap.get(mat.itemId)}: {mat.quantity} {mat.unit}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-brand-text">Equipment Used</h4>
                                    <ul className="text-sm list-disc list-inside text-slate-600 dark:text-brand-text-secondary">
                                        {entry.equipmentUsed.map(eq => <li key={eq.equipmentName}>{eq.equipmentName}: {eq.hours} hrs</li>)}
                                    </ul>
                                </div>
                                <div className="md:col-span-3">
                                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-brand-text">Work Progress</h4>
                                    <ul className="columns-2 md:columns-3 text-sm text-slate-600 dark:text-brand-text-secondary space-y-1">
                                        {entry.workProgress.filter(p => p.completed).map(p => <li key={p.id} className="flex items-center"><svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{p.text}</li>)}
                                    </ul>
                                </div>
                                {entry.hindrances && <div className="md:col-span-3">
                                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-brand-text">Hindrances / Remarks</h4>
                                    <p className="text-sm text-slate-600 dark:text-brand-text-secondary italic bg-slate-100 dark:bg-brand-dark p-2 rounded-md">{entry.hindrances}</p>
                                </div>}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            
            <AddEditDPRModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                entryToEdit={entryToEdit}
            />
        </>
    );
};

export default DPR;

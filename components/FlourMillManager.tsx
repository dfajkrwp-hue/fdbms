import React, { useState, useEffect, useMemo } from 'react';
import { FlourMill } from '../types';
import { CloseIcon, PlusIcon, TrashIcon, EditIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

interface FlourMillManagerProps {
    isOpen: boolean;
    onClose: () => void;
    flourMills: FlourMill[];
    setFlourMills: (value: FlourMill[] | ((val: FlourMill[]) => FlourMill[])) => void;
    logAction: (action: string, details?: Record<string, any>) => void;
}

const emptyFlourMill: Omit<FlourMill, 'id'> = {
    name: '',
    district: '',
    sanctionedNo: '',
    sanctionedDate: new Date().getFullYear().toString(),
    monthlyQuota: 0,
    annualQuota: 0,
};

const FlourMillManager: React.FC<FlourMillManagerProps> = ({ isOpen, onClose, flourMills, setFlourMills, logAction }) => {
    const [isEditing, setIsEditing] = useState<FlourMill | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFlourMills = useMemo(() => {
        const sorted = [...flourMills].sort((a, b) => a.name.localeCompare(b.name));
        if (!searchQuery) return sorted;
        const lowercasedQuery = searchQuery.toLowerCase();
        return sorted.filter(mill =>
            mill.name.toLowerCase().includes(lowercasedQuery) ||
            mill.sanctionedNo.toLowerCase().includes(lowercasedQuery) ||
            mill.district.toLowerCase().includes(lowercasedQuery)
        );
    }, [flourMills, searchQuery]);

    const handleSave = (millToSave: FlourMill) => {
        const oldMill = flourMills.find(m => m.id === millToSave.id);
        const action = oldMill ? 'Flour Mill Updated' : 'Flour Mill Created';
        
        setFlourMills(prev => {
            if (oldMill) {
                return prev.map(m => m.id === millToSave.id ? millToSave : m);
            }
            return [...prev, millToSave];
        });
        
        logAction(action, { millId: millToSave.id, millName: millToSave.name, oldValue: oldMill, newValue: millToSave });
        setIsEditing(null);
    };

    const handleAddNew = () => {
        const newId = flourMills.length > 0 ? Math.max(...flourMills.map(m => m.id)) + 1 : 1;
        setIsEditing({ ...emptyFlourMill, id: newId });
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this flour mill?')) {
            const deletedMill = flourMills.find(m => m.id === id);
            setFlourMills(prev => prev.filter(m => m.id !== id));
            if (deletedMill) {
                logAction('Flour Mill Deleted', { millId: id, millName: deletedMill.name });
            }
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Flour Mill Management</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                <div className="p-4 flex-1 overflow-y-auto">
                    {isEditing ? (
                        <FlourMillForm mill={isEditing} onSave={handleSave} onCancel={() => setIsEditing(null)} />
                    ) : (
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">All Flour Mills ({filteredFlourMills.length})</h3>
                                <button onClick={handleAddNew} className="flex items-center px-3 py-2 bg-[var(--color-primary)] text-white rounded-md shadow-sm hover:bg-[var(--color-primary-hover)] text-sm font-medium"><PlusIcon /> Add New</button>
                            </div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by name, district, or sanctioned no..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div className="overflow-x-auto border rounded-lg max-h-[60vh]">
                                <table className="min-w-full divide-y">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">District</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Sanctioned Info</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium uppercase">Monthly Quota</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y">
                                        {filteredFlourMills.map(mill => (
                                            <tr key={mill.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium">{mill.name}</td>
                                                <td className="px-4 py-2">{mill.district}</td>
                                                <td className="px-4 py-2 text-sm">{mill.sanctionedNo} ({mill.sanctionedDate})</td>
                                                <td className="px-4 py-2 text-right">{mill.monthlyQuota.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-center space-x-2">
                                                    <button onClick={() => setIsEditing(mill)} title="Edit" className="p-2 text-gray-500 hover:text-blue-600"><EditIcon /></button>
                                                    <button onClick={() => handleDelete(mill.id)} title="Delete" className="p-2 text-gray-500 hover:text-red-600"><TrashIcon /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface FlourMillFormProps {
    mill: FlourMill;
    onSave: (mill: FlourMill) => void;
    onCancel: () => void;
}

const FlourMillForm: React.FC<FlourMillFormProps> = ({ mill, onSave, onCancel }) => {
    const [formState, setFormState] = useState<FlourMill>(mill);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseFloat(value) || 0 : value;
        const updatedState = { ...formState, [name]: val };
        if (name === 'monthlyQuota') {
            updatedState.annualQuota = (val as number) * 12;
        }
        setFormState(updatedState);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold">{mill.id ? 'Edit Flour Mill' : 'Add New Flour Mill'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium">Name</label><input type="text" name="name" value={formState.name} onChange={handleChange} className={inputClass} required/></div>
                <div><label className="block text-sm font-medium">District</label><input type="text" name="district" value={formState.district} onChange={handleChange} className={inputClass} required/></div>
                <div><label className="block text-sm font-medium">Sanctioned No.</label><input type="text" name="sanctionedNo" value={formState.sanctionedNo} onChange={handleChange} className={inputClass} required/></div>
                <div><label className="block text-sm font-medium">Sanctioned Date/Year</label><input type="text" name="sanctionedDate" value={formState.sanctionedDate} onChange={handleChange} className={inputClass} required/></div>
                <div><label className="block text-sm font-medium">Monthly Quota</label><input type="number" name="monthlyQuota" value={formState.monthlyQuota} onChange={handleChange} className={inputClass} required/></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium">Annual Quota (auto-calculated)</label><input type="number" name="annualQuota" value={formState.annualQuota} className={`${inputClass} bg-gray-100`} readOnly/></div>
            </div>
             <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)]">Save Flour Mill</button>
            </div>
        </form>
    )
}

export default FlourMillManager;
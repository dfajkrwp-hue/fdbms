import React, { useState, useEffect } from 'react';
import { BillingSettings, DefaultCertPoint } from '../types';
import { CloseIcon, SettingsIcon, PlusIcon, TrashIcon } from './Icons';
import { v4 as uuidv4 } from 'uuid';

interface TransportationSettingsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    settings: BillingSettings;
    setSettings: (value: BillingSettings | ((val: BillingSettings) => BillingSettings)) => void;
    certPoints: DefaultCertPoint[];
    setCertPoints: (value: DefaultCertPoint[] | ((val: DefaultCertPoint[]) => DefaultCertPoint[])) => void;
    logAction: (action: string, details?: Record<string, any>) => void;
}

const TransportationSettingsManager: React.FC<TransportationSettingsManagerProps> = ({ isOpen, onClose, settings, setSettings, certPoints, setCertPoints, logAction }) => {
    const [formState, setFormState] = useState<BillingSettings>(settings);
    const [certPointsState, setCertPointsState] = useState<DefaultCertPoint[]>(certPoints);

    useEffect(() => {
        if (isOpen) {
            setFormState(settings);
            setCertPointsState(certPoints);
        }
    }, [isOpen, settings, certPoints]);

    if (!isOpen) return null;

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [section, key, subkey] = name.split('.');
        const numValue = parseFloat(value) || 0;

        setFormState(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            if (subkey) {
                newState[section][key][subkey] = numValue;
            } else {
                newState[section][key] = numValue;
            }
            return newState;
        });
    };

    const handleCertPointChange = (id: string, text: string) => {
        setCertPointsState(prev => prev.map(p => p.id === id ? { ...p, text } : p));
    };
    const addCertPoint = () => setCertPointsState(prev => [...prev, { id: uuidv4(), text: '' }]);
    const removeCertPoint = (id: string) => setCertPointsState(prev => prev.filter(p => p.id !== id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const oldSettings = { ...settings };
        const oldCertPoints = [...certPoints];
        
        setSettings(formState);
        setCertPoints(certPointsState);

        logAction('Transportation Settings Updated', { 
            oldSettings, newSettings: formState, 
            oldCertPoints, newCertPoints: certPointsState 
        });
        alert('Transportation settings have been updated.');
        onClose();
    };

    const inputClass = "w-full px-3 py-2 mt-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center"><SettingsIcon /> Transportation Admin Panel</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Calculation Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                                <h4 className="font-semibold text-gray-700">Bag Weights (Kg)</h4>
                                <div><label className="text-sm font-medium">Normal Mode (per bag)</label><input type="number" step="any" name="NORMAL_MODE.KG_PER_BAG" value={formState.NORMAL_MODE.KG_PER_BAG} onChange={handleSettingsChange} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Bardana (PP Bag)</label><input type="number" step="any" name="BARDANA_MODE.PP_BAG_BARDANA_KG" value={formState.BARDANA_MODE.PP_BAG_BARDANA_KG} onChange={handleSettingsChange} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Bardana (Jute Bag)</label><input type="number" step="any" name="BARDANA_MODE.JUTE_BAG_BARDANA_KG" value={formState.BARDANA_MODE.JUTE_BAG_BARDANA_KG} onChange={handleSettingsChange} className={inputClass}/></div>
                            </div>
                             <div className="space-y-4 p-4 bg-gray-50 rounded-lg border md:col-span-2 grid grid-cols-2 gap-x-6 gap-y-4">
                                <h4 className="font-semibold text-gray-700 col-span-2">Deduction Rates & Penalties</h4>
                                <div><label className="text-sm font-medium">Income Tax Rate (%)</label><input type="number" step="any" name="DEDUCTIONS.INCOME_TAX_RATE" value={formState.DEDUCTIONS.INCOME_TAX_RATE * 100} onChange={e => handleSettingsChange({ ...e, target: {...e.target, value: (parseFloat(e.target.value)/100).toString() }})} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Tajveed-ul Quran (per 1000)</label><input type="number" step="any" name="DEDUCTIONS.TAJVEED_UL_QURAN_RATE" value={formState.DEDUCTIONS.TAJVEED_UL_QURAN_RATE} onChange={handleSettingsChange} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Education Cess (% of I.Tax)</label><input type="number" step="any" name="DEDUCTIONS.EDUCATION_CESS_RATE" value={formState.DEDUCTIONS.EDUCATION_CESS_RATE * 100} onChange={e => handleSettingsChange({ ...e, target: {...e.target, value: (parseFloat(e.target.value)/100).toString() }})} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">K.L.C Rate (%)</label><input type="number" step="any" name="DEDUCTIONS.KLC_RATE" value={formState.DEDUCTIONS.KLC_RATE * 100} onChange={e => handleSettingsChange({ ...e, target: {...e.target, value: (parseFloat(e.target.value)/100).toString() }})} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">S.D Current Rate (%)</label><input type="number" step="any" name="DEDUCTIONS.SD_CURRENT_RATE" value={formState.DEDUCTIONS.SD_CURRENT_RATE * 100} onChange={e => handleSettingsChange({ ...e, target: {...e.target, value: (parseFloat(e.target.value)/100).toString() }})} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">GST Current Rate (%)</label><input type="number" step="any" name="DEDUCTIONS.GST_CURRENT_RATE" value={formState.DEDUCTIONS.GST_CURRENT_RATE * 100} onChange={e => handleSettingsChange({ ...e, target: {...e.target, value: (parseFloat(e.target.value)/100).toString() }})} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Penalty (per day)</label><input type="number" step="any" name="DEDUCTIONS.PENALTY_PER_DAY" value={formState.DEDUCTIONS.PENALTY_PER_DAY} onChange={handleSettingsChange} className={inputClass}/></div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Default Certification Points</h3>
                        <div className="space-y-2">
                            {certPointsState.map((point) => (
                                <div key={point.id} className="flex items-center gap-2">
                                    <input type="text" value={point.text} onChange={e => handleCertPointChange(point.id, e.target.value)} className="w-full text-sm p-2" />
                                    <button type="button" onClick={() => removeCertPoint(point.id)} className="p-2 text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addCertPoint} className="mt-2 flex items-center text-sm text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-hover)]"><PlusIcon /> Add Point</button>
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md shadow-sm hover:bg-[var(--color-primary-hover)]">Save All Settings</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransportationSettingsManager;
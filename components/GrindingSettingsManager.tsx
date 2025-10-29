import React, { useState, useEffect } from 'react';
import { GrindingBillSettings, GrindingRates, GrindingBillingConfig } from '../types';
import { CloseIcon, SettingsIcon } from './Icons';

interface GrindingSettingsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    printSettings: GrindingBillSettings;
    setPrintSettings: (value: GrindingBillSettings | ((val: GrindingBillSettings) => GrindingBillSettings)) => void;
    rates: GrindingRates;
    setRates: (value: GrindingRates | ((val: GrindingRates) => GrindingRates)) => void;
    calcConfig: GrindingBillingConfig;
    setCalcConfig: (value: GrindingBillingConfig | ((val: GrindingBillingConfig) => GrindingBillingConfig)) => void;
    logAction: (action: string, details?: Record<string, any>) => void;
}

const GrindingSettingsManager: React.FC<GrindingSettingsManagerProps> = ({ isOpen, onClose, printSettings, setPrintSettings, rates, setRates, calcConfig, setCalcConfig, logAction }) => {
    const [printState, setPrintState] = useState<GrindingBillSettings>(printSettings);
    const [ratesState, setRatesState] = useState<GrindingRates>(rates);
    const [calcState, setCalcState] = useState<GrindingBillingConfig>(calcConfig);

    useEffect(() => {
        if (isOpen) {
            setPrintState(printSettings);
            setRatesState(rates);
            setCalcState(calcConfig);
        }
    }, [isOpen, printSettings, rates, calcConfig]);

    if (!isOpen) return null;

    const handlePrintChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrintState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRatesState(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));
    };

    const handleCalcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [section, key] = name.split('.');
        const numValue = parseFloat(value) || 0;
        setCalcState(prev => ({...prev, [section]: {...prev[section as keyof GrindingBillingConfig], [key]: numValue }}));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        setPrintSettings(printState);
        setRates(ratesState);
        setCalcConfig(calcState);

        logAction('Grinding Admin Panel Updated', { 
            printSettings: {old: printSettings, new: printState},
            rates: {old: rates, new: ratesState},
            calcConfig: {old: calcConfig, new: calcState}
        });
        alert('Grinding bill settings have been updated.');
        onClose();
    };

    const inputClass = "w-full px-3 py-2 mt-1";
    const rateKeys = Object.keys(rates) as Array<keyof GrindingRates>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center"><SettingsIcon /> Grinding Admin Panel</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><CloseIcon /></button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Print Layout Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium">Certification Header</label><textarea name="certificationHeader" value={printState.certificationHeader} onChange={handlePrintChange} rows={2} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium">Certification Details</label><textarea name="certificationHeaderDetails" value={printState.certificationHeaderDetails} onChange={handlePrintChange} rows={2} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium">Signatory 1 (Left)</label><textarea name="signatory1" value={printState.signatory1} onChange={handlePrintChange} rows={2} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium">Signatory 2 (Right)</label><textarea name="signatory2" value={printState.signatory2} onChange={handlePrintChange} rows={2} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium">Footer Note 1</label><textarea name="footerNote1" value={printState.footerNote1} onChange={handlePrintChange} rows={2} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium">Footer Note 2</label><textarea name="footerNote2" value={printState.footerNote2} onChange={handlePrintChange} rows={2} className={inputClass} /></div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Default Commodity Rates (@100KG)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {rateKeys.map(key => (<div key={key}><label className="block text-sm font-medium">{key}</label><input type="number" step="0.01" name={key} value={ratesState[key]} onChange={handleRateChange} required className={inputClass}/></div>))}
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Calculation Rates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                                <h4 className="font-semibold text-gray-700">Tax Deductions</h4>
                                <div><label className="text-sm font-medium">Income Tax Rate (%)</label><input type="number" step="any" name="DEDUCTIONS.INCOME_TAX_RATE" value={calcState.DEDUCTIONS.INCOME_TAX_RATE * 100} onChange={e => handleCalcChange({ ...e, target: {...e.target, value: (parseFloat(e.target.value)/100).toString() }})} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Tajveed-ul Quran (per 1000)</label><input type="number" step="any" name="DEDUCTIONS.TAJVEED_UL_QURAN_RATE" value={calcState.DEDUCTIONS.TAJVEED_UL_QURAN_RATE} onChange={handleCalcChange} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Education Cess (% of I.Tax)</label><input type="number" step="any" name="DEDUCTIONS.EDUCATION_CESS_RATE" value={calcState.DEDUCTIONS.EDUCATION_CESS_RATE * 100} onChange={e => handleCalcChange({ ...e, target: {...e.target, value: (parseFloat(e.target.value)/100).toString() }})} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">K.L.C (per 1000)</label><input type="number" step="any" name="DEDUCTIONS.KLC_RATE" value={calcState.DEDUCTIONS.KLC_RATE} onChange={handleCalcChange} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Stump Duty Rate (%)</label><input type="number" step="any" name="DEDUCTIONS.STUMP_DUTY_RATE" value={calcState.DEDUCTIONS.STUMP_DUTY_RATE * 100} onChange={e => handleCalcChange({ ...e, target: {...e.target, value: (parseFloat(e.target.value)/100).toString() }})} className={inputClass}/></div>
                            </div>
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border md:col-span-2">
                                <h4 className="font-semibold text-gray-700">Other Deductions</h4>
                                <div><label className="text-sm font-medium">E-Bags Rate (per bag)</label><input type="number" step="any" name="OTHER_DEDUCTIONS.E_BAGS_RATE" value={calcState.OTHER_DEDUCTIONS.E_BAGS_RATE} onChange={handleCalcChange} className={inputClass}/></div>
                                <div><label className="text-sm font-medium">Bran Price Rate (per Kg)</label><input type="number" step="any" name="OTHER_DEDUCTIONS.BRAN_PRICE_RATE" value={calcState.OTHER_DEDUCTIONS.BRAN_PRICE_RATE} onChange={handleCalcChange} className={inputClass}/></div>
                            </div>
                        </div>
                    </section>


                    <div className="pt-4 flex justify-end gap-2 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md shadow-sm hover:bg-[var(--color-primary-hover)]">Save All Settings</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GrindingSettingsManager;
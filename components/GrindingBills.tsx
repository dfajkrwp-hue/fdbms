import React, { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

import { SavedGrindingBill, FlourMill, GrindingBillCommodity, GrindingDeductions, OtherDeductions, GrindingRates, GrindingBillSettings, GrindingBillingConfig, Attachment } from '../types';
import { MOCK_DISTRICTS, LOGO_URL } from '../constants';
import { numberToWords } from '../utils';
import { PlusIcon, TrashIcon, PrintIcon, DatabaseIcon, ClipboardCheckIcon, ChevronDownIcon, ChevronUpIcon, EditIcon, SettingsIcon, ReportIcon, ArrowRightIcon, DownloadIcon, PdfIcon, UploadIcon, PaperclipIcon, WalletIcon } from './Icons';

interface GrindingBillsProps {
    savedBills: SavedGrindingBill[];
    setSavedBills: (value: SavedGrindingBill[] | ((val: SavedGrindingBill[]) => SavedGrindingBill[])) => void;
    flourMills: FlourMill[];
    logAction: (action: string, details?: Record<string, any>) => void;
    canCreateAndEdit: boolean;
    isAdmin: boolean;
    setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void;
    setGrindingBillForPrinting: (bill: SavedGrindingBill | null) => void;
    setIsForGrindingPrinting: (isPrinting: boolean) => void;
    grindingRates: GrindingRates;
    setGrindingRatesManagerOpen: (isOpen: boolean) => void;
    grindingBillSettings: GrindingBillSettings;
    grindingBillingConfig: GrindingBillingConfig;
    handleSendToAGOffice: (billId: string, billType: 'transportation' | 'grinding') => void;
}

interface BillEntryFormProps {
    canCreateAndEdit: boolean;
    isAdmin: boolean;
    selectedFlourMillId: number | null;
    setSelectedFlourMillId: (id: number | null) => void;
    flourMills: FlourMill[];
    billNumber: string;
    billDate: string;
    setBillDate: (date: string) => void;
    billPeriodStart: string;
    setBillPeriodStart: (date: string) => void;
    billPeriodEnd: string;
    setBillPeriodEnd: (date: string) => void;
    sanctionedNo: string;
    sanctionedDate: string;
    commodities: GrindingBillCommodity[];
    handleCommodityChange: (id: string, field: 'quantityKgs' | 'ratePer100Kg', value: number) => void;
    totalAmount: number;
    districtForTax: string;
    setDistrictForTax: (district: string) => void;
    deductions: GrindingDeductions;
    customDeductions: Array<{ id: string; label: string; value: number }>;
    updateCustomDeduction: (id: string, field: 'label' | 'value', value: string | number) => void;
    removeCustomDeduction: (id: string) => void;
    addCustomDeduction: () => void;
    totalDeduction: number;
    netAmountAfterTaxes: number;
    otherDeductions: OtherDeductions;
    handleOtherDeductionChange: (type: 'eBags', field: 'month' | 'bags' | 'rate', value: string | number) => void;
    finalCalculations: {
        branPriceAmount: number;
        eBagsAmount: number;
        amountToDirector: number;
        finalAmountToMill: number;
        amountInWords: string;
    };
    grindingBillSettings: GrindingBillSettings;
    attachments: Attachment[];
    setAttachments: (attachments: Attachment[] | ((val: Attachment[]) => Attachment[])) => void;
}

interface SavedBillsListProps {
    savedBills: SavedGrindingBill[];
    flourMills: FlourMill[];
    loadBill: (bill: SavedGrindingBill) => void;
    handleDelete: (billId: string) => void;
    setGrindingBillsForPrinting: (bills: SavedGrindingBill[]) => void;
    setIsForGrindingBulkPrinting: (isPrinting: boolean) => void;
}

interface GrindingReportsProps {
    savedBills: SavedGrindingBill[];
    flourMills: FlourMill[];
}


const getInitialCommodities = (rates: GrindingRates): GrindingBillCommodity[] => [
    { id: uuidv4(), name: 'W/M Atta', quantityKgs: 0, ratePer100Kg: rates['W/M Atta'], amount: 0 },
    { id: uuidv4(), name: 'Fine Atta', quantityKgs: 0, ratePer100Kg: rates['Fine Atta'], amount: 0 },
    { id: uuidv4(), name: 'Bran', quantityKgs: 0, ratePer100Kg: rates['Bran'], amount: 0 },
];

const getInitialOtherDeductions = (config: GrindingBillingConfig): OtherDeductions => ({
    eBags: { month: '', bags: 0, rate: config.OTHER_DEDUCTIONS.E_BAGS_RATE, amount: 0 },
    branPrice: { quantity: 0, rate: config.OTHER_DEDUCTIONS.BRAN_PRICE_RATE, amount: 0 },
});

const initialCustomDeduction = { id: uuidv4(), label: 'Other if any', value: 0 };

const generateNextGrindingBillNumber = (bills: SavedGrindingBill[], date: string): string => {
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }
    const billDate = new Date(date);
    const month = (billDate.getMonth() + 1).toString().padStart(2, '0');
    const year = billDate.getFullYear();
    const currentMonthYear = `${month}/${year}`;

    let maxNumber = 0;
    bills.forEach(bill => {
        const match = bill.billNumber.match(/\((\d{2})\/(\d{4})\/(\d+)\)/);
        if (match && match[1] === month && match[2] === year.toString()) {
            const numberPart = parseInt(match[3], 10);
            if (numberPart > maxNumber) {
                maxNumber = numberPart;
            }
        }
    });

    const nextNumber = maxNumber + 1;
    return `(${currentMonthYear}/${nextNumber})`;
};

// Fix: Moved helper component definitions before their usage in the main `GrindingBills` component to resolve "Cannot find name" errors.
// Function components defined as const are not hoisted.
const BillEntryForm: React.FC<BillEntryFormProps> = ({ canCreateAndEdit, isAdmin, selectedFlourMillId, setSelectedFlourMillId, flourMills, billNumber, billDate, setBillDate, billPeriodStart, setBillPeriodStart, billPeriodEnd, setBillPeriodEnd, sanctionedNo, sanctionedDate, commodities, handleCommodityChange, totalAmount, districtForTax, setDistrictForTax, deductions, customDeductions, updateCustomDeduction, removeCustomDeduction, addCustomDeduction, totalDeduction, netAmountAfterTaxes, otherDeductions, handleOtherDeductionChange, finalCalculations, grindingBillSettings, attachments, setAttachments }) => {
    
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canCreateAndEdit) return;
        const files = e.target.files;
        if (!files) return;
        const newAttachments: Attachment[] = [...attachments];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            await new Promise<void>((resolve, reject) => {
                reader.onload = (event) => {
                    newAttachments.push({ id: uuidv4(), name: file.name, type: file.type, dataUrl: event.target?.result as string });
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        setAttachments(newAttachments);
        e.target.value = '';
    };

    const handleRemoveAttachment = (id: string) => {
        if (!canCreateAndEdit) return;
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    return (
    <fieldset disabled={!canCreateAndEdit} className="space-y-6">
         {/* Bill Info */}
        <div className="card p-4 md:p-6">
             <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-100 p-3 rounded-xl"><ClipboardCheckIcon className="h-6 w-6 text-green-700" /></div>
                <div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Bill Information</h2>
                    <p className="text-sm text-[var(--color-text-light)]">Enter primary details of the bill.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Flour Mill</label>
                    <select value={selectedFlourMillId ?? ''} onChange={e => setSelectedFlourMillId(Number(e.target.value))} className="w-full px-3 py-2">
                        <option disabled value="">Select Flour Mill</option>
                        {flourMills.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Bill #</label>
                    <input type="text" value={billNumber} disabled className="w-full px-3 py-2 bg-slate-100" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Bill Date</label>
                    <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} className="w-full px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Bill Period Start</label>
                    <input type="date" value={billPeriodStart} onChange={e => setBillPeriodStart(e.target.value)} className="w-full px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Bill Period End</label>
                    <input type="date" value={billPeriodEnd} onChange={e => setBillPeriodEnd(e.target.value)} className="w-full px-3 py-2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">District for Tax</label>
                    <select value={districtForTax} onChange={e => setDistrictForTax(e.target.value)} className="w-full px-3 py-2">
                        <option disabled>Select District</option>
                        {MOCK_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="flex items-end pb-2">
                    <p className="text-sm font-medium text-[var(--color-text-light)]">
                        Sanctioned No: {sanctionedNo || 'N/A'} <br/>
                        Sanctioned Date: {sanctionedDate || 'N/A'}
                    </p>
                </div>
            </div>
        </div>

        {/* Commodities */}
        <div className="card p-4 md:p-6"><div className="overflow-x-auto -mx-4 md:-mx-6"><table className="min-w-full text-sm">
            <thead className="text-center font-bold bg-slate-50"><tr><th className="p-2 font-semibold">S.#</th><th className="p-2 font-semibold text-left">Commodity</th><th className="p-2 font-semibold">Quantity of Atta KGs</th><th className="p-2 font-semibold">Rate @100KG</th><th className="p-2 font-semibold">Amount Payable</th></tr></thead>
            <tbody>{commodities.map((item, index) => (<tr key={item.id} className="border-b"><td className="p-2 text-center">{index + 1}</td><td className="p-2 font-semibold">{item.name}</td><td className="p-2"><input type="number" value={item.quantityKgs} onChange={e => handleCommodityChange(item.id, 'quantityKgs', Number(e.target.value))} className="w-full text-right p-1.5"/></td>
            <td className="p-2">
                {item.name === 'W/M Atta' ? (
                    <div className="w-full text-right p-1.5 h-[42px] flex items-center justify-end font-mono bg-slate-100 rounded-md">-</div>
                ) : (
                    <input 
                        type="number" 
                        step="0.01" 
                        value={item.ratePer100Kg} 
                        onChange={e => handleCommodityChange(item.id, 'ratePer100Kg', Number(e.target.value))} 
                        className="w-full text-right p-1.5"
                        disabled={!isAdmin}
                    />
                )}
            </td>
<td className="p-2 text-right font-medium">Rs. {Number(item.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>))}</tbody>
            <tfoot className="font-bold bg-slate-100"><tr><td colSpan={2} className="p-2 text-right">Total Qty:</td><td className="p-2 text-right">{commodities.reduce((s,i)=>s+i.quantityKgs,0).toLocaleString()}</td><td className="p-2 text-right">Total Amount</td>
<td className="p-2 text-right">Rs. {Number(totalAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr></tfoot>
        </table></div></div>

        {/* Attachments Card */}
        <div className="card p-4 md:p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-100 p-3 rounded-xl"><PaperclipIcon className="h-6 w-6 text-green-700" /></div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-main)]">Attachments</h3>
                    <p className="text-sm text-[var(--color-text-light)]">Attach any relevant documents.</p>
                </div>
            </div>
            <div className="p-4 border-2 border-dashed border-[var(--color-border)] rounded-lg bg-slate-50">
                {canCreateAndEdit && (
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <label htmlFor="grinding-file-upload" className="cursor-pointer inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold border border-green-200/50 rounded-md shadow-sm hover:bg-green-200 transition-colors"><UploadIcon className="h-5 w-5 mr-2" /><span>Add Attachments...</span></label>
                    <input id="grinding-file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileSelect} />
                </div>
                )}
                {attachments.length > 0 && (
                    <ul className="mt-4 space-y-2">
                        {attachments.map(att => (
                            <li key={att.id} className="flex items-center justify-between text-sm bg-slate-100 p-2 border border-[var(--color-border)] rounded-md shadow-sm">
                                <div className="flex items-center truncate">
                                    <PaperclipIcon className="h-5 w-5 mr-2 text-[var(--color-text-light)]"/>
                                    <a href={att.dataUrl} download={att.name} className="text-green-700 hover:underline truncate" title={att.name}>{att.name}</a>
                                </div>
                                {canCreateAndEdit && (<button onClick={() => handleRemoveAttachment(att.id)} className="ml-4 text-[var(--color-text-light)] hover:text-[var(--color-danger)]"><TrashIcon className="h-5 w-5" /></button>)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        {/* Deductions */}
        <div className="card p-4 md:p-6"><h3 className="font-bold mb-4">Deduction of taxes/Others</h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3"><table className="w-full text-sm"><tbody className="divide-y">
                    <tr className="align-middle"><td className="py-1 flex items-center"><span>1. Income Tax @8% (I.T.O )</span><select value={districtForTax} onChange={e => setDistrictForTax(e.target.value)} className="ml-2 p-1 text-xs"><option disabled>for districts</option>{MOCK_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}</select></td>
<td className="py-1 text-right font-medium">Rs. {Number(deductions.incomeTax).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>
<tr><td className="py-1">2. Tajveed UL Quran @ 5%/1000/-</td><td className="py-1 text-right font-medium">Rs. {Number(deductions.tajveedUlQuran).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>
<tr><td className="py-1">3. (Education Cess @ 10% of I.Tax)</td><td className="py-1 text-right font-medium">Rs. {Number(deductions.educationCess).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>
<tr><td className="py-1">4. K.L.C 1%/1000/-</td><td className="py-1 text-right font-medium">Rs. {Number(deductions.klc).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>
<tr><td className="py-1">5. Stump duty for current @ 0.25%</td><td className="py-1 text-right font-medium">Rs. {Number(deductions.stumpDuty).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>
                    {customDeductions.map((deduction, index) => (<tr key={deduction.id}><td className="py-1 w-full flex items-center gap-2"><span>{index + 6}.</span><input type="text" value={deduction.label} onChange={e => updateCustomDeduction(deduction.id, 'label', e.target.value)} className="w-full p-1" /></td><td className="py-1 text-right flex items-center justify-end gap-2"><span>Rs.</span><input type="number" value={deduction.value} onChange={e => updateCustomDeduction(deduction.id, 'value', parseFloat(e.target.value) || 0)} className="w-32 text-right p-1"/><button type="button" onClick={() => removeCustomDeduction(deduction.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="h-4 w-4" /></button></td></tr>))}
                </tbody></table><button type="button" onClick={addCustomDeduction} className="mt-2 flex items-center text-sm text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-hover)]"><PlusIcon /> Add Deduction Line</button></div>
                <div className="lg:col-span-2 space-y-3 pt-4 border-t lg:border-t-0 lg:pt-0">
<div className="flex justify-between font-medium"><span>Total Deduction:</span><span>Rs. {Number(totalDeduction).toLocaleString(undefined, {minimumFractionDigits:2})}</span></div>
<div className="flex justify-between font-bold text-xl text-green-700"><span>Net Amount:</span><span>Rs. {Number(netAmountAfterTaxes).toLocaleString(undefined, {minimumFractionDigits:2})}</span></div>
                </div>
            </div>
        </div>

        {/* Certification */}
        <div className="card p-4 md:p-6">
            <h3 className="font-bold mb-4">Certification & Final Cheques</h3>
            <div className="space-y-6 text-sm bg-slate-50 p-4 rounded-lg border">
                <div className="space-y-4">
                    <div><label className="font-medium">1. Deduction of Less /Excess E-Bags of I/Wheat @ Rs. {otherDeductions.eBags.rate} Per Bag</label><div className="grid grid-cols-3 gap-4 mt-1"><input type="text" placeholder="Month" value={otherDeductions.eBags.month} onChange={e => handleOtherDeductionChange('eBags', 'month', e.target.value)} className="p-1.5" /><input type="number" placeholder="No. of Bags" value={otherDeductions.eBags.bags || ''} onChange={e => handleOtherDeductionChange('eBags', 'bags', Number(e.target.value))} className="p-1.5" />
<div className="p-1.5 bg-slate-100 text-right rounded-md font-medium">Rs. {Number(finalCalculations.eBagsAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</div></div></div>
                    <div><label className="font-medium">2. Deduction of Bran Price @ Rs. {otherDeductions.branPrice.rate}/- Per Kg</label><div className="grid grid-cols-3 gap-4 mt-1"><div className="p-1.5 bg-slate-100 rounded-md">{otherDeductions.branPrice.quantity.toLocaleString()} KGs</div>
<div className="col-span-2 p-1.5 bg-slate-100 text-right rounded-md font-medium">Rs. {Number(finalCalculations.branPriceAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</div></div></div>
                </div>
<div className="pt-4 border-t grid grid-cols-2 gap-4 items-center"><label className="font-bold">3. Cheque in favour of Director Food (AJK)</label><div className="font-bold text-lg text-right text-red-600">Rs. {Number(finalCalculations.amountToDirector).toLocaleString(undefined, {minimumFractionDigits:2})}</div></div>
<div className="pt-2 border-t grid grid-cols-2 gap-4 items-center"><label className="font-bold">4. Cheque in favour of Flour Mills</label><div className="font-bold text-lg text-right text-green-800">(Rs. {Number(finalCalculations.finalAmountToMill).toLocaleString(undefined, {minimumFractionDigits:2})})</div></div>
            </div>
        </div>
    </fieldset>
);
};

const SavedBillsList: React.FC<SavedBillsListProps> = ({ savedBills, flourMills, loadBill, handleDelete, setGrindingBillsForPrinting, setIsForGrindingBulkPrinting }) => {
    const [billFilter, setBillFilter] = useState({millId: 'all', startDate: '', endDate: ''});

    const filteredSavedBills = useMemo(() => {
        return savedBills
            .filter(b => 
                (billFilter.millId === 'all' || b.flourMillId === Number(billFilter.millId)) &&
                (!billFilter.startDate || b.billDate >= billFilter.startDate) &&
                (!billFilter.endDate || b.billDate <= billFilter.endDate)
            )
            .sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime());
    }, [savedBills, billFilter]);

    const handleExportExcel = () => {
        if (filteredSavedBills.length === 0) return alert('No bills to export.');
        const data = filteredSavedBills.flatMap(bill => 
            bill.commodities.map(c => ({
                "Bill #": bill.billNumber,
                "Bill Date": bill.billDate,
                "Flour Mill": bill.flourMillName,
                "Commodity": c.name,
                "Quantity (Kg)": c.quantityKgs,
                "Rate @100Kg": c.ratePer100Kg,
                "Amount": c.amount,
                "Total Bill Amount": bill.totalAmount,
                "Net Amount After Taxes": bill.netAmountAfterTaxes,
                "Final Amount to Mill": bill.finalAmountToMill,
            }))
        );
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Grinding Bills");
        XLSX.writeFile(workbook, "GrindingBillsExport.xlsx");
    };

    const handleExportPdf = () => {
        if (filteredSavedBills.length === 0) return alert('No bills to export.');
        setGrindingBillsForPrinting(filteredSavedBills);
        setIsForGrindingBulkPrinting(true);
    };

    return (
    <div className="card p-4 md:p-6 animate-fade-in">
        <h2 className="text-lg font-semibold mb-4">Saved Grinding Bills ({filteredSavedBills.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border bg-gray-50 rounded-lg">
            <select onChange={e => setBillFilter(prev => ({...prev, millId: e.target.value}))} className="w-full p-2"><option value="all">All Flour Mills</option>{flourMills.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
            <input type="date" onChange={e => setBillFilter(prev => ({...prev, startDate: e.target.value}))} className="w-full p-2" />
            <input type="date" onChange={e => setBillFilter(prev => ({...prev, endDate: e.target.value}))} className="w-full p-2" />
        </div>
         <div className="flex justify-end gap-2 mb-4">
            <button onClick={handleExportExcel} className="flex items-center px-3 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-md shadow-sm hover:bg-green-200"><DownloadIcon className="mr-2 h-4 w-4" /> Export Excel</button>
            <button onClick={handleExportPdf} className="flex items-center px-3 py-2 bg-red-100 text-red-800 text-sm font-semibold rounded-md shadow-sm hover:bg-red-200"><PdfIcon className="mr-2 h-4 w-4" /> Export PDF</button>
        </div>
         <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium uppercase">Bill #</th><th className="px-4 py-2 text-left text-xs font-medium uppercase">Date</th><th className="px-4 py-2 text-left text-xs font-medium uppercase">Flour Mill</th><th className="px-4 py-2 text-right text-xs font-medium uppercase">Final Amount</th><th className="px-4 py-2 text-center text-xs font-medium uppercase">Actions</th></tr></thead>
                <tbody className="bg-white divide-y">
                    {filteredSavedBills.map(bill => (
                        <tr key={bill.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{bill.billNumber}</td>
                            <td className="px-4 py-2">{new Date(bill.billDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2">{bill.flourMillName}</td>
                            <td className="px-4 py-2 text-right font-semibold text-green-700">Rs. {Number(bill.finalAmountToMill).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                            <td className="px-4 py-2 text-center space-x-2">
                                <button onClick={() => loadBill(bill)} title="Edit" className="p-2 text-gray-500 hover:text-blue-600"><EditIcon /></button>
                                <button onClick={() => handleDelete(bill.id)} title="Delete" className="p-2 text-gray-500 hover:text-red-600"><TrashIcon /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)};

const GrindingReports: React.FC<GrindingReportsProps> = ({ savedBills, flourMills }) => {
    const [filter, setFilter] = useState({millId: 'all', startDate: '', endDate: ''});
    const printRef = useRef<HTMLDivElement>(null);

    const filteredBills = useMemo(() => {
        return savedBills.filter(bill => 
            (filter.millId === 'all' || bill.flourMillId === Number(filter.millId)) &&
            (!filter.startDate || bill.billDate >= filter.startDate) &&
            (!filter.endDate || bill.billDate <= filter.endDate)
        );
    }, [savedBills, filter]);

    const summaryByMill = useMemo(() => {
        const summary = new Map<number, { name: string, totalBills: number, totalAmount: number }>();
        filteredBills.forEach(bill => {
            if (bill.flourMillId != null) {
                if (!summary.has(bill.flourMillId)) {
                    summary.set(bill.flourMillId, { name: bill.flourMillName, totalBills: 0, totalAmount: 0 });
                }
                const current = summary.get(bill.flourMillId)!;
                current.totalBills += 1;
                current.totalAmount += bill.finalAmountToMill;
            }
        });
        return Array.from(summary.values());
    }, [filteredBills]);

    const summaryByDeduction = useMemo(() => {
        const summary: { [key: string]: number } = {};
        filteredBills.forEach(bill => {
            (Object.keys(bill.deductions) as Array<keyof GrindingDeductions>).forEach(key => {
                summary[key] = (summary[key] || 0) + bill.deductions[key];
            });
            bill.customDeductions.forEach(cd => {
                summary[cd.label] = (summary[cd.label] || 0) + cd.value;
            });
        });
        return summary;
    }, [filteredBills]);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Grinding Report</title><script src="https://cdn.tailwindcss.com"></script><style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"); @media print { .no-print { display: none !important; } body { font-family: "Inter", sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }</style></head><body>' + printContent.innerHTML + '</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        }
    };
    
    const tableThClass = "p-2 border-b-2 border-gray-300 bg-gray-100 font-bold text-left text-gray-600 uppercase tracking-wider text-xs";
    const tableTdClass = "p-2 border-b border-gray-200 text-xs";
    const tableTdRightClass = `${tableTdClass} text-right`;

    return (
    <div className="card p-4 md:p-6 animate-fade-in">
        <h2 className="text-lg font-semibold mb-4">Grinding Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border bg-gray-50 rounded-lg">
            <div className="md:col-span-2"><select onChange={e => setFilter(prev => ({...prev, millId: e.target.value}))} className="w-full p-2"><option value="all">All Flour Mills</option>{flourMills.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
            <input type="date" onChange={e => setFilter(prev => ({...prev, startDate: e.target.value}))} className="w-full p-2" />
            <input type="date" onChange={e => setFilter(prev => ({...prev, endDate: e.target.value}))} className="w-full p-2" />
        </div>
        <div className="flex justify-end mb-4">
             <button onClick={handlePrint} className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-md shadow-sm hover:bg-blue-200 no-print"><PrintIcon className="mr-2 h-4 w-4" /> Print Report</button>
        </div>

        {/* Hidden printable version */}
        <div className="hidden">
            <div ref={printRef} className="p-8 font-sans" style={{fontSize: '10px'}}>
                <header className="relative pb-4 border-b-2 border-gray-300">
                    <div className="w-20 mx-auto mb-2"><img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" /></div>
                    <div className="text-center">
                        <h1 className="text-base font-bold">Azad Govt of the State of Jammu & Kashmir</h1>
                        <h2 className="text-sm font-bold">Directorate of Food</h2>
                        <h3 className="text-xs font-bold">D-151 Satellite Town, Rwp</h3>
                    </div>
                </header>
                <div className="my-6">
                    <h2 className="text-xl font-bold mb-2">Grinding Bills Report</h2>
                    <div className="text-sm text-gray-600">
                        <p><span className="font-semibold">Flour Mill:</span> {flourMills.find(f => f.id === Number(filter.millId))?.name || 'All'}</p>
                        <p><span className="font-semibold">Date Range:</span> {filter.startDate || 'N/A'} to {filter.endDate || 'N/A'}</p>
                    </div>
                </div>
                 <div className="space-y-8">
                    <div>
                        <h3 className="text-base font-bold mb-2">Summary by Flour Mill</h3>
                        <table className="w-full">
                            <thead><tr><th className={tableThClass}>Flour Mill</th><th className={`${tableThClass} text-right`}>Total Bills</th><th className={`${tableThClass} text-right`}>Total Final Amount</th></tr></thead>
                            <tbody>{summaryByMill.map(item => (<tr key={item.name} className="even:bg-gray-50"><td className={tableTdClass}>{item.name}</td><td className={tableTdRightClass}>{item.totalBills}</td><td className={tableTdRightClass}>Rs. {Number(item.totalAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>))}</tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="text-base font-bold mb-2">Summary by Deduction Type</h3>
                        <table className="w-full">
                            <thead><tr><th className={tableThClass}>Deduction</th><th className={`${tableThClass} text-right`}>Total Amount</th></tr></thead>
                            <tbody>{Object.entries(summaryByDeduction).map(([key, value]) => (<tr key={key} className="even:bg-gray-50"><td className={tableTdClass}>{key}</td><td className={tableTdRightClass}>Rs. {Number(value).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
                <footer className="mt-8 text-center text-gray-400 text-[9px]"><p>Report generated by FDBMS on {new Date().toLocaleString()}</p></footer>
            </div>
        </div>

        {/* Visible on-screen version */}
        <div className="space-y-8">
             <div>
                <h3 className="text-md font-semibold mb-2">Summary by Flour Mill</h3>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium uppercase">Flour Mill</th><th className="px-4 py-2 text-right text-xs font-medium uppercase">Total Bills</th><th className="px-4 py-2 text-right text-xs font-medium uppercase">Total Final Amount</th></tr></thead>
                        <tbody className="bg-white divide-y">
                            {summaryByMill.map(item => (
                                <tr key={item.name}><td className="px-4 py-2">{item.name}</td><td className="px-4 py-2 text-right">{item.totalBills}</td><td className="px-4 py-2 text-right font-semibold text-green-700">Rs. {Number(item.totalAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <div>
                <h3 className="text-md font-semibold mb-2">Summary by Deduction Type</h3>
                 <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium uppercase">Deduction</th><th className="px-4 py-2 text-right text-xs font-medium uppercase">Total Amount</th></tr></thead>
                        <tbody className="bg-white divide-y">
                            {Object.entries(summaryByDeduction).map(([key, value]) => (
                                <tr key={key}><td className="px-4 py-2">{key}</td><td className="px-4 py-2 text-right font-semibold text-red-600">Rs. {Number(value).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
)};

const GrindingBills: React.FC<GrindingBillsProps> = ({ savedBills, setSavedBills, flourMills, logAction, canCreateAndEdit, isAdmin, setNotification, setGrindingBillForPrinting, setIsForGrindingPrinting, grindingRates, setGrindingRatesManagerOpen, grindingBillSettings, grindingBillingConfig, handleSendToAGOffice }) => {
    
    // UI State
    const [activeTab, setActiveTab] = useState<'entry' | 'list' | 'reports'>('entry');
    const [isGrindingBulkPrinting, setIsForGrindingBulkPrinting] = useState(false);
    const [grindingBillsForPrinting, setGrindingBillsForPrinting] = useState<SavedGrindingBill[]>([]);

    // Form State
    const [activeBill, setActiveBill] = useState<SavedGrindingBill | null>(null);
    const [billNumber, setBillNumber] = useState('');
    const [billDate, setBillDate] = useState('');
    const [billPeriod, setBillPeriod] = useState('');
    const [billPeriodStart, setBillPeriodStart] = useState('');
    const [billPeriodEnd, setBillPeriodEnd] = useState('');
    const [sanctionedNo, setSanctionedNo] = useState('');
    const [sanctionedDate, setSanctionedDate] = useState('');
    const [selectedFlourMillId, setSelectedFlourMillId] = useState<number | null>(null);
    const [commodities, setCommodities] = useState<GrindingBillCommodity[]>(getInitialCommodities(grindingRates));
    const [otherDeductions, setOtherDeductions] = useState<OtherDeductions>(getInitialOtherDeductions(grindingBillingConfig));
    const [customDeductions, setCustomDeductions] = useState([initialCustomDeduction]);
    const [districtForTax, setDistrictForTax] = useState('Rawalpindi');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    
    const resetForm = () => {
        setActiveBill(null);
        const today = new Date().toISOString().split('T')[0];
        setBillNumber(generateNextGrindingBillNumber(savedBills, today));
        setBillDate(today);
        setBillPeriodStart('');
        setBillPeriodEnd('');
        setSanctionedNo('');
        setSanctionedDate('');
        setSelectedFlourMillId(null);
        setCommodities(getInitialCommodities(grindingRates));
        setOtherDeductions(JSON.parse(JSON.stringify(getInitialOtherDeductions(grindingBillingConfig))));
        setCustomDeductions([{ id: uuidv4(), label: 'Other if any', value: 0 }]);
        setDistrictForTax('Rawalpindi');
        setAttachments([]);
        setNotification({ message: "Form cleared for new bill entry.", type: 'success' });
        setActiveTab('entry');
    };

    useEffect(() => {
        resetForm();
    }, []);
    
    useEffect(() => {
        if (!activeBill) {
            setCommodities(getInitialCommodities(grindingRates));
        }
    }, [grindingRates, activeBill]);

    // This will update the rates for a new bill if the global config changes.
    useEffect(() => {
        if (!activeBill) {
            setOtherDeductions(prev => ({
                eBags: { ...prev.eBags, rate: grindingBillingConfig.OTHER_DEDUCTIONS.E_BAGS_RATE },
                branPrice: { ...prev.branPrice, rate: grindingBillingConfig.OTHER_DEDUCTIONS.BRAN_PRICE_RATE }
            }));
        }
    }, [grindingBillingConfig, activeBill]);

    // Auto-update bill number when date changes
    useEffect(() => {
        if (!activeBill) { // Only auto-update for new bills
            setBillNumber(generateNextGrindingBillNumber(savedBills, billDate));
        }
    }, [billDate, savedBills, activeBill]);

    // Auto-fill sanctioned info and tax district on mill selection
    useEffect(() => {
        if (selectedFlourMillId) {
            const mill = flourMills.find(f => f.id === selectedFlourMillId);
            if (mill) {
                setSanctionedNo(mill.sanctionedNo);
                setSanctionedDate(mill.sanctionedDate);
                setDistrictForTax(mill.district);
            }
        } else {
            setSanctionedNo('');
            setSanctionedDate('');
            setDistrictForTax('Rawalpindi');
        }
    }, [selectedFlourMillId, flourMills]);
    
    // Combine period dates into a display string
    useEffect(() => {
        if (billPeriodStart && billPeriodEnd) {
            setBillPeriod(`${new Date(billPeriodStart).toLocaleDateString()} to ${new Date(billPeriodEnd).toLocaleDateString()}`);
        } else {
            setBillPeriod('');
        }
    }, [billPeriodStart, billPeriodEnd]);

    
    // Calculations
    const totalAmount = useMemo(() => commodities.reduce((sum, item) => sum + item.amount, 0), [commodities]);

    const deductions = useMemo<GrindingDeductions>(() => {
        const { DEDUCTIONS } = grindingBillingConfig;
        const incomeTax = totalAmount * DEDUCTIONS.INCOME_TAX_RATE;
        return {
            incomeTax: incomeTax,
            tajveedUlQuran: (totalAmount / 1000) * DEDUCTIONS.TAJVEED_UL_QURAN_RATE,
            educationCess: incomeTax * DEDUCTIONS.EDUCATION_CESS_RATE,
            klc: (totalAmount / 1000) * DEDUCTIONS.KLC_RATE,
            stumpDuty: totalAmount * DEDUCTIONS.STUMP_DUTY_RATE,
        };
    }, [totalAmount, grindingBillingConfig]);
    
    const totalDeduction = useMemo(() => {
        const standardDeductions = Object.values(deductions).reduce((sum, val) => sum + (Number(val) || 0), 0);
        const customDeductionsTotal = customDeductions.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
        return Number(standardDeductions) + Number(customDeductionsTotal);
    }, [deductions, customDeductions]);

    const netAmountAfterTaxes = useMemo(() => totalAmount - totalDeduction, [totalAmount, totalDeduction]);

    const finalCalculations = useMemo(() => {
        const branQuantity = commodities.find(c => c.name === 'Bran')?.quantityKgs || 0;
        const branPriceAmount = branQuantity * (Number(otherDeductions.branPrice.rate) || 0);
        const eBagsAmount = (Number(otherDeductions.eBags.bags) || 0) * (Number(otherDeductions.eBags.rate) || 0);

        // Fix: Explicitly casting the operands to Number to resolve a complex TypeScript type inference issue where one of the operands was being inferred as 'unknown', leading to a compile-time error on the addition operator.
        const amountToDirector = Number(eBagsAmount) + Number(branPriceAmount);
        const finalAmountToMill = netAmountAfterTaxes - amountToDirector;
        const amountInWords = numberToWords(finalAmountToMill);
        
        return { branPriceAmount, eBagsAmount, amountToDirector, finalAmountToMill, amountInWords };
    }, [commodities, otherDeductions, netAmountAfterTaxes]);

    // Update bran quantity for deduction automatically
    useEffect(() => {
        const bran = commodities.find(c => c.name === 'Bran');
        if (bran) {
            setOtherDeductions(prev => ({...prev, branPrice: {...prev.branPrice, quantity: bran.quantityKgs}}));
        }
    }, [commodities]);


    const handleCommodityChange = (id: string, field: 'quantityKgs' | 'ratePer100Kg', value: number) => {
        setCommodities(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                updatedItem.amount = (updatedItem.quantityKgs * updatedItem.ratePer100Kg) / 100;
                return updatedItem;
            }
            return item;
        }));
    };

    const handleOtherDeductionChange = (type: 'eBags', field: 'month' | 'bags' | 'rate', value: string | number) => {
        setOtherDeductions(prev => ({...prev, eBags: {...prev.eBags, [field]: value}}));
    };
    
    const addCustomDeduction = () => setCustomDeductions(prev => [...prev, { id: uuidv4(), label: '', value: 0 }]);
    const removeCustomDeduction = (id: string) => setCustomDeductions(prev => prev.filter(d => d.id !== id));
    const updateCustomDeduction = (id: string, field: 'label' | 'value', value: string | number) => setCustomDeductions(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));

    const getFullBill = (): SavedGrindingBill => {
        const flourMillName = flourMills.find(f => f.id === selectedFlourMillId)?.name || 'N/A';
        return {
            id: activeBill?.id || uuidv4(),
            billNumber, billDate, 
            billPeriod: billPeriodStart && billPeriodEnd ? `${new Date(billPeriodStart).toLocaleDateString()} to ${new Date(billPeriodEnd).toLocaleDateString()}` : '',
            billPeriodStart, billPeriodEnd, districtForTax,
            sanctionedNo, sanctionedDate,
            flourMillId: selectedFlourMillId, flourMillName,
            commodities, totalAmount, deductions, totalDeduction, netAmountAfterTaxes,
            customDeductions: customDeductions,
            otherDeductions: {
                eBags: {...otherDeductions.eBags, amount: finalCalculations.eBagsAmount},
                branPrice: {...otherDeductions.branPrice, amount: finalCalculations.branPriceAmount, quantity: commodities.find(c=>c.name==='Bran')?.quantityKgs || 0}
            },
            amountToDirector: finalCalculations.amountToDirector,
            finalAmountToMill: finalCalculations.finalAmountToMill,
            amountInWords: numberToWords(finalCalculations.finalAmountToMill),
            certificationHeader: grindingBillSettings.certificationHeader,
            certificationHeaderDetails: grindingBillSettings.certificationHeaderDetails,
            status: activeBill?.status || 'Draft',
            agOfficeSentAt: activeBill?.agOfficeSentAt || null,
            agOfficeProcessedAt: activeBill?.agOfficeProcessedAt || null,
            attachments: attachments,
        };
    };

    const loadBill = (bill: SavedGrindingBill) => {
        setActiveBill(bill);
        setBillNumber(bill.billNumber);
        setBillDate(bill.billDate);
        setBillPeriod(bill.billPeriod);

        setBillPeriodStart(bill.billPeriodStart || '');
        setBillPeriodEnd(bill.billPeriodEnd || '');
        setDistrictForTax(bill.districtForTax || 'Rawalpindi');
       
        setSanctionedNo(bill.sanctionedNo);
        setSanctionedDate(bill.sanctionedDate);
        setSelectedFlourMillId(bill.flourMillId);
        setCommodities(bill.commodities);
        setOtherDeductions(bill.otherDeductions);
        setAttachments(bill.attachments || []);
        
        if (bill.customDeductions && bill.customDeductions.length > 0) {
            setCustomDeductions(bill.customDeductions);
        } else {
            setCustomDeductions([initialCustomDeduction]);
        }
        
        setNotification({ message: `Loaded bill #${bill.billNumber}`, type: 'success' });
        setActiveTab('entry');
    };
    
    const handleDelete = (billId: string) => {
        if (window.confirm('Are you sure you want to delete this grinding bill? This action cannot be undone.')) {
            const billToDelete = savedBills.find(b => b.id === billId);
            setSavedBills(prev => prev.filter(b => b.id !== billId));
            logAction('Grinding Bill Deleted', { billNumber: billToDelete?.billNumber });
            setNotification({message: 'Grinding bill deleted.', type: 'success'});
            if (activeBill?.id === billId) {
                resetForm();
            }
        }
    }


    const handleSave = () => {
        if (!selectedFlourMillId) { setNotification({ message: 'Please select a flour mill.', type: 'error' }); return; }
        if (!billNumber) { setNotification({ message: 'Please enter a bill number.', type: 'error' }); return; }

        const billToSave = getFullBill();
        if (activeBill) {
            setSavedBills(prev => prev.map(b => b.id === activeBill.id ? billToSave : b));
            logAction('Grinding Bill Updated', { billNumber: billToSave.billNumber });
            setNotification({ message: 'Grinding bill updated!', type: 'success' });
        } else {
            setSavedBills(prev => [...prev, billToSave]);
            logAction('Grinding Bill Created', { billNumber: billToSave.billNumber });
            setNotification({ message: 'Grinding bill saved!', type: 'success' });
        }
        setActiveBill(billToSave);
    };

    const handlePrint = () => {
        const billToPrint = getFullBill();
        if (!billToPrint.flourMillId) {
             setNotification({message: 'Please select a flour mill before printing.', type: 'error'});
            return;
        }
        setGrindingBillForPrinting(billToPrint);
        setIsForGrindingPrinting(true);
    }
    
    const tabClass = "px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors";
    const activeTabClass = "bg-[var(--color-primary-light)] text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]";
    const inactiveTabClass = "text-gray-500 hover:text-gray-700 hover:bg-gray-100";

    return (
        <div className="space-y-6">
             <div className="flex border-b">
                <button onClick={() => setActiveTab('entry')} className={`${tabClass} ${activeTab === 'entry' ? activeTabClass : inactiveTabClass}`}>Bill Entry</button>
                <button onClick={() => setActiveTab('list')} className={`${tabClass} ${activeTab === 'list' ? activeTabClass : inactiveTabClass}`}>Saved Bills ({savedBills.length})</button>
                <button onClick={() => setActiveTab('reports')} className={`${tabClass} ${activeTab === 'reports' ? activeTabClass : inactiveTabClass}`}>Reports</button>
            </div>
            
            {activeTab === 'entry' && (
                 <div className="animate-fade-in">
                    <header className="mb-6 flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-xl"><ClipboardCheckIcon className="h-6 w-6 text-green-700" /></div>
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--color-text-main)]">{activeBill ? `Editing Bill #${activeBill.billNumber}` : 'New Grinding Bill'}</h2>
                                <p className="text-sm text-[var(--color-text-light)]">Enter the specifics for the grinding charges.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {canCreateAndEdit && (
                                <button
                                    onClick={() => handleSendToAGOffice(activeBill!.id, 'grinding')}
                                    disabled={!activeBill || activeBill.status !== 'Draft'}
                                    className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg shadow-lg hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                                    title={activeBill?.status !== 'Draft' ? `Bill has already been ${activeBill?.status}` : 'Save bill first'}
                                >
                                    <WalletIcon className="h-5 w-5 mr-2" /> Send to AG Office
                                </button>
                            )}
                            {canCreateAndEdit && <button type="button" onClick={resetForm} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200">New Bill</button>}
                            {canCreateAndEdit && <button type="button" onClick={() => setGrindingRatesManagerOpen(true)} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border rounded-md hover:bg-gray-200"><SettingsIcon className="h-4 w-4 mr-2" />Settings</button>}
                            <button type="button" onClick={handlePrint} className="flex items-center px-4 py-2 text-sm font-medium text-[var(--color-text-main)] bg-black/5 border border-[var(--color-border)] rounded-lg shadow-sm hover:bg-black/10 transition-colors"><PrintIcon className="h-4 w-4 mr-2" /> Print</button>
                            {canCreateAndEdit && <button type="button" onClick={handleSave} className="px-6 py-2 text-sm font-semibold text-white bg-green-600 border-none rounded-lg shadow-lg hover:bg-green-700 transition-colors transform hover:scale-105">{activeBill ? 'Update Bill' : 'Save Bill'}</button>}
                        </div>
                    </header>
                    <BillEntryForm {...{ canCreateAndEdit, isAdmin, selectedFlourMillId, setSelectedFlourMillId, flourMills, billNumber, billDate, setBillDate, billPeriodStart, setBillPeriodStart, billPeriodEnd, setBillPeriodEnd, sanctionedNo, sanctionedDate, commodities, handleCommodityChange, totalAmount, districtForTax, setDistrictForTax, deductions, customDeductions, updateCustomDeduction, removeCustomDeduction, addCustomDeduction, totalDeduction, netAmountAfterTaxes, otherDeductions, handleOtherDeductionChange, finalCalculations, grindingBillSettings, attachments, setAttachments }} />
                </div>
            )}

            {activeTab === 'list' && <SavedBillsList {...{ savedBills, flourMills, loadBill, handleDelete, setGrindingBillsForPrinting, setIsForGrindingBulkPrinting }} />}
            {activeTab === 'reports' && <GrindingReports savedBills={savedBills} flourMills={flourMills} />}
        </div>
    );
};

export default GrindingBills;
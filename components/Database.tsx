import React, { useState, useMemo } from 'react';
import { SavedBill, AuthUser } from '../types';
import { LoadIcon, PaperclipIcon, PdfIcon, ShareIcon, TrashIcon, DownloadIcon, PrintIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface DatabaseProps {
    currentUser: AuthUser;
    savedBills: SavedBill[];
    onLoadBill: (bill: SavedBill) => void;
    onDeleteBill: (id: string) => void;
    onBulkDelete: (ids: string[]) => void;
    onPrintBill: (bill: SavedBill) => void;
    onDownloadPdf: (bill: SavedBill) => void;
    onShareBill: (bill: SavedBill) => void;
    onDownloadFilteredPdf: (bills: SavedBill[]) => void;
}

type SortConfig = {
    key: keyof SavedBill;
    direction: 'ascending' | 'descending';
} | null;

const Database: React.FC<DatabaseProps> = ({ currentUser, savedBills, onLoadBill, onDeleteBill, onBulkDelete, onPrintBill, onDownloadPdf, onShareBill, onDownloadFilteredPdf }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContractorId, setSelectedContractorId] = useState('all');
    const [selectedStation, setSelectedStation] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [selectedBillIds, setSelectedBillIds] = useState<Set<string>>(new Set());
    
    // Advanced Filters State
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [billPeriod, setBillPeriod] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    const canManage = currentUser.role === 'Admin' || currentUser.role === 'Manager';

    const uniqueStations = useMemo(() => {
        const stationSet = new Set<string>();
        savedBills.forEach(bill => {
            bill.bill_items.forEach(item => {
                if (item.from) stationSet.add(item.from);
                if (item.to) stationSet.add(item.to);
            });
        });
        return Array.from(stationSet).sort();
    }, [savedBills]);
    
    const uniqueContractors = useMemo(() => {
        const contractorMap = new Map<number, string>();
        savedBills.forEach(bill => {
            if (bill.contractor_id !== null && !contractorMap.has(bill.contractor_id)) {
                contractorMap.set(bill.contractor_id, bill.contractor_name);
            }
        });
        return Array.from(contractorMap, ([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name));
    }, [savedBills]);

    const filteredAndSortedBills = useMemo(() => {
        let filtered = savedBills.filter(bill => {
            const searchMatch = !searchQuery || 
                bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bill.contractor_name.toLowerCase().includes(searchQuery.toLowerCase());
            
            const contractorMatch = selectedContractorId === 'all' || bill.contractor_id === Number(selectedContractorId);
            
            const stationMatch = selectedStation === 'all' || 
                bill.bill_items.some(item => item.from === selectedStation || item.to === selectedStation);

            const dateMatch = (!startDate || bill.bill_date >= startDate) && (!endDate || bill.bill_date <= endDate);
            
            const periodMatch = !billPeriod || (bill.bill_period && bill.bill_period.toLowerCase().includes(billPeriod.toLowerCase()));

            const minAmountNum = parseFloat(minAmount);
            const maxAmountNum = parseFloat(maxAmount);
            const minAmountMatch = !minAmount || isNaN(minAmountNum) || bill.netAmount >= minAmountNum;
            const maxAmountMatch = !maxAmount || isNaN(maxAmountNum) || bill.netAmount <= maxAmountNum;

            return searchMatch && stationMatch && dateMatch && contractorMatch && periodMatch && minAmountMatch && maxAmountMatch;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        } else {
             // Default sort by date descending
            filtered.sort((a, b) => new Date(b.bill_date).getTime() - new Date(a.bill_date).getTime());
        }

        return filtered;
    }, [savedBills, searchQuery, selectedStation, startDate, endDate, sortConfig, selectedContractorId, billPeriod, minAmount, maxAmount]);
    
    const filteredBillIds = useMemo(() => new Set(filteredAndSortedBills.map(b => b.id)), [filteredAndSortedBills]);
    const isAllSelected = filteredBillIds.size > 0 && Array.from(filteredBillIds).every(id => selectedBillIds.has(id));

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedBillIds(prev => new Set([...prev, ...filteredBillIds]));
        } else {
            const newSet = new Set(selectedBillIds);
            filteredBillIds.forEach(id => newSet.delete(id));
            setSelectedBillIds(newSet);
        }
    };

    const handleSelectOne = (billId: string) => {
        setSelectedBillIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(billId)) {
                newSet.delete(billId);
            } else {
                newSet.add(billId);
            }
            return newSet;
        });
    };

    const handleBulkDeleteClick = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedBillIds.size} selected bills? This action cannot be undone.`)) {
            onBulkDelete(Array.from(selectedBillIds));
            setSelectedBillIds(new Set());
        }
    }

    const requestSort = (key: keyof SavedBill) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof SavedBill) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="text-gray-400">↕</span>;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }

    const prepareExportData = () => {
        return filteredAndSortedBills.flatMap(bill =>
            (bill.bill_items.length > 0 ? bill.bill_items : [{}]).map(item => ({ // Ensure at least one row for bills with no items
                'Bill #': bill.bill_number,
                'Bill Date': bill.bill_date,
                'Bill Period': bill.bill_period,
                'Contractor': bill.contractor_name,
                'Sanctioned No': bill.sanctioned_no,
                'From': item?.from,
                'To': item?.to,
                'Mode': item?.mode,
                'Total Bags': item?.bags,
                'PP Bags': item?.ppBags,
                'Jute Bags': item?.juteBags,
                'Net KGs': item?.netKgs,
                'Bardana KGs': item?.bardanaKgs,
                'Gross KGs': item?.grossKgs,
                'Rate/Kg': item?.rate_per_kg,
                'Item Amount (Rs)': item?.rs,
                'Bill Grand Total': bill.grandTotal,
                'Bill Total Deductions': bill.totalDeductions,
                'Bill Net Amount': bill.netAmount,
            }))
        );
    };

    const handleExportCSV = () => {
        if (filteredAndSortedBills.length === 0) {
            alert('No data to export.');
            return;
        }
        const dataForExport = prepareExportData();
        const csv = Papa.unparse(dataForExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Bills_Export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcel = () => {
        if (filteredAndSortedBills.length === 0) {
            alert('No data to export.');
            return;
        }
        const dataForExport = prepareExportData();
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bills');
        XLSX.writeFile(workbook, `Bills_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#469110] focus:border-[#469110] bg-white";

    return (
        <div className="card p-4 md:p-6">
            <p className="text-gray-500 mb-4">{filteredAndSortedBills.length} of {savedBills.length} total bills showing.</p>
            <div className="mb-4 p-4 border bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Search Bills</label>
                        <input type="text" placeholder="Bill # or Contractor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                        <button onClick={() => setShowAdvanced(prev => !prev)} className="flex items-center text-sm font-medium text-[#00520A] hover:text-[#469110]">
                           {showAdvanced ? <ChevronUpIcon className="mr-1 h-5 w-5" /> : <ChevronDownIcon className="mr-1 h-5 w-5" />}
                           Advanced Filters
                        </button>
                    </div>
                </div>
                {showAdvanced && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end animate-fade-in">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Contractor</label>
                            <select value={selectedContractorId} onChange={e => setSelectedContractorId(e.target.value)} className={inputClass}>
                                <option value="all">All Contractors</option>
                                {uniqueContractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Station</label>
                            <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} className={inputClass}>
                                <option value="all">All Stations</option>
                                {uniqueStations.map(station => <option key={station} value={station}>{station}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${inputClass} text-gray-600`} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`${inputClass} text-gray-600`} />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Bill Period</label>
                            <input type="text" placeholder="e.g., October 2025" value={billPeriod} onChange={(e) => setBillPeriod(e.target.value)} className={inputClass} />
                        </div>
                         <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                             <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Min Net Amount</label>
                                <input type="number" placeholder="e.g., 50000" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Max Net Amount</label>
                                <input type="number" placeholder="e.g., 100000" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className={inputClass} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-4 border-t pt-4">
                <span className="text-sm font-medium text-gray-700">Export Filtered Data:</span>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-md shadow-sm hover:bg-green-200"
                >
                    <DownloadIcon className="mr-2 h-5 w-5" /> Export to CSV
                </button>
                <button
                    onClick={handleExportExcel}
                    className="flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-md shadow-sm hover:bg-blue-200"
                >
                    <DownloadIcon className="mr-2 h-5 w-5" /> Export to Excel
                </button>
                <button
                    onClick={() => onDownloadFilteredPdf(filteredAndSortedBills)}
                    className="flex items-center justify-center w-full sm:w-auto px-3 py-2 bg-red-100 text-red-800 text-sm font-semibold rounded-md shadow-sm hover:bg-red-200"
                >
                    <PdfIcon className="mr-2 h-5 w-5" /> Download Filtered PDF
                </button>
            </div>
            
            {selectedBillIds.size > 0 && canManage && (
                <div className="mb-4 flex flex-col sm:flex-row items-center gap-4 bg-[#00520A]/10 p-3 rounded-lg border border-[#00520A]/20">
                    <p className="text-sm font-semibold text-[#00520A] flex-1">{selectedBillIds.size} bill(s) selected.</p>
                    <button
                        onClick={handleBulkDeleteClick}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#660033] border rounded-lg shadow-sm hover:bg-[#520029] w-full sm:w-auto justify-center"
                    >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Delete Selected
                    </button>
                </div>
            )}


            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3">
                                {canManage && <input 
                                    type="checkbox" 
                                    className="h-4 w-4 rounded border-gray-300 text-[#00520A] focus:ring-[#469110]"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    disabled={filteredBillIds.size === 0}
                                    title={isAllSelected ? "Deselect all visible" : "Select all visible"}
                                />}
                            </th>
                            {['bill_number', 'bill_date', 'contractor_name', 'netAmount'].map((key) => (
                                <th key={key} onClick={() => requestSort(key as keyof SavedBill)} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer group">
                                    <div className="flex items-center gap-2">
                                        <span>{key.replace('_', ' ')}</span>
                                        <span className="opacity-50 group-hover:opacity-100">{getSortIndicator(key as keyof SavedBill)}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Attachments</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedBills.length > 0 ? (
                            filteredAndSortedBills.map(bill => (
                                <tr key={bill.id} className={`hover:bg-gray-50 transition-colors ${selectedBillIds.has(bill.id) ? 'bg-[#00520A]/5' : ''}`}>
                                    <td className="px-4 py-3">
                                        {canManage && <input 
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-[#00520A] focus:ring-[#469110]"
                                            checked={selectedBillIds.has(bill.id)}
                                            onChange={() => handleSelectOne(bill.id)}
                                        />}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{bill.bill_number}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(bill.bill_date).toLocaleDateString('en-CA')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{bill.contractor_name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[#00520A] text-right">Rs. {bill.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                        {bill.attachments && bill.attachments.length > 0 && (
                                            <div className="flex justify-center" title={`${bill.attachments.length} attachment(s)`}><PaperclipIcon className="h-6 w-6 text-gray-500" /></div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {canManage && (
                                                <button onClick={() => onLoadBill(bill)} title="Load Bill" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#00520A] transition-colors">
                                                    <LoadIcon />
                                                </button>
                                            )}
                                             <button onClick={() => onPrintBill(bill)} title="Print Bill" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-blue-500 transition-colors">
                                                <PrintIcon />
                                            </button>
                                            <button onClick={() => onDownloadPdf(bill)} title="Download PDF" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-500 transition-colors">
                                                <PdfIcon />
                                            </button>
                                            {canManage && (
                                                <button onClick={() => onShareBill(bill)} title="Share Bill" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-blue-600 transition-colors">
                                                    <ShareIcon />
                                                </button>
                                            )}
                                            {canManage && (
                                                <button onClick={() => onDeleteBill(bill.id)} title="Delete Bill" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#660033] transition-colors">
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-500">No bills found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Database;
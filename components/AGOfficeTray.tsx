import React, { useState, useMemo } from 'react';
import { SavedBill, SavedGrindingBill, UnifiedBill } from '../types';
import { DownloadIcon, PaperclipIcon, BadgeCheckIcon, ClockIcon, ReportIcon } from './Icons';

interface AGOfficeTrayProps {
    transportBills: SavedBill[];
    grindingBills: SavedGrindingBill[];
    onProcessAndDownload: (bills: UnifiedBill[]) => void;
    onGenerateReport: (startDate: string, endDate: string) => void;
}

const AGOfficeTray: React.FC<AGOfficeTrayProps> = ({ transportBills, grindingBills, onProcessAndDownload, onGenerateReport }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');
    const [selectedBillIds, setSelectedBillIds] = useState<Set<string>>(new Set());
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');

    const allBills = useMemo<UnifiedBill[]>(() => {
        const tb: UnifiedBill[] = transportBills.map(b => ({ ...b, billType: 'transportation' }));
        const gb: UnifiedBill[] = grindingBills.map(b => ({ ...b, billType: 'grinding' }));
        return [...tb, ...gb].sort((a, b) => new Date(b.agOfficeSentAt!).getTime() - new Date(a.agOfficeSentAt!).getTime());
    }, [transportBills, grindingBills]);

    const pendingBills = useMemo(() => allBills.filter(b => b.status === 'Sent to AG'), [allBills]);
    const processedBills = useMemo(() => allBills.filter(b => b.status === 'Processed'), [allBills]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedBillIds(new Set(pendingBills.map(b => b.id)));
        } else {
            setSelectedBillIds(new Set());
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

    const handleProcessSelected = async () => {
        if (selectedBillIds.size === 0) return;
        
        const billsToProcess = allBills.filter(b => selectedBillIds.has(b.id));
        onProcessAndDownload(billsToProcess);
        setSelectedBillIds(new Set());
    };

    const tabClass = "px-4 py-2 font-medium text-sm rounded-md transition-colors";
    const activeTabClass = "bg-amber-100 text-amber-800";
    const inactiveTabClass = "text-gray-500 hover:bg-gray-100";

    return (
        <div className="card p-4 md:p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">AG Office Tray</h2>

            <div className="p-4 border bg-gray-50 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Generate Report</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="text-xs font-medium text-gray-500">Start Date</label>
                        <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500">End Date</label>
                        <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="w-full p-2 border rounded-md"/>
                    </div>
                    <button onClick={() => onGenerateReport(reportStartDate, reportEndDate)} className="flex items-center justify-center h-10 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 font-semibold text-sm">
                        <ReportIcon className="h-5 w-5 mr-2" />
                        Generate & Print
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 border-b">
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('pending')} className={`${tabClass} ${activeTab === 'pending' ? activeTabClass : inactiveTabClass}`}>
                        Pending ({pendingBills.length})
                    </button>
                    <button onClick={() => setActiveTab('processed')} className={`${tabClass} ${activeTab === 'processed' ? activeTabClass : inactiveTabClass}`}>
                        Processed ({processedBills.length})
                    </button>
                </div>
                {activeTab === 'pending' && selectedBillIds.size > 0 && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-amber-700">{selectedBillIds.size} selected</span>
                        <button onClick={handleProcessSelected} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 font-semibold">
                            <DownloadIcon className="h-5 w-5 mr-2" />
                            Process Selected
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                        <tr>
                            {activeTab === 'pending' && <th className="px-4 py-2"><input type="checkbox" onChange={handleSelectAll} checked={pendingBills.length > 0 && selectedBillIds.size === pendingBills.length}/></th>}
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Bill #</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Date Sent</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase">Contractor/Mill</th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase">Net Amount</th>
                            <th className="px-4 py-2 text-center text-xs font-medium uppercase">Attachments</th>
                            {activeTab === 'processed' && <th className="px-4 py-2 text-left text-xs font-medium uppercase">Date Processed</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                        {(activeTab === 'pending' ? pendingBills : processedBills).map(bill => (
                            <tr key={bill.id} className={`hover:bg-gray-50 ${selectedBillIds.has(bill.id) ? 'bg-amber-50' : ''}`}>
                                {activeTab === 'pending' && <td className="px-4 py-2"><input type="checkbox" onChange={() => handleSelectOne(bill.id)} checked={selectedBillIds.has(bill.id)}/></td>}
                                <td className="px-4 py-2 font-medium">{bill.billType === 'transportation' ? bill.bill_number : bill.billNumber}</td>
                                <td className="px-4 py-2 text-sm">{bill.agOfficeSentAt ? new Date(bill.agOfficeSentAt).toLocaleString() : 'N/A'}</td>
                                <td className="px-4 py-2 text-sm capitalize">{bill.billType}</td>
                                <td className="px-4 py-2 text-sm">{bill.billType === 'transportation' ? bill.contractor_name : bill.flourMillName}</td>
                                <td className="px-4 py-2 text-right font-semibold text-green-700">Rs. {(bill.billType === 'transportation' ? bill.netAmount : bill.finalAmountToMill).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-4 py-2 text-center">
                                    {bill.attachments && bill.attachments.length > 0 ? (
                                        <div className="flex justify-center" title={`${bill.attachments.length} attachment(s)`}><PaperclipIcon className="h-5 w-5 text-gray-500" /></div>
                                    ) : '-'}
                                </td>
                                {activeTab === 'processed' && <td className="px-4 py-2 text-sm">{bill.agOfficeProcessedAt ? new Date(bill.agOfficeProcessedAt).toLocaleString() : 'N/A'}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 { (activeTab === 'pending' ? pendingBills.length === 0 : processedBills.length === 0) && (
                    <div className="text-center py-16 text-gray-500">
                        {activeTab === 'pending' ? <ClockIcon className="h-12 w-12 mx-auto text-gray-400" /> : <BadgeCheckIcon className="h-12 w-12 mx-auto text-gray-400" />}
                        <p className="mt-2 font-semibold">No {activeTab} bills.</p>
                        <p className="text-sm">This tray is currently empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AGOfficeTray;
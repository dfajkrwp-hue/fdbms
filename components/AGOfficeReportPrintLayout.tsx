import React from 'react';
import { LOGO_URL } from '../constants';
import { UnifiedBill } from '../types';

interface ReportData {
    startDate: string;
    endDate: string;
    sentBills: UnifiedBill[];
    processedBills: UnifiedBill[];
}

interface AGOfficeReportPrintLayoutProps {
    data: ReportData | null;
    printRef: React.RefObject<HTMLDivElement>;
}

const AGOfficeReportPrintLayout: React.FC<AGOfficeReportPrintLayoutProps> = ({ data, printRef }) => {
    if (!data) return null;

    const { startDate, endDate, sentBills, processedBills } = data;

    const renderBillRow = (bill: UnifiedBill, index: number) => {
        const isTransport = bill.billType === 'transportation';
        return (
            <tr key={bill.id} className="border-b">
                <td className="p-1 text-center">{index + 1}</td>
                <td className="p-1">{isTransport ? bill.bill_number : bill.billNumber}</td>
                <td className="p-1">{isTransport ? bill.contractor_name : bill.flourMillName}</td>
                <td className="p-1 text-right font-mono">Rs. {(isTransport ? bill.netAmount : bill.finalAmountToMill).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
        );
    }

    return (
        <div className="absolute top-0 left-[-9999px] -z-10" aria-hidden="true">
            <div ref={printRef} className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
                <div className="p-8 font-sans text-gray-800" style={{ fontSize: '10px' }}>
                    <header className="relative pb-4 border-b-2 border-gray-300">
                        <div className="w-20 mx-auto mb-2">
                            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-base font-bold">Azad Govt of the State of Jammu & Kashmir</h1>
                            <h2 className="text-sm font-bold">Directorate of Food</h2>
                        </div>
                    </header>
                    <div className="text-center my-6">
                        <h2 className="text-lg font-bold underline">AG Office Processing Receipt</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-4 border-b">
                        <div><span className="font-bold">Date Range:</span> {startDate || 'Start'} to {endDate || 'End'}</div>
                        <div className="text-right"><span className="font-bold">Generated On:</span> {new Date().toLocaleString()}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 text-center mb-8">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-3xl font-extrabold text-blue-700">{sentBills.length}</div>
                            <div className="text-sm font-semibold text-blue-600">Total Bills Received</div>
                        </div>
                         <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-3xl font-extrabold text-green-700">{processedBills.length}</div>
                            <div className="text-sm font-semibold text-green-600">Total Bills Processed</div>
                        </div>
                    </div>

                    {processedBills.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-base font-bold mb-2">Processed Bills</h3>
                            <table className="w-full text-xs">
                                <thead className="bg-gray-100 font-bold">
                                    <tr>
                                        <th className="p-1 w-10">S#</th>
                                        <th className="p-1 text-left">Bill #</th>
                                        <th className="p-1 text-left">Contractor/Mill</th>
                                        <th className="p-1 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedBills.map(renderBillRow)}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {sentBills.length > 0 && (
                        <div>
                            <h3 className="text-base font-bold mb-2">Pending Bills (Received but not Processed in this Period)</h3>
                            <table className="w-full text-xs">
                                 <thead className="bg-gray-100 font-bold">
                                    <tr>
                                        <th className="p-1 w-10">S#</th>
                                        <th className="p-1 text-left">Bill #</th>
                                        <th className="p-1 text-left">Contractor/Mill</th>
                                        <th className="p-1 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sentBills.filter(b => b.status !== 'Processed').map(renderBillRow)}
                                </tbody>
                            </table>
                        </div>
                    )}
                     <footer className="mt-32 text-center text-xs">
                        <div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold">Signature</p></div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default AGOfficeReportPrintLayout;

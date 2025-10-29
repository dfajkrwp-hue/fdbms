import React from 'react';
import { SavedBill, CalculatedDeductions } from '../types';
import { BILLING_CONFIG } from '../config';

interface AuditPrintLayoutProps {
    bill: SavedBill | null;
    printRef: React.RefObject<HTMLDivElement>;
}

const DEDUCTION_CONFIG = [
    { key: 'penalty', label: `Penalty for days delay @${BILLING_CONFIG.DEDUCTIONS.PENALTY_PER_DAY}/- per day`},
    { key: 'income_tax', label: `Income Tax @ ${BILLING_CONFIG.DEDUCTIONS.INCOME_TAX_RATE * 100}% (I.T.O)`},
    { key: 'tajveed_ul_quran', label: `Tajveed-ul Quran @ Rs. ${BILLING_CONFIG.DEDUCTIONS.TAJVEED_UL_QURAN_RATE} per 1000/-`},
    { key: 'education_cess', label: `Education Cess @ ${BILLING_CONFIG.DEDUCTIONS.EDUCATION_CESS_RATE * 100}% income Tax`},
    { key: 'klc', label: `K.L.C @ ${BILLING_CONFIG.DEDUCTIONS.KLC_RATE * 100}%`},
    { key: 'sd_current', label: `S.D Current bill @${BILLING_CONFIG.DEDUCTIONS.SD_CURRENT_RATE * 100}%`},
    { key: 'gst_current', label: `GST Current bill @${BILLING_CONFIG.DEDUCTIONS.GST_CURRENT_RATE * 100}%`},
];


const AuditPrintLayout: React.FC<AuditPrintLayoutProps> = ({ bill, printRef }) => {
    if (!bill) return null;

    return (
        <div className="absolute top-0 left-[-9999px] -z-10" aria-hidden="true">
            <div ref={printRef} style={{ width: '210mm', minHeight: '297mm' }} className="bg-white p-8 font-sans text-xs">
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold uppercase">Audit Summary</h1>
                    <p className="font-semibold">Bill #{bill.bill_number} for {bill.contractor_name}</p>
                </div>

                 <table className="w-full text-sm border-collapse">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-3 font-semibold text-gray-700">Grand Total Amount</td>
                            <td className="py-3 text-right font-bold text-lg text-gray-900">Rs. {bill.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                        
                        <tr>
                            <td colSpan={2} className="pt-4 pb-2 font-semibold text-gray-700">Deductions Breakdown:</td>
                        </tr>
                        
                        {DEDUCTION_CONFIG.map(d => (
                             <tr key={d.key}>
                                <td className="pl-4 py-1 text-gray-600">{d.label}</td>
                                <td className="py-1 text-right font-mono text-gray-800">(-) Rs. {(bill.deductions[d.key as keyof CalculatedDeductions] || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                             </tr>
                        ))}
                        
                        {bill.custom_deductions?.map(cd => (
                            <tr key={cd.id}>
                                <td className="pl-4 py-1 text-gray-600">{cd.label}</td>
                                <td className="py-1 text-right font-mono text-gray-800">(-) Rs. {(cd.value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                        ))}

                         <tr className="border-t font-semibold">
                            <td className="py-3 text-red-700">Total Deductions</td>
                            <td className="py-3 text-right font-bold text-lg text-red-700">(-) Rs. {bill.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>

                        <tr className="border-t-2 border-black font-bold text-xl">
                            <td className="py-4 text-indigo-800">Net Amount Payable</td>
                            <td className="py-4 text-right text-indigo-800">Rs. {bill.netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                        
                        <tr>
                            <td colSpan={2} className="pt-4 text-sm">
                                <span className="font-bold">In Words:</span> {bill.amountInWords}
                            </td>
                        </tr>
                    </tbody>
                 </table>
                
                 <footer className="mt-32 flex justify-between text-center text-xs">
                    <div>
                        <p className="pt-2 border-t border-black font-semibold">Prepared By</p>
                    </div>
                    <div>
                        <p className="pt-2 border-t border-black font-semibold">Checked By</p>
                    </div>
                    <div>
                        <p className="pt-2 border-t border-black font-semibold">Approved By</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AuditPrintLayout;
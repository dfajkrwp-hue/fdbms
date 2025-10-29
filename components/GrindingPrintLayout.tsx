import React from 'react';
import { SavedGrindingBill, GrindingBillSettings } from '../types';
import { LOGO_URL } from '../constants';

interface GrindingPrintLayoutProps {
    bill: SavedGrindingBill | null;
    printRef: React.RefObject<HTMLDivElement>;
    settings: GrindingBillSettings;
}

const GrindingPrintLayout: React.FC<GrindingPrintLayoutProps> = ({ bill, printRef, settings }) => {
    if (!bill) return null;

    const DEDUCTION_CONFIG = [
        { key: 'incomeTax', label: `Income Tax @8% (I.T.O ) (${bill.districtForTax})`},
        { key: 'tajveedUlQuran', label: `Tajveed UL Quran @ Rs. 5/1000/-`},
        { key: 'educationCess', label: `(Education Cess @ 10% of I.Tax)`},
        { key: 'klc', label: `K.L.C @ Rs. 1/1000/-`},
        { key: 'stumpDuty', label: `Stump duty for current @ 0.25%`},
    ];

    return (
        <div className="absolute top-0 left-[-9999px] -z-10" aria-hidden="true">
            <div ref={printRef} className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
                 <div className="p-10 font-sans text-gray-800" style={{ fontSize: '10px' }}>
                    
                    {/* Header */}
                    <header className="relative pb-4 border-b-2 border-gray-300">
                         <div className="absolute top-0 right-0">
                            <p className="text-xs font-semibold text-gray-500">Grinding Bill</p>
                        </div>
                        <div className="w-20 mx-auto mb-2">
                             <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-base font-bold">Azad Govt of the State of Jammu & Kashmir</h1>
                            <h2 className="text-sm font-bold">Directorate of Food</h2>
                            <h3 className="text-xs font-bold">D-151 Satellite Town, Rwp</h3>
                        </div>
                    </header>
                    
                    {/* Bill Info */}
                     <section className="grid grid-cols-2 gap-x-8 gap-y-1 mt-6 text-xs">
                        <div><span className="font-bold text-gray-500 w-32 inline-block">Bill No. (P-3):</span> <span className="font-semibold">{bill.billNumber}</span></div>
                        <div><span className="font-bold text-gray-500 w-32 inline-block">Dated:</span> <span className="font-semibold">{new Date(bill.billDate).toLocaleDateString()}</span></div>
                        <div><span className="font-bold text-gray-500 w-32 inline-block">Bill for Period:</span> <span className="font-semibold">{bill.billPeriod}</span></div>
                        <div><span className="font-bold text-gray-500 w-32 inline-block">Demand No:</span> <span className="font-semibold">22</span></div>
                    </section>
                    <section className="mt-4 pt-4 border-t border-gray-100 text-sm">
                        <p><span className="font-bold text-gray-500">In favor of:</span> <span className="font-semibold text-base text-gray-900">{bill.flourMillName}</span></p>
                        <p className="mt-1"><span className="font-bold text-gray-500">Sanctioned No:</span> <span className="font-semibold">{bill.sanctionedNo}</span> <span className="ml-4 font-bold text-gray-500">Dated:</span> <span className="font-semibold">{bill.sanctionedDate}</span></p>
                    </section>


                    {/* Commodities Table */}
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mt-6 mb-2">Commodity Grinding Charges</h2>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-left font-bold text-gray-600 bg-gray-100">
                                <th className="p-2">Commodity</th>
                                <th className="p-2 text-right">Quantity (KGs)</th>
                                <th className="p-2 text-right">Rate @100KG</th>
                                <th className="p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.commodities.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100 even:bg-gray-50">
                                    <td className="p-2 font-semibold">{item.name}</td>
                                    <td className="p-2 text-right">{item.quantityKgs.toLocaleString()}</td>
                                    <td className="p-2 text-right font-mono">{item.ratePer100Kg.toFixed(2)}</td>
                                    <td className="p-2 text-right font-semibold">Rs. {item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-gray-100">
                                <td className="p-2 text-right" colSpan={3}>Total Amount</td>
                                <td className="p-2 text-right">Rs. {bill.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    {/* Deductions & Summary */}
                     <div className="mt-6 grid grid-cols-5 gap-8">
                        <section className="col-span-3">
                            <h3 className="font-bold mb-2 text-gray-600 text-sm uppercase tracking-wider">Tax Deductions</h3>
                             <table className="w-full text-xs">
                                <tbody>
                                    {DEDUCTION_CONFIG.map(d => (
                                        (bill.deductions[d.key as keyof typeof bill.deductions] > 0) &&
                                        <tr key={d.key} className="border-b border-gray-100">
                                            <td className="py-1 text-gray-600 w-full">{d.label}</td>
                                            <td className="py-1 text-gray-800 text-right whitespace-nowrap">Rs. {(bill.deductions[d.key as keyof typeof bill.deductions] as number).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    ))}
                                    {bill.customDeductions.map((cd) => (
                                        cd.value > 0 && 
                                        <tr key={cd.id} className="border-b border-gray-100">
                                            <td className="py-1 text-gray-600">{cd.label}</td>
                                            <td className="py-1 text-right">Rs. {(cd.value).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                        <section className="col-span-2">
                             <div className="space-y-2 text-sm pt-8">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-semibold text-gray-800">Rs. {bill.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Tax Deductions:</span>
                                    <span className="font-semibold text-gray-800">(-) Rs. {bill.totalDeduction.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div className="flex justify-between border-t-2 border-gray-800 pt-2 mt-2">
                                    <span className="font-bold text-sm text-gray-900">Net Amount after Taxes</span>
                                    <span className="font-bold text-sm text-gray-900">Rs. {bill.netAmountAfterTaxes.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        </section>
                    </div>


                    {/* Other Deductions & Final Payment */}
                    <section className="mt-6 border-t pt-4">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Other Deductions & Final Payment</h2>
                        <div className="grid grid-cols-2 gap-8 text-xs mb-4">
                            <div>
                                <h3 className="font-bold mb-2">Less / Excess E-Bags of I/Wheat</h3>
                                <div className="space-y-1 border-t pt-2">
                                    <div className="flex justify-between"><span className="text-gray-600">Month:</span><span>{bill.otherDeductions.eBags.month}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">No. of Bags:</span><span>{bill.otherDeductions.eBags.bags.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Rate per Bag:</span><span>Rs. {bill.otherDeductions.eBags.rate.toLocaleString()}</span></div>
                                    <div className="flex justify-between font-bold border-t pt-1 mt-1"><span className="text-gray-800">Total Amount:</span><span className="text-gray-800">(-) Rs. {bill.otherDeductions.eBags.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                                </div>
                            </div>
                             <div>
                                <h3 className="font-bold mb-2">Bran Price Deduction</h3>
                                <div className="space-y-1 border-t pt-2">
                                    <div className="flex justify-between"><span className="text-gray-600">Quantity (Kg):</span><span>{bill.otherDeductions.branPrice.quantity.toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Rate per Kg:</span><span>Rs. {bill.otherDeductions.branPrice.rate.toLocaleString()}</span></div>
                                    <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span className="text-gray-800">Total Amount:</span><span className="text-gray-800">(-) Rs. {bill.otherDeductions.branPrice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Cheque in Favour of Director Food (AJK):</span>
                                <span className="font-bold text-base text-gray-900">Rs. {bill.amountToDirector.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-base border-t-2 border-b-2 border-gray-800 py-3 my-2">
                                <span className="font-extrabold text-gray-900">Final Amount Payable to Flour Mill</span>
                                <span className="font-extrabold text-gray-900">Rs. {bill.finalAmountToMill.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                        <p className="text-xs mt-2 text-gray-600 text-right font-semibold uppercase">In Words: {bill.amountInWords}</p>
                    </section>
                     
                    <footer className="mt-32">
                        <div className="flex justify-between text-center text-xs">
                            <div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold whitespace-pre-wrap">{settings.signatory1}</p></div>
                            <div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold whitespace-pre-wrap">{settings.signatory2}</p></div>
                        </div>
                        <div className="mt-8 text-xs">
                            <p>{settings.footerNote1}</p>
                            <p>{settings.footerNote2}</p>
                        </div>
                        <p className="text-center text-gray-400 mt-12 text-[9px]">Generated by FDBMS</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default GrindingPrintLayout;
import React from 'react';
import { UnifiedBill, BillingSettings, GrindingBillSettings, SavedBill, CalculatedDeductions, SavedGrindingBill } from '../types';
import { LOGO_URL } from '../constants';

interface CombinedPrintLayoutProps {
    bill: UnifiedBill | null;
    printRef: React.RefObject<HTMLDivElement>;
    transportationSettings: BillingSettings;
    grindingPrintSettings: GrindingBillSettings;
}

const CombinedPrintLayout: React.FC<CombinedPrintLayoutProps> = ({ bill, printRef, transportationSettings, grindingPrintSettings }) => {
    if (!bill) return null;

    const renderAttachments = () => (
        <>
            {bill.attachments?.map(att => (
                <div key={att.id} style={{ pageBreakBefore: 'always' }}>
                    <div className="p-8 font-sans text-gray-800 text-sm">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Attachment: {att.name}</h2>
                        {att.type.startsWith('image/') ? (
                            <img src={att.dataUrl} alt={att.name} style={{ maxWidth: '100%', maxHeight: '90vh', margin: '0 auto', display: 'block' }} />
                        ) : (
                            <div className="p-8 bg-gray-100 rounded-lg text-center">
                                <h3 className="text-xl font-semibold text-gray-700">Cannot Display Attachment</h3>
                                <p className="mt-2 text-gray-500">Preview for file type '{att.type}' is not available for printing.</p>
                                <p className="mt-1 text-sm text-gray-500">The file '{att.name}' will need to be handled separately.</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </>
    );

    return (
        <div className="absolute top-0 left-[-9999px] -z-10" aria-hidden="true">
            <div ref={printRef}>
                {bill.billType === 'transportation' 
                    ? <TransportationBillInner bill={bill} settings={transportationSettings} />
                    : <GrindingBillInner bill={bill} settings={grindingPrintSettings} />
                }
                {renderAttachments()}
            </div>
        </div>
    );
};

// --- Inner Component for Transportation Bill ---
const TransportationBillInner: React.FC<{ bill: SavedBill, settings: BillingSettings }> = ({ bill, settings }) => {
    const DEDUCTION_CONFIG = [
        { key: 'penalty', label: `Penalty for days delay @ Rs. ${settings.DEDUCTIONS.PENALTY_PER_DAY}/- per day`},
        { key: 'income_tax', label: `Income Tax @ ${settings.DEDUCTIONS.INCOME_TAX_RATE * 100}% (I.T.O)`},
        { key: 'tajveed_ul_quran', label: `Tajveed-ul Quran @ Rs. ${settings.DEDUCTIONS.TAJVEED_UL_QURAN_RATE} per 1000/-`},
        { key: 'education_cess', label: `Education Cess @ ${settings.DEDUCTIONS.EDUCATION_CESS_RATE * 100}% income Tax`},
        { key: 'klc', label: `K.L.C @ ${settings.DEDUCTIONS.KLC_RATE * 100}%`},
        { key: 'sd_current', label: `S.D Current bill @${settings.DEDUCTIONS.SD_CURRENT_RATE * 100}%`},
        { key: 'gst_current', label: `GST Current bill @${settings.DEDUCTIONS.GST_CURRENT_RATE * 100}%`},
    ];

    const defaultCertPoints = [
        { id: '1', text: 'The amount claimed in the bill is claimed for the first time.' },
        { id: '2', text: 'The Amount of this bill was not claimed previously' },
        { id: '3', text: 'The above mentioned Qty has actually been lifted by the Contractor.' },
        { id: '4', text: 'Verified statements are attached' },
        { id: '5', text: 'The bill prepared is correct.' },
        { id: '6', text: 'The bill prepared have been claimed in accordance with the sanctioned rates.' },
        { id: '7', text: 'The amount of shortage has been recovered from the bill in full from contractor (if any).' },
        { id: '8', text: 'If any deduction in the taxes imposed by this bill is required, the Department should be informed accordingly' },
    ];
    const certPointsToRender = bill.certification_points && bill.certification_points.length > 0 ? bill.certification_points : defaultCertPoints;

    return (
        <div className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
             <div className="p-10 font-sans text-gray-800" style={{ fontSize: '10px' }}>
                <header className="relative pb-4 border-b-2 border-gray-300">
                     <div className="absolute top-0 right-0"><p className="text-xs font-semibold text-gray-500">Transportation Bill</p></div>
                    <div className="w-20 mx-auto mb-2"><img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" /></div>
                    <div className="text-center">
                        <h1 className="text-base font-bold">Azad Govt of the State of Jammu & Kashmir</h1><h2 className="text-sm font-bold">Directorate of Food</h2><h3 className="text-xs font-bold">D-151 Satellite Town, Rwp</h3>
                    </div>
                </header>
                <section className="grid grid-cols-3 gap-6 mt-6 text-xs">
                    <div className="col-span-2">
                        <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Bill To</p>
                        <p className="font-semibold text-base text-gray-900">{bill.contractor_name}</p>
                        <p className="text-gray-600 mt-1">Sanctioned No: {bill.sanctioned_no || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-x-2">
                            <p className="text-gray-500 font-bold">BILL #</p><p className="font-semibold text-gray-800">{bill.bill_number}</p>
                            <p className="text-gray-500 font-bold">BILL DATE</p><p className="font-semibold text-gray-800">{new Date(bill.bill_date).toLocaleDateString()}</p>
                            <p className="text-gray-500 font-bold">BILL PERIOD</p><p className="font-semibold text-gray-800">{bill.bill_period || 'N/A'}</p>
                        </div>
                    </div>
                </section>
                <section className="mt-6">
                    <table className="w-full text-xs">
                        <thead><tr className="text-left font-bold text-gray-600 bg-gray-100"><th className="p-2 w-10">S#</th><th className="p-2">From</th><th className="p-2">To</th><th className="p-2 text-right">Bags</th><th className="p-2 text-right">Net KGs</th><th className="p-2 text-right">Rate/Kg</th><th className="p-2 text-right">Amount</th></tr></thead>
                        <tbody>{bill.bill_items.map((item, index) => (<tr key={item.id} className="border-b border-gray-100 even:bg-gray-50"><td className="p-2 text-center font-medium text-gray-500">{index + 1}</td><td className="p-2">{item.from}</td><td className="p-2">{item.to}</td><td className="p-2 text-right">{item.bags}</td><td className="p-2 text-right">{item.netKgs.toLocaleString(undefined, {minimumFractionDigits: 2})}</td><td className="p-2 text-right font-mono">{item.rate_per_kg.toFixed(4)}</td><td className="p-2 text-right font-semibold">Rs. {item.rs.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>))}</tbody>
                    </table>
                </section>
                <div className="mt-6 grid grid-cols-5 gap-8">
                    <section className="col-span-3">
                        <h3 className="font-bold mb-2 text-gray-600 text-sm uppercase tracking-wider">Deductions</h3>
                        <table className="w-full text-xs">
                            <tbody>
                                {DEDUCTION_CONFIG.map((d) => (Number(bill.deductions[d.key as keyof CalculatedDeductions] || 0) > 0 && <tr key={d.key} className="border-b border-gray-100"><td className="py-1 text-gray-600 w-full">{d.label}</td><td className="py-1 text-gray-800 text-right whitespace-nowrap">Rs. {(bill.deductions[d.key as keyof CalculatedDeductions] as number).toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>))}
                                {(bill.custom_deductions?.length > 0 && bill.custom_deductions[0]?.value > 0 ? bill.custom_deductions : [{label: bill.deductions.others_description, value: bill.deductions.others, id: '1'}]).map((cd) => (cd.value > 0 && <tr key={cd.id} className="border-b border-gray-100"><td className="py-1 text-gray-600">{cd.label}</td><td className="py-1 text-gray-800 text-right">Rs. {(cd.value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>))}
                            </tbody>
                        </table>
                    </section>
                    <section className="col-span-2"><div className="space-y-2 text-sm pt-8"><div className="flex justify-between"><span className="text-gray-600">Grand Total:</span><span className="font-semibold text-gray-800">Rs. {bill.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div><div className="flex justify-between"><span className="text-gray-600">Total Deductions:</span><span className="font-semibold text-gray-800">(-) Rs. {bill.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div><div className="flex justify-between border-t-2 border-gray-800 pt-2 mt-2"><span className="font-bold text-base text-gray-900">Net Amount Payable</span><span className="font-bold text-base text-gray-900">Rs. {bill.netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div></div></section>
                </div>
                <p className="text-xs mt-4 text-gray-600 font-semibold uppercase"><span className="font-bold">In Words:</span> {bill.amountInWords}</p>
                <section className="mt-8 border-t border-gray-200 pt-4">
                    <h3 className="font-bold text-gray-600 mb-2 text-sm uppercase tracking-wider">Certification</h3>
                    <ol className="list-decimal list-outside pl-5 space-y-1 text-gray-600 text-xs">{certPointsToRender.map(point => <li key={point.id}>{point.text}</li>)}</ol>
                    <p className="mt-4 text-gray-600 text-xs">Countersigned and forwarded to the Accounts Officer AJK Council Secretariate Accounts Office Islamabad for pre-audit and payments please. The Cheque may be issued in favour of Contractor and delivered to the authorized official of this Directorate.</p>
                </section>
                <footer className="mt-32"><div className="flex justify-between text-center text-xs"><div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold">Accounts Officer Food</p><p className="font-normal text-gray-500">(AJK) Rawalpindi</p></div><div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold">Assistant Director Food(DDO)</p><p className="font-normal text-gray-500">(AJK) Rawalpindi</p></div></div><p className="text-center text-gray-400 mt-12 text-[9px]">Generated by FDBMS</p></footer>
            </div>
        </div>
    );
};

// --- Inner Component for Grinding Bill ---
const GrindingBillInner: React.FC<{ bill: SavedGrindingBill, settings: GrindingBillSettings }> = ({ bill, settings }) => {
     const DEDUCTION_CONFIG = [
        { key: 'incomeTax', label: `Income Tax @8% (I.T.O ) (${bill.districtForTax})`},
        { key: 'tajveedUlQuran', label: `Tajveed UL Quran @ Rs. 5/1000/-`},
        { key: 'educationCess', label: `(Education Cess @ 10% of I.Tax)`},
        { key: 'klc', label: `K.L.C @ Rs. 1/1000/-`},
        { key: 'stumpDuty', label: `Stump duty for current @ 0.25%`},
    ];

    return (
        <div className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
             <div className="p-10 font-sans text-gray-800" style={{ fontSize: '10px' }}>
                <header className="relative pb-4 border-b-2 border-gray-300">
                    <div className="absolute top-0 right-0"><p className="text-xs font-semibold text-gray-500">Grinding Bill</p></div>
                    <div className="w-20 mx-auto mb-2"><img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" /></div>
                    <div className="text-center"><h1 className="text-base font-bold">Azad Govt of the State of Jammu & Kashmir</h1><h2 className="text-sm font-bold">Directorate of Food</h2><h3 className="text-xs font-bold">D-151 Satellite Town, Rwp</h3></div>
                </header>
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
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mt-6 mb-2">Commodity Grinding Charges</h2>
                <table className="w-full text-xs">
                    <thead><tr className="text-left font-bold text-gray-600 bg-gray-100"><th className="p-2">Commodity</th><th className="p-2 text-right">Quantity (KGs)</th><th className="p-2 text-right">Rate @100KG</th><th className="p-2 text-right">Amount</th></tr></thead>
                    <tbody>{bill.commodities.map((item) => (<tr key={item.id} className="border-b border-gray-100 even:bg-gray-50"><td className="p-2 font-semibold">{item.name}</td><td className="p-2 text-right">{item.quantityKgs.toLocaleString()}</td><td className="p-2 text-right font-mono">{item.ratePer100Kg.toFixed(2)}</td><td className="p-2 text-right font-semibold">Rs. {item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>))}</tbody>
                    <tfoot><tr className="font-bold bg-gray-100"><td className="p-2 text-right" colSpan={3}>Total Amount</td><td className="p-2 text-right">Rs. {bill.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr></tfoot>
                </table>
                <div className="mt-6 grid grid-cols-5 gap-8">
                    <section className="col-span-3">
                        <h3 className="font-bold mb-2 text-gray-600 text-sm uppercase tracking-wider">Tax Deductions</h3>
                        <table className="w-full text-xs">
                            <tbody>
                                {DEDUCTION_CONFIG.map(d => ((bill.deductions[d.key as keyof typeof bill.deductions] > 0) && <tr key={d.key} className="border-b border-gray-100"><td className="py-1 text-gray-600 w-full">{d.label}</td><td className="py-1 text-gray-800 text-right whitespace-nowrap">Rs. {(bill.deductions[d.key as keyof typeof bill.deductions] as number).toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>))}
                                {bill.customDeductions.map((cd) => (cd.value > 0 && <tr key={cd.id} className="border-b border-gray-100"><td className="py-1 text-gray-600">{cd.label}</td><td className="py-1 text-right">Rs. {(cd.value).toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>))}
                            </tbody>
                        </table>
                    </section>
                    <section className="col-span-2"><div className="space-y-2 text-sm pt-8"><div className="flex justify-between"><span className="text-gray-600">Total Amount:</span><span className="font-semibold text-gray-800">Rs. {bill.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div><div className="flex justify-between"><span className="text-gray-600">Total Tax Deductions:</span><span className="font-semibold text-gray-800">(-) Rs. {bill.totalDeduction.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div><div className="flex justify-between border-t-2 border-gray-800 pt-2 mt-2"><span className="font-bold text-sm text-gray-900">Net Amount after Taxes</span><span className="font-bold text-sm text-gray-900">Rs. {bill.netAmountAfterTaxes.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div></div></section>
                </div>
                <section className="mt-6 border-t pt-4">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Other Deductions & Final Payment</h2>
                    <div className="grid grid-cols-2 gap-8 text-xs mb-4">
                        <div>
                            <h3 className="font-bold mb-2">Less / Excess E-Bags of I/Wheat</h3>
                            <div className="space-y-1 border-t pt-2"><div className="flex justify-between"><span className="text-gray-600">Month:</span><span>{bill.otherDeductions.eBags.month}</span></div><div className="flex justify-between"><span className="text-gray-600">No. of Bags:</span><span>{bill.otherDeductions.eBags.bags.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-gray-600">Rate per Bag:</span><span>Rs. {bill.otherDeductions.eBags.rate.toLocaleString()}</span></div><div className="flex justify-between font-bold border-t pt-1 mt-1"><span className="text-gray-800">Total Amount:</span><span className="text-gray-800">(-) Rs. {bill.otherDeductions.eBags.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div></div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">Bran Price Deduction</h3>
                            <div className="space-y-1 border-t pt-2"><div className="flex justify-between"><span className="text-gray-600">Quantity (Kg):</span><span>{bill.otherDeductions.branPrice.quantity.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-gray-600">Rate per Kg:</span><span>Rs. {bill.otherDeductions.branPrice.rate.toLocaleString()}</span></div><div className="flex justify-between font-bold mt-2 pt-2 border-t"><span className="text-gray-800">Total Amount:</span><span className="text-gray-800">(-) Rs. {bill.otherDeductions.branPrice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div></div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t space-y-4 text-sm"><div className="flex justify-between items-center"><span className="font-semibold text-gray-700">Cheque in Favour of Director Food (AJK):</span><span className="font-bold text-base text-gray-900">Rs. {bill.amountToDirector.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div><div className="flex justify-between items-center text-base border-t-2 border-b-2 border-gray-800 py-3 my-2"><span className="font-extrabold text-gray-900">Final Amount Payable to Flour Mill</span><span className="font-extrabold text-gray-900">Rs. {bill.finalAmountToMill.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div></div>
                    <p className="text-xs mt-2 text-gray-600 text-right font-semibold uppercase">In Words: {bill.amountInWords}</p>
                </section>
                <footer className="mt-32">
                    <div className="flex justify-between text-center text-xs"><div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold whitespace-pre-wrap">{settings.signatory1}</p></div><div className="w-1/3"><p className="pt-2 border-t border-gray-400 font-semibold whitespace-pre-wrap">{settings.signatory2}</p></div></div>
                    <div className="mt-8 text-xs"><p>{settings.footerNote1}</p><p>{settings.footerNote2}</p></div>
                    <p className="text-center text-gray-400 mt-12 text-[9px]">Generated by FDBMS</p>
                </footer>
            </div>
        </div>
    );
};

export default CombinedPrintLayout;

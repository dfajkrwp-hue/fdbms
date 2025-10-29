import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SavedBill, Contractor, CalculatedDeductions, Contract, AuditLog, AuthUser } from '../types';
import { ChevronDownIcon, ChevronRightIcon, PrintIcon, DownloadIcon, CurrencyRupeeIcon } from './Icons';
import * as Papa from 'papaparse';
import { LOGO_URL } from '../constants';

interface ReportsProps {
  savedBills: SavedBill[];
  contractors: Contractor[];
  contracts: Contract[];
  auditLogs: AuditLog[];
  currentUser: AuthUser;
}

type ReportTab = 'details' | 'contractor' | 'contract' | 'monthly' | 'statement' | 'station' | 'deductions' | 'audit' | 'taxSummary';

interface StatementData {
  contractorName: string;
  period: { start: string; end: string };
  bills: SavedBill[];
  summary: {
    grandTotal: number;
    netAmount: number;
    totalDeductions: number;
    deductions: CalculatedDeductions;
  }
}

const Reports: React.FC<ReportsProps> = ({ savedBills, contractors, contracts, auditLogs, currentUser }) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('details');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Filters
  const [selectedContractorId, setSelectedContractorId] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  
  // Statement State
  const [statementData, setStatementData] = useState<StatementData | null>(null);
  const reportPrintRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const isAdmin = currentUser.role === 'Admin';

  const routesForFilter = useMemo(() => {
    const routeSet = new Set<string>();
    const relevantContracts = selectedContractorId === 'all'
      ? contracts
      : contracts.filter(c => c.contractor_id === Number(selectedContractorId));
      
    relevantContracts.forEach(c => {
      routeSet.add(`${c.from_location} -> ${c.to_location}`);
    });
    return Array.from(routeSet).sort();
  }, [contracts, selectedContractorId]);

  useEffect(() => {
    if (!routesForFilter.includes(selectedRoute)) {
      setSelectedRoute('all');
    }
  }, [routesForFilter, selectedRoute]);

  const filteredBills = useMemo(() => {
    return savedBills
      .filter(bill => {
        const contractorMatch = selectedContractorId === 'all' || bill.contractor_id === Number(selectedContractorId);
        const searchMatch = !searchQuery || bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase());
        const dateMatch = (!startDate || bill.bill_date >= startDate) && (!endDate || bill.bill_date <= endDate);
        const routeMatch = selectedRoute === 'all' || bill.bill_items.some(item => {
            if (selectedRoute === 'all') return true;
            const contract = contracts.find(c => c.contract_id === item.contract_id);
            if (!contract) return false;
            const routeStr = `${contract.from_location} -> ${contract.to_location}`;
            return routeStr === selectedRoute;
        });
        return contractorMatch && searchMatch && dateMatch && routeMatch;
      })
      .sort((a, b) => new Date(b.bill_date).getTime() - new Date(a.bill_date).getTime());
  }, [savedBills, contracts, selectedContractorId, searchQuery, startDate, endDate, selectedRoute]);
  
  const filteredAuditLogs = useMemo(() => {
    return auditLogs
      .filter(log => {
        const actionMatch = auditActionFilter === 'all' || log.action === auditActionFilter;
        const searchMatch = !searchQuery || log.username.toLowerCase().includes(searchQuery.toLowerCase()) || log.action.toLowerCase().includes(searchQuery.toLowerCase());
        const dateMatch = (!startDate || log.timestamp >= startDate) && (!endDate || new Date(log.timestamp) <= new Date(endDate + 'T23:59:59.999Z'));
        return actionMatch && searchMatch && dateMatch;
      });
  }, [auditLogs, auditActionFilter, searchQuery, startDate, endDate]);

  const uniqueAuditActions = useMemo(() => [...new Set(auditLogs.map(log => log.action))].sort(), [auditLogs]);
  
  const summary = useMemo(() => {
    return filteredBills.reduce((acc, bill) => {
      acc.totalAmount += bill.grandTotal;
      acc.totalDeductions += bill.totalDeductions;
      acc.netAmount += bill.netAmount;
      return acc;
    }, { totalAmount: 0, totalDeductions: 0, netAmount: 0 });
  }, [filteredBills]);

  const contractorSummary = useMemo(() => {
      const summaryMap = new Map<number, { name: string; totalBills: number; grandTotal: number; totalDeductions: number; netAmount: number }>();
      filteredBills.forEach(bill => {
          if (!bill.contractor_id) return;
          if (!summaryMap.has(bill.contractor_id)) {
              summaryMap.set(bill.contractor_id, { name: bill.contractor_name, totalBills: 0, grandTotal: 0, totalDeductions: 0, netAmount: 0 });
          }
          const current = summaryMap.get(bill.contractor_id)!;
          current.totalBills += 1;
          current.grandTotal += bill.grandTotal;
          current.totalDeductions += bill.totalDeductions;
          current.netAmount += bill.netAmount;
      });
      return Array.from(summaryMap.values()).sort((a,b) => b.netAmount - a.netAmount);
  }, [filteredBills]);

  const contractSummary = useMemo(() => {
    const summaryMap = new Map<number, {
        contract: Contract;
        totalTrips: number;
        totalNetKgs: number;
        totalAmount: number;
        billIds: Set<string>;
    }>();

    filteredBills.forEach(bill => {
        bill.bill_items.forEach(item => {
            if (item.contract_id) {
                const contract = contracts.find(c => c.contract_id === item.contract_id);
                if (contract) {
                    if (!summaryMap.has(contract.contract_id)) {
                        summaryMap.set(contract.contract_id, {
                            contract,
                            totalTrips: 0,
                            totalNetKgs: 0,
                            totalAmount: 0,
                            billIds: new Set<string>(),
                        });
                    }
                    const current = summaryMap.get(contract.contract_id)!;
                    current.totalTrips += 1;
                    current.totalNetKgs += item.netKgs;
                    current.totalAmount += item.rs;
                    current.billIds.add(bill.id);
                }
            }
        });
    });

    return Array.from(summaryMap.values()).sort((a,b) => b.totalAmount - a.totalAmount);
  }, [filteredBills, contracts]);


  const monthlySummary = useMemo(() => {
    const summaryMap = new Map<string, { month: string; totalBills: number; grandTotal: number; totalDeductions: number; netAmount: number }>();
    filteredBills.forEach(bill => {
        const month = bill.bill_date.substring(0, 7); // YYYY-MM
        if (!summaryMap.has(month)) {
            summaryMap.set(month, { month, totalBills: 0, grandTotal: 0, totalDeductions: 0, netAmount: 0 });
        }
        const current = summaryMap.get(month)!;
        current.totalBills += 1;
        current.grandTotal += bill.grandTotal;
        current.totalDeductions += bill.totalDeductions;
        current.netAmount += bill.netAmount;
    });
    return Array.from(summaryMap.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [filteredBills]);

  const stationSummary = useMemo(() => {
    const stationMap = new Map<string, { name: string; dispatchedTrips: number; dispatchedKgs: number; dispatchedValue: number; receivedTrips: number; receivedKgs: number; billIds: Set<string>; }>();
    
    const getStation = (name: string) => {
        if (!stationMap.has(name)) {
            stationMap.set(name, { name, dispatchedTrips: 0, dispatchedKgs: 0, dispatchedValue: 0, receivedTrips: 0, receivedKgs: 0, billIds: new Set() });
        }
        return stationMap.get(name)!;
    };

    filteredBills.forEach(bill => {
      bill.bill_items.forEach(item => {
          const fromStation = getStation(item.from);
          fromStation.dispatchedTrips += 1;
          fromStation.dispatchedKgs += item.netKgs;
          fromStation.dispatchedValue += item.rs;
          fromStation.billIds.add(bill.id);

          const toStation = getStation(item.to);
          toStation.receivedTrips += 1;
          toStation.receivedKgs += item.netKgs;
          toStation.billIds.add(bill.id);
      });
    });

    return Array.from(stationMap.values()).sort((a,b) => b.dispatchedValue - a.dispatchedValue);
  }, [filteredBills]);

  const deductionsSummary = useMemo(() => {
    const summary: { [key in keyof CalculatedDeductions]?: number } & { total: number } = { total: 0 };
    filteredBills.forEach(bill => {
        for (const key of Object.keys(bill.deductions) as (keyof CalculatedDeductions)[]) {
            if (key !== 'others_description') {
                const value = bill.deductions[key] || 0;
                summary[key] = (summary[key] || 0) + (value as number);
            }
        }
        summary.total += bill.totalDeductions;
    });
    return summary;
  }, [filteredBills]);
  
  const handleGenerateStatement = () => {
      if (selectedContractorId === 'all') { alert("Please select a specific contractor to generate a statement."); return; }
      const contractor = contractors.find(c => c.id === Number(selectedContractorId));
      if (!contractor) return;
      const billsForStatement = filteredBills.filter(b => b.contractor_id === Number(selectedContractorId));
      const summary = billsForStatement.reduce((acc, bill) => {
          acc.grandTotal += bill.grandTotal; acc.netAmount += bill.netAmount; acc.totalDeductions += bill.totalDeductions;
          for (const key of Object.keys(bill.deductions) as (keyof CalculatedDeductions)[]) {
              if (key !== 'others_description' && typeof bill.deductions[key] === 'number') {
                (acc.deductions as any)[key] = (Number((acc.deductions as any)[key]) || 0) + (bill.deductions[key] as number);
              }
          }
          return acc;
      }, { grandTotal: 0, netAmount: 0, totalDeductions: 0, deductions: {} as CalculatedDeductions });
      setStatementData({ contractorName: contractor.name, period: { start: startDate, end: endDate }, bills: billsForStatement, summary });
      setActiveTab('statement');
  }

  const handleExportCSV = () => {
    if (filteredBills.length === 0) { alert('No data to export.'); return; }
    const flattenedData = filteredBills.flatMap(bill => bill.bill_items.map(item => ({ 'Bill #': bill.bill_number, 'Bill Date': bill.bill_date, 'Contractor': bill.contractor_name, 'Sanctioned No': bill.sanctioned_no, 'From': item.from, 'To': item.to, 'Mode': item.mode, 'Total Bags': item.bags, 'PP Bags': item.ppBags, 'Jute Bags': item.juteBags, 'Net KGs': item.netKgs.toFixed(2), 'Bardana KGs': item.bardanaKgs.toFixed(3), 'Gross KGs': item.grossKgs.toFixed(2), 'Rate/Kg': item.rate_per_kg.toFixed(4), 'Amount (Rs)': item.rs.toFixed(2), 'Bill Grand Total': bill.grandTotal.toFixed(2), 'Bill Total Deductions': bill.totalDeductions.toFixed(2), 'Bill Net Amount': bill.netAmount.toFixed(2) })));
    const csv = Papa.unparse(flattenedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bills-Report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  const handlePrintReport = () => {
    if (activeTab !== 'audit' && filteredBills.length === 0) {
        alert("No data available to print for the selected filters.");
        return;
    }
    if (activeTab === 'audit' && filteredAuditLogs.length === 0) {
        alert("No audit logs available to print for the selected filters.");
        return;
    }
    setIsPrinting(true);
  };

  useEffect(() => {
    if (isPrinting) {
        const printContent = reportPrintRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>FDBMS Report</title><script src="https://cdn.tailwindcss.com"></script><style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"); @media print { .no-print { display: none !important; } body { font-family: "Inter", sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .page-break-before { page-break-before: always; } }</style></head><body>' + printContent.innerHTML + '</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        }
        setIsPrinting(false);
    }
  }, [isPrinting]);
  
  const toggleRow = (id: string) => setExpandedRowId(expandedRowId === id ? null : id);

  const renderFilters = () => {
      if (activeTab === 'audit') {
          return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label><select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"><option value="all">All Actions</option>{uniqueAuditActions.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                <div className="lg:col-span-1"><label className="block text-sm font-medium text-gray-700 mb-1">Search User/Action</label><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g., admin or Bill Created" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
            </div>
          )
      }
      return (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="md:col-span-2 xl:col-span-1"><label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label><select value={selectedContractorId} onChange={(e) => setSelectedContractorId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"><option value="all">All Contractors</option>{contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="md:col-span-2 xl:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Route</label><select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"><option value="all">All Routes</option>{routesForFilter.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
            <div className="xl:col-span-3"><label className="block text-sm font-medium text-gray-700 mb-1">Search Bill #</label><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g., M-1/10/123" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
            <div className="flex items-end xl:col-span-3"><button onClick={handleGenerateStatement} disabled={selectedContractorId === 'all'} className="w-full px-3 py-2 bg-[#469110] text-white font-semibold rounded-md shadow-sm hover:bg-[#00520A] disabled:bg-gray-400 disabled:cursor-not-allowed">Generate Contractor Statement</button></div>
          </div>
      )
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 md:p-8">
        {renderFilters()}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
            <span className="text-sm font-medium text-gray-700">Export Options:</span>
            <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-md shadow-sm hover:bg-green-200"><DownloadIcon className="mr-2 h-5 w-5" /> Export to CSV</button>
            <button onClick={handlePrintReport} className="flex items-center px-3 py-2 bg-red-100 text-red-800 text-sm font-semibold rounded-md shadow-sm hover:bg-red-200"><PrintIcon className="mr-2 h-5 w-5" /> Print Report</button>
        </div>
        <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <button onClick={() => setActiveTab('details')} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Bill Details</button>
            <button onClick={() => setActiveTab('contractor')} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'contractor' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Contractor Summary</button>
            <button onClick={() => setActiveTab('contract')} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'contract' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Contract Summary</button>
            <button onClick={() => setActiveTab('station')} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'station' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Station Summary</button>
            <button onClick={() => setActiveTab('monthly')} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'monthly' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Monthly Summary</button>
            <button onClick={() => setActiveTab('deductions')} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'deductions' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Deductions Report</button>
            <button onClick={() => setActiveTab('taxSummary')} disabled={selectedContractorId === 'all'} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm disabled:text-gray-300 disabled:hover:border-transparent ${activeTab === 'taxSummary' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tax Summary</button>
            {isAdmin && <button onClick={() => setActiveTab('audit')} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'audit' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Audit Log</button>}
            {statementData && <button onClick={() => setActiveTab('statement')} className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'statement' ? 'border-[#00520A] text-[#00520A]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Contractor Statement</button>}
        </nav>
        </div>
        <div className="mt-6">
        {activeTab === 'details' && (<><SummaryCards summary={summary} billCount={filteredBills.length} /><div className="overflow-x-auto border rounded-lg mt-8"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="w-10"></th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Bill #</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contractor</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Grand Total</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Deductions</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Net Amount</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredBills.length > 0 ? (filteredBills.map(bill => (<React.Fragment key={bill.id}><tr onClick={() => toggleRow(bill.id)} className="hover:bg-gray-50 cursor-pointer"><td className="pl-2">{expandedRowId === bill.id ? <ChevronDownIcon /> : <ChevronRightIcon />}</td><td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{bill.bill_number}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(bill.bill_date).toLocaleDateString('en-CA')}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{bill.contractor_name}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">Rs. {Number(bill.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-[#660033] text-right">Rs. {Number(bill.totalDeductions).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[#00520A] text-right">Rs. {Number(bill.netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>{expandedRowId === bill.id && <BillDetailRow bill={bill} />}</React.Fragment>))) : (<tr><td colSpan={7} className="text-center py-10 text-gray-500">No bills found matching your criteria.</td></tr>)}</tbody></table></div></>)}
        {activeTab === 'contractor' && <ContractorSummaryTable summaryData={contractorSummary} />}
        {activeTab === 'contract' && <ContractSummaryTable summaryData={contractSummary} allBills={savedBills} expandedRowId={expandedRowId} onToggleRow={toggleRow} />}
        {activeTab === 'station' && <StationSummaryTable summaryData={stationSummary} allBills={savedBills} expandedRowId={expandedRowId} onToggleRow={toggleRow} />}
        {activeTab === 'monthly' && <MonthlySummaryTable summaryData={monthlySummary} />}
        {activeTab === 'deductions' && <DeductionsSummaryTable summaryData={deductionsSummary} />}
        {activeTab === 'taxSummary' && <TaxSummaryTable bills={filteredBills} contractorName={contractors.find(c => c.id === Number(selectedContractorId))?.name || ''} />}
        {activeTab === 'statement' && statementData && <ContractorStatement data={statementData} />}
        {activeTab === 'audit' && isAdmin && <AuditLogTable logs={filteredAuditLogs} expandedRowId={expandedRowId} onToggleRow={toggleRow} />}
        </div>
        <PrintableReport 
            ref={reportPrintRef} 
            activeTab={activeTab}
            filters={{ contractor: contractors.find(c => c.id === Number(selectedContractorId))?.name || 'All', route: selectedRoute, startDate, endDate, auditAction: auditActionFilter, searchQuery }}
            data={{ bills: filteredBills, contractorSummary, contractSummary, stationSummary, monthlySummary, deductionsSummary, auditLogs: filteredAuditLogs, statementData }}
        />
    </div>
  );
};

const SummaryCards = ({ summary, billCount }: { summary: any, billCount: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="bg-[#E673AC]/10 border border-[#E673AC]/20 p-4 rounded-lg"><p className="text-sm text-[#660033] font-semibold">Total Bills</p><p className="text-2xl font-bold text-[#660033]">{billCount}</p></div><div className="bg-[#469110]/10 border border-[#469110]/20 p-4 rounded-lg"><p className="text-sm text-[#00520A] font-semibold">Total Amount Billed</p><p className="text-2xl font-bold text-[#00520A]">Rs. {Number(summary.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div><div className="bg-[#660033]/10 border border-[#660033]/20 p-4 rounded-lg"><p className="text-sm text-[#660033] font-semibold">Total Deductions</p><p className="text-2xl font-bold text-[#660033]">Rs. {Number(summary.totalDeductions).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div><div className="bg-[#00520A]/10 border border-[#00520A]/20 p-4 rounded-lg"><p className="text-sm text-[#00520A] font-semibold">Total Net Paid</p><p className="text-2xl font-bold text-[#00520A]">Rs. {Number(summary.netAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div></div>
);

const BillDetailRow = ({ bill }: { bill: SavedBill }) => {
    const DEDUCTION_CONFIG = [ { key: 'penalty', label: `Penalty`}, { key: 'income_tax', label: 'Income Tax'}, { key: 'tajveed_ul_quran', label: 'Tajveed-ul Quran'}, { key: 'education_cess', label: 'Education Cess'}, { key: 'klc', label: 'K.L.C'}, { key: 'sd_current', label: 'S.D Current'}, { key: 'gst_current', label: 'GST Current'}, ];
    return (
        <tr className="bg-gray-50"><td colSpan={7} className="p-4"><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div><h4 className="font-bold text-md mb-2">Bill Items</h4><div className="overflow-x-auto"><table className="min-w-full text-sm border-collapse border"><thead className="text-left bg-gray-200"><tr><th className="p-1 font-semibold border">S#</th><th className="p-1 font-semibold border">From</th><th className="p-1 font-semibold border">To</th><th className="p-1 font-semibold border text-right">Net KGs</th><th className="p-1 font-semibold border text-right">Rate</th><th className="p-1 font-semibold border text-right">Rs.</th></tr></thead><tbody>{bill.bill_items.map((item, index) => (<tr key={item.id}><td className="p-1 border text-center">{index + 1}</td><td className="p-1 border">{item.from}</td><td className="p-1 border">{item.to}</td><td className="p-1 border text-right">{item.netKgs.toFixed(0)}</td><td className="p-1 border text-right">{item.rate_per_kg.toFixed(4)}</td><td className="p-1 border text-right font-semibold">{Number(item.rs).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>))}</tbody></table></div></div><div><h4 className="font-bold text-md mb-2">Deductions</h4><div className="overflow-x-auto"><table className="min-w-full text-sm border-collapse border"><tbody>{DEDUCTION_CONFIG.map((d) => (<tr key={d.key}><td className="p-1 border w-96">{d.label}</td><td className="p-1 border text-right">{Number(bill.deductions[d.key as keyof CalculatedDeductions] || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>))}<tr><td className="p-1 border w-96">{bill.deductions.others_description || 'Others'}</td><td className="p-1 border text-right">{Number(bill.deductions.others || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr><tr className="font-bold bg-gray-200"><td className="p-1 border">Total Deduction</td><td className="p-1 border text-right">{Number(bill.totalDeductions).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr></tbody></table></div></div></div>{bill.attachments && bill.attachments.length > 0 && (<div className="mt-4"><h4 className="font-bold text-md mb-2">Attachments</h4><ul className="list-disc list-inside text-sm space-y-1">{bill.attachments.map(att => (<li key={att.id}><a href={att.dataUrl} download={att.name} className="text-[#00520A] hover:underline">{att.name}</a></li>))}</ul></div>)}</td></tr>
    );
};

const ContractorSummaryTable = ({ summaryData }: { summaryData: any[] }) => (<div className="overflow-x-auto border rounded-lg"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contractor</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Bills</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Billed</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Deductions</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Net Amount</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{summaryData.length > 0 ? summaryData.map(item => (<tr key={item.name} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{item.name}</td><td className="px-4 py-3 text-right">{item.totalBills}</td><td className="px-4 py-3 text-right">Rs. {Number(item.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td className="px-4 py-3 text-right text-[#660033]">Rs. {Number(item.totalDeductions).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td className="px-4 py-3 text-right font-bold text-[#00520A]">Rs. {Number(item.netAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>)) : <tr><td colSpan={5} className="text-center py-10 text-gray-500">No data available.</td></tr>}</tbody></table></div>);

const ContractSummaryTable: React.FC<{summaryData: any[], allBills: SavedBill[], expandedRowId: string | null, onToggleRow: (id: string) => void}> = ({ summaryData, allBills, expandedRowId, onToggleRow }) => (
    <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100"><tr><th className="w-10"></th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contractor</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Route</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Trips</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Net KGs</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Amount</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {summaryData.length > 0 ? summaryData.map(item => {
                    const rowId = `contract-${item.contract.contract_id}`;
                    return (<React.Fragment key={rowId}><tr onClick={() => onToggleRow(rowId)} className="hover:bg-gray-50 cursor-pointer"><td className="pl-2">{expandedRowId === rowId ? <ChevronDownIcon /> : <ChevronRightIcon />}</td><td className="px-4 py-3 font-medium">{item.contract.contractor_name}</td><td className="px-4 py-3 text-sm">{item.contract.from_location} → {item.contract.to_location}</td><td className="px-4 py-3 text-right">{item.totalTrips}</td><td className="px-4 py-3 text-right">{item.totalNetKgs.toLocaleString(undefined, {maximumFractionDigits: 0})}</td><td className="px-4 py-3 text-right font-bold text-[#00520A]">Rs. {Number(item.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>{expandedRowId === rowId && <ContractDetailRow billIds={item.billIds} allBills={allBills} />}</React.Fragment>)
                }) : <tr><td colSpan={6} className="text-center py-10 text-gray-500">No data available.</td></tr>}
            </tbody>
        </table>
    </div>
);
const ContractDetailRow: React.FC<{billIds: Set<string>, allBills: SavedBill[]}> = ({billIds, allBills}) => {
    const relevantBills = allBills.filter(b => billIds.has(b.id));
    return (<tr className="bg-gray-50"><td colSpan={6} className="p-4"><div className="overflow-x-auto"><h4 className="font-bold text-md mb-2">Associated Bills</h4><table className="min-w-full text-sm border-collapse border"><thead className="text-left bg-gray-200"><tr><th className="p-1 font-semibold border">Bill #</th><th className="p-1 font-semibold border">Date</th><th className="p-1 font-semibold border text-right">Total Net KGs</th><th className="p-1 font-semibold border text-right">Net Amount</th></tr></thead><tbody>{relevantBills.map(bill => (<tr key={bill.id}><td className="p-1 border">{bill.bill_number}</td><td className="p-1 border">{new Date(bill.bill_date).toLocaleDateString()}</td><td className="p-1 border text-right">{bill.bill_items.reduce((s, i) => s + i.netKgs, 0).toLocaleString(undefined, {maximumFractionDigits: 0})}</td><td className="p-1 border text-right font-semibold">Rs. {Number(bill.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>))}</tbody></table></div></td></tr>);
}

const StationSummaryTable: React.FC<{summaryData: any[], allBills: SavedBill[], expandedRowId: string | null, onToggleRow: (id: string) => void}> = ({ summaryData, allBills, expandedRowId, onToggleRow }) => (<div className="overflow-x-auto border rounded-lg"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="w-10"></th><th rowSpan={2} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase align-bottom">Station</th><th colSpan={2} className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase border-b border-l">Dispatched</th><th colSpan={2} className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase border-b border-l">Received</th><th rowSpan={2} className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase align-bottom border-l">Total Value (Rs.)</th></tr><tr><th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase border-l">Trips</th><th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Kgs</th><th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase border-l">Trips</th><th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Kgs</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{summaryData.length > 0 ? summaryData.map(item => { const rowId = `station-${item.name}`; return (<React.Fragment key={rowId}><tr onClick={() => onToggleRow(rowId)} className="hover:bg-gray-50 cursor-pointer"><td className="pl-2">{expandedRowId === rowId ? <ChevronDownIcon /> : <ChevronRightIcon />}</td><td className="px-4 py-3 font-medium">{item.name}</td><td className="px-4 py-3 text-right border-l">{item.dispatchedTrips.toLocaleString()}</td><td className="px-4 py-3 text-right">{item.dispatchedKgs.toLocaleString()}</td><td className="px-4 py-3 text-right border-l">{item.receivedTrips.toLocaleString()}</td><td className="px-4 py-3 text-right">{item.receivedKgs.toLocaleString()}</td><td className="px-4 py-3 text-right font-bold text-[#00520A]">Rs. {Number(item.dispatchedValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>{expandedRowId === rowId && <StationDetailRow stationName={item.name} billIds={item.billIds} allBills={allBills} />}</React.Fragment>) }) : <tr><td colSpan={7} className="text-center py-10 text-gray-500">No data available.</td></tr>}</tbody></table></div>);
const StationDetailRow: React.FC<{stationName: string, billIds: Set<string>, allBills: SavedBill[]}> = ({ stationName, billIds, allBills }) => {
    const relevantBills = allBills.filter(b => billIds.has(b.id));
    return (<tr className="bg-gray-50"><td colSpan={7} className="p-4"><div className="overflow-x-auto"><h4 className="font-bold text-md mb-2">Bills associated with {stationName}</h4><table className="min-w-full text-sm border-collapse border"><thead className="text-left bg-gray-200"><tr><th className="p-1 font-semibold border">Bill #</th><th className="p-1 font-semibold border">Date</th><th className="p-1 font-semibold border">Contractor</th><th className="p-1 font-semibold border text-right">Kgs Dispatched</th><th className="p-1 font-semibold border text-right">Kgs Received</th></tr></thead><tbody>{relevantBills.map(bill => { const dispatched = bill.bill_items.filter(i => i.from === stationName).reduce((s, i) => s + i.netKgs, 0); const received = bill.bill_items.filter(i => i.to === stationName).reduce((s, i) => s + i.netKgs, 0); return (<tr key={bill.id}><td className="p-1 border">{bill.bill_number}</td><td className="p-1 border">{new Date(bill.bill_date).toLocaleDateString()}</td><td className="p-1 border">{bill.contractor_name}</td><td className="p-1 border text-right">{dispatched > 0 ? dispatched.toLocaleString(undefined, {maximumFractionDigits:0}) : '-'}</td><td className="p-1 border text-right">{received > 0 ? received.toLocaleString(undefined, {maximumFractionDigits:0}) : '-'}</td></tr>);})}</tbody></table></div></td></tr>);
}

const MonthlySummaryTable = ({ summaryData }: { summaryData: any[] }) => (<div className="overflow-x-auto border rounded-lg"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Month</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Bills</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Billed</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Deductions</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total Net Amount</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{summaryData.length > 0 ? summaryData.map(item => (<tr key={item.month} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{item.month}</td><td className="px-4 py-3 text-right">{item.totalBills}</td><td className="px-4 py-3 text-right">Rs. {Number(item.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td className="px-4 py-3 text-right text-[#660033]">Rs. {Number(item.totalDeductions).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td className="px-4 py-3 text-right font-bold text-[#00520A]">Rs. {Number(item.netAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>)) : <tr><td colSpan={5} className="text-center py-10 text-gray-500">No data available.</td></tr>}</tbody></table></div>);
const DeductionsSummaryTable = ({ summaryData }: { summaryData: { [key: string]: number } }) => {
    const DEDUCTION_CONFIG = [ { key: 'penalty', label: `Penalty`}, { key: 'income_tax', label: 'Income Tax'}, { key: 'tajveed_ul_quran', label: 'Tajveed-ul Quran'}, { key: 'education_cess', label: 'Education Cess'}, { key: 'klc', label: 'K.L.C'}, { key: 'sd_current', label: 'S.D Current'}, { key: 'gst_current', label: 'GST Current'}, { key: 'others', label: 'Others'}, ];
    return (<div className="overflow-x-auto border rounded-lg max-w-lg mx-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Deduction Type</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total (Rs.)</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{DEDUCTION_CONFIG.map(item => (<tr key={item.key} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{item.label}</td><td className="px-4 py-3 text-right text-[#660033]">Rs. {Number(summaryData[item.key] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>))}</tbody><tfoot className="bg-gray-200 font-bold"><tr><td className="px-4 py-3">Total All Deductions</td><td className="px-4 py-3 text-right text-lg">Rs. {Number(summaryData.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr></tfoot></table></div>);
};

const TaxSummaryTable: React.FC<{ bills: SavedBill[], contractorName: string }> = ({ bills, contractorName }) => {
    const DEDUCTION_KEYS: (keyof CalculatedDeductions)[] = ['penalty', 'income_tax', 'tajveed_ul_quran', 'education_cess', 'klc', 'sd_current', 'gst_current', 'others'];
    const totals = useMemo(() => {
        const initialTotals = { netKgs: 0, grandTotal: 0, totalDeductions: 0, netAmount: 0, ...DEDUCTION_KEYS.reduce((acc, key) => ({...acc, [key]: 0}), {}) };
        return bills.reduce((acc, bill) => {
            acc.netKgs += bill.bill_items.reduce((s, i) => s + i.netKgs, 0);
            acc.grandTotal += bill.grandTotal;
            acc.totalDeductions += bill.totalDeductions;
            acc.netAmount += bill.netAmount;
            DEDUCTION_KEYS.forEach(key => {
                acc[key] = (acc[key] || 0) + (bill.deductions[key] || 0);
            });
            return acc;
        }, initialTotals);
    }, [bills]);
    if (!contractorName) return <p className="text-center text-gray-500 py-10">Please select a contractor to view the tax summary.</p>;
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Tax Deduction Summary for: <span className="text-[#00520A]">{contractorName}</span></h3>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                        <tr>
                            <th className="px-2 py-2 text-left">Bill #</th>
                            <th className="px-2 py-2 text-left">Date</th>
                            <th className="px-2 py-2 text-right">Net KGs</th>
                            <th className="px-2 py-2 text-right">Gross Amt</th>
                            {DEDUCTION_KEYS.map(k => <th key={String(k)} className="px-2 py-2 text-right">{String(k).replace(/_/g, ' ')}</th>)}
                            <th className="px-2 py-2 text-right">Total Deds</th>
                            <th className="px-2 py-2 text-right">Net Amt</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bills.map(bill => (
                            <tr key={bill.id} className="hover:bg-gray-50">
                                <td className="px-2 py-2 whitespace-nowrap font-medium">{bill.bill_number}</td>
                                <td className="px-2 py-2 whitespace-nowrap">{new Date(bill.bill_date).toLocaleDateString('en-CA')}</td>
                                <td className="px-2 py-2 text-right">{bill.bill_items.reduce((s, i) => s + i.netKgs, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                <td className="px-2 py-2 text-right">{Number(bill.grandTotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                {DEDUCTION_KEYS.map(k => <td key={String(k)} className="px-2 py-2 text-right text-[#660033]">{Number(bill.deductions[k] || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>)}
                                <td className="px-2 py-2 text-right font-semibold">{Number(bill.totalDeductions).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                <td className="px-2 py-2 text-right font-bold text-[#00520A]">{Number(bill.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-200 font-bold">
                        <tr>
                            <td colSpan={2} className="px-2 py-2 text-right">Totals:</td>
                            <td className="px-2 py-2 text-right">{totals.netKgs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right">{Number(totals.grandTotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            {DEDUCTION_KEYS.map(k => <td key={String(k)} className="px-2 py-2 text-right text-[#660033]">{Number(totals[String(k) as keyof typeof totals] || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>)}
                            <td className="px-2 py-2 text-right">{Number(totals.totalDeductions).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="px-2 py-2 text-right text-[#00520A]">{Number(totals.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

const AuditLogTable: React.FC<{ logs: AuditLog[], expandedRowId: string | null, onToggleRow: (id: string) => void }> = ({ logs, expandedRowId, onToggleRow }) => (
    <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100"><tr><th className="w-10"></th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Timestamp</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">User</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Action</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {logs.length > 0 ? logs.map(log => (<React.Fragment key={log.id}><tr onClick={() => onToggleRow(log.id)} className="hover:bg-gray-50 cursor-pointer"><td className="pl-2">{expandedRowId === log.id ? <ChevronDownIcon /> : <ChevronRightIcon />}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">{new Date(log.timestamp).toLocaleString()}</td><td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{log.username}</td><td className="px-4 py-3 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">{log.action}</span></td></tr>{expandedRowId === log.id && (<tr><td colSpan={4} className="p-4 bg-gray-50"><pre className="text-xs bg-gray-900 text-white p-3 rounded-md overflow-x-auto"><code>{JSON.stringify(log.details, null, 2)}</code></pre></td></tr>)}</React.Fragment>)) : <tr><td colSpan={4} className="text-center py-10 text-gray-500">No audit logs found for this period.</td></tr>}
            </tbody>
        </table>
    </div>
);

const ContractorStatement: React.FC<{ data: StatementData }> = ({ data }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = () => { const printContent = printRef.current; if (printContent) { const printWindow = window.open('', '', 'height=800,width=800'); if (printWindow) { printWindow.document.write('<html><head><title>Contractor Statement</title><script src="https://cdn.tailwindcss.com"></script><style>@media print { .no-print { display: none; } body { -webkit-print-color-adjust: exact; font-size: 10px; } }</style></head><body>' + printContent.innerHTML + '</body></html>'); printWindow.document.close(); printWindow.focus(); setTimeout(() => { printWindow.print(); printWindow.close(); }, 250); } } };
    const DEDUCTION_CONFIG = [ { key: 'penalty', label: `Penalty`}, { key: 'income_tax', label: 'Income Tax'}, { key: 'tajveed_ul_quran', label: 'Tajveed-ul Quran'}, { key: 'education_cess', label: 'Education Cess'}, { key: 'klc', label: 'K.L.C'}, { key: 'sd_current', label: 'S.D Current'}, { key: 'gst_current', label: 'GST Current'}, ];
    return (
        <div className="border rounded-lg p-6 bg-gray-50"><div className="flex justify-between items-center mb-6"><div><h2 className="text-2xl font-bold text-gray-800">Contractor Statement</h2><p className="text-gray-600">Summary for <span className="font-semibold">{data.contractorName}</span></p></div><button onClick={handlePrint} className="no-print flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"><PrintIcon className="mr-2" /> Print</button></div>
            <div ref={printRef} className="printable-area bg-white p-8 border">
                 <header className="relative pb-4 border-b-2 border-gray-300">
                    <div className="w-20 mx-auto mb-2"><img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" /></div>
                    <div className="text-center">
                        <h1 className="text-base font-bold">Azad Govt of the State of Jammu & Kashmir</h1>
                        <h2 className="text-sm font-bold">Directorate of Food</h2>
                        <h3 className="text-xs font-bold">D-151 Satellite Town, Rwp</h3>
                    </div>
                </header>
                <div className="text-center my-6">
                    <h2 className="text-lg font-bold underline">Contractor Payment Summary</h2>
                </div>
                <div className="flex justify-between text-sm mb-6 pb-4 border-b"><div><p className="font-bold text-gray-700">Contractor:</p><p className="text-gray-900">{data.contractorName}</p></div><div className="text-right"><p className="font-bold text-gray-700">Period:</p><p className="text-gray-900">{data.period.start || 'Start'} to {data.period.end || 'End'}</p></div></div><h3 className="text-base font-semibold mb-4 text-center">Overall Summary</h3><div className="space-y-3 text-xs"><div className="flex justify-between items-center py-2 border-b"><span className="font-semibold text-gray-700">Total Gross Amount:</span><span className="font-bold text-base text-gray-900">Rs. {Number(data.summary.grandTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div><div className="py-2"><span className="font-semibold text-gray-700">Deductions Breakdown:</span><ul className="text-xs text-gray-600 mt-2 space-y-1 pl-4">{DEDUCTION_CONFIG.map(d => (<li key={d.key} className="flex justify-between"><span>{d.label}:</span><span className="font-mono">Rs. {Number(data.summary.deductions[d.key as keyof CalculatedDeductions] || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></li>))} <li className="flex justify-between"><span>{data.summary.deductions.others_description || 'Others'}:</span><span className="font-mono">Rs. {Number(data.summary.deductions.others || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></li></ul></div><div className="flex justify-between items-center py-2 border-t"><span className="font-semibold text-red-700">Total Deductions:</span><span className="font-bold text-base text-red-700">Rs. {Number(data.summary.totalDeductions).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div><div className="flex justify-between items-center pt-3 border-t-2 border-gray-900 mt-2"><span className="text-lg font-bold text-[#00520A]">Net Amount Payable:</span><span className="text-lg font-bold text-[#00520A]">Rs. {Number(data.summary.netAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div></div>
            </div>
        </div>
    )
}

const PrintableReport = React.forwardRef<HTMLDivElement, { activeTab: ReportTab, filters: any, data: any }>(({ activeTab, filters, data }, ref) => {
    const reportTitles: Record<ReportTab, string> = {
        details: 'Bill Details Report',
        contractor: 'Contractor Summary Report',
        contract: 'Contract-wise Summary Report',
        station: 'Station Summary Report',
        monthly: 'Monthly Summary Report',
        deductions: 'Deductions Summary Report',
        taxSummary: `Tax Deduction Summary for ${filters.contractor}`,
        audit: 'Audit Log Report',
        statement: `Contractor Statement for ${data.statementData?.contractorName}`
    };

    const tableClass = "w-full text-xs";
    const thClass = "p-2 border-b-2 border-gray-300 bg-gray-100 font-bold text-left text-gray-600 uppercase tracking-wider";
    const tdClass = "p-2 border-b border-gray-200";
    const tdRight = `${tdClass} text-right`;
    const DEDUCTION_KEYS: (keyof CalculatedDeductions)[] = ['penalty', 'income_tax', 'tajveed_ul_quran', 'education_cess', 'klc', 'sd_current', 'gst_current', 'others'];

    const renderContent = () => {
        switch (activeTab) {
            case 'details': return (<table className={tableClass}><thead><tr><th className={thClass}>Bill #</th><th className={thClass}>Date</th><th className={thClass}>Contractor</th><th className={`${thClass} text-right`}>Gross</th><th className={`${thClass} text-right`}>Deductions</th><th className={`${thClass} text-right`}>Net Amount</th></tr></thead><tbody>{data.bills.map((b: SavedBill) => <tr key={b.id} className="even:bg-gray-50"><td className={tdClass}>{b.bill_number}</td><td className={tdClass}>{new Date(b.bill_date).toLocaleDateString('en-CA')}</td><td className={tdClass}>{b.contractor_name}</td><td className={tdRight}>{Number(b.grandTotal).toLocaleString(undefined, {minimumFractionDigits:2})}</td><td className={tdRight}>{Number(b.totalDeductions).toLocaleString(undefined, {minimumFractionDigits:2})}</td><td className={tdRight}>{Number(b.netAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>)}</tbody></table>);
            case 'contractor': return <table className={tableClass}><thead><tr><th className={thClass}>Contractor</th><th className={`${thClass} text-right`}>Bills</th><th className={`${thClass} text-right`}>Net Amount</th></tr></thead><tbody>{data.contractorSummary.map((item: any) => <tr key={item.name} className="even:bg-gray-50"><td className={tdClass}>{item.name}</td><td className={tdRight}>{item.totalBills}</td><td className={tdRight}>{Number(item.netAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>)}</tbody></table>;
            case 'contract': return (<> {data.contractSummary.map((item: any) => (<div key={item.contract.contract_id} className="mb-4 page-break-before"><h4 className="font-bold mb-1">{item.contract.contractor_name} <span className="font-normal text-gray-600">({item.contract.from_location} → {item.contract.to_location})</span></h4><table className={tableClass}><thead><tr><th className={thClass}>Bill #</th><th className={thClass}>Date</th><th className={`${thClass} text-right`}>Net KGs</th><th className={`${thClass} text-right`}>Amount</th></tr></thead><tbody>{data.bills.filter((b: SavedBill) => item.billIds.has(b.id)).map((b: SavedBill) => <tr key={b.id} className="even:bg-gray-50"><td className={tdClass}>{b.bill_number}</td><td className={tdClass}>{new Date(b.bill_date).toLocaleDateString('en-CA')}</td><td className={tdRight}>{b.bill_items.filter(i => i.contract_id === item.contract.contract_id).reduce((s,i) => s + i.netKgs, 0).toLocaleString(undefined, {maximumFractionDigits:0})}</td><td className={tdRight}>{b.bill_items.filter(i => i.contract_id === item.contract.contract_id).reduce((s,i) => s + i.rs, 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>)}<tr className="font-bold bg-gray-100"><td colSpan={2} className={tdRight}>Contract Total:</td><td className={tdRight}>{item.totalNetKgs.toLocaleString(undefined, {maximumFractionDigits:0})}</td><td className={tdRight}>{Number(item.totalAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr></tbody></table></div>))}</>);
            case 'station': return (<> {data.stationSummary.map((item: any) => (<div key={item.name} className="mb-4 page-break-before"><h4 className="font-bold mb-1">Station: {item.name}</h4><table className={tableClass}><thead><tr><th className={thClass}>Bill #</th><th className={thClass}>Date</th><th className={thClass}>Contractor</th><th className={`${thClass} text-right`}>Kgs Dispatched</th><th className={`${thClass} text-right`}>Kgs Received</th></tr></thead><tbody>{data.bills.filter((b: SavedBill) => item.billIds.has(b.id)).map((b: SavedBill) => { const dispatched = b.bill_items.filter(i => i.from === item.name).reduce((s, i) => s + i.netKgs, 0); const received = b.bill_items.filter(i => i.to === item.name).reduce((s, i) => s + i.netKgs, 0); return (<tr key={b.id} className="even:bg-gray-50"><td className={tdClass}>{b.bill_number}</td><td className={tdClass}>{new Date(b.bill_date).toLocaleDateString('en-CA')}</td><td className={tdClass}>{b.contractor_name}</td><td className={tdRight}>{dispatched > 0 ? dispatched.toLocaleString(undefined, {maximumFractionDigits:0}) : '-'}</td><td className={tdRight}>{received > 0 ? received.toLocaleString(undefined, {maximumFractionDigits:0}) : '-'}</td></tr>);})}</tbody></table></div>))}</>);
            case 'monthly': return <table className={tableClass}><thead><tr><th className={thClass}>Month</th><th className={`${thClass} text-right`}>Bills</th><th className={`${thClass} text-right`}>Net Amount</th></tr></thead><tbody>{data.monthlySummary.map((item: any) => <tr key={item.month} className="even:bg-gray-50"><td className={tdClass}>{item.month}</td><td className={tdRight}>{item.totalBills}</td><td className={tdRight}>{Number(item.netAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>)}</tbody></table>;
            case 'taxSummary': {
                const totals = data.bills.reduce((acc: any, bill: SavedBill) => {
                    acc.netKgs += bill.bill_items.reduce((s, i) => s + i.netKgs, 0); acc.grandTotal += bill.grandTotal; acc.totalDeductions += bill.totalDeductions; acc.netAmount += bill.netAmount; DEDUCTION_KEYS.forEach(key => { acc[key] = (acc[key] || 0) + (bill.deductions[key] || 0); }); return acc;
                }, { netKgs: 0, grandTotal: 0, totalDeductions: 0, netAmount: 0, ...DEDUCTION_KEYS.reduce((acc, key) => ({...acc, [key]: 0}), {}) });
                return <table className={tableClass}><thead><tr><th className={thClass}>Bill #</th><th className={thClass}>Date</th><th className={`${thClass} text-right`}>Net KGs</th><th className={`${thClass} text-right`}>Gross Amt</th>{DEDUCTION_KEYS.map(k => <th key={String(k)} className={`${thClass} text-right`}>{String(k).replace(/_/g, ' ')}</th>)}<th className={`${thClass} text-right`}>Total Deds</th><th className={`${thClass} text-right`}>Net Amt</th></tr></thead><tbody>{data.bills.map((bill: SavedBill) => <tr key={bill.id} className="even:bg-gray-50"><td className={tdClass}>{bill.bill_number}</td><td className={tdClass}>{new Date(bill.bill_date).toLocaleDateString('en-CA')}</td><td className={tdRight}>{bill.bill_items.reduce((s, i) => s + i.netKgs, 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td><td className={tdRight}>{Number(bill.grandTotal).toLocaleString(undefined, {minimumFractionDigits:2})}</td>{DEDUCTION_KEYS.map(k => <td key={String(k)} className={tdRight}>{Number(bill.deductions[k] || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>)}<td className={tdRight}>{Number(bill.totalDeductions).toLocaleString(undefined, {minimumFractionDigits:2})}</td><td className={tdRight}>{Number(bill.netAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr>)}</tbody><tfoot className="font-bold bg-gray-100"><tr><td colSpan={2} className={tdRight}>Totals:</td><td className={tdRight}>{totals.netKgs.toLocaleString(undefined, {minimumFractionDigits:2})}</td><td className={tdRight}>{Number(totals.grandTotal).toLocaleString(undefined, {minimumFractionDigits:2})}</td>{DEDUCTION_KEYS.map(k => <td key={String(k)} className={tdRight}>{Number(totals[String(k) as keyof typeof totals] || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</td>)}<td className={tdRight}>{Number(totals.totalDeductions).toLocaleString(undefined, {minimumFractionDigits:2})}</td><td className={tdRight}>{Number(totals.netAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</td></tr></tfoot></table>;
            }
            case 'audit': return <table className={tableClass}><thead><tr><th className={thClass}>Timestamp</th><th className={thClass}>User</th><th className={thClass}>Action</th></tr></thead><tbody>{data.auditLogs.map((log: AuditLog) => <tr key={log.id} className="even:bg-gray-50"><td className={tdClass}>{new Date(log.timestamp).toLocaleString()}</td><td className={tdClass}>{log.username}</td><td className={tdClass}>{log.action}</td></tr>)}</tbody></table>;
            case 'statement': return data.statementData ? <div dangerouslySetInnerHTML={{ __html: document.querySelector('.printable-area')?.innerHTML || '' }}></div> : <p>No statement generated.</p>;
            default: return <p>No printable view available for this report.</p>;
        }
    };
    
    return (
        <div className="hidden">
            <div ref={ref} className="p-8 font-sans" style={{fontSize: '10px'}}>
                 <header className="relative pb-4 border-b-2 border-gray-300">
                    <div className="w-20 mx-auto mb-2"><img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" /></div>
                    <div className="text-center">
                        <h1 className="text-base font-bold">Azad Govt of the State of Jammu & Kashmir</h1>
                        <h2 className="text-sm font-bold">Directorate of Food</h2>
                        <h3 className="text-xs font-bold">D-151 Satellite Town, Rwp</h3>
                    </div>
                </header>
                <div className="my-6">
                    <h2 className="text-xl font-bold mb-2">{reportTitles[activeTab]}</h2>
                    <div className="text-sm text-gray-600 grid grid-cols-2 gap-x-6">
                        <p><span className="font-semibold">Contractor:</span> {filters.contractor}</p>
                        <p><span className="font-semibold">Route:</span> {filters.route}</p>
                        <p><span className="font-semibold">Date Range:</span> {filters.startDate || 'N/A'} to {filters.endDate || 'N/A'}</p>
                        {activeTab === 'audit' && (<><p><span className="font-semibold">Action:</span> {filters.auditAction}</p><p><span className="font-semibold">Search:</span> {filters.searchQuery || 'N/A'}</p></>)}
                    </div>
                </div>
                {renderContent()}
                <footer className="mt-8 text-center text-gray-400 text-[9px]">
                    <p>Report generated by FDBMS on {new Date().toLocaleString()}</p>
                </footer>
            </div>
        </div>
    );
});


export default Reports;
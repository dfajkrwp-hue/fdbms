import React, { useRef, useState } from 'react';
import { AuthUser, Contract } from '../types';
import { DownloadIcon, UserGroupIcon, KeyIcon, UploadIcon, CloseIcon, InfoIcon, BuildingOfficeIcon, SettingsIcon, BookOpenIcon, ClipboardDocumentListIcon, BellIcon, TruckIcon, ClipboardCheckIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, DatabaseIcon, ReportIcon, WalletIcon } from './Icons';
import { LOGO_URL } from '../constants';
import * as XLSX from 'xlsx';

type AppView = 'dashboard' | 'newBill' | 'allBills' | 'reports' | 'budget' | 'orders' | 'notifications' | 'grindingBills' | 'agOffice';

interface SavedBillsSidebarProps {
    currentUser: AuthUser;
    contracts: Contract[];
    users: AuthUser[];
    setCurrentView: (view: AppView) => void;
    currentView: AppView;
    onOpenUserManager: () => void;
    onOpenContractManager: () => void;
    onOpenFlourMillManager: () => void;
    onOpenGrindingSettingsManager: () => void;
    onOpenTransportationSettingsManager: () => void;
    onOpenAboutModal: () => void;
    onOpenContactModal: () => void;
    onImportData: (file: File) => void;
    isOpen: boolean;
    onClose: () => void;
}


const SavedBillsSidebar: React.FC<SavedBillsSidebarProps> = ({ currentUser, contracts, users, setCurrentView, currentView, onOpenUserManager, onOpenContractManager, onOpenFlourMillManager, onOpenGrindingSettingsManager, onOpenTransportationSettingsManager, onOpenAboutModal, onOpenContactModal, onImportData, isOpen, onClose }) => {
    
    const importInputRef = useRef<HTMLInputElement>(null);
    const [isTransportationOpen, setTransportationOpen] = useState(true);

    const navItemClass = "flex items-center w-full px-3 py-2.5 text-[var(--color-text-light)] hover:bg-black/5 hover:text-[var(--color-text-main)] rounded-md font-medium transition-colors text-sm whitespace-nowrap";
    const activeNavItemClass = "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]";
    
    const { role } = currentUser;
    const isAdmin = role === 'Admin';
    const isAGOfficeUser = role === 'AG Office';

    const handleBackup = () => {
        const savedBillsData = localStorage.getItem('savedBills');
        const savedBills = savedBillsData ? JSON.parse(savedBillsData) : [];
        if (savedBills.length === 0 && contracts.length === 0) {
            alert('No data to back up.');
            return;
        }

        // Prepare data for sheets
        const bills_main = savedBills.map((b: any) => ({
            id: b.id,
            bill_number: b.bill_number,
            bill_date: b.bill_date,
            bill_period: b.bill_period,
            sanctioned_no: b.sanctioned_no,
            contractor_id: b.contractor_id,
            contractor_name: b.contractor_name,
            delay_days: b.delay_days,
            deductions: JSON.stringify(b.deductions),
            grandTotal: b.grandTotal,
            totalDeductions: b.totalDeductions,
            netAmount: b.netAmount,
            amountInWords: b.amountInWords,
        }));

        const bill_items = savedBills.flatMap((b: any) => b.bill_items.map((i: any) => ({ bill_id: b.id, ...i, bagTypes: i.bagTypes.join(',') })));
        const attachments = savedBills.flatMap((b: any) => b.attachments.map((a: any) => ({ bill_id: b.id, id: a.id, name: a.name, type: a.type })));
        const custom_deductions = savedBills.flatMap((b: any) => b.custom_deductions?.map((d: any) => ({ bill_id: b.id, ...d })) || []);
        const certification_points = savedBills.flatMap((b: any) => b.certification_points?.map((p: any) => ({ bill_id: b.id, ...p })) || []);
        const users_safe = users.map(({ password, ...user }) => user);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bills_main), "Bills");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bill_items), "Bill Items");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attachments), "Attachments");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(custom_deductions), "Custom Deductions");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(certification_points), "Certification Points");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(contracts), "Contracts");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(users_safe), "Users");

        const today = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `FDBMS-Backup-${today}.xlsx`);
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportData(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const isTransportationActive = ['newBill', 'allBills', 'reports'].includes(currentView);
    const isGrindingActive = ['grindingBills'].includes(currentView);

    const highlightedNavItemClass = "flex items-center gap-4 w-full px-4 py-4 rounded-xl font-semibold text-lg whitespace-nowrap transition-all duration-200 transform hover:scale-105 shadow-md";
    const isDashboardActive = currentView === 'dashboard';


    return (
        <>
            {/* Backdrop for mobile */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <aside className={`no-print w-full max-w-xs sm:w-64 bg-white text-slate-200 flex flex-col transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-30 md:static md:flex-shrink-0 md:translate-x-0 border-r border-[var(--color-border)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between gap-3 p-4 border-b border-[var(--color-border)] h-16 flex-shrink-0">
                     <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] rounded-md">
                        <img src={LOGO_URL} alt="AJK Logo" className="w-12 h-12"/>
                        <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-main)] leading-tight">
                            <span style={{color: 'var(--color-primary)'}}>F</span>DBMS
                        </h1>
                        <p className="text-sm text-[var(--color-text-light)]">Billing System</p>
                        </div>
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-black/10 md:hidden" aria-label="Close sidebar">
                        <CloseIcon />
                    </button>
                </div>
                
                <nav className="p-4 flex-1 space-y-4 overflow-y-auto">
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wider mb-2">Modules</h3>
                        <div className="space-y-3">
                             <button onClick={() => setCurrentView('dashboard')} className={`${highlightedNavItemClass} ${isDashboardActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                                Dashboard
                            </button>
                             <button onClick={() => setTransportationOpen(!isTransportationOpen)} className={`${highlightedNavItemClass} justify-between ${isTransportationActive ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'}`}>
                                <span className="flex items-center gap-4"><TruckIcon className="h-7 w-7"/> Transportation</span>
                                {isTransportationOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                            </button>
                            {isTransportationOpen && (
                                <div className="pl-8 pt-1 space-y-1">
                                    <button onClick={() => setCurrentView('newBill')} className={`${navItemClass} ${currentView === 'newBill' ? activeNavItemClass : ''}`}><PlusIcon /> New Bill</button>
                                    <button onClick={() => setCurrentView('allBills')} className={`${navItemClass} ${currentView === 'allBills' ? activeNavItemClass : ''}`}><DatabaseIcon /> All Bills</button>
                                    <button onClick={() => setCurrentView('reports')} className={`${navItemClass} ${currentView === 'reports' ? activeNavItemClass : ''}`}><ReportIcon /> Reports</button>
                                </div>
                            )}

                             <button onClick={() => setCurrentView('grindingBills')} className={`${highlightedNavItemClass} ${isGrindingActive ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg' : 'bg-teal-50 text-teal-800 hover:bg-teal-100'}`}>
                                <ClipboardCheckIcon className="h-7 w-7" /> Grinding Bills
                            </button>

                             {(isAdmin || isAGOfficeUser) && (
                                <button onClick={() => setCurrentView('agOffice')} className={`${highlightedNavItemClass} ${currentView === 'agOffice' ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg' : 'bg-orange-50 text-orange-800 hover:bg-orange-100'}`}>
                                    <WalletIcon className="h-7 w-7"/> AG Office Tray
                                </button>
                            )}
                        </div>
                    </div>

                    {isAdmin && (
                        <div>
                            <h3 className="px-3 text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wider mb-2">Administration</h3>
                            <div className="space-y-1">
                                <button onClick={onOpenContractManager} className={`${navItemClass}`}>
                                    <SettingsIcon /> Manage Contracts
                                </button>
                                <button onClick={onOpenFlourMillManager} className={`${navItemClass}`}>
                                    <BuildingOfficeIcon /> Manage Flour Mills
                                </button>
                                 <button onClick={onOpenTransportationSettingsManager} className={`${navItemClass}`}>
                                    <SettingsIcon /> Transportation Admin
                                </button>
                                 <button onClick={onOpenGrindingSettingsManager} className={`${navItemClass}`}>
                                    <SettingsIcon /> Grinding Admin
                                </button>
                                <button onClick={onOpenUserManager} className={`${navItemClass}`}>
                                    <UserGroupIcon /> User Management
                                </button>
                                <input
                                        type="file"
                                        ref={importInputRef}
                                        className="hidden"
                                        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        onChange={handleFileSelect}
                                    />
                                <button onClick={handleImportClick} className={`${navItemClass}`}>
                                        <UploadIcon /> Import Data (Excel)
                                    </button>
                                <button onClick={handleBackup} className={`${navItemClass}`}>
                                    <DownloadIcon className="mr-2" /> Backup Data (Excel)
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="px-3 text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wider mb-2">Help & Info</h3>
                        <div className="space-y-1">
                            <button onClick={onOpenContactModal} className={`${navItemClass}`}>
                                <BuildingOfficeIcon /> Contact Us
                            </button>
                            <button onClick={onOpenAboutModal} className={`${navItemClass}`}>
                                <InfoIcon /> About Developer
                            </button>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}

export default SavedBillsSidebar;
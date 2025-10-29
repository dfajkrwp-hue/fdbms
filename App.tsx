import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { useAuditLog } from './hooks/useAuditLog';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';


import { Contract, BillItem, SavedBill, Contractor, CalculatedDeductions, Attachment, AuthUser, StoredDocument, SavedGrindingBill, FlourMill, GrindingRates, GrindingBillSettings, BillingSettings, GrindingBillingConfig, DefaultCertPoint, UnifiedBill } from './types';
import { MOCK_CONTRACTS, MOCK_FLOUR_MILLS, DEFAULT_CERT_POINTS, DEFAULT_GRINDING_RATES, DEFAULT_GRINDING_SETTINGS, GRINDING_BILLING_CONFIG } from './constants';
import { BILLING_CONFIG } from './config';
import { numberToWords, toTitleCase } from './utils';

import Auth from './components/Auth';
import Header from './components/Header';
import Footer from './components/Footer';
import SavedBillsSidebar from './components/SavedBills';
import ContractManager from './components/ContractManager';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import PrintLayout from './components/PrintLayout';
import AuditPrintLayout from './components/AuditPrintLayout';
import DocumentGallery from './components/DocumentGallery';
import Database from './components/Database';
import ChangePasswordModal from './components/ChangePasswordModal';
import AboutDeveloperModal from './components/AboutDeveloperModal';
import ContactUsModal from './components/ContactUsModal';
import Dashboard from './components/Dashboard';
import GrindingBills from './components/GrindingBills';
import GrindingPrintLayout from './components/GrindingPrintLayout';
import FlourMillManager from './components/FlourMillManager';
import GrindingSettingsManager from './components/GrindingSettingsManager';
import TransportationSettingsManager from './components/TransportationSettingsManager';
import AGOfficeTray from './components/AGOfficeTray';
import AGOfficeReportPrintLayout from './components/AGOfficeReportPrintLayout';
import CombinedPrintLayout from './components/CombinedPrintLayout';
import { PlusIcon, TrashIcon, SettingsIcon, UploadIcon, PdfIcon, ChevronUpIcon, ChevronDownIcon, PaperclipIcon, DocumentTextIcon, DatabaseIcon, WalletIcon, PrintIcon, TruckIcon, BadgeCheckIcon, ArrowLeftIcon, ClipboardCheckIcon, ChevronRightIcon } from './components/Icons';


const initialBillItem: BillItem = {
    id: uuidv4(),
    contract_id: null,
    from: '',
    to: '',
    bags: 0,
    mode: 'Normal',
    bagTypes: [],
    ppBags: 0,
    juteBags: 0,
    rate_per_kg: 0,
    grossKgs: 0,
    bardanaKgs: 0,
    netKgs: 0,
    rs: 0,
};

type AppView = 'dashboard' | 'newBill' | 'allBills' | 'reports' | 'budget' | 'orders' | 'notifications' | 'grindingBills' | 'agOffice';

const initialCustomDeduction = { id: uuidv4(), label: 'Others if any', value: 0 };


const generateNextBillNumber = (bills: SavedBill[]): string => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    const currentMonthYear = `${month} ${year}`;

    const billsThisMonth = bills.filter(bill => {
        const parts = bill.bill_number.split('/');
        return parts.length === 3 && parts[0] === 'M-1' && parts[1] === currentMonthYear;
    });

    let maxNumber = 0;
    billsThisMonth.forEach(bill => {
        const numberPart = parseInt(bill.bill_number.split('/')[2], 10);
        if (!isNaN(numberPart) && numberPart > maxNumber) {
            maxNumber = numberPart;
        }
    });

    const nextNumber = maxNumber + 1;
    return `M-1/${currentMonthYear}/${nextNumber}`;
};

const calculateBillItem = (item: BillItem, settings: BillingSettings): BillItem => {
    const calculated = { ...item };

    // Sanitize all numeric inputs from the source item to prevent errors
    calculated.rate_per_kg = Number(item.rate_per_kg) || 0;
    calculated.bags = Number(item.bags) || 0;
    calculated.ppBags = Number(item.ppBags) || 0;
    calculated.juteBags = Number(item.juteBags) || 0;
    calculated.netKgs = Number(item.netKgs) || 0;

    if (calculated.mode === 'Normal') {
        calculated.grossKgs = calculated.bags * settings.NORMAL_MODE.KG_PER_BAG;
        calculated.bardanaKgs = 0;
        calculated.netKgs = calculated.grossKgs; // Overwrites sanitized value with calculated value
        calculated.ppBags = 0;
        calculated.juteBags = 0;
        calculated.bagTypes = [];
    } else { // Bardana
        calculated.bags = calculated.ppBags + calculated.juteBags;

        const ppBardana = calculated.bagTypes.includes('PP Bags') ? calculated.ppBags * settings.BARDANA_MODE.PP_BAG_BARDANA_KG : 0;
        const juteBardana = calculated.bagTypes.includes('Jute Bags') ? calculated.juteBags * settings.BARDANA_MODE.JUTE_BAG_BARDANA_KG : 0;
        
        calculated.bardanaKgs = ppBardana + juteBardana;
        calculated.grossKgs = calculated.netKgs + calculated.bardanaKgs;
    }
    
    calculated.rs = calculated.netKgs * calculated.rate_per_kg;
    return calculated;
};


function App() {
    // Auth state and hooks
    const { currentUser, users, setUsers, login, signup, logout, changePassword, adminResetPassword } = useAuth();
    const { auditLogs, logAction } = useAuditLog();
    const logActionWithUser = (action: string, details?: Record<string, any>) => logAction(action, currentUser, details);

    // Local storage state for data
    const [contracts, setContracts] = useLocalStorage<Contract[]>('contracts', MOCK_CONTRACTS);
    const [flourMills, setFlourMills] = useLocalStorage<FlourMill[]>('flourMills', MOCK_FLOUR_MILLS);
    const [savedBills, setSavedBills] = useLocalStorage<SavedBill[]>('savedBills', []);
    const [savedGrindingBills, setSavedGrindingBills] = useLocalStorage<SavedGrindingBill[]>('savedGrindingBills', []);
    const [documents, setDocuments] = useLocalStorage<StoredDocument[]>('storedDocuments', []);
    
    // Local storage state for settings (now admin-editable)
    const [transportationSettings, setTransportationSettings] = useLocalStorage<BillingSettings>('transportationSettings', BILLING_CONFIG);
    const [defaultCertPoints, setDefaultCertPoints] = useLocalStorage<DefaultCertPoint[]>('defaultCertPoints', DEFAULT_CERT_POINTS);
    const [grindingRates, setGrindingRates] = useLocalStorage<GrindingRates>('grindingRates', DEFAULT_GRINDING_RATES);
    const [grindingBillingConfig, setGrindingBillingConfig] = useLocalStorage<GrindingBillingConfig>('grindingBillingConfig', GRINDING_BILLING_CONFIG);
    const [grindingPrintSettings, setGrindingPrintSettings] = useLocalStorage<GrindingBillSettings>('grindingPrintSettings', DEFAULT_GRINDING_SETTINGS);
    const [sanctionedBudget, setSanctionedBudget] = useLocalStorage<number>('sanctionedBudget', 50000000);
    const [grindingSanctionedBudget, setGrindingSanctionedBudget] = useLocalStorage<number>('grindingSanctionedBudget', 20000000);


    // UI State
    const [currentView, setCurrentView] = useState<AppView>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isContractManagerOpen, setContractManagerOpen] = useState(false);
    const [isFlourMillManagerOpen, setFlourMillManagerOpen] = useState(false);
    const [isGrindingSettingsManagerOpen, setGrindingSettingsManagerOpen] = useState(false);
    const [isTransportationSettingsManagerOpen, setTransportationSettingsManagerOpen] = useState(false);
    const [isUserManagerOpen, setUserManagerOpen] = useState(false);
    const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
    const [isAboutModalOpen, setAboutModalOpen] = useState(false);
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [isCertCollapsed, setCertCollapsed] = useState(true);
    const [isTransportDetailsVisible, setIsTransportDetailsVisible] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Form state
    const [activeBillId, setActiveBillId] = useState<string | null>(null);
    const [billNumber, setBillNumber] = useState(() => generateNextBillNumber(JSON.parse(localStorage.getItem('savedBills') || '[]')));
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [billPeriod, setBillPeriod] = useState('');
    const [selectedContractorId, setSelectedContractorId] = useState<number | null>(null);
    const [billItems, setBillItems] = useState<BillItem[]>([{...initialBillItem}]);
    const [delayDays, setDelayDays] = useState(0);
    const [customDeductions, setCustomDeductions] = useState<Array<{ id: string; label: string; value: number }>>([{...initialCustomDeduction, id: uuidv4()}]);
    const [certificationPoints, setCertificationPoints] = useState(defaultCertPoints.map(p => ({ ...p, id: uuidv4() })));
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [billPeriodError, setBillPeriodError] = useState('');
    const [billStatus, setBillStatus] = useState<'Draft' | 'Sent to AG' | 'Processed'>('Draft');

    // Refs
    const printRef = useRef<HTMLDivElement>(null);
    const auditPrintRef = useRef<HTMLDivElement>(null);
    const grindingPrintRef = useRef<HTMLDivElement>(null);
    const agOfficeReportPrintRef = useRef<HTMLDivElement>(null);
    const combinedPrintRef = useRef<HTMLDivElement>(null);
    const billPeriodRef = useRef<HTMLInputElement>(null);
    
    // Printing & PDF Generation
    const [billsForPrinting, setBillsForPrinting] = useState<SavedBill[]>([]);
    const [isForPrinting, setIsForPrinting] = useState(false);
    const [auditBillForPrinting, setAuditBillForPrinting] = useState<SavedBill | null>(null);
    const [isForAuditPrinting, setIsForAuditPrinting] = useState(false);
    const [grindingBillForPrinting, setGrindingBillForPrinting] = useState<SavedGrindingBill | null>(null);
    const [isForGrindingPrinting, setIsForGrindingPrinting] = useState(false);
    const [agOfficeReportData, setAgOfficeReportData] = useState<any | null>(null);
    const [isPrintingAgOfficeReport, setIsPrintingAgOfficeReport] = useState(false);
    const [billForCombinedPrinting, setBillForCombinedPrinting] = useState<UnifiedBill | null>(null);


    // Effect to migrate old bills to new structure
    useEffect(() => {
        const migrate = (bills: any[]) => bills.map(b => {
            if (typeof b.status === 'undefined') {
                return { ...b, status: 'Draft', agOfficeSentAt: null, agOfficeProcessedAt: null };
            }
            return b;
        });

        const tbills = JSON.parse(localStorage.getItem('savedBills') || '[]') as SavedBill[];
        const gbills = JSON.parse(localStorage.getItem('savedGrindingBills') || '[]') as SavedGrindingBill[];

        setSavedBills(migrate(tbills));
        setSavedGrindingBills(migrate(gbills));
    }, []);

    // Effect to focus on bill period input when contractor is selected
    useEffect(() => {
        if (selectedContractorId !== null) {
            billPeriodRef.current?.focus();
        }
    }, [selectedContractorId]);

    // Effect for auto-hiding notifications
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);
    
    // Derived state and permissions
    const isAdmin = currentUser?.role === 'Admin';
    const isManager = currentUser?.role === 'Manager';
    const isAGOfficeUser = currentUser?.role === 'AG Office';
    const canCreateAndEdit = isAdmin || isManager;
    const canUploadDocs = isAdmin || isManager;


    const uniqueContractors = useMemo<Contractor[]>(() => {
        const contractorMap = new Map<number, string>();
        contracts.forEach(c => {
            if (!contractorMap.has(c.contractor_id)) {
                contractorMap.set(c.contractor_id, c.contractor_name);
            }
        });
        return Array.from(contractorMap, ([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name));
    }, [contracts]);

    const contractorContracts = useMemo(() => {
        if (!selectedContractorId) return [];
        return contracts.filter(c => c.contractor_id === selectedContractorId && c.status === 'Active');
    }, [selectedContractorId, contracts]);
    
    const grandTotal = useMemo(() => billItems.reduce((sum, item) => sum + item.rs, 0), [billItems]);
    
    const calculatedDeductions = useMemo<CalculatedDeductions>(() => {
        const { DEDUCTIONS } = transportationSettings;
        const income_tax = grandTotal * DEDUCTIONS.INCOME_TAX_RATE;
        const customDeductionsTotal = customDeductions.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
        const customDeductionsLabels = customDeductions.map(d => d.label).filter(Boolean).join(', ');

        return {
            penalty: delayDays * DEDUCTIONS.PENALTY_PER_DAY,
            income_tax: income_tax,
            tajveed_ul_quran: (grandTotal / 1000) * DEDUCTIONS.TAJVEED_UL_QURAN_RATE,
            education_cess: income_tax * DEDUCTIONS.EDUCATION_CESS_RATE,
            klc: grandTotal * DEDUCTIONS.KLC_RATE,
            sd_current: grandTotal * DEDUCTIONS.SD_CURRENT_RATE,
            gst_current: grandTotal * DEDUCTIONS.GST_CURRENT_RATE,
            others: customDeductionsTotal,
            others_description: customDeductionsLabels
        }
    }, [grandTotal, delayDays, customDeductions, transportationSettings]);

    const totals = useMemo(() => {
        const { penalty, income_tax, tajveed_ul_quran, education_cess, klc, sd_current, gst_current, others } = calculatedDeductions;
        const totalDeductions = [penalty, income_tax, tajveed_ul_quran, education_cess, klc, sd_current, gst_current, others].reduce((sum, val) => sum + (val || 0), 0);
        const netAmount = grandTotal - totalDeductions;
        const amountInWords = numberToWords(netAmount);
        return { grandTotal, totalDeductions, netAmount, amountInWords };
    }, [grandTotal, calculatedDeductions]);

    const getSanctionedNoForBill = (items: BillItem[]): string => {
        for (const item of items) {
            if (item.contract_id) {
                const contract = contracts.find(c => c.contract_id === item.contract_id);
                if (contract && contract.sanctioned_no) {
                    return contract.sanctioned_no;
                }
            }
        }
        return 'N/A';
    };

    // Handlers for bill items
    const handleItemChange = (id: string, field: keyof BillItem, value: any) => {
        setBillItems(prevItems => {
            const newItems = prevItems.map(item => {
                if (item.id === id) {
                    let updatedItem = { ...item };

                    if (field === 'contract_id' && value) {
                        updatedItem.contract_id = Number(value);
                        const contract = contracts.find(c => c.contract_id === updatedItem.contract_id);
                        if (contract) {
                            updatedItem.from = contract.from_location;
                            updatedItem.to = contract.to_location;
                            updatedItem.rate_per_kg = contract.rate_per_kg;
                        }
                    } else if (field === 'bagTypes') {
                        const bagTypeName = value as string;
                        const newBagTypes = updatedItem.bagTypes.includes(bagTypeName)
                            ? updatedItem.bagTypes.filter(bt => bt !== bagTypeName)
                            : [...updatedItem.bagTypes, bagTypeName];
                        updatedItem.bagTypes = newBagTypes;

                        if (!newBagTypes.includes('PP Bags')) updatedItem.ppBags = 0;
                        if (!newBagTypes.includes('Jute Bags')) updatedItem.juteBags = 0;
                    } else {
                        (updatedItem as any)[field] = value;
                    }
                    
                    return calculateBillItem(updatedItem, transportationSettings);
                }
                return item;
            });
            return newItems;
        });
    };

    const addNewItem = () => {
        setBillItems([...billItems, { ...initialBillItem, id: uuidv4() }]);
    };
    
    const removeItem = (id: string) => {
        if (billItems.length > 1) {
            setBillItems(billItems.filter(item => item.id !== id));
        }
    };

    const handleContractorChange = (id: number) => {
        setSelectedContractorId(id);
        setBillItems([{ ...initialBillItem, id: uuidv4() }]);
        setIsTransportDetailsVisible(true);
    }
    
    // Handlers for custom deductions
    const addCustomDeduction = () => {
        setCustomDeductions(prev => [...prev, { id: uuidv4(), label: '', value: 0 }]);
    };
    const removeCustomDeduction = (id: string) => {
        if (customDeductions.length > 1) {
            setCustomDeductions(prev => prev.filter(d => d.id !== id));
        }
    };
    const updateCustomDeduction = (id: string, field: 'label' | 'value', value: string | number) => {
        setCustomDeductions(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    // Handlers for certification points
    const addCertPoint = () => {
        setCertificationPoints(prev => [...prev, { id: uuidv4(), text: '' }]);
    };
    const removeCertPoint = (id: string) => {
        if (certificationPoints.length > 1) {
            setCertificationPoints(prev => prev.filter(p => p.id !== id));
        }
    };
    const updateCertPoint = (id: string, text: string) => {
        setCertificationPoints(prev => prev.map(p => p.id === id ? { ...p, text } : p));
    };

    // Bill actions
    const resetForm = (billsForNextNumber: SavedBill[] = savedBills) => {
        setActiveBillId(null);
        setBillNumber(generateNextBillNumber(billsForNextNumber));
        setBillDate(new Date().toISOString().split('T')[0]);
        setBillPeriod('');
        setSelectedContractorId(null);
        setBillItems([{ ...initialBillItem, id: uuidv4() }]);
        setDelayDays(0);
        setCustomDeductions([{...initialCustomDeduction, id: uuidv4()}]);
        setCertificationPoints(defaultCertPoints.map(p => ({ ...p, id: uuidv4() })));
        setAttachments([]);
        setBillPeriodError('');
        setBillStatus('Draft');
        setIsTransportDetailsVisible(false);
    }
    
    const handleSaveBill = () => {
        if (!canCreateAndEdit) return;
        if (!selectedContractorId) { setNotification({message: 'Please select a contractor.', type: 'error'}); return; }
        if (!billPeriod.trim()) { setBillPeriodError('You must enter this date.'); billPeriodRef.current?.focus(); return; }
        if (!billNumber) { setNotification({message: 'Please fill in the Bill #.', type: 'error'}); return; }
        
        const contractorName = uniqueContractors.find(c => c.id === selectedContractorId)?.name ?? 'N/A';
        const sanctionedNoForBill = getSanctionedNoForBill(billItems);

        const newBill: SavedBill = {
            id: activeBillId || uuidv4(),
            bill_number: billNumber,
            bill_date: billDate,
            bill_period: billPeriod,
            sanctioned_no: sanctionedNoForBill,
            contract_id: null,
            contractor_id: selectedContractorId,
            contractor_name: contractorName,
            bill_items: billItems.filter(item => item.netKgs > 0),
            delay_days: delayDays,
            deductions: calculatedDeductions,
            custom_deductions: customDeductions,
            certification_points: certificationPoints,
            grandTotal: totals.grandTotal,
            totalDeductions: totals.totalDeductions,
            netAmount: totals.netAmount,
            amountInWords: totals.amountInWords,
            attachments: attachments,
            status: billStatus,
            agOfficeSentAt: activeBillId ? savedBills.find(b => b.id === activeBillId)?.agOfficeSentAt || null : null,
            agOfficeProcessedAt: activeBillId ? savedBills.find(b => b.id === activeBillId)?.agOfficeProcessedAt || null : null,
        };

        if (activeBillId) {
            const oldBill = savedBills.find(b => b.id === activeBillId);
            setSavedBills(prevBills => prevBills.map(b => b.id === activeBillId ? newBill : b));
            logActionWithUser('Bill Updated', { billNumber: newBill.bill_number, billId: newBill.id, oldValue: oldBill, newValue: newBill });
            setNotification({ message: 'Bill updated successfully!', type: 'success' });
        } else {
            setSavedBills(prevBills => [...prevBills, newBill]);
            logActionWithUser('Bill Created', { billNumber: newBill.bill_number, billId: newBill.id });
            setNotification({ message: 'Bill saved successfully!', type: 'success' });
        }
        setActiveBillId(newBill.id);
        setBillStatus(newBill.status);
    };

    const handleLoadBill = (bill: SavedBill) => {
        setActiveBillId(bill.id);
        setBillNumber(bill.bill_number);
        setBillDate(bill.bill_date);
        setBillPeriod(bill.bill_period || '');
        setSelectedContractorId(bill.contractor_id);
        setBillStatus(bill.status || 'Draft');

        const itemsWithCalculations = bill.bill_items.map((item: any) => {
             const isOldFormat = !('bagTypes' in item);
            let bagTypes: string[] = item.bagTypes || [];
            let ppBags = item.ppBags || 0;
            let juteBags = item.juteBags || 0;

            if (isOldFormat && item.mode === 'Bardana') {
                if (item.bagType === 'PP Bags') { bagTypes = ['PP Bags']; ppBags = item.bags; }
                else if (item.bagType === 'Jute Bags') { bagTypes = ['Jute Bags']; juteBags = item.bags; }
            }

            const migratedItem: BillItem = { ...initialBillItem, ...item, mode: item.mode || 'Normal', bagTypes, ppBags, juteBags };
            if (migratedItem.mode === 'Bardana') migratedItem.netKgs = Number(item.netKgs) || 0;
            const finalItem = calculateBillItem(migratedItem, transportationSettings);
            if (isOldFormat && item.rs > 0) finalItem.rs = item.rs;
            return finalItem;
        });

        setBillItems(itemsWithCalculations.length > 0 ? itemsWithCalculations : [{ ...initialBillItem, id: uuidv4() }]);
        setIsTransportDetailsVisible(itemsWithCalculations.length > 0);

        setDelayDays(bill.delay_days || 0);
        
        if (bill.custom_deductions && bill.custom_deductions.length > 0) {
            setCustomDeductions(bill.custom_deductions);
        } else {
            setCustomDeductions([{
                id: uuidv4(),
                label: bill.deductions.others_description || 'Others if any',
                value: bill.deductions.others || 0
            }]);
        }
        
        setCertificationPoints(bill.certification_points && bill.certification_points.length > 0
            ? bill.certification_points
            : defaultCertPoints.map(p => ({...p, id: uuidv4()}))
        );

        setAttachments(bill.attachments || []);
        setCurrentView('newBill');
        setBillPeriodError('');
    };

    const onDeleteBill = (id: string) => {
        if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
            const billToDelete = savedBills.find(b => b.id === id);
            logActionWithUser('Bill Deleted', { billNumber: billToDelete?.bill_number, billId: id });

            const updatedBills = savedBills.filter(b => b.id !== id);
            setSavedBills(updatedBills);
            setNotification({ message: `Bill #${billToDelete?.bill_number} deleted.`, type: 'success' });

            // If the deleted bill was the one being edited, reset the form.
            if (activeBillId === id) {
                resetForm(updatedBills);
            }
        }
    };
    
    const onBulkDeleteBills = (ids: string[]) => {
         if (window.confirm(`Are you sure you want to delete ${ids.length} selected bills? This action cannot be undone.`)) {
            const billsToDelete = savedBills.filter(b => ids.includes(b.id));
            logActionWithUser('Bills Bulk Deleted', {
                count: ids.length,
                deletedBillNumbers: billsToDelete.map(b => b.bill_number)
            });

            const updatedBills = savedBills.filter(b => !ids.includes(b.id));
            setSavedBills(updatedBills);
            setNotification({ message: `${ids.length} bills have been deleted.`, type: 'success' });

            // If the deleted bills included the one being edited, reset the form.
            if (activeBillId && ids.includes(activeBillId)) {
                resetForm(updatedBills);
            }
        }
    };


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

    
    const triggerPrint = (ref: React.RefObject<HTMLDivElement>) => {
        const printContent = ref.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Print Bill</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                printWindow.document.write('<style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"); @media print { body { font-family: "Inter", sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .no-print { display: none; } .print-only { display: block !important; } .page-break-before { page-break-before: always; } }</style>');
                printWindow.document.write('</head><body>' + printContent.innerHTML + '</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                    setBillsForPrinting([]);
                    setAuditBillForPrinting(null);
                }, 250);
            }
        }
    };
    
    useEffect(() => {
        if (billsForPrinting.length > 0 && isForPrinting) {
            const timer = setTimeout(() => {
                triggerPrint(printRef);
                setIsForPrinting(false);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [billsForPrinting, isForPrinting]);
    
    useEffect(() => {
        if (auditBillForPrinting && isForAuditPrinting) {
            const timer = setTimeout(() => {
                triggerPrint(auditPrintRef);
                setIsForAuditPrinting(false);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [auditBillForPrinting, isForAuditPrinting]);

    useEffect(() => {
        if (grindingBillForPrinting && isForGrindingPrinting) {
            const timer = setTimeout(() => {
                triggerPrint(grindingPrintRef);
                setIsForGrindingPrinting(false);
                setGrindingBillForPrinting(null);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [grindingBillForPrinting, isForGrindingPrinting]);

     useEffect(() => {
        if (isPrintingAgOfficeReport && agOfficeReportData) {
            const timer = setTimeout(() => {
                triggerPrint(agOfficeReportPrintRef);
                setIsPrintingAgOfficeReport(false);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isPrintingAgOfficeReport, agOfficeReportData]);

    useEffect(() => {
        if (billForCombinedPrinting) {
            const timer = setTimeout(() => triggerPrint(combinedPrintRef), 50);
            return () => clearTimeout(timer);
        }
    }, [billForCombinedPrinting]);


    const handleExportToPdf = (billsToExport: SavedBill[]) => {
        const processedBills = billsToExport.map(bill => {
            const billWithSanctionNo = { ...bill };
            if (!bill.sanctioned_no || bill.sanctioned_no === 'N/A') {
                billWithSanctionNo.sanctioned_no = getSanctionedNoForBill(bill.bill_items);
            }
            return billWithSanctionNo;
        });
        setBillsForPrinting(processedBills);
        setIsForPrinting(true);
    };
    
    const getActiveBill = (): SavedBill => {
        if (!selectedContractorId) throw new Error("Contractor not selected");
        const contractorName = uniqueContractors.find(c => c.id === selectedContractorId)?.name ?? 'N/A';
        const sanctionedNoForBill = getSanctionedNoForBill(billItems);
        return {
            id: activeBillId || uuidv4(), bill_number: billNumber || 'N/A', bill_date: billDate, bill_period: billPeriod,
            sanctioned_no: sanctionedNoForBill, contract_id: null, contractor_id: selectedContractorId, contractor_name: contractorName,
            bill_items: billItems.filter(item => item.netKgs > 0), delay_days: delayDays, deductions: calculatedDeductions,
            custom_deductions: customDeductions, certification_points: certificationPoints,
            grandTotal: totals.grandTotal, totalDeductions: totals.totalDeductions, netAmount: totals.netAmount,
            amountInWords: totals.amountInWords, attachments: attachments,
            status: billStatus, agOfficeSentAt: null, agOfficeProcessedAt: null, // Will be updated by handlers
        };
    }
    
    const handleAuditPrint = () => {
        try {
            setAuditBillForPrinting(getActiveBill());
            setIsForAuditPrinting(true);
        } catch(e) {
            setNotification({message: (e as Error).message, type: 'error'});
        }
    }

    const handleStandardPrint = () => {
        try {
            handleExportToPdf([getActiveBill()]);
        } catch(e) {
            setNotification({message: (e as Error).message, type: 'error'});
        }
    }

    const onShareBill = (bill: SavedBill) => {
        const billText = `
Bill #: ${bill.bill_number} | Date: ${bill.bill_date} | Contractor: ${bill.contractor_name}
Net Amount: Rs. ${bill.netAmount.toFixed(2)}
Details:
${bill.bill_items.map(item => `- ${item.from} to ${item.to} | ${item.netKgs.toFixed(2)} Kg | Rs. ${item.rs.toFixed(2)}`).join('\n')}
        `.trim().replace(/^\s+/gm, '');
        if (navigator.share) navigator.share({ title: `Transport Bill ${bill.bill_number}`, text: billText }).catch(console.error);
        else { navigator.clipboard.writeText(billText); setNotification({message: 'Bill details copied to clipboard!', type: 'success'}); }
    };
    
    const migrateAndValidateBill = (billData: any): SavedBill | null => {
        if (!billData || typeof billData.id !== 'string' || typeof billData.bill_number !== 'string') {
            return null;
        }

        const sanitizedBill = { ...billData };
        
        // Ensure top-level arrays exist
        sanitizedBill.attachments = Array.isArray(billData.attachments) ? billData.attachments : [];
        sanitizedBill.custom_deductions = Array.isArray(billData.custom_deductions) ? billData.custom_deductions : [];
        sanitizedBill.certification_points = Array.isArray(billData.certification_points) ? billData.certification_points : [];
        
        // Sanitize numeric fields with defaults
        sanitizedBill.delay_days = parseInt(billData.delay_days, 10) || 0;
        sanitizedBill.grandTotal = parseFloat(billData.grandTotal) || 0;
        sanitizedBill.totalDeductions = parseFloat(billData.totalDeductions) || 0;
        sanitizedBill.netAmount = parseFloat(billData.netAmount) || 0;

        // Sanitize deductions object
        sanitizedBill.deductions = {
            penalty: parseFloat(billData.deductions?.penalty) || 0,
            income_tax: parseFloat(billData.deductions?.income_tax) || 0,
            tajveed_ul_quran: parseFloat(billData.deductions?.tajveed_ul_quran) || 0,
            education_cess: parseFloat(billData.deductions?.education_cess) || 0,
            klc: parseFloat(billData.deductions?.klc) || 0,
            sd_current: parseFloat(billData.deductions?.sd_current) || 0,
            gst_current: parseFloat(billData.deductions?.gst_current) || 0,
            others: parseFloat(billData.deductions?.others) || 0,
            others_description: billData.deductions?.others_description || '',
        };

        if (!Array.isArray(billData.bill_items)) {
            sanitizedBill.bill_items = [];
        } else {
            sanitizedBill.bill_items = billData.bill_items.map((item: any): BillItem => {
                const isOldFormat = !('bagTypes' in item) && item.mode === 'Bardana';
                let bagTypes: string[] = Array.isArray(item.bagTypes) ? item.bagTypes : [];
                let ppBags = parseInt(item.ppBags, 10) || 0;
                let juteBags = parseInt(item.juteBags, 10) || 0;
                
                if (isOldFormat) {
                    if (item.bagType === 'PP Bags') { bagTypes = ['PP Bags']; ppBags = parseInt(item.bags, 10) || 0; } 
                    else if (item.bagType === 'Jute Bags') { bagTypes = ['Jute Bags']; juteBags = parseInt(item.bags, 10) || 0; }
                }

                return {
                    ...initialBillItem,
                    ...item,
                    mode: item.mode || 'Normal',
                    bagTypes,
                    ppBags,
                    juteBags,
                    bags: parseInt(item.bags, 10) || 0,
                    netKgs: parseFloat(item.netKgs) || 0,
                    grossKgs: parseFloat(item.grossKgs) || 0,
                    bardanaKgs: parseFloat(item.bardanaKgs) || 0,
                    rate_per_kg: parseFloat(item.rate_per_kg) || 0,
                    rs: parseFloat(item.rs) || 0,
                };
            }).filter(Boolean);
        }
        
        // Final sanity check
        if (isNaN(sanitizedBill.netAmount)) {
            console.warn("Skipping bill due to NaN netAmount:", billData);
            return null;
        }

        return sanitizedBill as SavedBill;
    };
    
    const handleImportData = (file: File) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                if (!data) throw new Error("Could not read file.");

                const workbook = XLSX.read(data, { type: 'array' });

                const getSheetData = <T,>(sheetName: string): T[] => {
                    const sheet = workbook.Sheets[sheetName];
                    return sheet ? XLSX.utils.sheet_to_json<T>(sheet) : [];
                };

                // Read all sheets
                const mainBillsData = getSheetData<any>("Bills");
                const itemsData = getSheetData<any>("Bill Items");
                const attachmentsData = getSheetData<any>("Attachments");
                const customDeductionsData = getSheetData<any>("Custom Deductions");
                const certPointsData = getSheetData<any>("Certification Points");
                const newContractsData = getSheetData<Contract>("Contracts");
                const newUsersData = getSheetData<any>("Users");

                if (mainBillsData.length === 0 || newContractsData.length === 0) {
                    throw new Error("Invalid backup file. 'Bills' and 'Contracts' sheets must contain data.");
                }

                // Restore Contracts and Users
                if (window.confirm(`This will replace all ${contracts.length} existing contracts with ${newContractsData.length} from the file. Proceed?`)) {
                    setContracts(newContractsData);
                    logActionWithUser('Contracts Restored (Excel)', { filename: file.name, count: newContractsData.length });
                }
                if (newUsersData.length > 0 && window.confirm(`This will update existing users and add/update ${newUsersData.length} user(s) from the file. Proceed?`)) {
                    setUsers(currentUsers => {
                        const userMap = new Map(currentUsers.map(u => [u.id, u]));
                        newUsersData.forEach(importedUser => {
                            const existingUser = userMap.get(importedUser.id);
                            if (existingUser) {
                                userMap.set(importedUser.id, { ...existingUser, username: importedUser.username, role: importedUser.role });
                            } else {
                                userMap.set(importedUser.id, { ...importedUser, password: uuidv4() }); // Add with random password, admin must reset
                            }
                        });
                        logActionWithUser('Users Restored (Excel)', { filename: file.name, count: newUsersData.length });
                        return Array.from(userMap.values());
                    });
                }

                // Reconstruct Bills
                const createLookupMap = (data: any[], key: string = 'bill_id') => {
                    const map = new Map<string, any[]>();
                    data.forEach(item => {
                        if (!map.has(item[key])) map.set(item[key], []);
                        map.get(item[key])!.push(item);
                    });
                    return map;
                };

                const itemsMap = createLookupMap(itemsData);
                const attachmentsMap = createLookupMap(attachmentsData);
                const customDeductionsMap = createLookupMap(customDeductionsData);
                const certPointsMap = createLookupMap(certPointsData);

                const reconstructedBills: SavedBill[] = mainBillsData.map(b => {
                    const bill: Partial<SavedBill> = {
                        ...b,
                        deductions: typeof b.deductions === 'string' ? JSON.parse(b.deductions) : b.deductions,
                        bill_items: (itemsMap.get(b.id) || []).map(i => ({...i, bagTypes: typeof i.bagTypes === 'string' ? i.bagTypes.split(',').filter(Boolean) : [] })),
                        attachments: (attachmentsMap.get(b.id) || []),
                        custom_deductions: (customDeductionsMap.get(b.id) || []),
                        certification_points: (certPointsMap.get(b.id) || []),
                    };
                    return migrateAndValidateBill(bill);
                }).filter((b): b is SavedBill => b !== null);

                // Merge Bills into State
                if (reconstructedBills.length > 0) {
                    if (window.confirm(`Found ${reconstructedBills.length} valid bills in the file. This will add them or update existing ones. Proceed?`)) {
                        setSavedBills(currentBills => {
                            const billMap = new Map(currentBills.map(bill => [bill.id, bill]));
                            let updatedCount = 0, addedCount = 0;
                            reconstructedBills.forEach(importedBill => {
                                if (billMap.has(importedBill.id)) updatedCount++;
                                else addedCount++;
                                billMap.set(importedBill.id, importedBill);
                            });

                            logActionWithUser('Bills Restored (Excel)', { filename: file.name, added: addedCount, updated: updatedCount });
                            setNotification({message: `Import successful! ${addedCount} bills added, ${updatedCount} bills updated.`, type: 'success'});
                            
                            return Array.from(billMap.values());
                        });
                    }
                } else {
                    setNotification({message: "No valid bills were found to import from the file.", type: 'error'});
                }

            } catch (error) {
                console.error("Failed to import data:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                setNotification({message: `Failed to import data. ${errorMessage}`, type: 'error'});
            }
        };
        reader.readAsArrayBuffer(file);
    };


    const DEDUCTION_CONFIG = [
      { key: 'penalty', label: `Penalty for days delay @${transportationSettings.DEDUCTIONS.PENALTY_PER_DAY}/- per day`},
      { key: 'income_tax', label: `Income Tax @ ${transportationSettings.DEDUCTIONS.INCOME_TAX_RATE * 100}% (I.T.O)`},
      { key: 'tajveed_ul_quran', label: `Tajveed-ul Quran @ Rs. ${transportationSettings.DEDUCTIONS.TAJVEED_UL_QURAN_RATE} per 1000/-`},
      { key: 'education_cess', label: `Education Cess @ ${transportationSettings.DEDUCTIONS.EDUCATION_CESS_RATE * 100}% income Tax`},
      { key: 'klc', label: `K.L.C @ ${transportationSettings.DEDUCTIONS.KLC_RATE * 100}%`},
      { key: 'sd_current', label: `S.D Current bill @${transportationSettings.DEDUCTIONS.SD_CURRENT_RATE * 100}%`},
      { key: 'gst_current', label: `GST Current bill @${transportationSettings.DEDUCTIONS.GST_CURRENT_RATE * 100}%`},
    ];

    const handleSuccessfulAuth = (user: AuthUser) => {
        logAction('Login', user, { username: user.username });
    };
    
    if (!currentUser) {
        return <Auth onLogin={(u, p) => {
            const res = login(u,p);
            if(res.success && res.user) handleSuccessfulAuth(res.user);
            return res;
        }} />;
    }
    
    const handleUploadDocument = (doc: Omit<StoredDocument, 'id' | 'uploadedAt'>) => {
        const newDoc: StoredDocument = {
            ...doc,
            id: uuidv4(),
            uploadedAt: new Date().toISOString(),
            uploader: { id: currentUser.id, username: currentUser.username },
        };
        setDocuments(prev => [newDoc, ...prev].sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
        logActionWithUser('Document Uploaded', { category: doc.category, title: doc.title, fileName: doc.fileName });
        setNotification({ message: 'Document uploaded successfully!', type: 'success' });
    };

    const handleDeleteDocument = (docId: string) => {
        const docToDelete = documents.find(d => d.id === docId);
        if (window.confirm(`Are you sure you want to delete "${docToDelete?.title}"?`)) {
            setDocuments(prev => prev.filter(d => d.id !== docId));
            logActionWithUser('Document Deleted', { docId, title: docToDelete?.title, category: docToDelete?.category });
        }
    }

    const handleSendToAGOffice = (billId: string, billType: 'transportation' | 'grinding') => {
        if (billType === 'transportation') {
            setSavedBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'Sent to AG', agOfficeSentAt: new Date().toISOString() } : b));
            if (activeBillId === billId) setBillStatus('Sent to AG');
        } else {
            setSavedGrindingBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'Sent to AG', agOfficeSentAt: new Date().toISOString() } : b));
        }
        logActionWithUser('Bill Sent to AG Office', { billId, billType });
        setNotification({ message: 'Bill has been sent to the AG Office tray.', type: 'success' });
    };

    const handleProcessAndDownload = async (billsToProcess: UnifiedBill[]) => {
        const now = new Date().toISOString();
        const transportIds = new Set(billsToProcess.filter(b => b.billType === 'transportation').map(b => b.id));
        const grindingIds = new Set(billsToProcess.filter(b => b.billType === 'grinding').map(b => b.id));

        setSavedBills(prev => prev.map(b => transportIds.has(b.id) ? { ...b, status: 'Processed', agOfficeProcessedAt: now } : b));
        setSavedGrindingBills(prev => prev.map(b => grindingIds.has(b.id) ? { ...b, status: 'Processed', agOfficeProcessedAt: now } : b));
        
        logActionWithUser('Bills Processed from AG Tray', { count: billsToProcess.length, billIds: billsToProcess.map(b => b.id) });

        for (const bill of billsToProcess) {
            setBillForCombinedPrinting(bill);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Delay for print dialog
        }
        setBillForCombinedPrinting(null); // Clear after loop
        setNotification({ message: `${billsToProcess.length} bill(s) processed and downloaded.`, type: 'success' });
    };

    const handleGenerateAGOfficeReport = (startDate: string, endDate: string) => {
        if (!startDate || !endDate) {
            setNotification({ message: 'Please select both a start and end date for the report.', type: 'error' });
            return;
        }

        const allBills: UnifiedBill[] = [
            ...savedBills.map(b => ({ ...b, billType: 'transportation' as const })),
            ...savedGrindingBills.map(b => ({ ...b, billType: 'grinding' as const })),
        ];
        
        const sentInRange = allBills.filter(b => b.agOfficeSentAt && b.agOfficeSentAt.substring(0, 10) >= startDate && b.agOfficeSentAt.substring(0, 10) <= endDate);
        const processedInRange = allBills.filter(b => b.agOfficeProcessedAt && b.agOfficeProcessedAt.substring(0, 10) >= startDate && b.agOfficeProcessedAt.substring(0, 10) <= endDate);
        
        setAgOfficeReportData({ startDate, endDate, sentBills: sentInRange, processedBills: processedInRange });
        setIsPrintingAgOfficeReport(true);
    };

    
    const viewTitles: Record<AppView, string> = {
        dashboard: 'Dashboard',
        newBill: activeBillId ? 'Edit Bill' : 'Create New Bill',
        allBills: 'All Saved Bills',
        reports: 'Reports & Analysis',
        budget: 'Budget Documents',
        orders: 'Orders & Directives',
        notifications: 'Notifications',
        grindingBills: 'Grinding Bills Management',
        agOffice: 'AG Office Tray',
    };

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-bg-main)]">
            <Header 
                currentUser={currentUser}
                onLogout={() => { logActionWithUser('Logout'); logout(); }}
                setCurrentView={setCurrentView}
                currentView={currentView}
                onChangePassword={() => setChangePasswordOpen(true)}
                onOpenSidebar={() => setSidebarOpen(true)}
            />
            {notification && (
                <div className={`fixed top-20 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} z-50 animate-fade-in flex items-center gap-2`}>
                    <ClipboardCheckIcon className="h-5 w-5" /> {notification.message}
                </div>
            )}
            <div className="flex flex-1 min-h-0">
                <SavedBillsSidebar
                    currentUser={currentUser}
                    contracts={contracts}
                    users={users}
                    setCurrentView={(view) => { setCurrentView(view); setSidebarOpen(false); }}
                    currentView={currentView}
                    onOpenUserManager={() => setUserManagerOpen(true)}
                    onOpenContractManager={() => setContractManagerOpen(true)}
                    onOpenFlourMillManager={() => setFlourMillManagerOpen(true)}
                    onOpenGrindingSettingsManager={() => setGrindingSettingsManagerOpen(true)}
                    onOpenTransportationSettingsManager={() => setTransportationSettingsManagerOpen(true)}
                    onOpenAboutModal={() => setAboutModalOpen(true)}
                    onOpenContactModal={() => setContactModalOpen(true)}
                    onImportData={handleImportData}
                    isOpen={isSidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                     <header className="mb-6 flex justify-between items-center flex-wrap gap-4">
                        {currentView !== 'dashboard' ? (
                            <nav aria-label="Breadcrumb">
                                <ol className="list-none p-0 inline-flex items-center text-sm font-medium">
                                    <li className="flex items-center">
                                        <button onClick={() => setCurrentView('dashboard')} className="text-[var(--color-text-light)] hover:text-[var(--color-text-main)]">Dashboard</button>
                                    </li>
                                    <li className="flex items-center">
                                        <ChevronRightIcon className="h-5 w-5 mx-1 text-gray-400" />
                                        <span className="text-[var(--color-text-main)] font-semibold">{viewTitles[currentView]}</span>
                                    </li>
                                </ol>
                            </nav>
                        ) : <div />}
                        {currentView === 'newBill' && (
                           <div className="flex items-center gap-2 flex-wrap">
                                {canCreateAndEdit && (
                                    <button
                                        onClick={() => handleSendToAGOffice(activeBillId!, 'transportation')}
                                        disabled={!activeBillId || billStatus !== 'Draft'}
                                        className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg shadow-lg hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                                        title={billStatus !== 'Draft' ? `Bill has already been ${billStatus}` : 'Save bill first'}
                                    >
                                        <WalletIcon className="h-5 w-5 mr-2" /> Send to AG Office
                                    </button>
                                )}
                                {activeBillId && canCreateAndEdit && (
                                    <button onClick={() => resetForm()} className="flex items-center px-4 py-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 rounded-lg shadow-sm hover:bg-[var(--color-primary)]/20 transition-colors">
                                        <PlusIcon /> New Bill
                                    </button>
                                )}
                                <button onClick={handleStandardPrint} className="flex items-center px-4 py-2 text-sm font-medium text-[var(--color-text-main)] bg-black/5 border border-[var(--color-border)] rounded-lg shadow-sm hover:bg-black/10 transition-colors">
                                    <PrintIcon className="h-5 w-5 mr-2" />
                                    Print
                                </button>
                                <button onClick={handleAuditPrint} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-lg shadow-lg hover:bg-[var(--color-primary-hover)] transition-all duration-300 transform hover:scale-105">
                                    <PrintIcon className="h-5 w-5 mr-2" />
                                    Audit
                                </button>
                                {canCreateAndEdit && <button onClick={handleSaveBill} className="px-6 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] border-none rounded-lg shadow-lg hover:bg-[var(--color-primary-hover)] transition-colors transform hover:scale-105">{activeBillId ? 'Update Bill' : 'Save Bill'}</button>}
                            </div>
                        )}
                    </header>

                    
                    {currentView === 'dashboard' && (
                        <Dashboard
                            currentUser={currentUser}
                            setCurrentView={setCurrentView}
                            onNewBill={resetForm}
                            savedBills={savedBills}
                            sanctionedBudget={sanctionedBudget}
                            setSanctionedBudget={(v) => {
                                const oldValue = sanctionedBudget;
                                setSanctionedBudget(v);
                                logActionWithUser('Budget Updated', { budgetType: 'Transportation', oldValue, newValue: v });
                            }}
                            savedGrindingBills={savedGrindingBills}
                            grindingSanctionedBudget={grindingSanctionedBudget}
                            setGrindingSanctionedBudget={(v) => {
                                const oldValue = grindingSanctionedBudget;
                                setGrindingSanctionedBudget(v);
                                logActionWithUser('Budget Updated', { budgetType: 'Grinding', oldValue, newValue: v });
                            }}
                            flourMills={flourMills}
                            contracts={contracts}
                            canCreateAndEdit={canCreateAndEdit}
                        />
                    )}
                    {currentView === 'newBill' && (
                        <fieldset disabled={!canCreateAndEdit} className="space-y-6">
                            {/* Bill Information Card */}
                            <div className="card p-4 md:p-6">
                                 <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-[var(--color-primary-light)] p-3 rounded-xl"><DocumentTextIcon className="h-8 w-8 text-[var(--color-primary)]" /></div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Bill Information</h2>
                                        <p className="text-sm text-[var(--color-text-light)]">Enter primary details of the bill.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Contractor</label>
                                        <select value={selectedContractorId ?? ''} onChange={e => handleContractorChange(parseInt(e.target.value, 10))} className="w-full px-3 py-2">
                                            <option value="" disabled>Select Contractor</option>
                                            {uniqueContractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Bill #</label>
                                        <input type="text" value={billNumber} onChange={e => setBillNumber(e.target.value)} className="w-full px-3 py-2" placeholder="e.g. M-123" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Bill Date</label>
                                        <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} className="w-full px-3 py-2" />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Bill Period <span className="text-[var(--color-danger)]">*</span></label>
                                        <input ref={billPeriodRef} type="text" value={billPeriod} onChange={e => { setBillPeriod(toTitleCase(e.target.value)); if (billPeriodError) setBillPeriodError(''); }} className={`w-full px-3 py-2 ${billPeriodError ? 'border-[var(--color-danger)]! ring-1 ring-[var(--color-danger)]' : ''}`} placeholder="e.g. October 2025" required />
                                        {billPeriodError && <p className="mt-1 text-sm text-[var(--color-danger)]">{billPeriodError}</p>}
                                    </div>
                                     <div className="lg:col-span-2 flex items-end pb-2">
                                        <p className="text-sm font-medium text-[var(--color-text-light)]">Grant No. 22</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bill Items Section */}
                            <div className="card p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[var(--color-primary-light)] p-3 rounded-xl"><TruckIcon className="h-8 w-8 text-[var(--color-primary)]" /></div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Transportation Details</h2>
                                            <p className="text-sm text-[var(--color-text-light)]">Add one or more transportation items.</p>
                                        </div>
                                    </div>
                                </div>
                                {isTransportDetailsVisible ? (
                                    <div className="overflow-x-auto -mx-4 md:-mx-6">
                                        <table className="min-w-full text-sm">
                                            <thead className="text-left bg-slate-50">
                                                <tr>
                                                    <th className="p-2 font-semibold">S#</th>
                                                    <th className="p-2 font-semibold min-w-[250px]">Contract (From → To)</th>
                                                    <th className="p-2 font-semibold min-w-[100px]">Mode</th>
                                                    <th className="p-2 font-semibold min-w-[250px]">Bag Details</th>
                                                    <th className="p-2 font-semibold min-w-[120px]">Net KGs</th>
                                                    <th className="p-2 font-semibold min-w-[100px] text-right">Rate/Kg</th>
                                                    <th className="p-2 font-semibold min-w-[120px] text-right">Amount (Rs)</th>
                                                    <th className="p-2 font-semibold"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {billItems.map((item, index) => (
                                                    <tr key={item.id} className="border-b border-[var(--color-border)] last:border-b-0">
                                                        <td className="p-2 text-center">{index + 1}</td>
                                                        <td className="p-2 align-top">
                                                            <select value={item.contract_id ?? ''} onChange={e => handleItemChange(item.id, 'contract_id', e.target.value)} className="w-full p-2" disabled={!canCreateAndEdit || !selectedContractorId}>
                                                                <option value="" disabled>Select a contract...</option>
                                                                {contractorContracts.map(c => <option key={c.contract_id} value={c.contract_id}>{`${c.from_location} → ${c.to_location}`}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="p-2 align-top">
                                                             <select value={item.mode} onChange={e => handleItemChange(item.id, 'mode', e.target.value as BillItem['mode'])} className="w-full p-2">
                                                                <option value="Normal">Normal</option>
                                                                <option value="Bardana">Bardana</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            {item.mode === 'Normal' ? (
                                                                <div>
                                                                    <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">Total Bags</label>
                                                                    <input type="number" value={item.bags} onChange={e => handleItemChange(item.id, 'bags', parseInt(e.target.value, 10) || 0)} className="w-full p-2" />
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-4">
                                                                        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={item.bagTypes.includes('PP Bags')} onChange={() => handleItemChange(item.id, 'bagTypes', 'PP Bags')}/>PP Bags</label>
                                                                        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" className="rounded" checked={item.bagTypes.includes('Jute Bags')} onChange={() => handleItemChange(item.id, 'bagTypes', 'Jute Bags')}/>Jute Bags</label>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input type="number" value={item.ppBags} placeholder="PP Bags" onChange={e => handleItemChange(item.id, 'ppBags', parseInt(e.target.value, 10) || 0)} className="w-full p-2" disabled={!item.bagTypes.includes('PP Bags')}/>
                                                                        <input type="number" value={item.juteBags} placeholder="Jute Bags" onChange={e => handleItemChange(item.id, 'juteBags', parseInt(e.target.value, 10) || 0)} className="w-full p-2" disabled={!item.bagTypes.includes('Jute Bags')}/>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-2 align-top">
                                                             {item.mode === 'Normal' ? (
                                                                <div className="w-full p-2 h-[42px] flex items-center bg-slate-100 rounded-md font-medium text-[var(--color-text-main)]">{item.netKgs.toFixed(2)}</div>
                                                            ) : (
                                                                <input type="number" step="0.01" value={item.netKgs} onChange={e => handleItemChange(item.id, 'netKgs', parseFloat(e.target.value) || 0)} className="w-full p-2" />
                                                            )}
                                                        </td>
                                                        <td className="p-2 align-top text-right">
                                                            <div className="p-2 h-[42px] flex items-center justify-end">{item.rate_per_kg > 0 ? item.rate_per_kg.toFixed(4) : '...'}</div>
                                                        </td>
                                                        <td className="p-2 align-top text-right">
                                                            <div className="p-2 h-[42px] flex items-center justify-end font-bold text-[var(--color-primary)]">{item.rs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                                        </td>
                                                        <td className="p-2 align-top">
                                                            <button onClick={() => removeItem(item.id)} className="text-[var(--color-text-light)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed transition-colors p-2" disabled={billItems.length <= 1}>
                                                                <TrashIcon className="h-6 w-6"/>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            {canCreateAndEdit && (
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan={8} className="pt-4">
                                                            <button onClick={addNewItem} className="flex items-center px-4 py-2 text-sm bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold rounded-lg hover:bg-[var(--color-primary)]/20 shadow-sm w-full sm:w-auto justify-center transition-colors">
                                                                <PlusIcon /> Add New Item
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                                        <p className="text-sm text-[var(--color-text-light)] mb-4">{selectedContractorId ? 'Click the button to start adding transport details.' : 'Please select a contractor to begin.'}</p>
                                        <button onClick={() => setIsTransportDetailsVisible(true)} disabled={!selectedContractorId} className="flex items-center mx-auto px-4 py-2 text-sm bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                                            <PlusIcon /> Add Transport Details
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Attachments Card */}
                            <div className="card p-4 md:p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-[var(--color-primary-light)] p-3 rounded-xl"><PaperclipIcon className="h-8 w-8 text-[var(--color-primary)]" /></div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[var(--color-text-main)]">Attachments</h3>
                                        <p className="text-sm text-[var(--color-text-light)]">Attach vouchers, statements, etc.</p>
                                    </div>
                                </div>
                                <div className="p-4 border-2 border-dashed border-[var(--color-border)] rounded-lg bg-slate-50">
                                    {canCreateAndEdit && (
                                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold border border-[var(--color-primary)]/20 rounded-md shadow-sm hover:bg-[var(--color-primary)]/20 transition-colors"><UploadIcon className="h-6 w-6 mr-2" /><span>Add Attachments...</span></label>
                                        <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileSelect} />
                                    </div>
                                    )}
                                    {attachments.length > 0 && (
                                        <ul className="mt-4 space-y-2">
                                            {attachments.map(att => (
                                                <li key={att.id} className="flex items-center justify-between text-sm bg-slate-100 p-2 border border-[var(--color-border)] rounded-md shadow-sm">
                                                    <div className="flex items-center truncate">
                                                        <PaperclipIcon className="h-5 w-5 mr-2 text-[var(--color-text-light)]"/>
                                                        <a href={att.dataUrl} download={att.name} className="text-[var(--color-primary)] hover:underline truncate" title={att.name}>{att.name}</a>
                                                    </div>
                                                    {canCreateAndEdit && (<button onClick={() => handleRemoveAttachment(att.id)} className="ml-4 text-[var(--color-text-light)] hover:text-[var(--color-danger)]"><TrashIcon className="h-5 w-5" /></button>)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Deductions and Totals Card */}
                            <div className="card p-4 md:p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-[var(--color-primary-light)] p-3 rounded-xl"><WalletIcon className="h-8 w-8 text-[var(--color-primary)]" /></div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-[var(--color-text-main)]">Deductions & Totals</h2>
                                        <p className="text-sm text-[var(--color-text-light)]">Review all financial calculations.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        <table className="min-w-full text-sm">
                                            <thead className="text-left text-[var(--color-text-light)] "><tr className="border-b border-[var(--color-border)]"><th colSpan={3} className="pb-2 font-semibold">Deduction of taxes/Others</th></tr></thead>
                                            <tbody>
                                                {DEDUCTION_CONFIG.map((d) => (<tr key={d.key} className="border-b border-[var(--color-border)]"><td className="py-2 text-[var(--color-text-light)] w-full">{d.label}</td><td className="py-2 text-[var(--color-text-light)] pr-2">Rs.</td><td className="py-2 text-[var(--color-text-main)] font-medium text-right">{(calculatedDeductions[d.key as keyof CalculatedDeductions] || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>))}
                                                {customDeductions.map((deduction) => (
                                                    <tr key={deduction.id}>
                                                        <td className="py-2 w-full flex items-center gap-2">
                                                            <input type="text" value={deduction.label} onChange={e => updateCustomDeduction(deduction.id, 'label', e.target.value)} className="w-full p-1 rounded-sm" placeholder="Custom deduction..." />
                                                            {canCreateAndEdit && customDeductions.length > 1 && <button type="button" onClick={() => removeCustomDeduction(deduction.id)} className="text-gray-400 hover:text-[var(--color-danger)] p-1"><TrashIcon className="h-5 w-5" /></button>}
                                                        </td>
                                                        <td className="py-2 text-[var(--color-text-light)] pr-2">Rs.</td>
                                                        <td className="py-2 text-right"><input type="number" value={deduction.value} onChange={e => updateCustomDeduction(deduction.id, 'value', parseFloat(e.target.value) || 0)} className="w-32 text-right p-1 rounded-sm" placeholder="0"/></td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={3} className="pt-2">
                                                        {canCreateAndEdit && (<button type="button" onClick={addCustomDeduction} className="flex items-center text-sm text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-hover)]"><PlusIcon /> Add Deduction Line</button>)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="space-y-4">
                                        <div><label className="block text-sm font-medium text-[var(--color-text-light)] mb-1">Penalty for days delay</label><input type="number" value={delayDays} onChange={e => setDelayDays(parseInt(e.target.value, 10) || 0)} className="w-full px-3 py-2" placeholder="Days"/></div>
                                        <div className="bg-slate-50 border border-[var(--color-border)] p-4 rounded-lg space-y-3">
                                            <div className="flex justify-between items-center text-md"><span className="font-medium text-[var(--color-text-light)]">Grand Total</span><span className="font-semibold text-[var(--color-text-main)]">Rs. {totals.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                                            <div className="flex justify-between items-center text-md"><span className="font-medium text-[var(--color-danger)]">Total Deduction</span><span className="font-semibold text-[var(--color-danger)]">Rs. {totals.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                                            <div className="flex justify-between items-center text-2xl pt-3 mt-3 border-t border-[var(--color-border)]"><span className="font-bold text-[var(--color-primary)]">Net Amount</span><span className="font-extrabold text-[var(--color-primary)]">Rs. {totals.netAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-light)] mt-2"><span className="font-bold">In Words:</span> {totals.amountInWords}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Certifications Card */}
                            <div className="card overflow-hidden">
                                <button onClick={() => setCertCollapsed(!isCertCollapsed)} className="w-full flex justify-between items-center p-4">
                                     <div className="flex items-center gap-4">
                                        <div className="bg-[var(--color-primary-light)] p-3 rounded-xl"><BadgeCheckIcon className="h-8 w-8 text-[var(--color-primary)]" /></div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[var(--color-text-main)] text-left">Certification & Signatures</h2>
                                            <p className="text-sm text-[var(--color-text-light)] text-left">Final approval and certification points.</p>
                                        </div>
                                    </div>
                                    {isCertCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
                                </button>
                                {!isCertCollapsed && (
                                <div className="p-6 pt-0 text-sm text-[var(--color-text-main)] animate-fade-in">
                                    <p className="font-bold mb-2">Certified That:</p>
                                    <ol className="list-decimal list-inside space-y-2 pl-4 text-[var(--color-text-light)]">
                                        {certificationPoints.map((point) => (
                                            <li key={point.id} className="flex items-center gap-2">
                                                <input type="text" value={point.text} onChange={e => updateCertPoint(point.id, e.target.value)} className="w-full text-sm p-1 border-0 border-b !bg-transparent focus:!ring-0 focus:!border-[var(--color-primary-hover)]" />
                                                {canCreateAndEdit && certificationPoints.length > 1 && <button type="button" onClick={() => removeCertPoint(point.id)} className="text-gray-400 hover:text-[var(--color-danger)] p-1"><TrashIcon className="h-5 w-5" /></button>}
                                            </li>
                                        ))}
                                    </ol>
                                    {canCreateAndEdit && <button type="button" onClick={addCertPoint} className="mt-4 flex items-center text-sm text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-hover)]"><PlusIcon /> Add Certification Point</button>}

                                    <div className="mt-6 text-[var(--color-text-light)]"><p className="flex items-center">Countersigned for Rs. <span className="inline-block flex-1 border-b border-gray-300 ml-2"></span></p><p className="mt-2">and forwarded to the Accounts Officer AJK Council Secretariate Accounts Office Islamabad for pre-audit and payments please. The Cheque may be issued in favour of Contractor and delivered to the authorized to the authorized official of this Directorate.</p></div>
                                    <div className="mt-20 flex flex-col md:flex-row justify-between text-center gap-12 md:gap-0"><div><p className="pt-2 border-t border-gray-400 font-semibold">Accounts Officer Food</p><p className="font-normal text-[var(--color-text-light)]">(AJK) Rawalpindi</p></div><div><p className="pt-2 border-t border-gray-400 font-semibold">Assistant Director Food(DDO)</p><p className="font-normal text-[var(--color-text-light)]">(AJK) Rawalpindi</p></div></div>
                                </div>
                                )}
                            </div>
                        </fieldset>
                    )}
                    {currentView === 'allBills' && (
                        <Database currentUser={currentUser} savedBills={savedBills} onLoadBill={handleLoadBill} onDeleteBill={onDeleteBill} onBulkDelete={onBulkDeleteBills} onPrintBill={(bill) => handleExportToPdf([bill])} onDownloadPdf={(bill) => handleExportToPdf([bill])} onShareBill={onShareBill} onDownloadFilteredPdf={handleExportToPdf} />
                    )}
                    {currentView === 'reports' && (
                        <Reports savedBills={savedBills} contractors={uniqueContractors} contracts={contracts} auditLogs={auditLogs} currentUser={currentUser}/>
                    )}
                    {(currentView === 'budget' || currentView === 'orders' || currentView === 'notifications') && (
                        <DocumentGallery
                            category={currentView}
                            documents={documents.filter(d => d.category === currentView)}
                            onUpload={handleUploadDocument}
                            onDelete={handleDeleteDocument}
                            canUpload={canUploadDocs}
                        />
                    )}
                     {currentView === 'grindingBills' && (
                        <GrindingBills
                            savedBills={savedGrindingBills}
                            setSavedBills={setSavedGrindingBills}
                            flourMills={flourMills}
                            logAction={logActionWithUser}
                            canCreateAndEdit={canCreateAndEdit}
                            isAdmin={isAdmin}
                            setNotification={setNotification}
                            setGrindingBillForPrinting={setGrindingBillForPrinting}
                            setIsForGrindingPrinting={setIsForGrindingPrinting}
                            grindingRates={grindingRates}
                            setGrindingRatesManagerOpen={setGrindingSettingsManagerOpen}
                            grindingBillSettings={grindingPrintSettings}
                            grindingBillingConfig={grindingBillingConfig}
                            handleSendToAGOffice={handleSendToAGOffice}
                        />
                    )}
                    {currentView === 'agOffice' && (isAdmin || isAGOfficeUser) && (
                        <AGOfficeTray
                            transportBills={savedBills}
                            grindingBills={savedGrindingBills}
                            onProcessAndDownload={handleProcessAndDownload}
                            onGenerateReport={handleGenerateAGOfficeReport}
                        />
                    )}
                </main>
            </div>
            <Footer />
            
            {isAdmin && isContractManagerOpen && <ContractManager isOpen={isContractManagerOpen} onClose={() => setContractManagerOpen(false)} contracts={contracts} setContracts={setContracts} logAction={logActionWithUser} setNotification={setNotification} />}
            {isAdmin && isFlourMillManagerOpen && <FlourMillManager isOpen={isFlourMillManagerOpen} onClose={() => setFlourMillManagerOpen(false)} flourMills={flourMills} setFlourMills={setFlourMills} logAction={logActionWithUser} />}
            {isAdmin && isUserManagerOpen && <UserManagement isOpen={isUserManagerOpen} onClose={() => setUserManagerOpen(false)} currentUser={currentUser} users={users} setUsers={setUsers} onSignup={signup} logAction={logActionWithUser} adminResetPassword={adminResetPassword} />}
            {isChangePasswordOpen && <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setChangePasswordOpen(false)} currentUser={currentUser} onChangePassword={changePassword} logAction={logActionWithUser} />}
            {isAboutModalOpen && <AboutDeveloperModal onClose={() => setAboutModalOpen(false)} />}
            {isContactModalOpen && <ContactUsModal onClose={() => setContactModalOpen(false)} />}
            
            {isAdmin && isGrindingSettingsManagerOpen && 
                <GrindingSettingsManager 
                    isOpen={isGrindingSettingsManagerOpen} 
                    onClose={() => setGrindingSettingsManagerOpen(false)} 
                    printSettings={grindingPrintSettings} 
                    setPrintSettings={setGrindingPrintSettings}
                    rates={grindingRates}
                    // Fix: Correctly pass the `setGrindingRates` state setter function instead of the undefined `setRates`.
                    setRates={setGrindingRates}
                    calcConfig={grindingBillingConfig}
                    setCalcConfig={setGrindingBillingConfig}
                    logAction={logActionWithUser} 
                />
            }
            {isAdmin && isTransportationSettingsManagerOpen &&
                <TransportationSettingsManager
                    isOpen={isTransportationSettingsManagerOpen}
                    onClose={() => setTransportationSettingsManagerOpen(false)}
                    settings={transportationSettings}
                    setSettings={setTransportationSettings}
                    certPoints={defaultCertPoints}
                    setCertPoints={setDefaultCertPoints}
                    logAction={logActionWithUser}
                />
            }

            <PrintLayout bills={billsForPrinting} printRef={printRef} settings={transportationSettings} />
            <AuditPrintLayout bill={auditBillForPrinting} printRef={auditPrintRef} />
            <GrindingPrintLayout bill={grindingBillForPrinting} printRef={grindingPrintRef} settings={grindingPrintSettings} />
            <AGOfficeReportPrintLayout data={agOfficeReportData} printRef={agOfficeReportPrintRef} />
            <CombinedPrintLayout 
                bill={billForCombinedPrinting}
                printRef={combinedPrintRef}
                transportationSettings={transportationSettings}
                grindingPrintSettings={grindingPrintSettings}
            />
        </div>
    );
}

export default App;
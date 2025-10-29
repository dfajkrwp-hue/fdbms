

export type UserRole = 'Admin' | 'Manager' | 'User' | 'Viewer' | 'AG Office';

export interface AuthUser {
    id: string;
    username: string;
    password?: string;
    role: UserRole;
}

export interface Contract {
    contract_id: number;
    sanctioned_no: string;
    contractor_id: number;
    contractor_name: string;
    from_location: string;
    to_location: string;
    rate_per_kg: number;
    effective_date: string;
    status: 'Active' | 'Inactive';
}

export interface FlourMill {
    id: number;
    name: string;
    district: string;
    monthlyQuota: number;
    annualQuota: number;
    sanctionedNo: string;
    sanctionedDate: string;
}

export interface BillItem {
    id: string;
    contract_id: number | null;
    from: string;
    to: string;
    bags: number;
    mode: 'Normal' | 'Bardana';
    bagTypes: string[];
    ppBags: number;
    juteBags: number;
    rate_per_kg: number;
    grossKgs: number;
    bardanaKgs: number;
    netKgs: number;
    rs: number;
}

export interface CalculatedDeductions {
    penalty: number;
    income_tax: number;
    tajveed_ul_quran: number;
    education_cess: number;
    klc: number;
    sd_current: number;
    gst_current: number;
    others: number;
    others_description: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: string;
    dataUrl: string;
}

export interface SavedBill {
    id: string;
    bill_number: string;
    bill_date: string;
    bill_period: string;
    sanctioned_no: string;
    contract_id: number | null;
    contractor_id: number;
    contractor_name: string;
    bill_items: BillItem[];
    delay_days: number;
    deductions: CalculatedDeductions;
    custom_deductions: Array<{ id: string; label: string; value: number }>;
    certification_points: Array<{ id: string; text: string }>;
    grandTotal: number;
    totalDeductions: number;
    netAmount: number;
    amountInWords: string;
    attachments: Attachment[];
    status: 'Draft' | 'Sent to AG' | 'Processed';
    agOfficeSentAt: string | null;
    agOfficeProcessedAt: string | null;
}

export interface Contractor {
    id: number;
    name: string;
}

export interface StoredDocument {
    id: string;
    title: string;
    description: string;
    category: 'budget' | 'orders' | 'notifications';
    fileName: string;
    fileType: string;
    dataUrl: string;
    uploadedAt: string;
    uploader: { id: string; username: string };
}

export interface GrindingBillCommodity {
    id: string;
    name: 'W/M Atta' | 'Fine Atta' | 'Bran';
    quantityKgs: number;
    ratePer100Kg: number;
    amount: number;
}

export interface GrindingDeductions {
    incomeTax: number;
    tajveedUlQuran: number;
    educationCess: number;
    klc: number;
    stumpDuty: number;
}

export interface OtherDeductions {
    eBags: { month: string; bags: number; rate: number; amount: number };
    branPrice: { quantity: number; rate: number; amount: number };
}

export interface SavedGrindingBill {
    id: string;
    billNumber: string;
    billDate: string;
    billPeriod: string;
    billPeriodStart: string;
    billPeriodEnd: string;
    districtForTax: string;
    sanctionedNo: string;
    sanctionedDate: string;
    flourMillId: number | null;
    flourMillName: string;
    commodities: GrindingBillCommodity[];
    totalAmount: number;
    deductions: GrindingDeductions;
    customDeductions: Array<{ id: string; label: string; value: number }>;
    totalDeduction: number;
    netAmountAfterTaxes: number;
    otherDeductions: OtherDeductions;
    amountToDirector: number;
    finalAmountToMill: number;
    amountInWords: string;
    certificationHeader: string;
    certificationHeaderDetails: string;
    status: 'Draft' | 'Sent to AG' | 'Processed';
    agOfficeSentAt: string | null;
    agOfficeProcessedAt: string | null;
    attachments: Attachment[]; // Assuming grinding bills can have attachments
}

export type UnifiedBill = (SavedBill & { billType: 'transportation' }) | (SavedGrindingBill & { billType: 'grinding' });


export interface GrindingRates {
    'W/M Atta': number;
    'Fine Atta': number;
    'Bran': number;
}

export interface GrindingBillSettings {
    signatory1: string;
    signatory2: string;
    certificationHeader: string;
    certificationHeaderDetails: string;
    footerNote1: string;
    footerNote2: string;
}

export interface BillingSettings {
    NORMAL_MODE: { KG_PER_BAG: number; };
    BARDANA_MODE: { PP_BAG_BARDANA_KG: number; JUTE_BAG_BARDANA_KG: number; };
    DEDUCTIONS: {
        INCOME_TAX_RATE: number;
        TAJVEED_UL_QURAN_RATE: number;
        EDUCATION_CESS_RATE: number;
        KLC_RATE: number;
        SD_CURRENT_RATE: number;
        GST_CURRENT_RATE: number;
        PENALTY_PER_DAY: number;
    };
}

export interface DefaultCertPoint {
    id: string;
    text: string;
}

export interface GrindingBillingConfig {
    DEDUCTIONS: {
        INCOME_TAX_RATE: number;
        TAJVEED_UL_QURAN_RATE: number;
        EDUCATION_CESS_RATE: number;
        KLC_RATE: number;
        STUMP_DUTY_RATE: number;
    };
    OTHER_DEDUCTIONS: {
        E_BAGS_RATE: number;
        BRAN_PRICE_RATE: number;
    };
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    username: string;
    action: string;
    details: Record<string, any>;
}
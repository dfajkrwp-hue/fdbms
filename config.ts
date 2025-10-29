// config.ts

export const BILLING_CONFIG = {
    NORMAL_MODE: {
        KG_PER_BAG: 20
    },
    BARDANA_MODE: {
        PP_BAG_BARDANA_KG: 0.115,
        JUTE_BAG_BARDANA_KG: 1.0,
    },
    DEDUCTIONS: {
        INCOME_TAX_RATE: 0.06,
        TAJVEED_UL_QURAN_RATE: 10, // Per 1000
        EDUCATION_CESS_RATE: 0.10, // of Income Tax
        KLC_RATE: 0.001,
        SD_CURRENT_RATE: 0.0025,
        GST_CURRENT_RATE: 0.15,
        PENALTY_PER_DAY: 100,
    }
};

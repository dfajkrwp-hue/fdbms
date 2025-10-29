import type { Contract, FlourMill, GrindingBillSettings, DefaultCertPoint, GrindingRates, GrindingBillingConfig } from './types';

export const LOGO_URL = 'https://ajk.gov.pk/wp-content/uploads/2022/10/AzadKashmirSeal.png';

export const MOCK_DISTRICTS = ['Rawalpindi', 'Islamabad', 'Mirpur', 'Muzaffarabad', 'Bhimber', 'Kotli', 'Poonch', 'Bagh', 'Haveli', 'Sudhnoti', 'Neelum'];

export const MOCK_CONTRACTS: Contract[] = [
    {
        "contract_id": 1,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "Hafizabad /Sargodha",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 4.2155,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 2,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Hafizabad /Sargodha",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 4.4599,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 3,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Hafizabad /Sargodha",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 4.1985,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 4,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Hafizabad /Sargodha",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 5.1455,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 5,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "T.T Sing",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 5.7455,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 6,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "T.T Sing",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 6.3399,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 7,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "T.T Sing",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 4.9486,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 8,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "T.T Sing",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 5.8455,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 9,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "T.T Sing",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 7.8374,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 10,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "Pak Patan/Sahiwal",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 5.2955,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 11,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Pak Patan/Sahiwal",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 6.4299,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 12,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Pak Patan/Sahiwal",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 6.2755,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 13,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "Pak Patan/Sahiwal",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 6.2461,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 14,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Pak Patan/Sahiwal",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 8.2607,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 15,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "Layya",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 6.1455,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 16,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 5,
        "contractor_name": "Raja M. Azad Khan & Co.",
        "from_location": "Layya",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 7.45,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 17,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Layya",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 6.5155,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 18,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "Layya",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 6.37,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 19,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Layya",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 9.1655,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 20,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "Khaniwal",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 6.4455,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 21,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Khaniwal",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 7.0339,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 22,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Khaniwal",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 6.9855,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 23,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "Khaniwal",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 6.8055,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 24,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Khaniwal",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 9.1855,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 25,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Okara",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 5.7474,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 26,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Okara",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 6.4955,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 27,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "Vehari",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 6.5855,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 28,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Vehari",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 7.1505,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 29,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Vehari",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 6.8255,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 30,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "Vehari",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 6.6963,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 31,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Vehari",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 6.2105,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 32,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "B.Nagar",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 6.5755,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 33,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "B.Nagar",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 7.1405,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 34,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "B.Nagar",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 6.8255,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 35,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "B.Nagar",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 6.6963,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 36,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "B.Nagar",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 9.2095,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 37,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "Alipur",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 6.995,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 38,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Alipur",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 7.1435,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 39,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Alipur",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 6.9683,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 40,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "Alipur",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 6.9785,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 41,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Alipur",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 9.8745,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 42,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 6,
        "contractor_name": "Sadar Ibrar Ahmed",
        "from_location": "Borewala",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 6.6929,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 43,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Borewala",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 7.0406,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 44,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Borewala",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 6.8855,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 45,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "Borewala",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 6.8855,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 46,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Borewala",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 9.2675,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 47,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "Multan/Lohdran",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 6.9515,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 48,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Multan/Lohdran",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 7.3045,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 49,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Multan/Lohdran",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 7.0655,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 50,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "Multan/Lohdran",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 7.0491,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 51,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Multan/Lohdran",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 9.5835,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 52,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "Khanpur",
        "to_location": "Base Godown Isb",
        "rate_per_kg": 8.89,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 53,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 2,
        "contractor_name": "Aamir Khatab & Co.",
        "from_location": "Khanpur",
        "to_location": "U.K Flour Mills Rawat",
        "rate_per_kg": 9.0866,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 54,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 3,
        "contractor_name": "Sardar Altaf Hussain",
        "from_location": "Khanpur",
        "to_location": "B.G/Mangla F.M Mirpur New Fine FM Mirpur",
        "rate_per_kg": 8.8479,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 55,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 4,
        "contractor_name": "Muhammad Waseem Khan",
        "from_location": "Khanpur",
        "to_location": "Saddiqui F.M Jatlan",
        "rate_per_kg": 8.8155,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 56,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 7,
        "contractor_name": "Sardar Imtiaz Ahmed & Co",
        "from_location": "Khanpur",
        "to_location": "Pak Kashmir F.M Dudyal",
        "rate_per_kg": 12.4983,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 57,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "BG Islamabad",
        "to_location": "Poonch FM Arja",
        "rate_per_kg": 4.89,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 58,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 1,
        "contractor_name": "Sarwar Khan & Co.",
        "from_location": "BG Islamabad",
        "to_location": "Suduzai FM Azadpatan",
        "rate_per_kg": 2.8349,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 59,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 8,
        "contractor_name": "Bashir Ahmed Abbasi & Co.",
        "from_location": "BG Islamabad",
        "to_location": "Neelum FM Mzd.(via-Abtbad)(I.R)",
        "rate_per_kg": 6.65,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 60,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 8,
        "contractor_name": "Bashir Ahmed Abbasi & Co.",
        "from_location": "BG Islamabad",
        "to_location": "Gillani FM Kohala(viaAbtbad)(I.R)",
        "rate_per_kg": 6.9,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 61,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 9,
        "contractor_name": "Attique Urehman",
        "from_location": "Siddiqui FM Jatlan",
        "to_location": "Seri",
        "rate_per_kg": 5.2091,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 62,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 9,
        "contractor_name": "Attique Urehman",
        "from_location": "Siddiqui FM Jatlan",
        "to_location": "Khuritta",
        "rate_per_kg": 5.0391,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 63,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 10,
        "contractor_name": "Mehmood Ahmed Khan",
        "from_location": "Itifaq FM Sensa",
        "to_location": "Dharbazar",
        "rate_per_kg": 3.2299,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 64,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 10,
        "contractor_name": "Mehmood Ahmed Khan",
        "from_location": "Itifaq FM Sensa",
        "to_location": "Mandhol",
        "rate_per_kg": 3.1899,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 65,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 11,
        "contractor_name": "Yasir Javed",
        "from_location": "Gillani FM Kohalla",
        "to_location": "Chamankot",
        "rate_per_kg": 1.5222,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 66,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 11,
        "contractor_name": "Yasir Javed",
        "from_location": "Gillani FM Kohalla",
        "to_location": "Dhirkot",
        "rate_per_kg": 2.0123,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 67,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 5,
        "contractor_name": "Raja M. Azad Khan & Co.",
        "from_location": "Gillani FM Kohalla",
        "to_location": "Bagh",
        "rate_per_kg": 3.1624,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 68,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 12,
        "contractor_name": "Naseer & Co",
        "from_location": "Gillani FM Kohalla",
        "to_location": "Ghaziabad",
        "rate_per_kg": 2.7786,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 69,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 13,
        "contractor_name": "Raja Sabir Hussain",
        "from_location": "Gillani FM Kohalla",
        "to_location": "Rangla",
        "rate_per_kg": 3.57,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 70,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 5,
        "contractor_name": "Raja M. Azad Khan & Co.",
        "from_location": "Gillani FM Kohalla",
        "to_location": "Sudan Gali",
        "rate_per_kg": 4.4724,
        "effective_date": "2025-10-06",
        "status": "Active"
    },
    {
        "contract_id": 71,
        "sanctioned_no": "M-1( ) /DF/11300-03/2025 dated 06 Oct, 2025",
        "contractor_id": 14,
        "contractor_name": "Khursheed Ahmed Mughal",
        "from_location": "Poonch FM Arja",
        "to_location": "Doba / Prongi Bala",
        "rate_per_kg": 8.9813,
        "effective_date": "2025-10-06",
        "status": "Active"
    }
];

export const MOCK_FLOUR_MILLS: FlourMill[] = [
    { id: 1, name: 'Neelum Flour Mills Mzfd', district: 'Mzd.', monthlyQuota: 3600, annualQuota: 43200, sanctionedNo: 'SF 34', sanctionedDate: '2011' },
    { id: 2, name: 'Gillani Flour Mills Kohala', district: 'Bagh', monthlyQuota: 2500, annualQuota: 30000, sanctionedNo: 'SF 35', sanctionedDate: '2012' },
    { id: 3, name: 'Poonch Flour Mills Arja', district: 'Bagh', monthlyQuota: 1850, annualQuota: 22200, sanctionedNo: 'SF 36', sanctionedDate: '2013' },
    { id: 4, name: 'Jadeed Flour Mills Gorah', district: 'Sudhnoti', monthlyQuota: 1800, annualQuota: 21600, sanctionedNo: '', sanctionedDate: '' },
    { id: 5, name: 'Sodozai Flour Mills Azadpatan', district: 'Sudhnoti', monthlyQuota: 1800, annualQuota: 43200, sanctionedNo: 'SF 37', sanctionedDate: '2008' },
    { id: 6, name: 'Mangla Flour Mills Mirpur', district: 'Mirpur', monthlyQuota: 3000, annualQuota: 36000, sanctionedNo: 'SF 38', sanctionedDate: '2005' },
    { id: 7, name: 'New Fine Flour Mills Mirpur', district: 'Mirpur', monthlyQuota: 300, annualQuota: 3600, sanctionedNo: 'SF 39', sanctionedDate: '2004' },
    { id: 8, name: 'Saddiqui Flour Mills Jatlan', district: 'Bhimber', monthlyQuota: 3000, annualQuota: 36000, sanctionedNo: 'SF 40', sanctionedDate: '1980' },
    { id: 9, name: 'Pak Kashmir F.M Dudyal', district: 'Mirpur', monthlyQuota: 3000, annualQuota: 36000, sanctionedNo: 'SF 41', sanctionedDate: '1985' },
    { id: 10, name: 'Itefaq Flour Mills Sehnsa', district: 'Kotli', monthlyQuota: 3000, annualQuota: 36000, sanctionedNo: 'SF 42', sanctionedDate: '1996' },
    { id: 11, name: 'United Kashmir Flour Mills Rawat', district: 'Islamabad', monthlyQuota: 1875, annualQuota: 22500, sanctionedNo: 'SF 43', sanctionedDate: '1998' },
    { id: 12, name: 'Kashmir United Flour Mills Sihala', district: 'Islamabad', monthlyQuota: 0, annualQuota: 0, sanctionedNo: 'SF 44', sanctionedDate: '2000' },
    { id: 13, name: 'Muzaffarabad Flour & General Mills (Pvt). Ltd.', district: 'Muzaffarabad', monthlyQuota: 800, annualQuota: 9600, sanctionedNo: 'SF 55', sanctionedDate: '2001' }
];

export const DEFAULT_CERT_POINTS: DefaultCertPoint[] = [
    { id: '1', text: 'The amount claimed in the bill is claimed for the first time.' },
    { id: '2', text: 'The Amount of this bill was not claimed previously' },
    { id: '3', text: 'The above mentioned Qty has actually been lifted by the Contractor.' },
    { id: '4', text: 'Verified statements are attached' },
    { id: '5', text: 'The bill prepared is correct.' },
    { id: '6', text: 'The bill prepared have been claimed in accordance with the sanctioned rates.' },
    { id: '7', text: 'The amount of shortage has been recovered from the bill in full from contractor (if any).' },
    { id: '8', text: 'If any deduction in the taxes imposed by this bill is required, the Department should be informed accordingly' },
];

export const DEFAULT_GRINDING_RATES: GrindingRates = {
    'W/M Atta': 0,
    'Fine Atta': 233.64,
    'Bran': 230.32,
};

export const DEFAULT_GRINDING_SETTINGS: GrindingBillSettings = {
    signatory1: 'Accounts Officer Food\n(AJK) Rawalpindi',
    signatory2: 'Assistant Director Food(DDO)\n(AJK) Rawalpindi',
    certificationHeader: 'Certified That:-',
    certificationHeaderDetails: 'The grinding charges of I/Wheat have been claimed as per rates mentioned in Govt. notification No. M-1()/DF/SO-II/2025 dated 25 Oct, 2025. The amount of bill has been calculated correctly and the bill is correct in all respects.',
    footerNote1: 'Pre-audited and passed for Rs. _____________/-',
    footerNote2: 'Cheque may be issued in favour of Flour Mills and delivered to the authorized official of this Directorate for which a proper receipt will be submitted in due course.',
};

export const GRINDING_BILLING_CONFIG: GrindingBillingConfig = {
    DEDUCTIONS: {
        INCOME_TAX_RATE: 0.08,
        TAJVEED_UL_QURAN_RATE: 5, // per 1000
        EDUCATION_CESS_RATE: 0.10, // of Income Tax
        KLC_RATE: 1, // per 1000
        STUMP_DUTY_RATE: 0.0025,
    },
    OTHER_DEDUCTIONS: {
        E_BAGS_RATE: 200,
        BRAN_PRICE_RATE: 45,
    },
};
export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  share: number;
  isMinor: boolean;
}

export interface Asset {
  id: string;
  type: string;
  category: "immovable" | "movable" | "financial" | "digital" | "other";
  description: string;
  estimatedValue: number;
  assignedTo: string;
  accountNumber?: string;
  location?: string;
}

export interface Witness {
  id: string;
  name: string;
  address: string;
  relation: string;
}

export interface Codicil {
  id: string;
  date: string;
  description: string;
}

export interface WillData {
  testatorName: string;
  testatorAge: string;
  religion: string;
  address: string;
  beneficiaries: Beneficiary[];
  assets: Asset[];
  executorName: string;
  executorAddress: string;
  guardianName: string;
  witnesses: Witness[];
  codicils: Codicil[];
  specialInstructions: string;
  funeralWishes: string;
  charitableDonations: string;
}

export const ASSET_TYPES: Record<string, { label: string; category: Asset["category"] }> = {
  "Residential Property": { label: "Residential Property", category: "immovable" },
  "Commercial Property": { label: "Commercial Property", category: "immovable" },
  "Agricultural Land": { label: "Agricultural Land", category: "immovable" },
  "Bank Account": { label: "Bank Account", category: "financial" },
  "Fixed Deposit": { label: "Fixed Deposit", category: "financial" },
  "Mutual Funds": { label: "Mutual Funds", category: "financial" },
  "Shares/Stocks": { label: "Shares/Stocks", category: "financial" },
  "PPF/EPF": { label: "PPF/EPF", category: "financial" },
  "Insurance Policy": { label: "Insurance Policy", category: "financial" },
  "NPS Account": { label: "NPS Account", category: "financial" },
  "Gold/Jewellery": { label: "Gold/Jewellery", category: "movable" },
  "Vehicle": { label: "Vehicle", category: "movable" },
  "Art/Collectibles": { label: "Art/Collectibles", category: "movable" },
  "Furniture/Electronics": { label: "Furniture/Electronics", category: "movable" },
  "Cryptocurrency": { label: "Cryptocurrency", category: "digital" },
  "Domain Names": { label: "Domain Names", category: "digital" },
  "Social Media Accounts": { label: "Social Media Accounts", category: "digital" },
  "Digital Content/IP": { label: "Digital Content/IP", category: "digital" },
  "Online Wallets": { label: "Online Wallets", category: "digital" },
  "Business Interest": { label: "Business Interest", category: "other" },
  "Intellectual Property": { label: "Intellectual Property", category: "other" },
  "Loans Receivable": { label: "Loans Receivable", category: "other" },
};

export const RELATIONSHIPS = [
  "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister",
  "Grandson", "Granddaughter", "Son-in-law", "Daughter-in-law",
  "Nephew", "Niece", "Friend", "Charity/Trust", "Other"
];

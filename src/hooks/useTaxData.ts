import { useState, useEffect, useCallback } from 'react';

export interface SalaryData {
  employerName: string;
  officeAddress: string;
  employmentNature: string;
  employerTAN: string;
  employerPAN: string;
  incomeData: Array<{
    particulars: string;
    income: string;
    exemption: string;
    taxableIncome: string;
  }>;
}

export interface CapitalGainsData {
  shares: AssetEntry[];
  mutualFunds: AssetEntry[];
  property: AssetEntry[];
  crypto: AssetEntry[];
}

export interface AssetEntry {
  id: string;
  assetName: string;
  dateOfPurchase: string;
  dateOfSale: string;
  purchasePrice: number;
  salePrice: number;
  expenses: number;
  capitalGain: number;
}

export interface BusinessData {
  presumptiveIncome: {
    grossReceipts: number;
    presumptiveRate: number;
    presumptiveIncome: number;
  };
  regularIncome: {
    grossReceipts: number;
    expenses: number;
    netIncome: number;
  };
}

export interface DeductionsData {
  [section: string]: number;
}

export interface TaxDataSummary {
  salary: {
    data: SalaryData | null;
    total: number;
    grossIncome: number;
    hasData: boolean;
  };
  capitalGains: {
    data: CapitalGainsData | null;
    total: number;
    hasData: boolean;
    hasShares: boolean;
    hasMutualFunds: boolean;
    hasProperty: boolean;
    hasCrypto: boolean;
  };
  business: {
    data: BusinessData | null;
    total: number;
    hasData: boolean;
    isPresumptive: boolean;
  };
  houseProperty: {
    total: number;
    hasData: boolean;
  };
  otherSources: {
    total: number;
    hasData: boolean;
  };
  deductions: {
    data: DeductionsData | null;
    total: number;
    hasData: boolean;
  };
  grossTotal: number;
  totalDeductions: number;
  taxableIncome: number;
}

const safeParseJSON = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const safeParseNumber = (key: string): number => {
  const val = parseFloat(localStorage.getItem(key) || '0');
  return isNaN(val) ? 0 : val;
};

export const useTaxData = (): TaxDataSummary => {
  const [, setTick] = useState(0);

  // Listen for storage changes (cross-tab) and custom events (same-tab)
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    window.addEventListener('storage', refresh);
    window.addEventListener('taxDataUpdated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('taxDataUpdated', refresh);
    };
  }, [refresh]);

  const salaryData = safeParseJSON<SalaryData>('salary_data');
  const salaryTotal = safeParseNumber('salary_total');
  const salaryGross = salaryData?.incomeData?.reduce(
    (sum, row) => sum + (parseFloat(row.income) || 0), 0
  ) || 0;

  const cgData = safeParseJSON<CapitalGainsData>('cg_data');
  const cgTotal = safeParseNumber('cg_total');
  const hasAssets = (arr?: AssetEntry[]) => (arr || []).some(a => a.assetName || a.purchasePrice > 0 || a.salePrice > 0);

  const bpData = safeParseJSON<BusinessData>('bp_data');
  const bpTotal = safeParseNumber('pgbp_total');

  const hpTotal = safeParseNumber('hp_total');

  const osTotal = safeParseNumber('os_total');

  const deductionsData = safeParseJSON<DeductionsData>('deductions_data');
  const deductionsTotal = safeParseNumber('deductions_total');

  const grossTotal = salaryTotal + Math.max(cgTotal, 0) + bpTotal + hpTotal + osTotal;
  const taxableIncome = Math.max(0, grossTotal - deductionsTotal);

  return {
    salary: {
      data: salaryData,
      total: salaryTotal,
      grossIncome: salaryGross,
      hasData: salaryTotal > 0 || !!salaryData?.employerName,
    },
    capitalGains: {
      data: cgData,
      total: cgTotal,
      hasData: cgTotal !== 0 || hasAssets(cgData?.shares),
      hasShares: hasAssets(cgData?.shares),
      hasMutualFunds: hasAssets(cgData?.mutualFunds),
      hasProperty: hasAssets(cgData?.property),
      hasCrypto: hasAssets(cgData?.crypto),
    },
    business: {
      data: bpData,
      total: bpTotal,
      hasData: bpTotal > 0,
      isPresumptive: (bpData?.presumptiveIncome?.presumptiveIncome || 0) >= (bpData?.regularIncome?.netIncome || 0),
    },
    houseProperty: {
      total: hpTotal,
      hasData: hpTotal !== 0,
    },
    otherSources: {
      total: osTotal,
      hasData: osTotal > 0,
    },
    deductions: {
      data: deductionsData,
      total: deductionsTotal,
      hasData: deductionsTotal > 0,
    },
    grossTotal,
    totalDeductions: deductionsTotal,
    taxableIncome,
  };
};

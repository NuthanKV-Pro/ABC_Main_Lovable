import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface PopulateFieldNumeric {
  key: string;
  setter: (value: number) => void;
  defaultValue: number;
  label?: string;
}

export interface PopulateFieldString {
  key: string;
  setter: (value: string) => void;
  defaultValue: string;
  label?: string;
}

export type PopulateField = PopulateFieldNumeric | PopulateFieldString;

export interface PopulatedInfo {
  fieldKey: string;
  source: string;
  value: number | string;
}

const SOURCE_LABELS: Record<string, string> = {
  salary_total: "Salary",
  fhs_monthlyIncome: "Health Score",
  fhs_age: "Health Score",
  fhs_monthlyExpenses: "Health Score",
  fhs_totalInvestments: "Health Score",
  fhs_monthlySavings: "Health Score",
  fhs_emergencyFund: "Health Score",
  fhs_monthlyDebtPayment: "Health Score",
  fhs_totalDebt: "Health Score",
  net_worth_assets: "Net Worth",
  net_worth_liabilities: "Net Worth",
  sip_monthly: "SIP Calculator",
};

function getNum(key: string) {
  const v = parseFloat(localStorage.getItem(key) || "0");
  return !isNaN(v) && v > 0 ? v : 0;
}

function getProfile(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("user_profile") || "{}");
  } catch {
    return {};
  }
}

function resolveWithSource(key: string): { value: number | string; source: string } {
  const profile = getProfile();

  // === STRING FIELDS ===
  
  // PAN - priority: sync_pan > profile.pan
  if (key === "pan") {
    const syncPan = localStorage.getItem("sync_pan");
    if (syncPan && syncPan.length === 10) {
      return { value: syncPan, source: "My Profile" };
    }
    if (profile.pan && profile.pan.length === 10 && profile.pan !== "ABCDE1234F") {
      return { value: profile.pan, source: "Profile Settings" };
    }
    return { value: "", source: "" };
  }

  // Name - from profile
  if (key === "name") {
    if (profile.name && profile.name !== "Shankaran Pillai") {
      return { value: profile.name, source: "Profile Settings" };
    }
    return { value: "", source: "" };
  }

  // Address - from profile
  if (key === "address") {
    if (profile.address) {
      return { value: profile.address, source: "Profile Settings" };
    }
    return { value: "", source: "" };
  }

  // Email - from profile
  if (key === "email") {
    if (profile.email) {
      return { value: profile.email, source: "Profile Settings" };
    }
    return { value: "", source: "" };
  }

  // Phone - from profile
  if (key === "phone") {
    if (profile.phone) {
      return { value: profile.phone, source: "Profile Settings" };
    }
    return { value: "", source: "" };
  }

  // Assessee Type - from profile
  if (key === "assesseeType") {
    if (profile.assesseeType) {
      return { value: profile.assesseeType, source: "Profile Settings" };
    }
    return { value: "", source: "" };
  }

  // === NUMERIC FIELDS ===

  // Age - priority: sync_age > fhs_age > derived from DOB
  if (key === "age" || key === "fhs_age") {
    const syncAge = getNum("sync_age");
    if (syncAge > 0) return { value: syncAge, source: "My Profile" };
    const fhsAge = getNum("fhs_age");
    if (fhsAge > 0) return { value: fhsAge, source: "Health Score" };
    // Derive from DOB if available
    if (profile.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      if (today.getMonth() < dob.getMonth() || 
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age > 0 && age < 120) return { value: age, source: "Profile Settings" };
    }
    return { value: 0, source: "" };
  }

  // Sync key mapping - checked first for all numeric fields
  const syncMap: Record<string, string> = {
    monthlyIncome: "sync_monthlyIncome",
    fhs_monthlyExpenses: "sync_monthlyExpenses",
    monthlyExpenses: "sync_monthlyExpenses",
    fhs_totalInvestments: "sync_totalInvestments",
    totalInvestments: "sync_totalInvestments",
    fhs_monthlySavings: "sync_monthlySavings",
    monthlySavings: "sync_monthlySavings",
    fhs_emergencyFund: "sync_emergencyFund",
    emergencyFund: "sync_emergencyFund",
    fhs_monthlyDebtPayment: "sync_monthlyDebtPayment",
    monthlyDebtPayment: "sync_monthlyDebtPayment",
    fhs_totalDebt: "sync_totalDebt",
    totalDebt: "sync_totalDebt",
  };

  const syncKey = syncMap[key];
  if (syncKey) {
    const syncVal = getNum(syncKey);
    if (syncVal > 0) return { value: syncVal, source: "My Profile" };
  }

  // Derived income sources
  const salaryTotal = getNum("salary_total");
  const incomeFromSalary = salaryTotal > 0 ? Math.round(salaryTotal / 12) : 0;
  const fhsIncome = getNum("fhs_monthlyIncome");

  switch (key) {
    // Monthly Income - priority: sync > salary > health score
    case "monthlyIncome": {
      if (incomeFromSalary > 0) return { value: incomeFromSalary, source: "Salary" };
      if (fhsIncome > 0) return { value: fhsIncome, source: "Health Score" };
      return { value: 0, source: "" };
    }

    // Salary-derived monthly income
    case "salaryMonthlyIncome": {
      if (incomeFromSalary > 0) return { value: incomeFromSalary, source: "Salary" };
      return { value: 0, source: "" };
    }

    // Annual income (from salary)
    case "annualIncome": {
      if (salaryTotal > 0) return { value: salaryTotal, source: "Salary" };
      if (fhsIncome > 0) return { value: fhsIncome * 12, source: "Health Score" };
      return { value: 0, source: "" };
    }

    // Monthly Savings - from health score or SIP calculator
    case "monthlySavings": {
      const fhsSavings = getNum("fhs_monthlySavings");
      if (fhsSavings > 0) return { value: fhsSavings, source: "Health Score" };
      const sipMonthly = getNum("sip_monthly");
      if (sipMonthly > 0) return { value: sipMonthly, source: "SIP Calculator" };
      return { value: 0, source: "" };
    }

    // Monthly Expenses
    case "monthlyExpenses":
    case "fhs_monthlyExpenses": {
      const v = getNum("fhs_monthlyExpenses");
      if (v > 0) return { value: v, source: "Health Score" };
      return { value: 0, source: "" };
    }

    // Total Investments - from health score or net worth
    case "totalInvestments":
    case "fhs_totalInvestments": {
      const fhsVal = getNum("fhs_totalInvestments");
      if (fhsVal > 0) return { value: fhsVal, source: "Health Score" };
      const nwAssets = getNum("net_worth_assets");
      if (nwAssets > 0) return { value: nwAssets, source: "Net Worth" };
      return { value: 0, source: "" };
    }

    // Total Debt - from health score or net worth
    case "totalDebt":
    case "fhs_totalDebt": {
      const fhsVal = getNum("fhs_totalDebt");
      if (fhsVal > 0) return { value: fhsVal, source: "Health Score" };
      const nwLiab = getNum("net_worth_liabilities");
      if (nwLiab > 0) return { value: nwLiab, source: "Net Worth" };
      return { value: 0, source: "" };
    }

    // Emergency Fund
    case "emergencyFund":
    case "fhs_emergencyFund": {
      const v = getNum("fhs_emergencyFund");
      if (v > 0) return { value: v, source: "Health Score" };
      return { value: 0, source: "" };
    }

    // Monthly Debt Payment
    case "monthlyDebtPayment":
    case "fhs_monthlyDebtPayment": {
      const v = getNum("fhs_monthlyDebtPayment");
      if (v > 0) return { value: v, source: "Health Score" };
      return { value: 0, source: "" };
    }

    // Default: try to get from localStorage with source label
    default: {
      const v = getNum(key);
      return { value: v, source: SOURCE_LABELS[key] || "Saved Data" };
    }
  }
}

/**
 * Reads localStorage keys on mount and auto-populates fields.
 * Returns info about which fields were populated and their sources.
 */
export function useAutoPopulate(fields: PopulateField[]): {
  populatedFields: Map<string, PopulatedInfo>;
  resetField: (fieldKey: string) => void;
} {
  const ran = useRef(false);
  const [populatedFields, setPopulatedFields] = useState<Map<string, PopulatedInfo>>(new Map());

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const populated = new Map<string, PopulatedInfo>();

    for (const field of fields) {
      const { value, source } = resolveWithSource(field.key);
      const hasValue = typeof value === "string" ? value.length > 0 : value > 0;
      if (hasValue && value !== field.defaultValue) {
        // Type-safe setter call
        if (typeof value === "string" && typeof field.defaultValue === "string") {
          (field.setter as (v: string) => void)(value);
        } else if (typeof value === "number" && typeof field.defaultValue === "number") {
          (field.setter as (v: number) => void)(value);
        }
        populated.set(field.key, { fieldKey: field.key, source, value });
      }
    }

    if (populated.size > 0) {
      setPopulatedFields(populated);
      toast({
        title: "Pre-filled from your saved data",
        description: `${populated.size} field${populated.size > 1 ? "s" : ""} auto-populated from other tools.`,
      });
    }
  }, []);

  const resetField = (fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey);
    if (field) {
      if (typeof field.defaultValue === "string") {
        (field.setter as (v: string) => void)(field.defaultValue);
      } else {
        (field.setter as (v: number) => void)(field.defaultValue);
      }
      setPopulatedFields(prev => {
        const next = new Map(prev);
        next.delete(fieldKey);
        return next;
      });
    }
  };

  return { populatedFields, resetField };
}

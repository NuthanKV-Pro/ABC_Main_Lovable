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
};

function getNum(key: string) {
  const v = parseFloat(localStorage.getItem(key) || "0");
  return !isNaN(v) && v > 0 ? v : 0;
}

function resolveWithSource(key: string): { value: number | string; source: string } {
  // Handle PAN from profile
  if (key === "pan") {
    const syncPan = localStorage.getItem("sync_pan");
    if (syncPan && syncPan.length === 10) {
      return { value: syncPan, source: "My Profile" };
    }
    try {
      const profile = JSON.parse(localStorage.getItem("user_profile") || "{}");
      if (profile.pan && profile.pan.length === 10 && profile.pan !== "ABCDE1234F") {
        return { value: profile.pan, source: "Profile Settings" };
      }
    } catch {}
    return { value: "", source: "" };
  }

  const salaryTotal = getNum("salary_total");
  const incomeFromSalary = salaryTotal > 0 ? Math.round(salaryTotal / 12) : 0;
  const fhsIncome = getNum("fhs_monthlyIncome");

  // Check sync_ keys first (from "Sync All Tools")
  const syncMap: Record<string, string> = {
    monthlyIncome: "sync_monthlyIncome",
    fhs_age: "sync_age",
    fhs_monthlyExpenses: "sync_monthlyExpenses",
    fhs_totalInvestments: "sync_totalInvestments",
    fhs_monthlySavings: "sync_monthlySavings",
    fhs_emergencyFund: "sync_emergencyFund",
    fhs_monthlyDebtPayment: "sync_monthlyDebtPayment",
    fhs_totalDebt: "sync_totalDebt",
  };

  const syncKey = syncMap[key];
  if (syncKey) {
    const syncVal = getNum(syncKey);
    if (syncVal > 0) return { value: syncVal, source: "My Profile" };
  }

  switch (key) {
    case "monthlyIncome": {
      if (incomeFromSalary > 0) return { value: incomeFromSalary, source: "Salary" };
      if (fhsIncome > 0) return { value: fhsIncome, source: "Health Score" };
      return { value: 0, source: "" };
    }
    case "salaryMonthlyIncome":
      return { value: incomeFromSalary, source: "Salary" };
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

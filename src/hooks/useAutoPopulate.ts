import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

type Setter<T> = (value: T) => void;

export interface PopulateField {
  key: string;
  setter: Setter<number>;
  defaultValue: number;
  label?: string; // human-readable field name
}

export interface PopulatedInfo {
  fieldKey: string;
  source: string;
  value: number;
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

function resolveWithSource(key: string): { value: number; source: string } {
  const salaryTotal = getNum("salary_total");
  const incomeFromSalary = salaryTotal > 0 ? Math.round(salaryTotal / 12) : 0;
  const fhsIncome = getNum("fhs_monthlyIncome");

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

    for (const { key, setter, defaultValue } of fields) {
      const { value, source } = resolveWithSource(key);
      if (value > 0 && value !== defaultValue) {
        setter(value);
        populated.set(key, { fieldKey: key, source, value });
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
      field.setter(field.defaultValue);
      setPopulatedFields(prev => {
        const next = new Map(prev);
        next.delete(fieldKey);
        return next;
      });
    }
  };

  return { populatedFields, resetField };
}

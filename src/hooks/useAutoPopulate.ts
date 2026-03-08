import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

type Setter<T> = (value: T) => void;

interface PopulateField {
  key: string;
  setter: Setter<number>;
  defaultValue: number;
}

/**
 * Reads localStorage keys on mount and auto-populates fields
 * that still hold their default value. Shows a toast if any were filled.
 */
export function useAutoPopulate(fields: PopulateField[]) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const getNum = (key: string) => {
      const v = parseFloat(localStorage.getItem(key) || "0");
      return !isNaN(v) && v > 0 ? v : 0;
    };

    const salaryTotal = getNum("salary_total");
    const incomeFromSalary = salaryTotal > 0 ? Math.round(salaryTotal / 12) : 0;
    const fhsIncome = getNum("fhs_monthlyIncome");

    // Helper: resolve a source key to a value
    const resolve = (key: string): number => {
      switch (key) {
        case "monthlyIncome":
          return incomeFromSalary || fhsIncome;
        case "fhs_age":
          return getNum("fhs_age");
        case "fhs_monthlyExpenses":
          return getNum("fhs_monthlyExpenses");
        case "fhs_totalInvestments":
          return getNum("fhs_totalInvestments");
        case "fhs_monthlySavings":
          return getNum("fhs_monthlySavings");
        case "fhs_emergencyFund":
          return getNum("fhs_emergencyFund");
        case "fhs_monthlyDebtPayment":
          return getNum("fhs_monthlyDebtPayment");
        case "fhs_totalDebt":
          return getNum("fhs_totalDebt");
        case "salaryMonthlyIncome":
          return incomeFromSalary;
        default:
          return getNum(key);
      }
    };

    let filled = 0;
    for (const { key, setter, defaultValue } of fields) {
      const value = resolve(key);
      if (value > 0 && value !== defaultValue) {
        setter(value);
        filled++;
      }
    }

    if (filled > 0) {
      toast({
        title: "Pre-filled from your saved data",
        description: `${filled} field${filled > 1 ? "s" : ""} auto-populated from other tools.`,
      });
    }
  }, []);
}

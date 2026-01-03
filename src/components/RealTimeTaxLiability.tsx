import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingDown, TrendingUp, IndianRupee, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface IncomeValues {
  salary: number;
  hp: number;
  pgbp: number;
  cg: number;
  os: number;
}

interface RealTimeTaxLiabilityProps {
  incomeValues: IncomeValues;
  assessmentYear?: string;
}

// Tax calculation for New Regime (FY 2024-25 / AY 2025-26)
const calculateNewRegimeTax = (income: number): number => {
  if (income <= 300000) return 0;
  if (income <= 700000) return (income - 300000) * 0.05;
  if (income <= 1000000) return 20000 + (income - 700000) * 0.1;
  if (income <= 1200000) return 20000 + 30000 + (income - 1000000) * 0.15;
  if (income <= 1500000) return 20000 + 30000 + 30000 + (income - 1200000) * 0.2;
  return 20000 + 30000 + 30000 + 60000 + (income - 1500000) * 0.3;
};

// Tax calculation for Old Regime
const calculateOldRegimeTax = (income: number): number => {
  if (income <= 250000) return 0;
  if (income <= 500000) return (income - 250000) * 0.05;
  if (income <= 1000000) return 12500 + (income - 500000) * 0.2;
  return 12500 + 100000 + (income - 1000000) * 0.3;
};

const calculateSurcharge = (income: number, taxAmount: number): number => {
  if (income <= 5000000) return 0;
  if (income <= 10000000) return taxAmount * 0.1;
  if (income <= 20000000) return taxAmount * 0.15;
  if (income <= 50000000) return taxAmount * 0.25;
  return taxAmount * 0.37;
};

// Get current slab info based on income for New Regime
const getCurrentSlabInfo = (income: number): { slab: string; rate: string; nextSlab: number | null } => {
  if (income <= 300000) return { slab: "0 - 3L", rate: "Nil", nextSlab: 300000 };
  if (income <= 700000) return { slab: "3L - 7L", rate: "5%", nextSlab: 700000 };
  if (income <= 1000000) return { slab: "7L - 10L", rate: "10%", nextSlab: 1000000 };
  if (income <= 1200000) return { slab: "10L - 12L", rate: "15%", nextSlab: 1200000 };
  if (income <= 1500000) return { slab: "12L - 15L", rate: "20%", nextSlab: 1500000 };
  return { slab: "Above 15L", rate: "30%", nextSlab: null };
};

const RealTimeTaxLiability = ({ incomeValues, assessmentYear = "2025-26" }: RealTimeTaxLiabilityProps) => {
  const [deductions, setDeductions] = useState(0);

  // Load deductions from localStorage
  useEffect(() => {
    const loadDeductions = () => {
      const section80C = parseFloat(localStorage.getItem('deduction_80C') || '0');
      const section80D = parseFloat(localStorage.getItem('deduction_80D') || '0');
      const section80E = parseFloat(localStorage.getItem('deduction_80E') || '0');
      const section80G = parseFloat(localStorage.getItem('deduction_80G') || '0');
      const section80TTA = parseFloat(localStorage.getItem('deduction_80TTA') || '0');
      const section24b = parseFloat(localStorage.getItem('deduction_24b') || '0');
      const nps80CCD = parseFloat(localStorage.getItem('deduction_80CCD') || '0');
      setDeductions(section80C + section80D + section80E + section80G + section80TTA + section24b + nps80CCD);
    };

    loadDeductions();
    window.addEventListener('focus', loadDeductions);
    window.addEventListener('storage', loadDeductions);
    
    return () => {
      window.removeEventListener('focus', loadDeductions);
      window.removeEventListener('storage', loadDeductions);
    };
  }, []);

  const taxCalculation = useMemo(() => {
    const grossTotalIncome = Object.values(incomeValues).reduce((sum, val) => sum + val, 0);
    
    // New Regime - standard deduction of 75,000 for salaried (FY 2024-25)
    const standardDeductionNew = incomeValues.salary > 0 ? 75000 : 0;
    const taxableIncomeNew = Math.max(0, grossTotalIncome - standardDeductionNew);
    
    // Old Regime - standard deduction of 50,000 + Chapter VI-A deductions
    const standardDeductionOld = incomeValues.salary > 0 ? 50000 : 0;
    const taxableIncomeOld = Math.max(0, grossTotalIncome - standardDeductionOld - deductions);

    // Calculate taxes
    const taxNew = calculateNewRegimeTax(taxableIncomeNew);
    const taxOld = calculateOldRegimeTax(taxableIncomeOld);

    // Surcharge
    const surchargeNew = calculateSurcharge(taxableIncomeNew, taxNew);
    const surchargeOld = calculateSurcharge(taxableIncomeOld, taxOld);

    // Cess @ 4%
    const cessNew = Math.round((taxNew + surchargeNew) * 0.04);
    const cessOld = Math.round((taxOld + surchargeOld) * 0.04);

    // Total tax
    const totalTaxNew = Math.round(taxNew + surchargeNew + cessNew);
    const totalTaxOld = Math.round(taxOld + surchargeOld + cessOld);

    // Rebate u/s 87A (New Regime: up to 7L, rebate up to 25,000)
    const rebateNew = taxableIncomeNew <= 700000 ? Math.min(taxNew, 25000) : 0;
    const rebateOld = taxableIncomeOld <= 500000 ? Math.min(taxOld, 12500) : 0;

    const finalTaxNew = Math.max(0, totalTaxNew - rebateNew);
    const finalTaxOld = Math.max(0, totalTaxOld - rebateOld);

    // Effective tax rate
    const effectiveRateNew = grossTotalIncome > 0 ? ((finalTaxNew / grossTotalIncome) * 100).toFixed(2) : "0.00";
    const effectiveRateOld = grossTotalIncome > 0 ? ((finalTaxOld / grossTotalIncome) * 100).toFixed(2) : "0.00";

    const betterRegime = finalTaxNew <= finalTaxOld ? "new" : "old";
    const savings = Math.abs(finalTaxNew - finalTaxOld);

    const slabInfo = getCurrentSlabInfo(taxableIncomeNew);

    return {
      grossTotalIncome,
      taxableIncomeNew,
      taxableIncomeOld,
      standardDeductionNew,
      standardDeductionOld,
      deductions,
      taxNew,
      taxOld,
      surchargeNew,
      surchargeOld,
      cessNew,
      cessOld,
      rebateNew,
      rebateOld,
      finalTaxNew,
      finalTaxOld,
      effectiveRateNew,
      effectiveRateOld,
      betterRegime,
      savings,
      slabInfo
    };
  }, [incomeValues, deductions]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (taxCalculation.grossTotalIncome === 0) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Calculator className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-center text-sm">
            Enter income details to see real-time tax calculation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Real-Time Tax Liability</CardTitle>
              <p className="text-xs text-muted-foreground">AY {assessmentYear} | As per Income Tax Act, 1961</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Live Calculation
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Income Summary */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-card border">
          <div>
            <p className="text-xs text-muted-foreground">Gross Total Income</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(taxCalculation.grossTotalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Slab</p>
            <p className="text-lg font-bold text-primary">{taxCalculation.slabInfo.rate}</p>
            <p className="text-xs text-muted-foreground">{taxCalculation.slabInfo.slab}</p>
          </div>
        </div>

        {/* Tax Comparison - Two Columns */}
        <div className="grid grid-cols-2 gap-3">
          {/* New Regime */}
          <div className={`p-3 rounded-lg border-2 ${taxCalculation.betterRegime === 'new' ? 'border-green-500 bg-green-500/5' : 'border-muted bg-muted/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">New Regime</span>
              {taxCalculation.betterRegime === 'new' && (
                <Badge className="bg-green-500 text-white text-xs">Recommended</Badge>
              )}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Income</span>
                <span>{formatCurrency(taxCalculation.taxableIncomeNew)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax on Slabs</span>
                <span>{formatCurrency(taxCalculation.taxNew)}</span>
              </div>
              {taxCalculation.rebateNew > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Rebate u/s 87A</span>
                  <span>-{formatCurrency(taxCalculation.rebateNew)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cess @4%</span>
                <span>{formatCurrency(taxCalculation.cessNew)}</span>
              </div>
              {taxCalculation.surchargeNew > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Surcharge</span>
                  <span>{formatCurrency(taxCalculation.surchargeNew)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Total Tax</span>
                <span className="text-primary">{formatCurrency(taxCalculation.finalTaxNew)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Effective Rate</span>
                <span>{taxCalculation.effectiveRateNew}%</span>
              </div>
            </div>
          </div>

          {/* Old Regime */}
          <div className={`p-3 rounded-lg border-2 ${taxCalculation.betterRegime === 'old' ? 'border-green-500 bg-green-500/5' : 'border-muted bg-muted/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Old Regime</span>
              {taxCalculation.betterRegime === 'old' && (
                <Badge className="bg-green-500 text-white text-xs">Recommended</Badge>
              )}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Income</span>
                <span>{formatCurrency(taxCalculation.taxableIncomeOld)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax on Slabs</span>
                <span>{formatCurrency(taxCalculation.taxOld)}</span>
              </div>
              {taxCalculation.rebateOld > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Rebate u/s 87A</span>
                  <span>-{formatCurrency(taxCalculation.rebateOld)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cess @4%</span>
                <span>{formatCurrency(taxCalculation.cessOld)}</span>
              </div>
              {taxCalculation.surchargeOld > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Surcharge</span>
                  <span>{formatCurrency(taxCalculation.surchargeOld)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Total Tax</span>
                <span className="text-primary">{formatCurrency(taxCalculation.finalTaxOld)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Effective Rate</span>
                <span>{taxCalculation.effectiveRateOld}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Highlight */}
        {taxCalculation.savings > 0 && (
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
            <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Save {formatCurrency(taxCalculation.savings)} with {taxCalculation.betterRegime === 'new' ? 'New' : 'Old'} Regime
            </span>
          </div>
        )}

        {/* Deductions Info */}
        {taxCalculation.deductions > 0 && (
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
              <IndianRupee className="w-3 h-3" />
              <span>Chapter VI-A Deductions claimed: {formatCurrency(taxCalculation.deductions)}</span>
            </div>
          </div>
        )}

        {/* Advance Tax Alert */}
        {taxCalculation.finalTaxNew >= 10000 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-xs text-yellow-700 dark:text-yellow-400">
              <p className="font-medium">Advance Tax Applicable</p>
              <p>Tax liability exceeds ₹10,000. Pay advance tax in installments (Jun 15, Sep 15, Dec 15, Mar 15).</p>
            </div>
          </div>
        )}

        {/* Next Slab Progress */}
        {taxCalculation.slabInfo.nextSlab && taxCalculation.grossTotalIncome < taxCalculation.slabInfo.nextSlab && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Distance to next slab</span>
              <span className="font-medium">{formatCurrency(taxCalculation.slabInfo.nextSlab - taxCalculation.grossTotalIncome)} remaining</span>
            </div>
            <Progress value={(taxCalculation.grossTotalIncome / taxCalculation.slabInfo.nextSlab) * 100} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeTaxLiability;

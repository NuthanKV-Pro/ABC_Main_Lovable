import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info, CheckCircle2 } from "lucide-react";

interface StandardDeductionCalculatorProps {
  grossSalary: number;
}

export const StandardDeductionCalculator = ({ grossSalary }: StandardDeductionCalculatorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const calculations = useMemo(() => {
    const oldRegimeDeduction = 50000;
    const newRegimeDeduction = 75000;

    // Standard deduction is limited to gross salary if salary is less than deduction amount
    const applicableOldDeduction = Math.min(oldRegimeDeduction, grossSalary);
    const applicableNewDeduction = Math.min(newRegimeDeduction, grossSalary);

    const netSalaryOldRegime = grossSalary - applicableOldDeduction;
    const netSalaryNewRegime = grossSalary - applicableNewDeduction;

    const additionalBenefitNewRegime = applicableNewDeduction - applicableOldDeduction;

    return {
      grossSalary,
      oldRegimeDeduction,
      newRegimeDeduction,
      applicableOldDeduction,
      applicableNewDeduction,
      netSalaryOldRegime,
      netSalaryNewRegime,
      additionalBenefitNewRegime,
    };
  }, [grossSalary]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Save to localStorage when calculations change
  useEffect(() => {
    if (grossSalary > 0) {
      localStorage.setItem('standard_deduction_data', JSON.stringify({
        oldRegime: calculations.applicableOldDeduction,
        newRegime: calculations.applicableNewDeduction,
        grossSalary: grossSalary,
      }));
    }
  }, [calculations, grossSalary]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          <Calculator className="w-4 h-4" />
          Sec 16 Deduction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-500" />
            Standard Deduction - Section 16
          </DialogTitle>
          <DialogDescription>
            Automatic deduction from salary income under Section 16(ia) of Income Tax Act
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Card */}
          <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-800 dark:text-emerald-200">
                  <p className="font-medium mb-1">What is Standard Deduction?</p>
                  <p className="text-emerald-700 dark:text-emerald-300">
                    A flat deduction available to all salaried employees & pensioners, automatically applied to reduce taxable salary income. No documentation or proof required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gross Salary Display */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Your Gross Salary Income</div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(calculations.grossSalary)}
            </div>
          </div>

          {/* Regime Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Old Regime */}
            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300">
                    Old Regime
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Standard Deduction</div>
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {formatCurrency(calculations.applicableOldDeduction)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (Max: ₹50,000)
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">Net Taxable Salary</div>
                    <div className="text-base font-medium">
                      {formatCurrency(calculations.netSalaryOldRegime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Regime */}
            <Card className="border-2 border-emerald-200 dark:border-emerald-800 relative">
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-emerald-500 text-white text-xs">
                  Higher Benefit
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                    New Regime
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Standard Deduction</div>
                    <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(calculations.applicableNewDeduction)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (Max: ₹75,000)
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">Net Taxable Salary</div>
                    <div className="text-base font-medium">
                      {formatCurrency(calculations.netSalaryNewRegime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Benefit */}
          {calculations.additionalBenefitNewRegime > 0 && (
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                      Additional Benefit in New Regime
                    </div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(calculations.additionalBenefitNewRegime)} more deduction
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Eligibility Note */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
            <p><strong>Eligibility:</strong> All salaried employees & pensioners</p>
            <p><strong>AY 2025-26:</strong> Old Regime - ₹50,000 | New Regime - ₹75,000</p>
            <p><strong>Note:</strong> This deduction is automatically applied. Ensure you don't claim it twice.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

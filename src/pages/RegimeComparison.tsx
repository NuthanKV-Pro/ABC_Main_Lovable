import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

// Tax calculation functions for Old Regime
const calculateOldRegimeTax = (income: number): number => {
  if (income <= 250000) return 0;
  if (income <= 500000) return (income - 250000) * 0.05;
  if (income <= 1000000) return 12500 + (income - 500000) * 0.2;
  return 12500 + 100000 + (income - 1000000) * 0.3;
};

// Tax calculation functions for New Regime (FY 2024-25)
const calculateNewRegimeTax = (income: number): number => {
  if (income <= 300000) return 0;
  if (income <= 700000) return (income - 300000) * 0.05;
  if (income <= 1000000) return 20000 + (income - 700000) * 0.1;
  if (income <= 1200000) return 20000 + 30000 + (income - 1000000) * 0.15;
  if (income <= 1500000) return 20000 + 30000 + 30000 + (income - 1200000) * 0.2;
  return 20000 + 30000 + 30000 + 60000 + (income - 1500000) * 0.3;
};

const RegimeComparison = () => {
  const navigate = useNavigate();
  
  const [incomeData, setIncomeData] = useState({
    salary: 0,
    hp: 0,
    pgbp: 0,
    cg: 0,
    os: 0
  });
  
  const [deductions, setDeductions] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      setIncomeData({
        salary: parseFloat(localStorage.getItem('salary_total') || '0'),
        hp: parseFloat(localStorage.getItem('hp_total') || '0'),
        pgbp: parseFloat(localStorage.getItem('pgbp_total') || '0'),
        cg: parseFloat(localStorage.getItem('cg_total') || '0'),
        os: parseFloat(localStorage.getItem('os_total') || '0'),
      });
      setDeductions(parseFloat(localStorage.getItem('deductions_total') || '0'));
    };

    loadData();
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

  const gti = incomeData.salary + incomeData.hp + incomeData.pgbp + incomeData.cg + incomeData.os;
  
  // Old regime allows full deductions, new regime has limited deductions
  const deductionOld = deductions;
  const deductionNew = Math.min(deductions, 75000); // Standard deduction limit in new regime
  
  const taxableIncomeOld = Math.max(0, gti - deductionOld);
  const taxableIncomeNew = Math.max(0, gti - deductionNew);
  
  const slabsOld = calculateOldRegimeTax(taxableIncomeOld);
  const slabsNew = calculateNewRegimeTax(taxableIncomeNew);
  
  const cess = 4;
  
  const cessOld = (slabsOld * cess) / 100;
  const cessNew = (slabsNew * cess) / 100;
  
  const totalWithCessOld = slabsOld + cessOld;
  const totalWithCessNew = slabsNew + cessNew;
  
  // Surcharge calculation (simplified)
  const calculateSurcharge = (income: number, tax: number): number => {
    if (income <= 5000000) return 0;
    if (income <= 10000000) return tax * 0.1;
    if (income <= 20000000) return tax * 0.15;
    if (income <= 50000000) return tax * 0.25;
    return tax * 0.37;
  };
  
  const surchargeOld = calculateSurcharge(taxableIncomeOld, slabsOld);
  const surchargeNew = calculateSurcharge(taxableIncomeNew, slabsNew);
  
  const finalTaxOld = totalWithCessOld + surchargeOld;
  const finalTaxNew = totalWithCessNew + surchargeNew;

  const betterRegime = finalTaxOld < finalTaxNew ? 'old' : 'new';

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Tax Regime Comparison</h1>
              <p className="text-sm text-muted-foreground">Compare Old vs New Tax Regime</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Old vs New Tax Regime</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Particulars</TableHead>
                  <TableHead className="text-right">New Regime (₹)</TableHead>
                  <TableHead className="text-right">Old Regime (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Gross Total Income</TableCell>
                  <TableCell className="text-right">{gti.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{gti.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Deduction</TableCell>
                  <TableCell className="text-right">{deductionNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{deductionOld.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Income</TableCell>
                  <TableCell className="text-right">{taxableIncomeNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{taxableIncomeOld.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tax on Slabs</TableCell>
                  <TableCell className="text-right">{slabsNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{slabsOld.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cess @ 4%</TableCell>
                  <TableCell className="text-right">{cessNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{cessOld.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="text-right">{totalWithCessNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{totalWithCessOld.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Surcharge</TableCell>
                  <TableCell className="text-right">{surchargeNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{surchargeOld.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow className={betterRegime === 'new' ? 'bg-primary/10' : ''}>
                  <TableCell className="font-bold">Total Tax (New)</TableCell>
                  <TableCell className="text-right font-bold">{finalTaxNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
                <TableRow className={betterRegime === 'old' ? 'bg-primary/10' : ''}>
                  <TableCell className="font-bold">Total Tax (Old)</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-bold">{finalTaxOld.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium">
                Recommended Regime: <span className="text-primary font-bold">{betterRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tax Savings: ₹{Math.abs(finalTaxNew - finalTaxOld).toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RegimeComparison;
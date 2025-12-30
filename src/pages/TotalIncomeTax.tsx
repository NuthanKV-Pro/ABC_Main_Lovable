import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

// Tax calculation for New Regime (FY 2024-25)
const calculateNewRegimeTax = (income: number): number => {
  if (income <= 300000) return 0;
  if (income <= 700000) return (income - 300000) * 0.05;
  if (income <= 1000000) return 20000 + (income - 700000) * 0.1;
  if (income <= 1200000) return 20000 + 30000 + (income - 1000000) * 0.15;
  if (income <= 1500000) return 20000 + 30000 + 30000 + (income - 1200000) * 0.2;
  return 20000 + 30000 + 30000 + 60000 + (income - 1500000) * 0.3;
};

const TotalIncomeTax = () => {
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
  const totalIncome = Math.max(0, gti - deductions);
  const tax = calculateNewRegimeTax(totalIncome);
  const cess = Math.round(tax * 0.04);
  
  // Surcharge calculation
  const calculateSurcharge = (income: number, taxAmount: number): number => {
    if (income <= 5000000) return 0;
    if (income <= 10000000) return taxAmount * 0.1;
    if (income <= 20000000) return taxAmount * 0.15;
    if (income <= 50000000) return taxAmount * 0.25;
    return taxAmount * 0.37;
  };
  
  const surcharge = Math.round(calculateSurcharge(totalIncome, tax));
  const totalTax = Math.round(tax + cess + surcharge);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Total Income & Tax</h1>
              <p className="text-sm text-muted-foreground">Complete tax computation summary</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Heads of Income */}
          <Card>
            <CardHeader>
              <CardTitle>Heads of Income</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Head of Income</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Salary</TableCell>
                    <TableCell className="text-right">₹{incomeData.salary.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">House Property</TableCell>
                    <TableCell className="text-right">₹{incomeData.hp.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Business & Profession</TableCell>
                    <TableCell className="text-right">₹{incomeData.pgbp.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Capital Gains</TableCell>
                    <TableCell className="text-right">₹{incomeData.cg.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Other Sources</TableCell>
                    <TableCell className="text-right">₹{incomeData.os.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10 font-bold">
                    <TableCell>Gross Total Income</TableCell>
                    <TableCell className="text-right">₹{gti.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Deductions & Total Income */}
          <Card>
            <CardHeader>
              <CardTitle>Deductions & Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Gross Total Income</TableCell>
                    <TableCell className="text-right">₹{gti.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Less: Deductions (Chapter VI-A)</TableCell>
                    <TableCell className="text-right">₹{deductions.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10 font-bold">
                    <TableCell>Total Taxable Income</TableCell>
                    <TableCell className="text-right">₹{totalIncome.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Tax Computation */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle>Tax on Taxable Income</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Tax on Total Income</TableCell>
                    <TableCell className="text-right">₹{tax.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Add: Health & Education Cess @ 4%</TableCell>
                    <TableCell className="text-right">₹{cess.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Add: Surcharge</TableCell>
                    <TableCell className="text-right">₹{surcharge.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/20 font-bold text-lg">
                    <TableCell>Total Tax Liability</TableCell>
                    <TableCell className="text-right">₹{totalTax.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TotalIncomeTax;
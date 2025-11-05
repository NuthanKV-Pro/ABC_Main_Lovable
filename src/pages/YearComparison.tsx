import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const YearComparison = () => {
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from actual calculations
  const data = {
    year1: "2023-24",
    year2: "2024-25",
    salary1: 800000,
    salary2: 900000,
    hp1: 120000,
    hp2: 150000,
    pgbp1: 250000,
    pgbp2: 300000,
    cg1: 50000,
    cg2: 75000,
    os1: 30000,
    os2: 35000,
    gti1: 1250000,
    gti2: 1460000,
    deductions1: 150000,
    deductions2: 150000,
    ti1: 1100000,
    ti2: 1310000,
    tds1: 45000,
    tds2: 52000,
    tcs1: 5000,
    tcs2: 6000,
    advTax1: 100000,
    advTax2: 120000,
    regime1: "Old",
    regime2: "New"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Year-on-Year Comparison</h1>
              <p className="text-sm text-muted-foreground">Compare income and tax with previous year</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Income & Tax Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Particulars</TableHead>
                  <TableHead className="text-right">{data.year1}</TableHead>
                  <TableHead className="text-right">{data.year2}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold" colSpan={3}>Heads of Income</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-6">Salary</TableCell>
                  <TableCell className="text-right">₹{data.salary1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.salary2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-6">House Property</TableCell>
                  <TableCell className="text-right">₹{data.hp1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.hp2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-6">Business & Profession</TableCell>
                  <TableCell className="text-right">₹{data.pgbp1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.pgbp2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-6">Capital Gains</TableCell>
                  <TableCell className="text-right">₹{data.cg1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.cg2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-6">Other Sources</TableCell>
                  <TableCell className="text-right">₹{data.os1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.os2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Gross Total Income (GTI)</TableCell>
                  <TableCell className="text-right font-bold">₹{data.gti1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right font-bold">₹{data.gti2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Deductions</TableCell>
                  <TableCell className="text-right">₹{data.deductions1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.deductions2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Total Income (TI)</TableCell>
                  <TableCell className="text-right font-bold">₹{data.ti1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right font-bold">₹{data.ti2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TDS</TableCell>
                  <TableCell className="text-right">₹{data.tds1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.tds2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TCS</TableCell>
                  <TableCell className="text-right">₹{data.tcs1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.tcs2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Advance Tax</TableCell>
                  <TableCell className="text-right">₹{data.advTax1.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">₹{data.advTax2.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Regime Used</TableCell>
                  <TableCell className="text-right">{data.regime1}</TableCell>
                  <TableCell className="text-right">{data.regime2}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default YearComparison;

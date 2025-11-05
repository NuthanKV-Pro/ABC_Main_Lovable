import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const TotalIncomeTax = () => {
  const navigate = useNavigate();

  // Sample data - would come from actual calculations
  const data = {
    salary: 900000,
    hp: 150000,
    pgbp: 300000,
    cg: 75000,
    os: 35000,
    gti: 1460000,
    deductions: 150000,
    totalIncome: 1310000,
    tax: 195000,
    cess: 7800,
    surcharge: 0,
    totalTax: 202800
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
                    <TableCell className="text-right">₹{data.salary.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">House Property</TableCell>
                    <TableCell className="text-right">₹{data.hp.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Business & Profession</TableCell>
                    <TableCell className="text-right">₹{data.pgbp.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Capital Gains</TableCell>
                    <TableCell className="text-right">₹{data.cg.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Other Sources</TableCell>
                    <TableCell className="text-right">₹{data.os.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10 font-bold">
                    <TableCell>Gross Total Income</TableCell>
                    <TableCell className="text-right">₹{data.gti.toLocaleString('en-IN')}</TableCell>
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
                    <TableCell className="text-right">₹{data.gti.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Less: Deductions (Chapter VI-A)</TableCell>
                    <TableCell className="text-right">₹{data.deductions.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10 font-bold">
                    <TableCell>Total Taxable Income</TableCell>
                    <TableCell className="text-right">₹{data.totalIncome.toLocaleString('en-IN')}</TableCell>
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
                    <TableCell className="text-right">₹{data.tax.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Add: Health & Education Cess @ 4%</TableCell>
                    <TableCell className="text-right">₹{data.cess.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Add: Surcharge</TableCell>
                    <TableCell className="text-right">₹{data.surcharge.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/20 font-bold text-lg">
                    <TableCell>Total Tax Liability</TableCell>
                    <TableCell className="text-right">₹{data.totalTax.toLocaleString('en-IN')}</TableCell>
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

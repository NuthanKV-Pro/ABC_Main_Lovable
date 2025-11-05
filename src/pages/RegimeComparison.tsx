import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const RegimeComparison = () => {
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from calculations
  const data = {
    gti: 1500000,
    deductionOld: 150000,
    deductionNew: 50000,
    slabsOld: 187500,
    slabsNew: 195000,
    cess: 4,
  };

  const totalOld = data.slabsOld;
  const cessOld = (totalOld * data.cess) / 100;
  const totalWithCessOld = totalOld + cessOld;
  const surchargeOld = 0; // Calculate based on income
  const finalTaxOld = totalWithCessOld + surchargeOld;

  const totalNew = data.slabsNew;
  const cessNew = (totalNew * data.cess) / 100;
  const totalWithCessNew = totalNew + cessNew;
  const surchargeNew = 0; // Calculate based on income
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
                  <TableCell className="text-right">{data.gti.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{data.gti.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Deduction</TableCell>
                  <TableCell className="text-right">{data.deductionNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{data.deductionOld.toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Income</TableCell>
                  <TableCell className="text-right">{(data.gti - data.deductionNew).toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{(data.gti - data.deductionOld).toLocaleString('en-IN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tax on Slabs</TableCell>
                  <TableCell className="text-right">{data.slabsNew.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">{data.slabsOld.toLocaleString('en-IN')}</TableCell>
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

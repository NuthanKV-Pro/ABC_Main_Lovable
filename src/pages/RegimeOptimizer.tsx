import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { useTaxData } from "@/hooks/useTaxData";
import ExportButton from "@/components/ExportButton";
import { ExportConfig } from "@/utils/unifiedExport";

const OLD_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: Infinity, rate: 0.30 },
];

const NEW_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.10 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.20 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.30 },
];

const calcWithSlabs = (taxable: number, slabs: typeof OLD_SLABS) => {
  let tax = 0;
  for (const s of slabs) { if (taxable > s.min) tax += (Math.min(taxable, s.max) - s.min) * s.rate; }
  return Math.round(tax * 1.04); // +4% cess
};

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const DEDUCTION_LABELS: Record<string, string> = {
  "80C": "Sec 80C (PPF, ELSS, LIC etc.)",
  "80D": "Sec 80D (Health Insurance)",
  "80E": "Sec 80E (Education Loan Interest)",
  "80G": "Sec 80G (Donations)",
  "80TTA": "Sec 80TTA (Savings Interest)",
  "80CCD1B": "Sec 80CCD(1B) (NPS extra ₹50K)",
  "24b": "Sec 24(b) (Home Loan Interest)",
  "HRA": "HRA Exemption",
};

const RegimeOptimizer = () => {
  const goBack = useGoBack();
  const taxData = useTaxData();

  const gross = taxData.grossTotal;
  const deductionsData = taxData.deductions.data || {};
  const totalDed = taxData.totalDeductions;

  // Old regime: gross - all deductions
  const oldTaxable = Math.max(0, gross - totalDed);
  const oldTax = calcWithSlabs(oldTaxable, OLD_SLABS);

  // New regime: gross - standard deduction (75000)
  const stdDed = 75000;
  const newTaxable = Math.max(0, gross - stdDed);
  const newTax = calcWithSlabs(newTaxable, NEW_SLABS);

  // 87A rebate for new regime (taxable <= 12L after std ded, tax up to 60K)
  const rebate87ANew = newTaxable <= 1200000 ? Math.min(newTax, 60000) : 0;
  const newTaxFinal = Math.max(0, newTax - rebate87ANew);
  // 87A for old (taxable <= 5L, tax up to 12500)
  const rebate87AOld = oldTaxable <= 500000 ? Math.min(oldTax, 12500) : 0;
  const oldTaxFinal = Math.max(0, oldTax - rebate87AOld);

  const savings = Math.abs(oldTaxFinal - newTaxFinal);
  const recommended = oldTaxFinal <= newTaxFinal ? "Old Regime" : "New Regime";
  const hasData = gross > 0;

  const dedEntries = Object.entries(deductionsData).filter(([, v]) => v > 0);

  const getExportConfig = (): ExportConfig => ({
    title: "Regime Optimizer Report", fileNamePrefix: "regime-optimizer",
    sections: [
      { title: "Income Summary", keyValues: [["Gross Total Income", fmt(gross)], ["Total Deductions (Old)", fmt(totalDed)], ["Standard Deduction (New)", fmt(stdDed)]] },
      { title: "Tax Comparison", keyValues: [["Old Regime Tax", fmt(oldTaxFinal)], ["New Regime Tax", fmt(newTaxFinal)], ["Recommended", recommended], ["Savings", fmt(savings)]] },
      { title: "Deduction Breakdown", table: { head: ["Deduction", "Amount", "In Old", "In New"], body: dedEntries.map(([k, v]) => [DEDUCTION_LABELS[k] || k, fmt(v), "✓", "✗"]) } },
    ]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Calculator className="h-6 w-6 text-primary" /> Old vs New Regime Optimizer</h1>
              <p className="text-sm text-muted-foreground">Data-driven recommendation based on your entered tax data</p>
            </div>
          </div>
          <ExportButton getConfig={getExportConfig} />
        </div>

        {!hasData && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">Enter your income and deduction data in the Tax Dashboard first. This tool pulls data automatically.</p>
              <Button variant="outline" className="mt-3" onClick={() => window.location.href = "/dashboard"}>Go to Dashboard</Button>
            </CardContent>
          </Card>
        )}

        {hasData && (
          <>
            {/* Recommendation Banner */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Recommended Regime</p>
                    <p className="text-2xl font-bold text-foreground">{recommended}</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-muted-foreground">You save</p>
                  <p className="text-3xl font-bold text-primary">{fmt(savings)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={recommended === "Old Regime" ? "border-primary/50 ring-2 ring-primary/20" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">Old Regime {recommended === "Old Regime" && <Badge className="bg-primary/20 text-primary border-primary/30">Recommended</Badge>}</CardTitle>
                  <CardDescription>All deductions & exemptions available</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Gross Income</span><span>{fmt(gross)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Deductions</span><span>-{fmt(totalDed)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Taxable Income</span><span>{fmt(oldTaxable)}</span></div>
                  {rebate87AOld > 0 && <div className="flex justify-between"><span className="text-muted-foreground">87A Rebate</span><span>-{fmt(rebate87AOld)}</span></div>}
                  <div className="flex justify-between font-bold border-t pt-2"><span>Tax Payable</span><span className="text-foreground">{fmt(oldTaxFinal)}</span></div>
                </CardContent>
              </Card>

              <Card className={recommended === "New Regime" ? "border-primary/50 ring-2 ring-primary/20" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">New Regime (FY 2024-25) {recommended === "New Regime" && <Badge className="bg-primary/20 text-primary border-primary/30">Recommended</Badge>}</CardTitle>
                  <CardDescription>Lower rates, fewer deductions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Gross Income</span><span>{fmt(gross)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Std. Deduction</span><span>-{fmt(stdDed)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Taxable Income</span><span>{fmt(newTaxable)}</span></div>
                  {rebate87ANew > 0 && <div className="flex justify-between"><span className="text-muted-foreground">87A Rebate</span><span>-{fmt(rebate87ANew)}</span></div>}
                  <div className="flex justify-between font-bold border-t pt-2"><span>Tax Payable</span><span className="text-foreground">{fmt(newTaxFinal)}</span></div>
                </CardContent>
              </Card>
            </div>

            {/* Deduction breakdown */}
            {dedEntries.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Deduction Breakdown — What You Lose in New Regime</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Deduction</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-center">Old Regime</TableHead><TableHead className="text-center">New Regime</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {dedEntries.map(([key, val]) => (
                        <TableRow key={key}>
                          <TableCell>{DEDUCTION_LABELS[key] || key}</TableCell>
                          <TableCell className="text-right">{fmt(val)}</TableCell>
                          <TableCell className="text-center"><CheckCircle className="h-4 w-4 text-primary mx-auto" /></TableCell>
                          <TableCell className="text-center"><XCircle className="h-4 w-4 text-destructive mx-auto" /></TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>Standard Deduction (₹75,000)</TableCell>
                        <TableCell className="text-right">{fmt(stdDed)}</TableCell>
                        <TableCell className="text-center"><XCircle className="h-4 w-4 text-destructive mx-auto" /></TableCell>
                        <TableCell className="text-center"><CheckCircle className="h-4 w-4 text-primary mx-auto" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RegimeOptimizer;

import { useState } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import { useAutoPopulate } from "@/hooks/useAutoPopulate";
import AutoPopulateBadge from "@/components/AutoPopulateBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, Info, CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/components/Footer";

const InsuranceComparison = () => {
  const goBack = useGoBack();
  const [age, setAge] = useState(30);
  const [sumAssured, setSumAssured] = useState(10000000);
  const [policyTerm, setPolicyTerm] = useState(30);
  const [premiumPayingTerm, setPremiumPayingTerm] = useState(20);

  const { populatedFields, resetField } = useAutoPopulate([
    { key: "age", setter: setAge, defaultValue: 30 },
  ]);

  // Approximate annual premiums
  const termPremium = Math.round((sumAssured / 1000) * (0.8 + age * 0.04));
  const endowmentPremium = Math.round(sumAssured * (0.04 + age * 0.001));
  const ulipPremium = Math.round(sumAssured * (0.02 + age * 0.0005));

  // Returns calculation
  const termTotalPaid = termPremium * policyTerm;
  const termMaturity = 0; // No maturity benefit (pure protection)
  const termDeathBenefit = sumAssured;

  const endowmentTotalPaid = endowmentPremium * premiumPayingTerm;
  const endowmentMaturity = Math.round(endowmentPremium * premiumPayingTerm * 1.4); // ~4-5% CAGR
  const endowmentIRR = ((Math.pow(endowmentMaturity / endowmentTotalPaid, 1 / policyTerm) - 1) * 100).toFixed(1);

  const ulipTotalPaid = ulipPremium * premiumPayingTerm;
  const ulipCharges = Math.round(ulipTotalPaid * 0.15); // ~15% goes to charges
  const ulipInvested = ulipTotalPaid - ulipCharges;
  const ulipMaturity = Math.round(ulipInvested * Math.pow(1.10, policyTerm)); // assuming 10% return
  const ulipIRR = ((Math.pow(ulipMaturity / ulipTotalPaid, 1 / policyTerm) - 1) * 100).toFixed(1);

  // Term + MF strategy
  const termPlusMfExtra = endowmentPremium - termPremium;
  const mfCorpus = Math.round(termPlusMfExtra * (((Math.pow(1 + 0.12 / 12, premiumPayingTerm * 12) - 1) / (0.12 / 12)) * (1 + 0.12 / 12)));

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const Check = () => <CheckCircle className="h-4 w-4 text-green-500 inline" />;
  const Cross = () => <XCircle className="h-4 w-4 text-red-500 inline" />;

  const products = [
    {
      name: "Term Insurance",
      premium: fmt(termPremium),
      totalPaid: fmt(termTotalPaid),
      maturityBenefit: "None (pure protection)",
      deathBenefit: fmt(termDeathBenefit),
      irr: "N/A",
      taxBenefit80C: true,
      taxFreeMaturity: false,
      transparency: "High",
      charges: "Low (mortality only)",
      flexibility: "Low",
      bestFor: "Pure life cover at lowest cost",
      verdict: "✅ Best for protection",
    },
    {
      name: "Endowment Plan",
      premium: fmt(endowmentPremium),
      totalPaid: fmt(endowmentTotalPaid),
      maturityBenefit: fmt(endowmentMaturity),
      deathBenefit: fmt(Math.max(sumAssured, endowmentMaturity)),
      irr: `${endowmentIRR}%`,
      taxBenefit80C: true,
      taxFreeMaturity: true,
      transparency: "Low",
      charges: "High (built into premium)",
      flexibility: "Very Low",
      bestFor: "Forced savings + basic cover",
      verdict: "⚠️ Low returns, high lock-in",
    },
    {
      name: "ULIP",
      premium: fmt(ulipPremium),
      totalPaid: fmt(ulipTotalPaid),
      maturityBenefit: fmt(ulipMaturity),
      deathBenefit: fmt(Math.max(sumAssured, ulipMaturity)),
      irr: `${ulipIRR}%`,
      taxBenefit80C: true,
      taxFreeMaturity: true,
      transparency: "Medium",
      charges: `High first 5 yrs (~${fmt(ulipCharges)})`,
      flexibility: "Medium (fund switching)",
      bestFor: "Tax-free equity exposure (if held 10+ yrs)",
      verdict: "⚠️ Only if long-term + tax-free goal",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => goBack()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Term vs Endowment vs ULIP</h1>
              <p className="text-sm text-muted-foreground">Compare insurance products for smart decisions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Your Profile
              </CardTitle>
              <CardDescription>Adjust parameters to see personalized comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Age
                    <AutoPopulateBadge fieldKey="age" populatedFields={populatedFields} onReset={resetField} />
                  </Label>
                  <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} min={18} max={60} />
                </div>
                <div className="space-y-2">
                  <Label>Sum Assured (₹)</Label>
                  <Input type="number" value={sumAssured} onChange={(e) => setSumAssured(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Policy Term (Years)</Label>
                  <Input type="number" value={policyTerm} onChange={(e) => setPolicyTerm(Number(e.target.value))} min={5} max={40} />
                </div>
                <div className="space-y-2">
                  <Label>Premium Paying Term (Yrs)</Label>
                  <Input type="number" value={premiumPayingTerm} onChange={(e) => setPremiumPayingTerm(Number(e.target.value))} min={5} max={policyTerm} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Feature</TableHead>
                      {products.map(p => (
                        <TableHead key={p.name} className="font-bold text-center">{p.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { label: "Annual Premium", key: "premium" },
                      { label: "Total Premiums Paid", key: "totalPaid" },
                      { label: "Maturity Benefit", key: "maturityBenefit" },
                      { label: "Death Benefit", key: "deathBenefit" },
                      { label: "Real IRR", key: "irr" },
                      { label: "Charges", key: "charges" },
                      { label: "Transparency", key: "transparency" },
                      { label: "Flexibility", key: "flexibility" },
                      { label: "Best For", key: "bestFor" },
                    ].map(row => (
                      <TableRow key={row.label}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        {products.map(p => (
                          <TableCell key={p.name} className="text-center text-sm">
                            {(p as any)[row.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-medium">80C Tax Benefit</TableCell>
                      {products.map(p => (
                        <TableCell key={p.name} className="text-center">
                          {p.taxBenefit80C ? <Check /> : <Cross />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tax-Free Maturity</TableCell>
                      {products.map(p => (
                        <TableCell key={p.name} className="text-center">
                          {p.taxFreeMaturity ? <Check /> : <Cross />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-bold">Verdict</TableCell>
                      {products.map(p => (
                        <TableCell key={p.name} className="text-center font-semibold text-sm">
                          {p.verdict}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-lg text-green-600">💡 Smart Strategy: Term + Mutual Fund</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Instead of paying <strong>{fmt(endowmentPremium)}/yr</strong> for an endowment plan, consider:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">Term Premium</p>
                  <p className="font-bold text-lg">{fmt(termPremium)}/yr</p>
                  <p className="text-xs text-muted-foreground">Full {fmt(sumAssured)} cover</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">Invest Difference in MF SIP</p>
                  <p className="font-bold text-lg">{fmt(termPlusMfExtra)}/yr</p>
                  <p className="text-xs text-muted-foreground">@12% expected return</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground">MF Corpus in {premiumPayingTerm} yrs</p>
                  <p className="font-bold text-lg text-green-600">{fmt(mfCorpus)}</p>
                  <p className="text-xs text-muted-foreground">vs Endowment: {fmt(endowmentMaturity)}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-green-600">
                You get {fmt(sumAssured)} life cover + {fmt(mfCorpus - endowmentMaturity)} more wealth!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">Disclaimer</h4>
              <p className="text-sm text-muted-foreground">
                Premium estimates are approximate and vary by insurer, health, and lifestyle. ULIP returns depend on market performance.
                Mutual fund returns are not guaranteed. Always compare actual quotes before purchasing.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InsuranceComparison;

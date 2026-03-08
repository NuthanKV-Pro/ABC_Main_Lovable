import { useState } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/components/Footer";

const InvestmentModeComparison = () => {
  const goBack = useGoBack();
  const [goalAmount, setGoalAmount] = useState(1000000);
  const [duration, setDuration] = useState(5);
  const [expectedReturn, setExpectedReturn] = useState(12);

  const monthlyRate = expectedReturn / 12 / 100;
  const months = duration * 12;

  // SIP: FV = P * [((1+r)^n - 1) / r] * (1+r)
  const sipMonthly = goalAmount / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  const sipTotalInvested = sipMonthly * months;
  const sipWealth = goalAmount;
  const sipGains = sipWealth - sipTotalInvested;

  // Lumpsum: FV = P * (1+r)^n
  const lumpsumRequired = goalAmount / Math.pow(1 + expectedReturn / 100, duration);
  const lumpsumGains = goalAmount - lumpsumRequired;

  // RD: Similar to SIP but typically lower returns (bank rate)
  const rdRate = 7.0;
  const rdMonthlyRate = rdRate / 4 / 100; // quarterly compounding
  const rdQuarters = duration * 4;
  const rdMonthly = goalAmount / (((Math.pow(1 + rdMonthlyRate, rdQuarters) - 1) / rdMonthlyRate) * (1 + rdMonthlyRate));
  const rdTotalInvested = rdMonthly * rdQuarters;
  const rdGains = goalAmount - rdTotalInvested;

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const comparisons = [
    {
      mode: "SIP (Mutual Fund)",
      investment: fmt(sipTotalInvested),
      monthly: fmt(sipMonthly),
      gains: fmt(sipGains),
      gainsPercent: ((sipGains / sipTotalInvested) * 100).toFixed(1),
      returnRate: `${expectedReturn}%`,
      risk: "Market-linked",
      liquidity: "High (after exit load)",
      taxability: "LTCG >₹1L @10%, STCG @15%",
      bestFor: "Long-term wealth creation",
    },
    {
      mode: "Lumpsum (Mutual Fund)",
      investment: fmt(lumpsumRequired),
      monthly: "One-time",
      gains: fmt(lumpsumGains),
      gainsPercent: ((lumpsumGains / lumpsumRequired) * 100).toFixed(1),
      returnRate: `${expectedReturn}%`,
      risk: "Market-linked (timing risk)",
      liquidity: "High (after exit load)",
      taxability: "LTCG >₹1L @10%, STCG @15%",
      bestFor: "Windfall/bonus investment",
    },
    {
      mode: "RD (Bank)",
      investment: fmt(rdTotalInvested),
      monthly: fmt(rdMonthly),
      gains: fmt(rdGains),
      gainsPercent: ((rdGains / rdTotalInvested) * 100).toFixed(1),
      returnRate: `${rdRate}%`,
      risk: "Zero (bank guaranteed)",
      liquidity: "Low (penalty on early withdrawal)",
      taxability: "Interest fully taxable as per slab",
      bestFor: "Conservative, guaranteed savings",
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
              <h1 className="text-2xl font-bold text-primary">SIP vs Lumpsum vs RD</h1>
              <p className="text-sm text-muted-foreground">Compare investment modes for your goal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Goal Parameters
              </CardTitle>
              <CardDescription>Set your financial goal to compare investment modes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Goal Amount (₹)</Label>
                  <Input type="number" value={goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Years)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} max={30} />
                </div>
                <div className="space-y-2">
                  <Label>Expected MF Return (%)</Label>
                  <Input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} min={1} max={30} />
                  <p className="text-xs text-muted-foreground">RD rate fixed at 7% for comparison</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              To reach <span className="font-semibold text-foreground">{fmt(goalAmount)}</span> in {duration} years: 
              SIP needs <span className="font-semibold text-green-600">{fmt(sipMonthly)}/mo</span>, 
              Lumpsum needs <span className="font-semibold text-blue-600">{fmt(lumpsumRequired)} upfront</span>, 
              RD needs <span className="font-semibold text-amber-600">{fmt(rdMonthly)}/quarter</span>
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Parameter</TableHead>
                      {comparisons.map(c => (
                        <TableHead key={c.mode} className="font-bold text-center">{c.mode}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { label: "Total Investment", key: "investment" },
                      { label: "Monthly/Periodic", key: "monthly" },
                      { label: "Total Gains", key: "gains" },
                      { label: "Return on Investment", key: "gainsPercent", suffix: "%" },
                      { label: "Expected Return Rate", key: "returnRate" },
                      { label: "Risk Level", key: "risk" },
                      { label: "Liquidity", key: "liquidity" },
                      { label: "Tax Treatment", key: "taxability" },
                      { label: "Best For", key: "bestFor" },
                    ].map(row => (
                      <TableRow key={row.label}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        {comparisons.map(c => (
                          <TableCell key={c.mode} className="text-center">
                            {(c as any)[row.key]}{row.suffix && !String((c as any)[row.key]).includes("%") ? row.suffix : ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisons.map((c, i) => (
              <Card key={c.mode} className={i === 0 ? "border-2 border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{c.mode}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Invest</span>
                    <span className="font-semibold">{c.investment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gains</span>
                    <span className="font-semibold text-green-600">{c.gains}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ROI</span>
                    <span className="font-bold text-primary">{c.gainsPercent}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">{c.bestFor}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">Verdict</h4>
              <p className="text-sm text-muted-foreground">
                <strong>SIP</strong> is ideal for salaried investors — it averages out market volatility (rupee cost averaging) and requires smaller periodic investments. 
                <strong> Lumpsum</strong> works best when you have surplus cash and markets are at reasonable valuations. 
                <strong> RD</strong> is suitable for risk-averse investors who want guaranteed returns, but post-tax returns may trail inflation.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InvestmentModeComparison;

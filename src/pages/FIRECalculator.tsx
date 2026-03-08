import { useState, useEffect } from "react";
import { useAutoPopulate } from "@/hooks/useAutoPopulate";
import AutoPopulateBadge from "@/components/AutoPopulateBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Flame, Target, TrendingUp, Calendar, RotateCcw } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import ExportButton from "@/components/ExportButton";
import { ExportConfig } from "@/utils/unifiedExport";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const FIRECalculator = () => {
  const goBack = useGoBack();
  const [age, setAge] = useState(30);
  const [monthlyExp, setMonthlyExp] = useState(50000);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlySavings, setMonthlySavings] = useState(30000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [swr, setSwr] = useState(3.5);

  const { populatedFields, resetField } = useAutoPopulate([
    { key: "fhs_age", setter: setAge, defaultValue: 30 },
    { key: "fhs_monthlyExpenses", setter: setMonthlyExp, defaultValue: 50000 },
    { key: "fhs_totalInvestments", setter: setCurrentSavings, defaultValue: 500000 },
    { key: "fhs_monthlySavings", setter: setMonthlySavings, defaultValue: 30000 },
  ]);

  const annualExp = monthlyExp * 12;
  const fireNumber = annualExp / (swr / 100);
  const realReturn = ((1 + expectedReturn / 100) / (1 + inflation / 100) - 1);

  // Project year by year
  const projections: { year: number; age: number; corpus: number }[] = [];
  let corpus = currentSavings;
  let yearsToFIRE = -1;
  const monthlyReturn = realReturn / 12;

  for (let y = 0; y <= 50; y++) {
    projections.push({ year: y, age: age + y, corpus: Math.round(corpus) });
    if (corpus >= fireNumber && yearsToFIRE === -1) yearsToFIRE = y;
    // Monthly compounding for a year
    for (let m = 0; m < 12; m++) {
      corpus = corpus * (1 + monthlyReturn) + monthlySavings;
    }
    if (y > 0 && corpus > fireNumber * 5) break;
  }

  if (yearsToFIRE === -1 && corpus >= fireNumber) yearsToFIRE = projections.length - 1;
  const fireAge = yearsToFIRE >= 0 ? age + yearsToFIRE : null;
  const savingsRate = monthlySavings > 0 && monthlyExp > 0 ? Math.round((monthlySavings / (monthlySavings + monthlyExp)) * 100) : 0;

  // Persist computed values to localStorage
  useEffect(() => {
    if (fireNumber > 0) localStorage.setItem("fire_target", String(Math.round(fireNumber)));
    if (currentSavings > 0) localStorage.setItem("fire_corpus", String(currentSavings));
    if (fireAge !== null) localStorage.setItem("fire_age", String(fireAge));
    if (yearsToFIRE >= 0) localStorage.setItem("fire_years", String(yearsToFIRE));
    if (savingsRate > 0) localStorage.setItem("fire_savings_rate", String(savingsRate));
  }, [fireNumber, currentSavings, fireAge, yearsToFIRE, savingsRate]);

  const getExportConfig = (): ExportConfig => ({
    title: "FIRE Calculator Report", fileNamePrefix: "fire-calculator",
    sections: [
      { title: "Inputs", keyValues: [["Current Age", String(age)], ["Monthly Expenses", fmt(monthlyExp)], ["Monthly Savings", fmt(monthlySavings)], ["Current Savings", fmt(currentSavings)], ["Expected Return", `${expectedReturn}%`], ["Inflation", `${inflation}%`], ["SWR", `${swr}%`]] },
      { title: "Results", keyValues: [["FIRE Number", fmt(fireNumber)], ["Years to FIRE", yearsToFIRE >= 0 ? String(yearsToFIRE) : "N/A"], ["FIRE Age", fireAge ? String(fireAge) : "N/A"], ["Savings Rate", `${savingsRate}%`]] },
    ]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Flame className="h-6 w-6 text-primary" /> FIRE Calculator</h1>
              <p className="text-sm text-muted-foreground">Financial Independence, Retire Early — India Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ResetConfirmDialog onConfirm={() => {
              ['fire_target', 'fire_corpus', 'fire_age', 'fire_years', 'fire_savings_rate'].forEach(k => localStorage.removeItem(k));
              setAge(30); setMonthlyExp(50000); setCurrentSavings(500000); setMonthlySavings(30000);
              setExpectedReturn(12); setInflation(6); setSwr(3.5);
            }} />
            <ExportButton getConfig={getExportConfig} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Your Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label className="flex items-center">Current Age<AutoPopulateBadge fieldKey="fhs_age" populatedFields={populatedFields} onReset={resetField} /></Label><Input type="number" value={age} onChange={e => setAge(parseInt(e.target.value) || 25)} /></div>
                <div className="space-y-2"><Label className="flex items-center">Monthly Expenses (₹)<AutoPopulateBadge fieldKey="fhs_monthlyExpenses" populatedFields={populatedFields} onReset={resetField} /></Label><Input type="number" value={monthlyExp || ""} onChange={e => setMonthlyExp(parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label className="flex items-center">Current Savings (₹)<AutoPopulateBadge fieldKey="fhs_totalInvestments" populatedFields={populatedFields} onReset={resetField} /></Label><Input type="number" value={currentSavings || ""} onChange={e => setCurrentSavings(parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label className="flex items-center">Monthly Savings (₹)<AutoPopulateBadge fieldKey="fhs_monthlySavings" populatedFields={populatedFields} onReset={resetField} /></Label><Input type="number" value={monthlySavings || ""} onChange={e => setMonthlySavings(parseFloat(e.target.value) || 0)} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Assumptions</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Expected Return</Label><span className="text-sm font-medium">{expectedReturn}%</span></div>
                  <Slider value={[expectedReturn]} onValueChange={v => setExpectedReturn(v[0])} min={6} max={18} step={0.5} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Inflation</Label><span className="text-sm font-medium">{inflation}%</span></div>
                  <Slider value={[inflation]} onValueChange={v => setInflation(v[0])} min={3} max={10} step={0.5} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Safe Withdrawal Rate</Label><span className="text-sm font-medium">{swr}%</span></div>
                  <Slider value={[swr]} onValueChange={v => setSwr(v[0])} min={2} max={5} step={0.25} />
                  <p className="text-xs text-muted-foreground">India-specific: 3.5-4% recommended due to higher inflation</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="pt-4 text-center"><Target className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-xs text-muted-foreground">FIRE Number</p><p className="text-lg font-bold">{fmt(fireNumber)}</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><Calendar className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-xs text-muted-foreground">Years to FIRE</p><p className="text-lg font-bold">{yearsToFIRE >= 0 ? yearsToFIRE : "∞"}</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><Flame className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-xs text-muted-foreground">FIRE Age</p><p className="text-lg font-bold">{fireAge ?? "—"}</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-xs text-muted-foreground">Savings Rate</p><p className="text-lg font-bold">{savingsRate}%</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">Savings Trajectory (Real Terms)</CardTitle><CardDescription>Inflation-adjusted corpus growth over time</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="age" label={{ value: "Age", position: "insideBottom", offset: -5 }} className="text-muted-foreground" />
                    <YAxis tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} className="text-muted-foreground" />
                    <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={l => `Age ${l}`} />
                    <ReferenceLine y={fireNumber} stroke="hsl(var(--primary))" strokeDasharray="5 5" label={{ value: "FIRE Target", fill: "hsl(var(--primary))" }} />
                    <Line type="monotone" dataKey="corpus" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">How FIRE Number is Calculated</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>FIRE Number</strong> = Annual Expenses ÷ Safe Withdrawal Rate = {fmt(annualExp)} ÷ {swr}% = <strong>{fmt(fireNumber)}</strong></p>
                <p><strong>Real Return</strong> = (1 + {expectedReturn}%) ÷ (1 + {inflation}%) − 1 = <strong>{(realReturn * 100).toFixed(2)}%</strong> per annum</p>
                <p>The chart shows inflation-adjusted corpus growth. When your corpus reaches the FIRE number, you can sustain your current lifestyle indefinitely.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIRECalculator;

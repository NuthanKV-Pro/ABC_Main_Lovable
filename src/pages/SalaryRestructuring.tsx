import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Wallet, IndianRupee, TrendingUp, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SalaryRestructuring = () => {
  const navigate = useNavigate();
  const [ctc, setCTC] = useState(2000000);
  const [regime, setRegime] = useState("old");
  const [metro, setMetro] = useState(true);
  const [monthlyRent, setMonthlyRent] = useState(25000);

  // Component percentages
  const [basicPct, setBasicPct] = useState(40);
  const [hraPct, setHraPct] = useState(50); // % of basic
  const [specialAllowance, setSpecialAllowance] = useState(0);
  const [ltaPct, setLtaPct] = useState(5); // % of CTC
  const [npsEmployerPct, setNpsEmployerPct] = useState(10); // % of basic
  const [foodCoupons, setFoodCoupons] = useState(26400); // ₹2200/month
  const [telephoneReimbursement, setTelephoneReimbursement] = useState(12000);
  const [fuelAllowance, setFuelAllowance] = useState(24000);

  const basic = Math.round(ctc * basicPct / 100);
  const hra = Math.round(basic * hraPct / 100);
  const lta = Math.round(ctc * ltaPct / 100);
  const npsEmployer = Math.round(basic * npsEmployerPct / 100);
  const epfEmployer = Math.min(Math.round(basic * 12 / 100), 21600 * 12 / 12); // max on ₹15K basic cap
  const epfEmployee = epfEmployer;
  const gratuity = Math.round((basic * 4.81) / 100);

  const fixedComponents = hra + lta + npsEmployer + epfEmployer + gratuity + foodCoupons + telephoneReimbursement + fuelAllowance;
  const calculatedSpecial = Math.max(0, ctc - basic - fixedComponents);

  // HRA Exemption calculation
  const hraExemption = useMemo(() => {
    const actualHRA = hra;
    const rentPaid = monthlyRent * 12;
    const rentMinus10 = rentPaid - (basic * 10 / 100);
    const hraPercent = metro ? (basic * 50 / 100) : (basic * 40 / 100);
    return Math.min(actualHRA, Math.max(0, rentMinus10), hraPercent);
  }, [hra, monthlyRent, basic, metro]);

  // Tax calculation (simplified)
  const taxableIncome = useMemo(() => {
    if (regime === "new") {
      const standardDeduction = 75000;
      const taxable = basic + hra + calculatedSpecial + lta - standardDeduction;
      return Math.max(0, taxable);
    } else {
      const standardDeduction = 50000;
      const sec80C = Math.min(epfEmployee + 50000, 150000); // EPF + other 80C
      const sec80CCD = Math.min(npsEmployer, basic * 10 / 100); // NPS employer exempt
      const taxable = basic + (hra - hraExemption) + calculatedSpecial - standardDeduction - sec80C - 50000 - sec80CCD;
      return Math.max(0, taxable);
    }
  }, [regime, basic, hra, calculatedSpecial, lta, hraExemption, epfEmployee, npsEmployer]);

  const calculateTax = (income: number, isNew: boolean) => {
    if (isNew) {
      const slabs = [[0, 400000, 0], [400000, 800000, 5], [800000, 1200000, 10], [1200000, 1600000, 15], [1600000, 2000000, 20], [2000000, 2400000, 25], [2400000, Infinity, 30]];
      let tax = 0;
      for (const [min, max, rate] of slabs) {
        if (income > min) tax += (Math.min(income, max) - min) * rate / 100;
      }
      if (income <= 1200000) tax = 0; // Rebate 87A
      return Math.round(tax * 1.04); // 4% cess
    } else {
      const slabs = [[0, 250000, 0], [250000, 500000, 5], [500000, 1000000, 20], [1000000, Infinity, 30]];
      let tax = 0;
      for (const [min, max, rate] of slabs) {
        if (income > min) tax += (Math.min(income, max) - min) * rate / 100;
      }
      if (income <= 500000) tax = 0;
      return Math.round(tax * 1.04);
    }
  };

  const taxOld = calculateTax(taxableIncome, false);
  const taxNew = calculateTax(taxableIncome, true);
  const inHandMonthly = Math.round((ctc - (regime === "old" ? taxOld : taxNew) - epfEmployee * 12) / 12);

  const components = [
    { name: "Basic Salary", annual: basic, monthly: Math.round(basic / 12), taxable: true },
    { name: "HRA", annual: hra, monthly: Math.round(hra / 12), taxable: regime === "new" },
    { name: "Special Allowance", annual: calculatedSpecial, monthly: Math.round(calculatedSpecial / 12), taxable: true },
    { name: "LTA", annual: lta, monthly: Math.round(lta / 12), taxable: false },
    { name: "NPS (Employer)", annual: npsEmployer, monthly: Math.round(npsEmployer / 12), taxable: false },
    { name: "EPF (Employer)", annual: epfEmployer, monthly: Math.round(epfEmployer / 12), taxable: false },
    { name: "Gratuity", annual: gratuity, monthly: Math.round(gratuity / 12), taxable: false },
    { name: "Food Coupons", annual: foodCoupons, monthly: Math.round(foodCoupons / 12), taxable: false },
    { name: "Telephone", annual: telephoneReimbursement, monthly: Math.round(telephoneReimbursement / 12), taxable: false },
    { name: "Fuel Allowance", annual: fuelAllowance, monthly: Math.round(fuelAllowance / 12), taxable: false },
  ];

  const chartData = [
    { name: "Current", basic: basic, hra: hra, special: calculatedSpecial, taxFree: lta + npsEmployer + foodCoupons + telephoneReimbursement + fuelAllowance },
  ];

  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Salary Restructuring Tool</h1>
            <p className="text-muted-foreground text-sm">Optimize CTC components for maximum take-home pay</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-primary/5 border-primary/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">CTC</p><p className="text-xl font-bold text-primary">{formatCurrency(ctc)}</p></CardContent></Card>
          <Card className="bg-green-500/5 border-green-500/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">In-Hand (Monthly)</p><p className="text-xl font-bold text-green-500">{formatCurrency(inHandMonthly)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Tax ({regime})</p><p className="text-xl font-bold text-amber-500">{formatCurrency(regime === "old" ? taxOld : taxNew)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">HRA Exemption</p><p className="text-xl font-bold text-green-500">{formatCurrency(hraExemption)}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Salary Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Annual CTC (₹)</Label><Input type="number" value={ctc} onChange={e => setCTC(Number(e.target.value))} /></div>
                <div>
                  <Label>Tax Regime</Label>
                  <Select value={regime} onValueChange={setRegime}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="old">Old Regime</SelectItem>
                      <SelectItem value="new">New Regime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Monthly Rent Paid (₹)</Label><Input type="number" value={monthlyRent} onChange={e => setMonthlyRent(Number(e.target.value))} /></div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between"><Label>Basic (% of CTC)</Label><span className="text-sm font-semibold">{basicPct}%</span></div>
                  <Slider value={[basicPct]} onValueChange={v => setBasicPct(v[0])} min={30} max={60} step={1} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between"><Label>HRA (% of Basic)</Label><span className="text-sm font-semibold">{hraPct}%</span></div>
                  <Slider value={[hraPct]} onValueChange={v => setHraPct(v[0])} min={30} max={50} step={5} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between"><Label>NPS Employer (% of Basic)</Label><span className="text-sm font-semibold">{npsEmployerPct}%</span></div>
                  <Slider value={[npsEmployerPct]} onValueChange={v => setNpsEmployerPct(v[0])} min={0} max={14} step={1} className="mt-2" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div><Label className="text-xs">Food Coupons (₹/yr)</Label><Input type="number" value={foodCoupons} onChange={e => setFoodCoupons(Number(e.target.value))} /></div>
                  <div><Label className="text-xs">Telephone (₹/yr)</Label><Input type="number" value={telephoneReimbursement} onChange={e => setTelephoneReimbursement(Number(e.target.value))} /></div>
                  <div><Label className="text-xs">Fuel (₹/yr)</Label><Input type="number" value={fuelAllowance} onChange={e => setFuelAllowance(Number(e.target.value))} /></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Optimization Tips</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { tip: "Keep Basic at 40% of CTC for optimal EPF and HRA balance", applies: basicPct < 35 || basicPct > 50 },
                { tip: "Maximize NPS employer contribution (up to 14%) for tax-free income", applies: npsEmployerPct < 10 },
                { tip: "Use Food Coupons (₹2,200/month) for tax-free meal benefit", applies: foodCoupons === 0 },
                { tip: `Old regime saves more for your CTC` , applies: taxOld < taxNew },
                { tip: `New regime saves more for your CTC`, applies: taxNew < taxOld },
                { tip: "Consider HRA of 50% of Basic if in metro city", applies: !metro && hraPct < 50 },
              ].filter(t => t.applies).map((t, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">{t.tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Salary Breakup Table */}
        <Card className="mt-6">
          <CardHeader><CardTitle>Salary Breakup</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead className="text-right">Monthly (₹)</TableHead>
                  <TableHead className="text-right">Annual (₹)</TableHead>
                  <TableHead>Tax Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map(c => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.monthly)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.annual)}</TableCell>
                    <TableCell><Badge variant={c.taxable ? "destructive" : "default"}>{c.taxable ? "Taxable" : "Exempt/Deductible"}</Badge></TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold border-t-2">
                  <TableCell>Total CTC</TableCell>
                  <TableCell className="text-right">{formatCurrency(Math.round(ctc / 12))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(ctc)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalaryRestructuring;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Plus, Trash2, Info, CheckCircle, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CapitalBudgeting = () => {
  const navigate = useNavigate();
  const [initialInvestment, setInitialInvestment] = useState<number>(1000000);
  const [discountRate, setDiscountRate] = useState<number>(10);
  const [reinvestmentRate, setReinvestmentRate] = useState<number>(8);
  const [cashFlows, setCashFlows] = useState<number[]>([300000, 350000, 400000, 450000, 500000]);
  const [averageProfit, setAverageProfit] = useState<number>(200000);
  const [projectLife, setProjectLife] = useState<number>(5);
  const [selectedTechnique, setSelectedTechnique] = useState<string>("npv");

  const addCashFlow = () => setCashFlows([...cashFlows, 0]);
  const removeCashFlow = (index: number) => setCashFlows(cashFlows.filter((_, i) => i !== index));
  const updateCashFlow = (index: number, value: number) => {
    const updated = [...cashFlows];
    updated[index] = value;
    setCashFlows(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Payback Period
  const calculatePaybackPeriod = () => {
    let cumulative = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      cumulative += cashFlows[i];
      if (cumulative >= initialInvestment) {
        const prevCumulative = cumulative - cashFlows[i];
        const fraction = (initialInvestment - prevCumulative) / cashFlows[i];
        return i + fraction;
      }
    }
    return -1; // Not recovered
  };

  // Payback Reciprocal
  const calculatePaybackReciprocal = () => {
    const payback = calculatePaybackPeriod();
    return payback > 0 ? (1 / payback) * 100 : 0;
  };

  // Discounted Payback Period
  const calculateDiscountedPayback = () => {
    let cumulative = 0;
    const rate = discountRate / 100;
    for (let i = 0; i < cashFlows.length; i++) {
      const discountedCF = cashFlows[i] / Math.pow(1 + rate, i + 1);
      cumulative += discountedCF;
      if (cumulative >= initialInvestment) {
        const prevCumulative = cumulative - discountedCF;
        const fraction = (initialInvestment - prevCumulative) / discountedCF;
        return i + fraction;
      }
    }
    return -1;
  };

  // Accounting Rate of Return (ARR)
  const calculateARR = () => {
    const avgInvestment = initialInvestment / 2;
    return (averageProfit / avgInvestment) * 100;
  };

  // Average Rate of Return
  const calculateAverageROR = () => {
    return (averageProfit / initialInvestment) * 100;
  };

  // NPV
  const calculateNPV = () => {
    const rate = discountRate / 100;
    let npv = -initialInvestment;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    return npv;
  };

  // Profitability Index (PI)
  const calculatePI = () => {
    const rate = discountRate / 100;
    let pvCashFlows = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      pvCashFlows += cashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    return pvCashFlows / initialInvestment;
  };

  // IRR (using Newton-Raphson method)
  const calculateIRR = () => {
    let irr = 0.1;
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = -initialInvestment;
      let derivative = 0;

      for (let j = 0; j < cashFlows.length; j++) {
        const t = j + 1;
        npv += cashFlows[j] / Math.pow(1 + irr, t);
        derivative -= (t * cashFlows[j]) / Math.pow(1 + irr, t + 1);
      }

      const newIrr = irr - npv / derivative;
      if (Math.abs(newIrr - irr) < tolerance) {
        return newIrr * 100;
      }
      irr = newIrr;
    }
    return irr * 100;
  };

  // MIRR
  const calculateMIRR = () => {
    const n = cashFlows.length;
    const rate = discountRate / 100;
    const reinvestRate = reinvestmentRate / 100;

    // Future value of positive cash flows
    let fvPositive = 0;
    for (let i = 0; i < n; i++) {
      if (cashFlows[i] > 0) {
        fvPositive += cashFlows[i] * Math.pow(1 + reinvestRate, n - i - 1);
      }
    }

    // Present value of negative cash flows
    let pvNegative = initialInvestment;
    for (let i = 0; i < n; i++) {
      if (cashFlows[i] < 0) {
        pvNegative += Math.abs(cashFlows[i]) / Math.pow(1 + rate, i + 1);
      }
    }

    const mirr = Math.pow(fvPositive / pvNegative, 1 / n) - 1;
    return mirr * 100;
  };

  const paybackPeriod = calculatePaybackPeriod();
  const paybackReciprocal = calculatePaybackReciprocal();
  const discountedPayback = calculateDiscountedPayback();
  const arr = calculateARR();
  const avgROR = calculateAverageROR();
  const npv = calculateNPV();
  const pi = calculatePI();
  const irr = calculateIRR();
  const mirr = calculateMIRR();

  const getDecision = (value: number, type: string) => {
    switch (type) {
      case 'npv': return value > 0;
      case 'pi': return value > 1;
      case 'irr': return value > discountRate;
      case 'mirr': return value > discountRate;
      default: return value > 0;
    }
  };

  const techniques = [
    { id: 'payback', name: 'Payback Period', category: 'Traditional' },
    { id: 'payback-reciprocal', name: 'Payback Reciprocal', category: 'Traditional' },
    { id: 'discounted-payback', name: 'Discounted Payback', category: 'Traditional' },
    { id: 'arr', name: 'Accounting Rate of Return', category: 'Traditional' },
    { id: 'avg-ror', name: 'Average Rate of Return', category: 'Traditional' },
    { id: 'npv', name: 'Net Present Value (NPV)', category: 'DCF' },
    { id: 'pi', name: 'Profitability Index (PI)', category: 'DCF' },
    { id: 'irr', name: 'Internal Rate of Return', category: 'DCF' },
    { id: 'mirr', name: 'Modified IRR', category: 'DCF' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Capital Budgeting Techniques</h1>
              <p className="text-sm text-muted-foreground">Investment appraisal & project evaluation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Initial Investment (₹)</Label>
                  <Input
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Rate (%)</Label>
                  <Input
                    type="number"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reinvestment Rate (%) - for MIRR</Label>
                  <Input
                    type="number"
                    value={reinvestmentRate}
                    onChange={(e) => setReinvestmentRate(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Average Annual Profit (for ARR)</Label>
                  <Input
                    type="number"
                    value={averageProfit}
                    onChange={(e) => setAverageProfit(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Annual Cash Flows</Label>
                  <Button onClick={addCashFlow} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Year
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {cashFlows.map((cf, index) => (
                    <div key={index} className="relative">
                      <Label className="text-xs text-muted-foreground">Year {index + 1}</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          value={cf}
                          onChange={(e) => updateCashFlow(index, Number(e.target.value))}
                        />
                        {cashFlows.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCashFlow(index)}
                            className="text-red-500 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Techniques</TabsTrigger>
              <TabsTrigger value="traditional">Traditional Methods</TabsTrigger>
              <TabsTrigger value="dcf">DCF Methods</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Traditional Methods */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Payback Period</CardTitle>
                    <CardDescription>Time to recover initial investment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      {paybackPeriod > 0 ? `${paybackPeriod.toFixed(2)} years` : 'Not recovered'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {paybackPeriod > 0 && paybackPeriod <= cashFlows.length ? 'Investment recovered' : 'Exceeds project life'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Payback Reciprocal</CardTitle>
                    <CardDescription>Estimated return rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{paybackReciprocal.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground mt-1">1 / Payback Period</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Discounted Payback</CardTitle>
                    <CardDescription>Time-value adjusted recovery</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      {discountedPayback > 0 ? `${discountedPayback.toFixed(2)} years` : 'Not recovered'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">At {discountRate}% discount rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">ARR</CardTitle>
                    <CardDescription>Accounting Rate of Return</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{arr.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Profit / Avg Investment</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average ROR</CardTitle>
                    <CardDescription>Average Rate of Return</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{avgROR.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Profit / Initial Investment</p>
                  </CardContent>
                </Card>

                {/* DCF Methods */}
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      NPV
                      {npv > 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    <CardDescription>Net Present Value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${npv > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(npv)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {npv > 0 ? 'Accept: NPV > 0' : 'Reject: NPV < 0'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      PI
                      {pi > 1 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    <CardDescription>Profitability Index</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${pi > 1 ? 'text-green-500' : 'text-red-500'}`}>
                      {pi.toFixed(3)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pi > 1 ? 'Accept: PI > 1' : 'Reject: PI < 1'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      IRR
                      {irr > discountRate ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    <CardDescription>Internal Rate of Return</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${irr > discountRate ? 'text-green-500' : 'text-red-500'}`}>
                      {irr.toFixed(2)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {irr > discountRate ? `Accept: IRR > ${discountRate}%` : `Reject: IRR < ${discountRate}%`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      MIRR
                      {mirr > discountRate ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    <CardDescription>Modified IRR</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${mirr > discountRate ? 'text-green-500' : 'text-red-500'}`}>
                      {mirr.toFixed(2)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reinvestment @ {reinvestmentRate}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="traditional">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payback Period</CardTitle>
                    <CardDescription>Time to recover initial investment without considering time value of money</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary mb-4">
                      {paybackPeriod > 0 ? `${paybackPeriod.toFixed(2)} years` : 'Not recovered'}
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Formula:</strong> Years before full recovery + (Unrecovered cost / Cash flow of next year)</p>
                      <p><strong>Pros:</strong> Simple, emphasizes liquidity</p>
                      <p><strong>Cons:</strong> Ignores time value, cash flows after payback</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payback Reciprocal</CardTitle>
                    <CardDescription>Rough estimate of project return rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary mb-4">{paybackReciprocal.toFixed(2)}%</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Formula:</strong> 1 / Payback Period × 100</p>
                      <p><strong>Use:</strong> Quick approximation of IRR for perpetual projects</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Discounted Payback Period</CardTitle>
                    <CardDescription>Time to recover considering time value of money</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary mb-4">
                      {discountedPayback > 0 ? `${discountedPayback.toFixed(2)} years` : 'Not recovered'}
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Method:</strong> Uses discounted cash flows at {discountRate}%</p>
                      <p><strong>Advantage:</strong> Accounts for time value of money</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accounting Rate of Return (ARR)</CardTitle>
                    <CardDescription>Average profit as percentage of average investment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary mb-4">{arr.toFixed(2)}%</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Formula:</strong> Average Profit / Average Investment × 100</p>
                      <p><strong>Avg Investment:</strong> {formatCurrency(initialInvestment / 2)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Rate of Return</CardTitle>
                    <CardDescription>Average profit as percentage of initial investment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary mb-4">{avgROR.toFixed(2)}%</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Formula:</strong> Average Profit / Initial Investment × 100</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dcf">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Net Present Value (NPV)
                      {npv > 0 ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </CardTitle>
                    <CardDescription>Present value of all cash flows minus initial investment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-4xl font-bold mb-4 ${npv > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(npv)}
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Formula:</strong> Σ(CFt / (1+r)^t) - Initial Investment</p>
                      <p><strong>Decision:</strong> {npv > 0 ? 'ACCEPT - Project adds value' : 'REJECT - Project destroys value'}</p>
                      <p><strong>Note:</strong> Most theoretically sound method</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Profitability Index (PI)
                      {pi > 1 ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </CardTitle>
                    <CardDescription>Benefit-cost ratio of the project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-4xl font-bold mb-4 ${pi > 1 ? 'text-green-500' : 'text-red-500'}`}>
                      {pi.toFixed(3)}
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Formula:</strong> PV of Cash Inflows / Initial Investment</p>
                      <p><strong>Decision:</strong> {pi > 1 ? 'ACCEPT - PI > 1' : 'REJECT - PI < 1'}</p>
                      <p><strong>Use:</strong> Useful for capital rationing</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Internal Rate of Return (IRR)
                      {irr > discountRate ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </CardTitle>
                    <CardDescription>Discount rate at which NPV equals zero</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-4xl font-bold mb-4 ${irr > discountRate ? 'text-green-500' : 'text-red-500'}`}>
                      {irr.toFixed(2)}%
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Method:</strong> Rate where NPV = 0</p>
                      <p><strong>Decision:</strong> {irr > discountRate ? `ACCEPT - IRR (${irr.toFixed(2)}%) > Cost of Capital (${discountRate}%)` : `REJECT - IRR < Cost of Capital`}</p>
                      <p><strong>Limitation:</strong> May give multiple rates for non-conventional cash flows</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Modified IRR (MIRR)
                      {mirr > discountRate ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </CardTitle>
                    <CardDescription>IRR assuming reinvestment at a specified rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-4xl font-bold mb-4 ${mirr > discountRate ? 'text-green-500' : 'text-red-500'}`}>
                      {mirr.toFixed(2)}%
                    </p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Reinvestment Rate:</strong> {reinvestmentRate}%</p>
                      <p><strong>Advantage:</strong> Single rate, more realistic reinvestment assumption</p>
                      <p><strong>Decision:</strong> {mirr > discountRate ? 'ACCEPT' : 'REJECT'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Investment Decision Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground">NPV Decision</p>
                  <p className={`text-xl font-bold ${npv > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {npv > 0 ? 'Accept' : 'Reject'}
                  </p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground">PI Decision</p>
                  <p className={`text-xl font-bold ${pi > 1 ? 'text-green-500' : 'text-red-500'}`}>
                    {pi > 1 ? 'Accept' : 'Reject'}
                  </p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground">IRR Decision</p>
                  <p className={`text-xl font-bold ${irr > discountRate ? 'text-green-500' : 'text-red-500'}`}>
                    {irr > discountRate ? 'Accept' : 'Reject'}
                  </p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground">MIRR Decision</p>
                  <p className={`text-xl font-bold ${mirr > discountRate ? 'text-green-500' : 'text-red-500'}`}>
                    {mirr > discountRate ? 'Accept' : 'Reject'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Key Concepts & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm"><strong>NPV Rule:</strong> Accept if NPV &gt; 0. It directly measures value creation.</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm"><strong>IRR vs NPV:</strong> When mutually exclusive, prefer NPV. IRR can mislead with different project scales.</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm"><strong>PI Usage:</strong> Best for capital rationing - rank projects by PI when budget is limited.</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm"><strong>MIRR Advantage:</strong> Avoids multiple IRR problem and uses realistic reinvestment rate.</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm"><strong>Payback Limitation:</strong> Use only as a supplementary measure, not primary decision tool.</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm"><strong>Discount Rate:</strong> Should reflect project risk - use WACC or risk-adjusted rate.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Info className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This Capital Budgeting Calculator is provided for educational and informational purposes only.
                It is designed to help understand different investment appraisal techniques.
              </p>
              <p>
                The calculations are based on the inputs provided and assume cash flows occur at the end of each period.
                Real-world projects may have mid-year cash flows, inflation adjustments, and other complexities.
              </p>
              <p>
                IRR calculation uses iterative methods and may not converge for all cash flow patterns.
                Projects with non-conventional cash flows (sign changes) may have multiple IRRs.
              </p>
              <p>
                Investment decisions should be made after thorough analysis including sensitivity analysis, scenario planning,
                and consultation with qualified financial professionals.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CapitalBudgeting;

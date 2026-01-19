import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, TrendingUp, IndianRupee, Percent, Info, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CompoundInterestCalculator = () => {
  const navigate = useNavigate();
  
  // Basic inputs
  const [principal, setPrincipal] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("yearly");
  
  // SIP inputs
  const [enableSIP, setEnableSIP] = useState<boolean>(true);
  const [monthlySIP, setMonthlySIP] = useState<number>(10000);
  
  // Step-up SIP
  const [enableStepUp, setEnableStepUp] = useState<boolean>(false);
  const [stepUpPercent, setStepUpPercent] = useState<number>(10);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCompoundingPeriods = (freq: string) => {
    switch (freq) {
      case "monthly": return 12;
      case "quarterly": return 4;
      case "half-yearly": return 2;
      case "yearly": return 1;
      default: return 1;
    }
  };

  // Calculate yearly breakdown
  const calculateYearlyBreakdown = () => {
    const n = getCompoundingPeriods(compoundingFrequency);
    const r = annualRate / 100;
    const breakdown = [];
    
    let currentSIP = monthlySIP;
    let totalInvested = principal;
    let accumulatedValue = principal;
    
    for (let year = 1; year <= years; year++) {
      const startValue = accumulatedValue;
      
      // Compound interest on existing corpus
      const compoundedPrincipal = startValue * Math.pow(1 + r / n, n);
      
      // SIP contribution for this year (if enabled)
      let sipContribution = 0;
      let sipFutureValue = 0;
      
      if (enableSIP) {
        sipContribution = currentSIP * 12;
        
        // Future value of SIP at year end (monthly compounding assumed for SIP)
        const monthlyRate = r / 12;
        sipFutureValue = currentSIP * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) * (1 + monthlyRate);
        
        totalInvested += sipContribution;
        
        // Step-up for next year
        if (enableStepUp) {
          currentSIP = currentSIP * (1 + stepUpPercent / 100);
        }
      }
      
      accumulatedValue = compoundedPrincipal + sipFutureValue;
      
      const interestEarned = accumulatedValue - startValue - sipContribution;
      const cumulativeInterest = accumulatedValue - totalInvested;
      
      breakdown.push({
        year,
        startValue: Math.round(startValue),
        sipContribution: Math.round(sipContribution),
        monthlySIPAmount: Math.round(enableSIP ? (enableStepUp ? currentSIP / (1 + stepUpPercent / 100) : monthlySIP) : 0),
        interestEarned: Math.round(interestEarned),
        endValue: Math.round(accumulatedValue),
        totalInvested: Math.round(totalInvested),
        cumulativeInterest: Math.round(cumulativeInterest),
        wealthGain: Math.round(accumulatedValue - totalInvested)
      });
    }
    
    return breakdown;
  };

  const yearlyData = calculateYearlyBreakdown();
  const finalValue = yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].endValue : principal;
  const totalInvested = yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].totalInvested : principal;
  const totalInterest = finalValue - totalInvested;

  // Chart data
  const chartData = yearlyData.map(d => ({
    year: `Y${d.year}`,
    invested: d.totalInvested,
    value: d.endValue,
    interest: d.cumulativeInterest
  }));

  // Comparison: With vs Without Step-up
  const calculateWithoutStepUp = () => {
    if (!enableStepUp) return null;
    
    const n = getCompoundingPeriods(compoundingFrequency);
    const r = annualRate / 100;
    let accumulatedValue = principal;
    let totalInvested = principal;
    
    for (let year = 1; year <= years; year++) {
      const compoundedPrincipal = accumulatedValue * Math.pow(1 + r / n, n);
      
      if (enableSIP) {
        const monthlyRate = r / 12;
        const sipFutureValue = monthlySIP * ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) * (1 + monthlyRate);
        totalInvested += monthlySIP * 12;
        accumulatedValue = compoundedPrincipal + sipFutureValue;
      } else {
        accumulatedValue = compoundedPrincipal;
      }
    }
    
    return { value: accumulatedValue, invested: totalInvested };
  };

  const withoutStepUp = calculateWithoutStepUp();
  const stepUpBenefit = withoutStepUp ? finalValue - withoutStepUp.value : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Compound Interest Calculator</h1>
              <p className="text-sm text-muted-foreground">With Step-up SIP & yearly growth breakdown</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* What is Compound Interest */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Understanding Compound Interest & Step-up SIP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Compound Interest</h4>
                  <p className="text-sm text-muted-foreground">
                    Interest calculated on the initial principal AND the accumulated interest from previous periods. 
                    Often called "interest on interest" - the key to exponential wealth growth over time.
                  </p>
                  <p className="text-xs mt-2 font-mono bg-muted/50 p-2 rounded">
                    A = P × (1 + r/n)^(n×t)
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Step-up SIP</h4>
                  <p className="text-sm text-muted-foreground">
                    A strategy where you increase your SIP amount by a fixed percentage each year. 
                    Aligns with income growth and significantly boosts final corpus through increased contributions.
                  </p>
                  <p className="text-xs mt-2 font-mono bg-muted/50 p-2 rounded">
                    SIP(year) = SIP × (1 + step%)^(year-1)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Calculator Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Initial Principal</Label>
                    <span className="text-sm font-medium">{formatCurrency(principal)}</span>
                  </div>
                  <Slider
                    value={[principal]}
                    onValueChange={(v) => setPrincipal(v[0])}
                    min={0}
                    max={10000000}
                    step={10000}
                  />
                  <Input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Annual Interest Rate (%)</Label>
                    <span className="text-sm font-medium">{annualRate}%</span>
                  </div>
                  <Slider
                    value={[annualRate]}
                    onValueChange={(v) => setAnnualRate(v[0])}
                    min={1}
                    max={30}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Investment Period (Years)</Label>
                    <span className="text-sm font-medium">{years} years</span>
                  </div>
                  <Slider
                    value={[years]}
                    onValueChange={(v) => setYears(v[0])}
                    min={1}
                    max={40}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Compounding Frequency</Label>
                  <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Enable Monthly SIP</Label>
                    <Switch checked={enableSIP} onCheckedChange={setEnableSIP} />
                  </div>

                  {enableSIP && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Monthly SIP Amount</Label>
                          <span className="text-sm font-medium">{formatCurrency(monthlySIP)}</span>
                        </div>
                        <Slider
                          value={[monthlySIP]}
                          onValueChange={(v) => setMonthlySIP(v[0])}
                          min={500}
                          max={500000}
                          step={500}
                        />
                        <Input
                          type="number"
                          value={monthlySIP}
                          onChange={(e) => setMonthlySIP(Number(e.target.value))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">Enable Step-up SIP</Label>
                        <Switch checked={enableStepUp} onCheckedChange={setEnableStepUp} />
                      </div>

                      {enableStepUp && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Annual Step-up (%)</Label>
                            <span className="text-sm font-medium">{stepUpPercent}%</span>
                          </div>
                          <Slider
                            value={[stepUpPercent]}
                            onValueChange={(v) => setStepUpPercent(v[0])}
                            min={1}
                            max={25}
                            step={1}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Final Corpus</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(finalValue)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Total Invested</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
                  </CardContent>
                </Card>
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Interest Earned</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(totalInterest)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Wealth Multiplier</p>
                    <p className="text-2xl font-bold">{(finalValue / totalInvested).toFixed(2)}x</p>
                  </CardContent>
                </Card>
              </div>

              {/* Step-up Benefit */}
              {enableStepUp && withoutStepUp && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Step-up SIP Benefit</p>
                        <p className="text-xl font-bold text-amber-500">+{formatCurrency(stepUpBenefit)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Without Step-up: {formatCurrency(withoutStepUp.value)}</p>
                        <p className="text-xs text-muted-foreground">With Step-up: {formatCurrency(finalValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Wealth Growth Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Year ${label.replace('Y', '')}`}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="invested" name="Total Invested" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="interest" name="Interest Earned" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Yearly Breakdown Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Year-by-Year Breakdown</CardTitle>
                  <CardDescription>Detailed growth analysis for each year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-card">Year</TableHead>
                          <TableHead className="sticky top-0 bg-card">Start Value</TableHead>
                          {enableSIP && <TableHead className="sticky top-0 bg-card">Monthly SIP</TableHead>}
                          {enableSIP && <TableHead className="sticky top-0 bg-card">SIP (Year)</TableHead>}
                          <TableHead className="sticky top-0 bg-card">Interest</TableHead>
                          <TableHead className="sticky top-0 bg-card">End Value</TableHead>
                          <TableHead className="sticky top-0 bg-card">Total Invested</TableHead>
                          <TableHead className="sticky top-0 bg-card">Wealth Gain</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {yearlyData.map((row) => (
                          <TableRow key={row.year}>
                            <TableCell className="font-medium">Year {row.year}</TableCell>
                            <TableCell>{formatCurrency(row.startValue)}</TableCell>
                            {enableSIP && <TableCell>{formatCurrency(row.monthlySIPAmount)}</TableCell>}
                            {enableSIP && <TableCell>{formatCurrency(row.sipContribution)}</TableCell>}
                            <TableCell className="text-green-500">+{formatCurrency(row.interestEarned)}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(row.endValue)}</TableCell>
                            <TableCell>{formatCurrency(row.totalInvested)}</TableCell>
                            <TableCell className="text-primary font-semibold">{formatCurrency(row.wealthGain)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Power of Compounding Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                The Power of Compounding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Rule of 72</h4>
                  <p className="text-sm text-muted-foreground">
                    Divide 72 by your interest rate to find how many years it takes to double your money.
                  </p>
                  <p className="text-lg font-bold mt-2">
                    At {annualRate}%: ~{Math.round(72 / annualRate)} years to double
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Time is Key</h4>
                  <p className="text-sm text-muted-foreground">
                    Starting early matters more than starting big. The longer your money compounds, 
                    the more exponential growth you experience.
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Step-up Advantage</h4>
                  <p className="text-sm text-muted-foreground">
                    Increasing SIP by just 10% annually can boost your final corpus by 50-80% over 
                    20+ years compared to a flat SIP.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compounding Frequency Info */}
          <Card>
            <CardHeader>
              <CardTitle>Compounding Frequency Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Times per Year</TableHead>
                      <TableHead>Best For</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Yearly</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>FDs, Bonds</TableCell>
                      <TableCell>Interest added once a year</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Half-Yearly</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>Some corporate deposits</TableCell>
                      <TableCell>Interest added every 6 months</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Quarterly</TableCell>
                      <TableCell>4</TableCell>
                      <TableCell>PPF, NSC</TableCell>
                      <TableCell>Interest added every 3 months</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Monthly</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>Savings accounts, mutual funds</TableCell>
                      <TableCell>Interest added every month</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Higher compounding frequency = marginally higher returns. The difference is more pronounced at higher interest rates and longer durations.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This Compound Interest Calculator is provided for educational and illustrative purposes only. 
                The calculations assume a constant rate of return throughout the investment period, which is 
                unrealistic for market-linked investments like mutual funds and stocks.
              </p>
              <p>
                Actual returns may vary significantly based on market conditions, fund performance, and economic factors. 
                Past performance does not guarantee future results. Equity investments are subject to market risks.
              </p>
              <p>
                The step-up SIP calculation assumes you can increase your SIP amount consistently each year. 
                Consider your income growth trajectory and financial commitments before committing to step-up plans.
              </p>
              <p>
                This tool does not account for taxes, exit loads, expense ratios, or inflation. 
                Consult a qualified financial advisor before making investment decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CompoundInterestCalculator;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingDown, IndianRupee, Percent, Info, AlertTriangle, Lightbulb, BarChart3, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const InflationImpactCalculator = () => {
  const navigate = useNavigate();
  
  // Purchasing Power inputs
  const [currentAmount, setCurrentAmount] = useState<number>(100000);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [years, setYears] = useState<number>(20);
  
  // Investment Return inputs
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000000);
  const [nominalReturn, setNominalReturn] = useState<number>(12);
  const [investmentYears, setInvestmentYears] = useState<number>(10);

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

  // Calculate purchasing power erosion
  const calculatePurchasingPower = () => {
    const data = [];
    for (let year = 0; year <= years; year++) {
      const futureValue = currentAmount / Math.pow(1 + inflationRate / 100, year);
      const erosion = currentAmount - futureValue;
      const erosionPercent = (erosion / currentAmount) * 100;
      data.push({
        year,
        purchasingPower: Math.round(futureValue),
        erosion: Math.round(erosion),
        erosionPercent: erosionPercent.toFixed(1)
      });
    }
    return data;
  };

  // Calculate real vs nominal returns
  const calculateRealReturns = () => {
    const realReturn = ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
    const data = [];
    
    for (let year = 0; year <= investmentYears; year++) {
      const nominalValue = investmentAmount * Math.pow(1 + nominalReturn / 100, year);
      const realValue = investmentAmount * Math.pow(1 + realReturn / 100, year);
      const inflationLoss = nominalValue - realValue;
      
      data.push({
        year,
        nominalValue: Math.round(nominalValue),
        realValue: Math.round(realValue),
        inflationLoss: Math.round(inflationLoss),
        realReturn: realReturn.toFixed(2)
      });
    }
    return { data, realReturn };
  };

  // Cost of common items over time
  const calculateFutureCosts = () => {
    const items = [
      { name: "Monthly Groceries", current: 10000 },
      { name: "School Fees (Annual)", current: 150000 },
      { name: "Health Insurance Premium", current: 25000 },
      { name: "Movie Ticket", current: 250 },
      { name: "Restaurant Meal for 2", current: 1500 },
      { name: "Domestic Flight", current: 5000 },
      { name: "Mid-range Car", current: 1000000 },
      { name: "1 BHK Rent (Metro)", current: 25000 },
    ];

    return items.map(item => ({
      ...item,
      in5Years: Math.round(item.current * Math.pow(1 + inflationRate / 100, 5)),
      in10Years: Math.round(item.current * Math.pow(1 + inflationRate / 100, 10)),
      in20Years: Math.round(item.current * Math.pow(1 + inflationRate / 100, 20)),
    }));
  };

  const purchasingPowerData = calculatePurchasingPower();
  const { data: returnData, realReturn } = calculateRealReturns();
  const futureCosts = calculateFutureCosts();
  
  const finalPurchasingPower = purchasingPowerData[purchasingPowerData.length - 1];
  const finalReturnData = returnData[returnData.length - 1];

  // Chart data for purchasing power
  const ppChartData = purchasingPowerData.map(d => ({
    year: `Y${d.year}`,
    value: d.purchasingPower,
    erosion: d.erosion
  }));

  // Chart data for returns comparison
  const returnChartData = returnData.map(d => ({
    year: `Y${d.year}`,
    nominal: d.nominalValue,
    real: d.realValue
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Inflation Impact Calculator</h1>
              <p className="text-sm text-muted-foreground">Understand how inflation erodes your money's value</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* What is Inflation */}
          <Card className="bg-gradient-to-br from-red-500/5 to-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Understanding Inflation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Inflation is the rate at which the general level of prices for goods and services rises, 
                eroding your money's purchasing power over time. What ₹100 buys today will cost more tomorrow.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">CPI Inflation (India)</h4>
                  <p className="text-2xl font-bold">~5-6%</p>
                  <p className="text-xs text-muted-foreground">Average over last 10 years</p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Education Inflation</h4>
                  <p className="text-2xl font-bold">~10-12%</p>
                  <p className="text-xs text-muted-foreground">School & college fees growth</p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Healthcare Inflation</h4>
                  <p className="text-2xl font-bold">~8-10%</p>
                  <p className="text-xs text-muted-foreground">Medical costs growth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="purchasing-power" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="purchasing-power">Purchasing Power</TabsTrigger>
              <TabsTrigger value="real-returns">Real vs Nominal Returns</TabsTrigger>
              <TabsTrigger value="future-costs">Future Costs</TabsTrigger>
            </TabsList>

            {/* Purchasing Power Tab */}
            <TabsContent value="purchasing-power" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Current Amount</Label>
                        <span className="text-sm font-medium">{formatCurrency(currentAmount)}</span>
                      </div>
                      <Slider
                        value={[currentAmount]}
                        onValueChange={(v) => setCurrentAmount(v[0])}
                        min={10000}
                        max={10000000}
                        step={10000}
                      />
                      <Input
                        type="number"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Inflation Rate (%)</Label>
                        <span className="text-sm font-medium">{inflationRate}%</span>
                      </div>
                      <Slider
                        value={[inflationRate]}
                        onValueChange={(v) => setInflationRate(v[0])}
                        min={1}
                        max={15}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Time Period (Years)</Label>
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
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      Purchasing Power Erosion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ppChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Area type="monotone" dataKey="value" name="Purchasing Power" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Today's Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(currentAmount)}</p>
                  </CardContent>
                </Card>
                <Card className="border-red-500/30">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Worth After {years} Years</p>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(finalPurchasingPower.purchasingPower)}</p>
                  </CardContent>
                </Card>
                <Card className="border-red-500/30">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Value Lost</p>
                    <p className="text-2xl font-bold text-red-500">-{formatCurrency(finalPurchasingPower.erosion)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Erosion %</p>
                    <p className="text-2xl font-bold">{finalPurchasingPower.erosionPercent}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Yearly Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Year-by-Year Erosion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-80">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year</TableHead>
                          <TableHead>Purchasing Power</TableHead>
                          <TableHead>Value Lost</TableHead>
                          <TableHead>Erosion %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchasingPowerData.map((row) => (
                          <TableRow key={row.year}>
                            <TableCell className="font-medium">Year {row.year}</TableCell>
                            <TableCell>{formatCurrency(row.purchasingPower)}</TableCell>
                            <TableCell className="text-red-500">-{formatCurrency(row.erosion)}</TableCell>
                            <TableCell>{row.erosionPercent}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Real vs Nominal Returns Tab */}
            <TabsContent value="real-returns" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Investment Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Investment Amount</Label>
                        <span className="text-sm font-medium">{formatCurrency(investmentAmount)}</span>
                      </div>
                      <Slider
                        value={[investmentAmount]}
                        onValueChange={(v) => setInvestmentAmount(v[0])}
                        min={100000}
                        max={50000000}
                        step={100000}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Nominal Return (%)</Label>
                        <span className="text-sm font-medium">{nominalReturn}%</span>
                      </div>
                      <Slider
                        value={[nominalReturn]}
                        onValueChange={(v) => setNominalReturn(v[0])}
                        min={1}
                        max={25}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Inflation Rate (%)</Label>
                        <span className="text-sm font-medium">{inflationRate}%</span>
                      </div>
                      <Slider
                        value={[inflationRate]}
                        onValueChange={(v) => setInflationRate(v[0])}
                        min={1}
                        max={15}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Investment Period</Label>
                        <span className="text-sm font-medium">{investmentYears} years</span>
                      </div>
                      <Slider
                        value={[investmentYears]}
                        onValueChange={(v) => setInvestmentYears(v[0])}
                        min={1}
                        max={30}
                        step={1}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Nominal vs Real Value</CardTitle>
                    <CardDescription>How inflation reduces your actual returns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={returnChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Line type="monotone" dataKey="nominal" name="Nominal Value" stroke="#8884d8" strokeWidth={2} />
                          <Line type="monotone" dataKey="real" name="Real Value (Inflation Adjusted)" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Return Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Nominal Return</p>
                    <p className="text-2xl font-bold text-primary">{nominalReturn}%</p>
                  </CardContent>
                </Card>
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Inflation</p>
                    <p className="text-2xl font-bold text-red-500">-{inflationRate}%</p>
                  </CardContent>
                </Card>
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Real Return</p>
                    <p className="text-2xl font-bold text-green-500">{realReturn}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Nominal Final Value</p>
                    <p className="text-xl font-bold">{formatCurrency(finalReturnData.nominalValue)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground">Real Final Value</p>
                    <p className="text-xl font-bold text-green-500">{formatCurrency(finalReturnData.realValue)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Formula Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Real Return Formula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/30 rounded-lg font-mono text-center">
                    <p className="text-lg">Real Return = ((1 + Nominal Return) / (1 + Inflation Rate)) - 1</p>
                    <p className="mt-2 text-primary">
                      = ((1 + {nominalReturn}%) / (1 + {inflationRate}%)) - 1 = <strong>{realReturn}%</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Future Costs Tab */}
            <TabsContent value="future-costs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What Things Will Cost in the Future</CardTitle>
                  <CardDescription>Based on {inflationRate}% annual inflation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Today</TableHead>
                          <TableHead>In 5 Years</TableHead>
                          <TableHead>In 10 Years</TableHead>
                          <TableHead>In 20 Years</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {futureCosts.map((item) => (
                          <TableRow key={item.name}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{formatCurrency(item.current)}</TableCell>
                            <TableCell className="text-amber-500">{formatCurrency(item.in5Years)}</TableCell>
                            <TableCell className="text-orange-500">{formatCurrency(item.in10Years)}</TableCell>
                            <TableCell className="text-red-500">{formatCurrency(item.in20Years)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Inflation Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Beating Inflation: Investment Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <h4 className="font-semibold text-green-600">Equity (Stocks/MF)</h4>
                      <p className="text-sm text-muted-foreground mt-1">12-15% historical returns</p>
                      <p className="text-xs mt-2">Best for long-term wealth creation</p>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <h4 className="font-semibold text-blue-600">Real Estate</h4>
                      <p className="text-sm text-muted-foreground mt-1">8-12% appreciation + rent</p>
                      <p className="text-xs mt-2">Good hedge against inflation</p>
                    </div>
                    <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                      <h4 className="font-semibold text-amber-600">Gold</h4>
                      <p className="text-sm text-muted-foreground mt-1">8-10% long-term returns</p>
                      <p className="text-xs mt-2">Traditional inflation hedge</p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <h4 className="font-semibold text-purple-600">PPF / Debt Funds</h4>
                      <p className="text-sm text-muted-foreground mt-1">6-8% returns</p>
                      <p className="text-xs mt-2">Safe but may barely beat inflation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This calculator provides estimates based on assumed constant inflation rates. Actual inflation 
                varies year to year and differs across sectors (food, healthcare, education, etc.).
              </p>
              <p>
                Historical average inflation in India has been around 5-7%, but specific categories like 
                education (10-12%) and healthcare (8-10%) often experience higher inflation.
              </p>
              <p>
                Investment returns are not guaranteed and past performance does not predict future results. 
                Consult a financial advisor for personalized investment advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InflationImpactCalculator;

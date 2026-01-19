import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, IndianRupee, Percent, Info, AlertTriangle, Lightbulb, CheckCircle, Star, TrendingUp, Shield, Lock, Coins } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Investment80C {
  id: string;
  name: string;
  shortName: string;
  maxLimit: number;
  currentInvestment: number;
  expectedReturn: string;
  lockIn: string;
  risk: 'Low' | 'Medium' | 'High';
  taxOnMaturity: string;
  recommended: boolean;
  description: string;
  icon: any;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TaxSaver80COptimizer = () => {
  const navigate = useNavigate();
  
  const [annualIncome, setAnnualIncome] = useState<number>(1200000);
  const [taxRegime, setTaxRegime] = useState<string>("old");
  const [ageGroup, setAgeGroup] = useState<string>("below60");
  const [riskAppetite, setRiskAppetite] = useState<string>("moderate");
  
  const [investments, setInvestments] = useState<Investment80C[]>([
    { id: 'epf', name: 'Employee Provident Fund', shortName: 'EPF', maxLimit: 150000, currentInvestment: 50000, expectedReturn: '8.15%', lockIn: 'Till retirement', risk: 'Low', taxOnMaturity: 'Exempt', recommended: true, description: 'Mandatory for salaried, employer matching', icon: Shield },
    { id: 'ppf', name: 'Public Provident Fund', shortName: 'PPF', maxLimit: 150000, currentInvestment: 0, expectedReturn: '7.1%', lockIn: '15 years', risk: 'Low', taxOnMaturity: 'Exempt', recommended: true, description: 'Government backed, EEE tax status', icon: Lock },
    { id: 'elss', name: 'ELSS Mutual Funds', shortName: 'ELSS', maxLimit: 150000, currentInvestment: 0, expectedReturn: '12-15%', lockIn: '3 years', risk: 'High', taxOnMaturity: 'LTCG 12.5%', recommended: true, description: 'Shortest lock-in, market-linked returns', icon: TrendingUp },
    { id: 'nps', name: 'National Pension System', shortName: 'NPS', maxLimit: 50000, currentInvestment: 0, expectedReturn: '9-12%', lockIn: 'Till 60', risk: 'Medium', taxOnMaturity: '60% exempt', recommended: true, description: 'Extra ₹50K under 80CCD(1B)', icon: Coins },
    { id: 'ssy', name: 'Sukanya Samriddhi Yojana', shortName: 'SSY', maxLimit: 150000, currentInvestment: 0, expectedReturn: '8.2%', lockIn: '21 years', risk: 'Low', taxOnMaturity: 'Exempt', recommended: false, description: 'For girl child, high returns for risk', icon: Star },
    { id: 'ulip', name: 'ULIP', shortName: 'ULIP', maxLimit: 150000, currentInvestment: 0, expectedReturn: '8-12%', lockIn: '5 years', risk: 'Medium', taxOnMaturity: 'Exempt*', recommended: false, description: 'Insurance + investment combo', icon: Shield },
    { id: 'lifeins', name: 'Life Insurance Premium', shortName: 'LIC/Term', maxLimit: 150000, currentInvestment: 0, expectedReturn: '4-6%', lockIn: 'Policy term', risk: 'Low', taxOnMaturity: 'Exempt', recommended: false, description: 'Term insurance recommended over endowment', icon: Shield },
    { id: 'nsc', name: 'National Savings Certificate', shortName: 'NSC', maxLimit: 150000, currentInvestment: 0, expectedReturn: '7.7%', lockIn: '5 years', risk: 'Low', taxOnMaturity: 'Taxable', recommended: false, description: 'Fixed returns, post office scheme', icon: Lock },
    { id: 'tuition', name: 'Children Tuition Fees', shortName: 'Tuition', maxLimit: 150000, currentInvestment: 0, expectedReturn: 'N/A', lockIn: 'N/A', risk: 'Low', taxOnMaturity: 'N/A', recommended: false, description: 'Max 2 children, full-time education only', icon: Star },
    { id: 'homeloan', name: 'Home Loan Principal', shortName: 'Home Loan', maxLimit: 150000, currentInvestment: 0, expectedReturn: 'N/A', lockIn: 'N/A', risk: 'Low', taxOnMaturity: 'N/A', recommended: false, description: 'Principal repayment qualifies', icon: Lock },
  ]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Tax slab calculation
  const getTaxRate = () => {
    if (taxRegime === 'new') return 0; // No 80C benefit in new regime
    
    if (annualIncome <= 250000) return 0;
    if (annualIncome <= 500000) return 5;
    if (annualIncome <= 1000000) return 20;
    return 30;
  };

  const taxRate = getTaxRate();
  const maxDeduction = 150000;
  const npsExtra = 50000; // Additional 80CCD(1B)
  
  const totalCurrentInvestment = investments.reduce((sum, inv) => sum + inv.currentInvestment, 0);
  const section80CInvestment = Math.min(totalCurrentInvestment, maxDeduction);
  const npsInvestment = investments.find(i => i.id === 'nps')?.currentInvestment || 0;
  const npsExtraDeduction = Math.min(npsInvestment, npsExtra);
  
  const totalDeduction = section80CInvestment + npsExtraDeduction;
  const taxSaved = (totalDeduction * taxRate) / 100;
  const remainingLimit = maxDeduction - section80CInvestment;
  const utilizationPercent = (section80CInvestment / maxDeduction) * 100;

  const updateInvestment = (id: string, value: number) => {
    setInvestments(investments.map(inv => 
      inv.id === id ? { ...inv, currentInvestment: value } : inv
    ));
  };

  // Generate optimal allocation recommendation
  const getOptimalAllocation = useMemo(() => {
    const remaining = maxDeduction - investments.find(i => i.id === 'epf')?.currentInvestment!;
    
    if (riskAppetite === 'aggressive') {
      return [
        { name: 'ELSS', allocation: Math.min(remaining * 0.6, 90000), reason: 'Highest return potential, shortest lock-in' },
        { name: 'NPS', allocation: 50000, reason: 'Extra ₹50K deduction + market exposure' },
        { name: 'PPF', allocation: Math.min(remaining * 0.2, 30000), reason: 'Safety anchor, EEE status' },
      ];
    } else if (riskAppetite === 'conservative') {
      return [
        { name: 'PPF', allocation: Math.min(remaining * 0.5, 75000), reason: 'Government backed, guaranteed returns' },
        { name: 'NPS', allocation: 50000, reason: 'Extra deduction, moderate risk' },
        { name: 'NSC/SSY', allocation: Math.min(remaining * 0.3, 45000), reason: 'Fixed returns, safe' },
      ];
    } else {
      return [
        { name: 'ELSS', allocation: Math.min(remaining * 0.4, 60000), reason: 'Good returns with 3-year lock-in' },
        { name: 'PPF', allocation: Math.min(remaining * 0.3, 45000), reason: 'Safety + tax-free returns' },
        { name: 'NPS', allocation: 50000, reason: 'Extra ₹50K deduction under 80CCD(1B)' },
      ];
    }
  }, [riskAppetite, investments]);

  // Pie chart data
  const pieData = investments
    .filter(inv => inv.currentInvestment > 0)
    .map(inv => ({ name: inv.shortName, value: inv.currentInvestment }));

  // Comparison chart
  const comparisonData = investments.slice(0, 6).map(inv => ({
    name: inv.shortName,
    return: parseFloat(inv.expectedReturn) || 0,
    lockIn: inv.lockIn.includes('year') ? parseInt(inv.lockIn) : (inv.lockIn.includes('retirement') ? 30 : 5)
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
              <h1 className="text-2xl font-bold text-primary">Tax Saver 80C Optimizer</h1>
              <p className="text-sm text-muted-foreground">Maximize your Section 80C tax savings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* New Regime Warning */}
          {taxRegime === 'new' && (
            <Card className="border-amber-500/30 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-600">New Tax Regime Selected</h4>
                    <p className="text-sm text-muted-foreground">
                      Section 80C deductions are NOT available under the New Tax Regime. 
                      Switch to Old Regime to claim these benefits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Annual Income (₹)</Label>
                  <Input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Regime</Label>
                  <Select value={taxRegime} onValueChange={setTaxRegime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="old">Old Regime (with deductions)</SelectItem>
                      <SelectItem value="new">New Regime (no deductions)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age Group</Label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below60">Below 60 years</SelectItem>
                      <SelectItem value="60to80">60-80 years</SelectItem>
                      <SelectItem value="above80">Above 80 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Risk Appetite</Label>
                  <Select value={riskAppetite} onValueChange={setRiskAppetite}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (Low Risk)</SelectItem>
                      <SelectItem value="moderate">Moderate (Balanced)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (High Returns)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Tax Savings Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-xs text-muted-foreground">80C Invested</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(section80CInvestment)}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">80C Limit</p>
                    <p className="text-xl font-bold">{formatCurrency(maxDeduction)}</p>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <p className="text-xs text-muted-foreground">NPS Extra (80CCD)</p>
                    <p className="text-xl font-bold text-amber-500">{formatCurrency(npsExtraDeduction)}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <p className="text-xs text-muted-foreground">Tax Saved @ {taxRate}%</p>
                    <p className="text-xl font-bold text-green-500">{formatCurrency(taxSaved)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>80C Utilization: {formatCurrency(section80CInvestment)} / {formatCurrency(maxDeduction)}</span>
                    <span className={utilizationPercent >= 100 ? 'text-green-500' : 'text-amber-500'}>
                      {utilizationPercent.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={Math.min(utilizationPercent, 100)} className="h-3" />
                  {remainingLimit > 0 && taxRegime === 'old' && (
                    <p className="text-sm text-amber-500">
                      You can still invest {formatCurrency(remainingLimit)} more to maximize tax savings!
                    </p>
                  )}
                </div>

                {/* Pie Chart */}
                {pieData.length > 0 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Optimal Allocation Recommendation */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Recommended Allocation ({riskAppetite.charAt(0).toUpperCase() + riskAppetite.slice(1)} Profile)
              </CardTitle>
              <CardDescription>Based on your risk appetite and tax slab</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getOptimalAllocation.map((rec, i) => (
                  <div key={i} className="p-4 bg-card rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{rec.name}</h4>
                      <span className="text-lg font-bold text-primary">{formatCurrency(rec.allocation)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investment Options Table */}
          <Card>
            <CardHeader>
              <CardTitle>All 80C Investment Options</CardTitle>
              <CardDescription>Enter your current investments to see total deduction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investment</TableHead>
                      <TableHead>Your Investment (₹)</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Lock-in</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Tax on Maturity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((inv) => (
                      <TableRow key={inv.id} className={inv.recommended ? 'bg-green-500/5' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {inv.recommended && <Star className="h-4 w-4 text-amber-500" />}
                            <div>
                              <p className="font-medium">{inv.name}</p>
                              <p className="text-xs text-muted-foreground">{inv.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={inv.currentInvestment}
                            onChange={(e) => updateInvestment(inv.id, Number(e.target.value))}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell className="text-green-500 font-medium">{inv.expectedReturn}</TableCell>
                        <TableCell>{inv.lockIn}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            inv.risk === 'Low' ? 'bg-green-500/20 text-green-500' :
                            inv.risk === 'Medium' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {inv.risk}
                          </span>
                        </TableCell>
                        <TableCell>{inv.taxOnMaturity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Comparison: Returns vs Lock-in</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="return" name="Expected Return (%)" fill="#82ca9d" />
                    <Bar dataKey="lockIn" name="Lock-in (Years)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Key Points About Section 80C
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">80C Limits</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Maximum deduction: ₹1,50,000 per year</li>
                    <li>• Includes EPF, PPF, ELSS, LIC, NSC, SSY, Tuition fees, Home loan principal</li>
                    <li>• Only available in Old Tax Regime</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Additional Benefits</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 80CCD(1B): Extra ₹50,000 for NPS</li>
                    <li>• 80CCD(2): Employer NPS contribution (10% of salary)</li>
                    <li>• Total potential: ₹2,00,000+ in deductions</li>
                  </ul>
                </div>
              </div>
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
                This tool provides general guidance on Section 80C tax-saving investments. The recommendations 
                are based on typical investment characteristics and may not suit every individual's circumstances.
              </p>
              <p>
                Investment returns mentioned are indicative and based on historical performance. Actual returns 
                may vary. ELSS and NPS are market-linked products subject to market risks.
              </p>
              <p>
                Tax laws are subject to change. Always verify current limits and rules with official sources 
                or a qualified tax professional before making investment decisions.
              </p>
              <p>
                This is not personalized financial advice. Consider consulting a certified financial planner 
                for recommendations tailored to your specific financial situation and goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TaxSaver80COptimizer;

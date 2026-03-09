import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calculator, TrendingDown, Clock, Banknote } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const EMIPrepaymentOptimizer = () => {
  const goBack = useGoBack();
  const [loanAmount, setLoanAmount] = useState("5000000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [tenure, setTenure] = useState("20");
  const [completedMonths, setCompletedMonths] = useState("24");
  const [prepaymentAmount, setPrepaymentAmount] = useState("500000");

  const principal = parseFloat(loanAmount) || 0;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const totalMonths = (parseInt(tenure) || 0) * 12;
  const paidMonths = parseInt(completedMonths) || 0;
  const prepay = parseFloat(prepaymentAmount) || 0;

  // Calculate current EMI
  const emi = rate > 0 ? (principal * rate * Math.pow(1 + rate, totalMonths)) / (Math.pow(1 + rate, totalMonths) - 1) : principal / totalMonths;

  // Calculate outstanding principal after paid months
  let outstandingPrincipal = principal;
  for (let i = 0; i < paidMonths; i++) {
    const interest = outstandingPrincipal * rate;
    const principalPart = emi - interest;
    outstandingPrincipal -= principalPart;
  }

  const remainingMonths = totalMonths - paidMonths;

  // Option 1: Reduce EMI (keep tenure same)
  const newPrincipalReduceEMI = outstandingPrincipal - prepay;
  const newEMIReduceEMI = rate > 0 
    ? (newPrincipalReduceEMI * rate * Math.pow(1 + rate, remainingMonths)) / (Math.pow(1 + rate, remainingMonths) - 1)
    : newPrincipalReduceEMI / remainingMonths;
  const emiSavings = emi - newEMIReduceEMI;
  const totalSavingsReduceEMI = emiSavings * remainingMonths;

  // Option 2: Reduce Tenure (keep EMI same)
  const newPrincipalReduceTenure = outstandingPrincipal - prepay;
  let newTenureMonths = remainingMonths;
  if (rate > 0 && emi > newPrincipalReduceTenure * rate) {
    newTenureMonths = Math.ceil(Math.log(emi / (emi - newPrincipalReduceTenure * rate)) / Math.log(1 + rate));
  }
  const tenureSavingsMonths = remainingMonths - newTenureMonths;
  const tenureSavingsYears = Math.floor(tenureSavingsMonths / 12);
  const tenureSavingsRemainingMonths = tenureSavingsMonths % 12;

  // Total interest calculation
  const totalInterestOriginal = (emi * remainingMonths) - outstandingPrincipal;
  const totalInterestReduceEMI = (newEMIReduceEMI * remainingMonths) - newPrincipalReduceEMI;
  const totalInterestReduceTenure = (emi * newTenureMonths) - newPrincipalReduceEMI;

  const interestSavedReduceEMI = totalInterestOriginal - totalInterestReduceEMI;
  const interestSavedReduceTenure = totalInterestOriginal - totalInterestReduceTenure;

  // Chart data for comparison
  const chartData = [];
  let balanceOriginal = outstandingPrincipal;
  let balanceReduceEMI = newPrincipalReduceEMI;
  let balanceReduceTenure = newPrincipalReduceEMI;

  for (let year = 0; year <= Math.ceil(remainingMonths / 12); year++) {
    chartData.push({
      year: `Year ${year}`,
      original: Math.round(balanceOriginal),
      reduceEMI: Math.round(balanceReduceEMI),
      reduceTenure: Math.round(balanceReduceTenure)
    });

    for (let m = 0; m < 12 && (year * 12 + m) < remainingMonths; m++) {
      const intOrig = balanceOriginal * rate;
      balanceOriginal -= (emi - intOrig);

      const intReduceEMI = balanceReduceEMI * rate;
      balanceReduceEMI -= (newEMIReduceEMI - intReduceEMI);

      if ((year * 12 + m) < newTenureMonths) {
        const intReduceTenure = balanceReduceTenure * rate;
        balanceReduceTenure -= (emi - intReduceTenure);
      }
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">EMI Prepayment Optimizer</CardTitle>
              <CardDescription>Compare EMI reduction vs tenure reduction strategies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Original Loan Amount (₹)</Label>
                  <Input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Interest Rate (% p.a.)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Original Tenure (Years)</Label>
                  <Input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                  />
                </div>
                <div>
                  <Label>EMIs Already Paid (Months)</Label>
                  <Input
                    type="number"
                    value={completedMonths}
                    onChange={(e) => setCompletedMonths(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Prepayment Amount (₹)</Label>
                  <Input
                    type="number"
                    value={prepaymentAmount}
                    onChange={(e) => setPrepaymentAmount(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Current Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current EMI:</span>
                      <span className="font-mono font-bold">₹{Math.round(emi).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outstanding Principal:</span>
                      <span className="font-mono">₹{Math.round(outstandingPrincipal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Tenure:</span>
                      <span className="font-mono">{Math.floor(remainingMonths / 12)}y {remainingMonths % 12}m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Option 1: Reduce EMI</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>New EMI:</span>
                      <span className="font-mono font-bold text-green-500">₹{Math.round(newEMIReduceEMI).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Savings:</span>
                      <span className="font-mono">₹{Math.round(emiSavings).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Saved:</span>
                      <span className="font-mono">₹{Math.round(interestSavedReduceEMI).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold">Option 2: Reduce Tenure</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>New Tenure:</span>
                      <span className="font-mono font-bold text-purple-500">
                        {Math.floor(newTenureMonths / 12)}y {newTenureMonths % 12}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tenure Reduced By:</span>
                      <span className="font-mono">{tenureSavingsYears}y {tenureSavingsRemainingMonths}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Saved:</span>
                      <span className="font-mono">₹{Math.round(interestSavedReduceTenure).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Banknote className="h-5 w-5" /> Recommendation
              </h4>
              <p className="text-sm">
                {interestSavedReduceTenure > interestSavedReduceEMI ? (
                  <span>
                    <strong className="text-green-500">Reduce Tenure</strong> saves you more! 
                    You'll save ₹{Math.round(interestSavedReduceTenure - interestSavedReduceEMI).toLocaleString()} more in interest 
                    and be debt-free {tenureSavingsYears} years {tenureSavingsRemainingMonths} months earlier.
                  </span>
                ) : (
                  <span>
                    <strong className="text-green-500">Reduce EMI</strong> gives better immediate cash flow relief of ₹{Math.round(emiSavings).toLocaleString()}/month. 
                    Choose this if you need monthly budget flexibility.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Principal Balance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="original" 
                    name="Without Prepayment"
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reduceEMI" 
                    name="Reduce EMI"
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reduceTenure" 
                    name="Reduce Tenure"
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default EMIPrepaymentOptimizer;

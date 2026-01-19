import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingDown, TrendingUp, AlertTriangle, Info, Calendar, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SWPCalculator = () => {
  const navigate = useNavigate();
  const [initialInvestment, setInitialInvestment] = useState<number>(2500000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState<number>(25000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [withdrawalPeriod, setWithdrawalPeriod] = useState<number>(20);
  const [withdrawalFrequency, setWithdrawalFrequency] = useState<string>("monthly");

  // Calculations
  const frequencyMultiplier = withdrawalFrequency === "monthly" ? 12 : 
                              withdrawalFrequency === "quarterly" ? 4 : 1;
  const withdrawalAmount = withdrawalFrequency === "monthly" ? monthlyWithdrawal :
                           withdrawalFrequency === "quarterly" ? monthlyWithdrawal * 3 :
                           monthlyWithdrawal * 12;
  
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = withdrawalPeriod * 12;
  
  // Calculate if corpus will last
  const calculateCorpusLife = () => {
    let balance = initialInvestment;
    let months = 0;
    const maxMonths = withdrawalPeriod * 12;
    
    while (balance > 0 && months < maxMonths) {
      // Monthly growth
      balance = balance * (1 + monthlyRate);
      // Monthly withdrawal
      if (withdrawalFrequency === "monthly" || 
          (withdrawalFrequency === "quarterly" && months % 3 === 0) ||
          (withdrawalFrequency === "yearly" && months % 12 === 0)) {
        balance -= withdrawalAmount;
      }
      months++;
    }
    
    return { balance: Math.max(0, balance), months, depleted: balance <= 0 };
  };

  const { balance: finalBalance, months: actualMonths, depleted } = calculateCorpusLife();
  
  const totalWithdrawals = depleted 
    ? (actualMonths / (12 / frequencyMultiplier)) * withdrawalAmount
    : withdrawalPeriod * frequencyMultiplier * withdrawalAmount;
  
  const totalReturns = totalWithdrawals + finalBalance - initialInvestment;
  
  // Generate yearly schedule
  const generateSchedule = () => {
    const schedule = [];
    let balance = initialInvestment;
    
    for (let year = 1; year <= Math.min(10, withdrawalPeriod); year++) {
      const yearStart = balance;
      let yearlyWithdrawal = 0;
      let yearlyGrowth = 0;
      
      for (let month = 0; month < 12; month++) {
        const growth = balance * monthlyRate;
        yearlyGrowth += growth;
        balance += growth;
        
        if (withdrawalFrequency === "monthly" ||
            (withdrawalFrequency === "quarterly" && month % 3 === 0) ||
            (withdrawalFrequency === "yearly" && month === 0)) {
          const withdrawal = Math.min(withdrawalAmount, balance);
          balance -= withdrawal;
          yearlyWithdrawal += withdrawal;
        }
      }
      
      schedule.push({
        year,
        startBalance: yearStart,
        growth: yearlyGrowth,
        withdrawal: yearlyWithdrawal,
        endBalance: Math.max(0, balance),
      });
      
      if (balance <= 0) break;
    }
    
    return schedule;
  };

  const schedule = generateSchedule();

  // Calculate sustainable withdrawal rate
  const sustainableWithdrawal = initialInvestment * (monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <TrendingDown className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SWP Calculator</h1>
            <p className="text-muted-foreground">Plan regular income from your mutual fund investments</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Investment Details
              </CardTitle>
              <CardDescription>Configure your SWP parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initialInvestment">Initial Investment (₹)</Label>
                <Input
                  id="initialInvestment"
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  min={100000}
                  step={100000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyWithdrawal">Monthly Withdrawal (₹)</Label>
                <Input
                  id="monthlyWithdrawal"
                  type="number"
                  value={monthlyWithdrawal}
                  onChange={(e) => setMonthlyWithdrawal(Number(e.target.value))}
                  min={1000}
                  step={1000}
                />
                <p className="text-xs text-muted-foreground">
                  Amount adjusted based on withdrawal frequency
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Withdrawal Frequency</Label>
                <Select value={withdrawalFrequency} onValueChange={setWithdrawalFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
                <Input
                  id="expectedReturn"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  min={1}
                  max={30}
                  step={0.5}
                />
                <p className="text-xs text-muted-foreground">
                  Equity: 10-15%, Hybrid: 8-12%, Debt: 6-8%
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawalPeriod">Withdrawal Period (years)</Label>
                <Select value={withdrawalPeriod.toString()} onValueChange={(v) => setWithdrawalPeriod(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                    <SelectItem value="15">15 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                    <SelectItem value="25">25 Years</SelectItem>
                    <SelectItem value="30">30 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                SWP Summary
              </CardTitle>
              <CardDescription>Your withdrawal plan analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initial Corpus</span>
                  <span className="font-semibold">₹{initialInvestment.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {withdrawalFrequency.charAt(0).toUpperCase() + withdrawalFrequency.slice(1)} Withdrawal
                  </span>
                  <span className="font-semibold">₹{withdrawalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Return</span>
                  <span className="font-semibold">{expectedReturn}% p.a.</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${depleted ? 'bg-red-500/10 border-red-500/20' : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20'}`}>
                <p className="text-sm text-muted-foreground mb-1">
                  {depleted ? 'Corpus Depletes In' : 'Balance After ' + withdrawalPeriod + ' Years'}
                </p>
                <p className={`text-3xl font-bold ${depleted ? 'text-red-600' : 'text-purple-600'}`}>
                  {depleted 
                    ? `${Math.floor(actualMonths / 12)} years ${actualMonths % 12} months`
                    : `₹${finalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                  }
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Withdrawals</span>
                  <span className="font-semibold text-green-600">₹{totalWithdrawals.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Returns Earned</span>
                  <span className="font-semibold">₹{Math.max(0, totalReturns).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Sustainable Monthly Withdrawal</span>
                  <span className="font-bold text-primary">₹{sustainableWithdrawal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {depleted && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Corpus Depletion Warning</AlertTitle>
                  <AlertDescription className="text-xs">
                    Your corpus will be exhausted before {withdrawalPeriod} years. 
                    Consider reducing withdrawal to ₹{sustainableWithdrawal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month for sustainability.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Tax Tip</AlertTitle>
                <AlertDescription className="text-xs">
                  Only the gains portion of SWP is taxable. For equity funds held 1+ year, LTCG above ₹1.25 lakh is taxed at 12.5%.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Yearly Schedule */}
        <Card className="mt-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Yearly Projection (First 10 Years)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Opening Balance</TableHead>
                    <TableHead className="text-right">Growth</TableHead>
                    <TableHead className="text-right">Withdrawal</TableHead>
                    <TableHead className="text-right">Closing Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((row) => (
                    <TableRow key={row.year}>
                      <TableCell className="font-medium">Year {row.year}</TableCell>
                      <TableCell className="text-right">₹{row.startBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right text-green-600">+₹{row.growth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right text-orange-600">-₹{row.withdrawal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right font-semibold">₹{row.endBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert variant="destructive" className="mt-6 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Disclaimer</AlertTitle>
          <AlertDescription>
            This calculator provides estimates based on assumed returns. Actual mutual fund returns vary and are subject to market risks. 
            Past performance does not guarantee future results. Please consult a financial advisor before making investment decisions.
          </AlertDescription>
        </Alert>

        {/* Info Section */}
        <Card className="mt-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              What is SWP?
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Systematic Withdrawal Plan (SWP)</strong>: A facility to withdraw a fixed amount from your mutual fund investment at regular intervals.</li>
              <li><strong>Capital Protection</strong>: Unlike fixed deposits, your corpus continues to grow while you withdraw, potentially lasting longer.</li>
              <li><strong>Flexibility</strong>: Choose withdrawal frequency (monthly, quarterly, yearly) and amount as per your needs.</li>
              <li><strong>Tax Efficiency</strong>: Only gains are taxed, not the principal. Better than interest income from FDs for tax planning.</li>
              <li><strong>Best For</strong>: Retirees, supplementing income, meeting regular expenses from investments.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SWPCalculator;

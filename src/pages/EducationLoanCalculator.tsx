import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, GraduationCap, TrendingUp, AlertTriangle, Info, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EducationLoanCalculator = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [courseDuration, setCourseDuration] = useState<number>(4);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(6);
  const [repaymentYears, setRepaymentYears] = useState<number>(10);
  const [isInterestSubsidy, setIsInterestSubsidy] = useState<boolean>(false);
  const [subsidyPercentage, setSubsidyPercentage] = useState<number>(100);

  // Calculations
  const totalMoratoriumMonths = (courseDuration * 12) + moratoriumMonths;
  const monthlyRate = interestRate / 12 / 100;
  
  // Interest during moratorium (if no subsidy)
  const moratoriumInterest = isInterestSubsidy 
    ? loanAmount * monthlyRate * totalMoratoriumMonths * (1 - subsidyPercentage / 100)
    : loanAmount * monthlyRate * totalMoratoriumMonths;
  
  // Principal at start of repayment (compound if interest not paid during moratorium)
  const principalAtRepayment = loanAmount + moratoriumInterest;
  
  // EMI calculation
  const n = repaymentYears * 12;
  const emi = principalAtRepayment * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - loanAmount;

  // Generate repayment schedule (first 5 years)
  const generateSchedule = () => {
    const schedule = [];
    let balance = principalAtRepayment;
    
    for (let year = 1; year <= Math.min(5, repaymentYears); year++) {
      const yearlyInterest = balance * interestRate / 100;
      const yearlyPrincipal = (emi * 12) - yearlyInterest;
      balance = Math.max(0, balance - yearlyPrincipal);
      
      schedule.push({
        year,
        emi: emi * 12,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance,
      });
    }
    
    return schedule;
  };

  const schedule = generateSchedule();

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
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Education Loan Calculator</h1>
            <p className="text-muted-foreground">Plan your education financing with moratorium & subsidy options</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Loan Details
              </CardTitle>
              <CardDescription>Enter your education loan parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  min={100000}
                  step={50000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (% per annum)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={1}
                  max={20}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseDuration">Course Duration (years)</Label>
                <Select value={courseDuration.toString()} onValueChange={(v) => setCourseDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="4">4 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="6">6 Years (Medical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moratorium">Moratorium Period (months after course)</Label>
                <Select value={moratoriumMonths.toString()} onValueChange={(v) => setMoratoriumMonths(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Period to find employment after course completion
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repaymentYears">Repayment Period (years)</Label>
                <Select value={repaymentYears.toString()} onValueChange={(v) => setRepaymentYears(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="7">7 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                    <SelectItem value="12">12 Years</SelectItem>
                    <SelectItem value="15">15 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subsidy" className="cursor-pointer">Interest Subsidy (CSIS/ISLFHE)</Label>
                  <Switch
                    id="subsidy"
                    checked={isInterestSubsidy}
                    onCheckedChange={setIsInterestSubsidy}
                  />
                </div>
                {isInterestSubsidy && (
                  <div className="space-y-2">
                    <Label htmlFor="subsidyPercentage">Subsidy Coverage (%)</Label>
                    <Select value={subsidyPercentage.toString()} onValueChange={(v) => setSubsidyPercentage(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100% (Full Subsidy)</SelectItem>
                        <SelectItem value="50">50% (Partial Subsidy)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Government schemes like CSIS provide interest subsidy during moratorium for eligible students
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Loan Summary
              </CardTitle>
              <CardDescription>Your education loan breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Moratorium</span>
                  <span className="font-semibold">{totalMoratoriumMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moratorium Interest</span>
                  <span className="font-semibold">₹{moratoriumInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                {isInterestSubsidy && (
                  <div className="flex justify-between text-green-600">
                    <span>Interest Subsidy Benefit</span>
                    <span className="font-semibold">
                      ₹{(loanAmount * monthlyRate * totalMoratoriumMonths * subsidyPercentage / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground mb-1">Monthly EMI (after moratorium)</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal at Repayment Start</span>
                  <span className="font-semibold">₹{principalAtRepayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-semibold">₹{totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total Repayment</span>
                  <span className="font-bold text-primary">₹{totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertTitle>Repayment Timeline</AlertTitle>
                <AlertDescription className="text-xs">
                  EMI starts {totalMoratoriumMonths} months after loan disbursement. 
                  You can pay interest during moratorium to reduce total cost.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Repayment Schedule */}
        <Card className="mt-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Yearly Repayment Schedule (First 5 Years)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Yearly Payment</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((row) => (
                    <TableRow key={row.year}>
                      <TableCell className="font-medium">Year {row.year}</TableCell>
                      <TableCell className="text-right">₹{row.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right text-green-600">₹{row.principal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right text-orange-600">₹{row.interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right font-semibold">₹{row.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
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
            This is an indicative calculation only. Actual interest rates, moratorium periods, and subsidy eligibility vary by bank and government schemes. 
            Interest subsidy schemes like CSIS are subject to income and institution eligibility criteria. 
            Processing fees, insurance, and other charges may apply. Please consult with your bank for accurate loan quotes.
          </AlertDescription>
        </Alert>

        {/* Info Section */}
        <Card className="mt-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              About Education Loan Subsidies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>CSIS (Central Sector Interest Subsidy):</strong> Full interest subsidy during moratorium for students from families with income up to ₹4.5 lakhs per annum</li>
              <li><strong>ISLFHE (Interest Subsidy for Loan for Higher Education):</strong> Applicable for professional/technical courses in India</li>
              <li><strong>Moratorium Period:</strong> Course duration + 6-12 months grace period after completion</li>
              <li><strong>Tax Benefit:</strong> Interest paid on education loans is deductible under Section 80E (no upper limit) for 8 years</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducationLoanCalculator;

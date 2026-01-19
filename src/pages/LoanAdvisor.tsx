import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingDown, Clock, IndianRupee, Lightbulb, CheckCircle2, AlertCircle, Calculator } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";

const LoanAdvisor = () => {
  const navigate = useNavigate();
  
  // Current loan details
  const [outstandingAmount, setOutstandingAmount] = useState<number>(2500000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [remainingTenure, setRemainingTenure] = useState<number>(15);
  const [currentEMI, setCurrentEMI] = useState<number>(26120);
  
  // Extra payment details
  const [extraPayment, setExtraPayment] = useState<number>(100000);
  const [paymentType, setPaymentType] = useState<string>("lumpsum");
  
  // User preferences
  const [monthlyBudget, setMonthlyBudget] = useState<number>(35000);
  const [priority, setPriority] = useState<string>("balanced");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} years`;
    return `${years} years ${remainingMonths} months`;
  };

  // Calculate EMI
  const calculateEMI = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return principal / months;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return emi;
  };

  // Calculate tenure for given EMI
  const calculateTenure = (principal: number, rate: number, emi: number) => {
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return principal / emi;
    const months = Math.log(emi / (emi - principal * monthlyRate)) / Math.log(1 + monthlyRate);
    return Math.ceil(months);
  };

  // Current scenario (no extra payment)
  const currentTenureMonths = remainingTenure * 12;
  const currentTotalPayment = currentEMI * currentTenureMonths;
  const currentTotalInterest = currentTotalPayment - outstandingAmount;

  // Scenario 1: Reduce EMI (keep same tenure)
  const newPrincipalAfterPayment = outstandingAmount - extraPayment;
  const reducedEMI = calculateEMI(newPrincipalAfterPayment, interestRate, currentTenureMonths);
  const emiReduction = currentEMI - reducedEMI;
  const reducedEMITotalPayment = reducedEMI * currentTenureMonths + extraPayment;
  const reducedEMITotalInterest = reducedEMITotalPayment - outstandingAmount;
  const interestSavedEMI = currentTotalInterest - reducedEMITotalInterest;

  // Scenario 2: Reduce Tenure (keep same EMI)
  const reducedTenureMonths = calculateTenure(newPrincipalAfterPayment, interestRate, currentEMI);
  const tenureReduction = currentTenureMonths - reducedTenureMonths;
  const reducedTenureTotalPayment = currentEMI * reducedTenureMonths + extraPayment;
  const reducedTenureTotalInterest = reducedTenureTotalPayment - outstandingAmount;
  const interestSavedTenure = currentTotalInterest - reducedTenureTotalInterest;

  // Determine recommendation
  const getRecommendation = () => {
    const emiAffordability = monthlyBudget - currentEMI;
    const canAffordCurrentEMI = emiAffordability >= 0;
    
    if (priority === "low-emi") {
      return {
        choice: "reduce-emi",
        reason: "You prioritize lower monthly payments for better cash flow management.",
        confidence: "high"
      };
    }
    
    if (priority === "fast-freedom") {
      return {
        choice: "reduce-tenure",
        reason: "You want to become debt-free faster and save maximum interest.",
        confidence: "high"
      };
    }
    
    // Balanced recommendation
    if (!canAffordCurrentEMI) {
      return {
        choice: "reduce-emi",
        reason: "Your current EMI exceeds your budget. Reducing EMI will ease your monthly burden.",
        confidence: "high"
      };
    }
    
    if (interestSavedTenure > interestSavedEMI * 1.5) {
      return {
        choice: "reduce-tenure",
        reason: `Reducing tenure saves ${formatCurrency(interestSavedTenure - interestSavedEMI)} more in interest compared to reducing EMI.`,
        confidence: "high"
      };
    }
    
    if (emiAffordability > currentEMI * 0.3) {
      return {
        choice: "reduce-tenure",
        reason: "You have comfortable buffer in your budget. Reducing tenure maximizes savings.",
        confidence: "medium"
      };
    }
    
    return {
      choice: "reduce-emi",
      reason: "Given your budget constraints, reducing EMI provides better financial flexibility.",
      confidence: "medium"
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Loan Advisor</h1>
              <p className="text-sm text-muted-foreground">Reduce EMI vs Reduce Tenure - Expert Guidance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Current Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Outstanding Principal (₹)</Label>
                  <Input
                    type="number"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interest Rate: {interestRate}%</Label>
                  <Slider
                    value={[interestRate]}
                    onValueChange={(v) => setInterestRate(v[0])}
                    min={5}
                    max={20}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Remaining Tenure (Years)</Label>
                  <Input
                    type="number"
                    value={remainingTenure}
                    onChange={(e) => setRemainingTenure(Number(e.target.value))}
                    min={1}
                    max={30}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current EMI (₹)</Label>
                  <Input
                    type="number"
                    value={currentEMI}
                    onChange={(e) => setCurrentEMI(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Extra Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  Extra Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lumpsum">Lumpsum Payment</SelectItem>
                      <SelectItem value="bonus">Annual Bonus</SelectItem>
                      <SelectItem value="savings">Accumulated Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Extra Payment Amount (₹)</Label>
                  <Input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Monthly Budget for EMI (₹)</Label>
                  <Input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>What's your priority?</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced Approach</SelectItem>
                      <SelectItem value="low-emi">Lower Monthly EMI</SelectItem>
                      <SelectItem value="fast-freedom">Debt-Free Faster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommendation */}
            <Alert className={recommendation.choice === "reduce-tenure" 
              ? "border-green-500/50 bg-green-500/10" 
              : "border-blue-500/50 bg-blue-500/10"}>
              <Lightbulb className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold flex items-center gap-2">
                Our Recommendation
                <Badge variant={recommendation.confidence === "high" ? "default" : "secondary"}>
                  {recommendation.confidence} confidence
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="text-lg font-medium">
                  {recommendation.choice === "reduce-tenure" 
                    ? "🎯 Reduce Tenure - Keep paying same EMI" 
                    : "💰 Reduce EMI - Lower your monthly burden"}
                </p>
                <p className="mt-1 text-muted-foreground">{recommendation.reason}</p>
              </AlertDescription>
            </Alert>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Reduce EMI */}
              <Card className={`border-2 ${recommendation.choice === "reduce-emi" ? "border-primary shadow-lg" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-blue-500" />
                      Reduce EMI
                    </CardTitle>
                    {recommendation.choice === "reduce-emi" && (
                      <Badge className="bg-primary">Recommended</Badge>
                    )}
                  </div>
                  <CardDescription>Keep same tenure, lower monthly payment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">New EMI</span>
                      <span className="text-xl font-bold text-primary">{formatCurrency(reducedEMI)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">EMI Reduction</span>
                      <span className="font-semibold text-green-500">-{formatCurrency(emiReduction)}/month</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tenure Remains</span>
                      <span className="font-medium">{formatMonths(currentTenureMonths)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Interest</span>
                      <span className="font-medium">{formatCurrency(reducedEMITotalInterest)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-muted-foreground">Interest Saved</span>
                      <span className="font-bold text-green-500">{formatCurrency(interestSavedEMI)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Pros
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Better monthly cash flow</li>
                      <li>• More flexibility for other expenses</li>
                      <li>• Lower financial stress</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      Cons
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Pay more interest overall</li>
                      <li>• Longer debt duration</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Option 2: Reduce Tenure */}
              <Card className={`border-2 ${recommendation.choice === "reduce-tenure" ? "border-primary shadow-lg" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      Reduce Tenure
                    </CardTitle>
                    {recommendation.choice === "reduce-tenure" && (
                      <Badge className="bg-primary">Recommended</Badge>
                    )}
                  </div>
                  <CardDescription>Keep same EMI, finish loan faster</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">New Tenure</span>
                      <span className="text-xl font-bold text-primary">{formatMonths(reducedTenureMonths)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tenure Reduction</span>
                      <span className="font-semibold text-green-500">-{formatMonths(tenureReduction)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">EMI Remains</span>
                      <span className="font-medium">{formatCurrency(currentEMI)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Interest</span>
                      <span className="font-medium">{formatCurrency(reducedTenureTotalInterest)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-muted-foreground">Interest Saved</span>
                      <span className="font-bold text-green-500">{formatCurrency(interestSavedTenure)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Pros
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Maximum interest savings</li>
                      <li>• Become debt-free sooner</li>
                      <li>• Build equity faster</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      Cons
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Same monthly burden</li>
                      <li>• Less financial flexibility</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current vs New Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Summary Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Parameter</th>
                        <th className="text-right py-3 px-2">Current</th>
                        <th className="text-right py-3 px-2 text-blue-500">Reduce EMI</th>
                        <th className="text-right py-3 px-2 text-green-500">Reduce Tenure</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-2">Monthly EMI</td>
                        <td className="text-right py-3 px-2">{formatCurrency(currentEMI)}</td>
                        <td className="text-right py-3 px-2 text-blue-500">{formatCurrency(reducedEMI)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(currentEMI)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2">Tenure</td>
                        <td className="text-right py-3 px-2">{formatMonths(currentTenureMonths)}</td>
                        <td className="text-right py-3 px-2">{formatMonths(currentTenureMonths)}</td>
                        <td className="text-right py-3 px-2 text-green-500">{formatMonths(reducedTenureMonths)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2">Total Interest</td>
                        <td className="text-right py-3 px-2">{formatCurrency(currentTotalInterest)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(reducedEMITotalInterest)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(reducedTenureTotalInterest)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2">Total Payment</td>
                        <td className="text-right py-3 px-2">{formatCurrency(currentTotalPayment)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(reducedEMITotalPayment)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(reducedTenureTotalPayment)}</td>
                      </tr>
                      <tr className="bg-muted/50">
                        <td className="py-3 px-2 font-semibold">Interest Saved</td>
                        <td className="text-right py-3 px-2">-</td>
                        <td className="text-right py-3 px-2 text-blue-500 font-semibold">{formatCurrency(interestSavedEMI)}</td>
                        <td className="text-right py-3 px-2 text-green-500 font-semibold">{formatCurrency(interestSavedTenure)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Expert Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Expert Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">📊 The Math Rule</p>
                    <p className="text-sm text-muted-foreground">
                      Reducing tenure almost always saves more interest than reducing EMI. The difference can be substantial over long loan periods.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">💡 Emergency Fund First</p>
                    <p className="text-sm text-muted-foreground">
                      Before making prepayments, ensure you have 6 months of expenses saved. Financial security comes before debt reduction.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">🎯 Tax Benefits</p>
                    <p className="text-sm text-muted-foreground">
                      Home loan principal repayment qualifies for Section 80C deduction (up to ₹1.5L). Interest is deductible under Section 24 (up to ₹2L for self-occupied).
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium mb-2">⚡ Best Time to Prepay</p>
                    <p className="text-sm text-muted-foreground">
                      Prepay early in the loan tenure for maximum impact. Interest component is highest in initial years.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* When to Choose What */}
            <Card>
              <CardHeader>
                <CardTitle>When to Choose What?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-blue-500">
                      <TrendingDown className="w-4 h-4" />
                      Choose Reduce EMI When:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500" />
                        You're facing monthly cash flow issues
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500" />
                        You expect variable income in future
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500" />
                        You want to invest the savings elsewhere
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500" />
                        You have other high-interest loans
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500" />
                        Near retirement with need for lower obligations
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-green-500">
                      <Clock className="w-4 h-4" />
                      Choose Reduce Tenure When:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                        You have stable, growing income
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                        You want to maximize interest savings
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                        You're early in your loan tenure
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                        You want to be debt-free before retirement
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                        Current EMI is comfortable within budget
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                This tool provides estimates for educational purposes only. Actual figures may vary based on bank policies, 
                prepayment charges, and other factors. Consult with your bank or a financial advisor before making decisions.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanAdvisor;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Home, Calculator, Info, AlertTriangle, CheckCircle, IndianRupee, TrendingUp, Wallet, PiggyBank, Shield, Banknote } from "lucide-react";
import Footer from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const HomeAffordabilityCalculator = () => {
  const navigate = useNavigate();
  
  // Income inputs
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [spouseIncome, setSpouseIncome] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  
  // Existing obligations
  const [existingEMIs, setExistingEMIs] = useState<number>(0);
  const [creditCardDues, setCreditCardDues] = useState<number>(0);
  const [otherDebts, setOtherDebts] = useState<number>(0);
  
  // Loan parameters
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenure, setLoanTenure] = useState<number>(20);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [availableDownPayment, setAvailableDownPayment] = useState<number>(1000000);
  
  // Additional costs
  const [registrationPercent, setRegistrationPercent] = useState<number>(7);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(30000);
  
  // Credit profile
  const [creditScore, setCreditScore] = useState<string>("750+");
  const [employmentType, setEmploymentType] = useState<string>("salaried");
  const [age, setAge] = useState<number>(30);

  // Calculations
  const totalMonthlyIncome = monthlyIncome + spouseIncome + otherIncome;
  const totalExistingObligations = existingEMIs + creditCardDues + otherDebts;
  const disposableIncome = totalMonthlyIncome - monthlyExpenses - totalExistingObligations;
  
  // FOIR (Fixed Obligation to Income Ratio) based on credit score
  const getFOIR = () => {
    switch (creditScore) {
      case "750+": return 0.55;
      case "700-749": return 0.50;
      case "650-699": return 0.45;
      case "600-649": return 0.40;
      default: return 0.35;
    }
  };
  
  const maxFOIR = getFOIR();
  const currentFOIR = totalExistingObligations / totalMonthlyIncome;
  const availableFOIR = Math.max(0, maxFOIR - currentFOIR);
  
  // Maximum EMI you can afford
  const maxEMI = totalMonthlyIncome * availableFOIR;
  
  // Calculate max loan from EMI (reverse EMI formula)
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalMonths = loanTenure * 12;
  const maxLoanAmount = maxEMI > 0 
    ? (maxEMI * (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)) /
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths))
    : 0;
  
  // Max property value based on loan + down payment
  const maxPropertyFromLoan = maxLoanAmount / (1 - downPaymentPercent / 100);
  const maxPropertyFromDownPayment = availableDownPayment / (downPaymentPercent / 100);
  
  // The lower of the two constraints
  const maxAffordableProperty = Math.min(maxPropertyFromLoan, maxPropertyFromDownPayment);
  const requiredDownPayment = maxAffordableProperty * (downPaymentPercent / 100);
  const actualLoanAmount = maxAffordableProperty - requiredDownPayment;
  
  // Registration and other costs
  const registrationCost = maxAffordableProperty * (registrationPercent / 100);
  const totalUpfrontCost = requiredDownPayment + registrationCost;
  
  // Calculate actual EMI for the affordable property
  const actualEMI = actualLoanAmount > 0
    ? (actualLoanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)
    : 0;
  
  // Total cost of ownership
  const totalInterest = (actualEMI * totalMonths) - actualLoanAmount;
  const totalCost = maxAffordableProperty + registrationCost + totalInterest;
  
  // Post-EMI disposable income
  const postEMIDisposable = disposableIncome - actualEMI;
  
  // Affordability score (0-100)
  const affordabilityScore = Math.min(100, Math.max(0, 
    ((postEMIDisposable / totalMonthlyIncome) * 100) + 
    ((availableDownPayment >= requiredDownPayment ? 20 : 0)) +
    (creditScore === "750+" ? 15 : creditScore === "700-749" ? 10 : 5)
  ));
  
  // Max retirement age consideration
  const maxRetirementAge = employmentType === "salaried" ? 60 : 65;
  const maxPossibleTenure = Math.max(5, maxRetirementAge - age);
  const tenureWarning = loanTenure > maxPossibleTenure;

  const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLakhs = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return "₹0";
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return formatCurrency(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Very Good";
    if (score >= 50) return "Moderate";
    if (score >= 30) return "Stretched";
    return "Risky";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Home Affordability Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Determine how much house you can afford based on your financial situation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income & Expenses */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-primary" />
                Income & Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Your Monthly Income (Net)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Spouse's Monthly Income</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={spouseIncome}
                    onChange={(e) => setSpouseIncome(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Other Monthly Income</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Rental, dividends, freelance, etc.</p>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Monthly Income</span>
                  <span className="font-bold text-primary">{formatCurrency(totalMonthlyIncome)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-muted-foreground">Monthly Living Expenses</Label>
                <div className="mt-2 space-y-2">
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Food, utilities, transport, etc. (excluding rent/EMIs)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Debts & Loan Parameters */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Banknote className="h-5 w-5 text-orange-500" />
                Debts & Loan Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Existing EMIs (All Loans)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={existingEMIs}
                    onChange={(e) => setExistingEMIs(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Credit Card Min. Due</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={creditCardDues}
                    onChange={(e) => setCreditCardDues(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Other Monthly Obligations</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={otherDebts}
                    onChange={(e) => setOtherDebts(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Interest Rate: {interestRate}% p.a.</Label>
                  <Slider
                    value={[interestRate]}
                    onValueChange={(value) => setInterestRate(value[0])}
                    min={6}
                    max={15}
                    step={0.25}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Loan Tenure: {loanTenure} years</Label>
                  <Slider
                    value={[loanTenure]}
                    onValueChange={(value) => setLoanTenure(value[0])}
                    min={5}
                    max={30}
                    step={1}
                  />
                  {tenureWarning && (
                    <p className="text-xs text-orange-500">
                      ⚠️ Tenure may exceed retirement age. Banks may limit to {maxPossibleTenure} years.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Down Payment: {downPaymentPercent}%</Label>
                  <Slider
                    value={[downPaymentPercent]}
                    onValueChange={(value) => setDownPaymentPercent(value[0])}
                    min={10}
                    max={50}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Registration & Stamp Duty: {registrationPercent}%</Label>
                  <Slider
                    value={[registrationPercent]}
                    onValueChange={(value) => setRegistrationPercent(value[0])}
                    min={3}
                    max={12}
                    step={0.5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile & Down Payment */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-500" />
                Profile & Savings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Available for Down Payment</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={availableDownPayment}
                    onChange={(e) => setAvailableDownPayment(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Savings available for down payment + registration</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Your Age: {age} years</Label>
                <Slider
                  value={[age]}
                  onValueChange={(value) => setAge(value[0])}
                  min={21}
                  max={60}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Credit Score Range</Label>
                <Select value={creditScore} onValueChange={setCreditScore}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="750+">Excellent (750+)</SelectItem>
                    <SelectItem value="700-749">Good (700-749)</SelectItem>
                    <SelectItem value="650-699">Fair (650-699)</SelectItem>
                    <SelectItem value="600-649">Poor (600-649)</SelectItem>
                    <SelectItem value="below-600">Very Poor (&lt;600)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Employment Type</Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self-employed">Self-Employed</SelectItem>
                    <SelectItem value="business">Business Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* FOIR Indicator */}
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current FOIR</span>
                  <span className={currentFOIR > maxFOIR ? "text-red-500" : "text-green-500"}>
                    {(currentFOIR * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Max Allowed FOIR</span>
                  <span className="font-medium">{(maxFOIR * 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, (currentFOIR / maxFOIR) * 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  FOIR = Fixed Obligation to Income Ratio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Affordability Summary */}
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-primary" />
                Your Home Affordability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Result */}
              <div className="text-center p-6 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Maximum Property Value You Can Afford</p>
                <p className="text-4xl font-bold text-primary">{formatLakhs(maxAffordableProperty)}</p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Down Payment Required</p>
                  <p className="text-lg font-bold">{formatLakhs(requiredDownPayment)}</p>
                  <p className="text-xs text-muted-foreground">({downPaymentPercent}%)</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-bold">{formatLakhs(actualLoanAmount)}</p>
                  <p className="text-xs text-muted-foreground">({100 - downPaymentPercent}%)</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Registration Cost</p>
                  <p className="text-lg font-bold">{formatLakhs(registrationCost)}</p>
                  <p className="text-xs text-muted-foreground">({registrationPercent}%)</p>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Upfront</p>
                  <p className="text-lg font-bold">{formatLakhs(totalUpfrontCost)}</p>
                  <p className="text-xs text-muted-foreground">Down + Reg.</p>
                </div>
              </div>

              {/* EMI Details */}
              <div className="p-4 bg-background rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monthly EMI</p>
                    <p className="text-xl font-bold">{formatCurrency(actualEMI)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Post-EMI Disposable</p>
                    <p className={`text-xl font-bold ${postEMIDisposable < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {formatCurrency(postEMIDisposable)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Interest</p>
                    <p className="font-medium">{formatLakhs(totalInterest)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Cost of Home</p>
                    <p className="font-medium">{formatLakhs(totalCost)}</p>
                  </div>
                </div>
              </div>

              {/* Shortfall Warning */}
              {availableDownPayment < totalUpfrontCost && (
                <div className="p-3 bg-orange-500/10 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-700 dark:text-orange-400">Savings Shortfall</p>
                    <p className="text-muted-foreground">
                      You need {formatLakhs(totalUpfrontCost - availableDownPayment)} more for down payment and registration.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Affordability Score */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                Affordability Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score */}
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Affordability Score</p>
                <p className={`text-5xl font-bold ${getScoreColor(affordabilityScore)}`}>
                  {Math.round(affordabilityScore)}
                </p>
                <p className={`text-lg font-medium ${getScoreColor(affordabilityScore)}`}>
                  {getScoreLabel(affordabilityScore)}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">EMI to Income Ratio</span>
                  <span className={`font-bold ${(actualEMI / totalMonthlyIncome) > 0.4 ? 'text-red-500' : 'text-green-600'}`}>
                    {((actualEMI / totalMonthlyIncome) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Max EMI Capacity</span>
                  <span className="font-bold">{formatCurrency(maxEMI)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Available FOIR</span>
                  <span className={`font-bold ${availableFOIR < 0.1 ? 'text-red-500' : 'text-green-600'}`}>
                    {(availableFOIR * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Loan to Value (LTV)</span>
                  <span className="font-bold">{100 - downPaymentPercent}%</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-400">Tips to Increase Affordability</p>
                    <ul className="text-muted-foreground mt-1 space-y-1">
                      {availableFOIR < 0.2 && <li>• Pay off existing debts to free up FOIR capacity</li>}
                      {downPaymentPercent < 25 && <li>• Increase down payment to reduce loan amount</li>}
                      {loanTenure < 20 && <li>• Consider longer tenure to reduce EMI</li>}
                      {creditScore !== "750+" && <li>• Improve credit score for better interest rates</li>}
                      <li>• Consider joint loan with spouse for higher eligibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Bank Eligibility Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>FOIR:</strong> Banks allow 40-55% of income for all EMIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>LTV:</strong> Max 80-90% of property value as loan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Age:</strong> Loan tenure + age should not exceed 60-65 years</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Credit Score:</strong> 750+ preferred for best rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Employment:</strong> Min 2-3 years stable income history</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PiggyBank className="h-5 w-5 text-blue-500" />
                Hidden Costs to Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Registration:</strong> 5-12% of property value</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Brokerage:</strong> 1-2% of property value</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>GST:</strong> 5% on under-construction property</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Interior:</strong> ₹500-2000 per sq.ft</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Maintenance:</strong> ₹2-5 per sq.ft monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Loan Processing:</strong> 0.5-1% of loan amount</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-purple-500" />
                Smart Buying Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Keep EMI below 30-35% of take-home salary</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Maintain 6 months emergency fund separately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Consider joint loan for higher eligibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Compare rates across 5-6 lenders</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Choose shorter tenure if affordable for less interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>Factor in future income growth and expenses</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tax Benefits */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-green-500" />
              Tax Benefits on Home Loan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <h4 className="font-medium mb-2">Section 24(b) - Interest</h4>
                <p className="text-2xl font-bold text-green-600">₹2 Lakh/year</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Deduction on home loan interest for self-occupied property
                </p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <h4 className="font-medium mb-2">Section 80C - Principal</h4>
                <p className="text-2xl font-bold text-blue-600">₹1.5 Lakh/year</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Deduction on principal repayment (shared with other 80C investments)
                </p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg">
                <h4 className="font-medium mb-2">Section 80EEA - First-time Buyer</h4>
                <p className="text-2xl font-bold text-purple-600">₹1.5 Lakh/year</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Additional interest deduction for affordable housing (conditions apply)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-6 border-yellow-500/30 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-yellow-700 dark:text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              <strong>This calculator provides estimates for educational and planning purposes only.</strong> The results 
              are indicative and may not reflect actual bank eligibility or approval amounts.
            </p>
            <p>
              <strong>Key limitations:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Actual loan eligibility varies by bank and individual assessment</li>
              <li>Interest rates are subject to change and may vary based on profile</li>
              <li>Banks may have additional criteria not captured in this calculator</li>
              <li>Property valuation by bank may differ from market price</li>
              <li>Tax benefits are subject to prevailing tax laws and may change</li>
              <li>Self-employed individuals may need additional documentation</li>
              <li>Future income changes, job stability, and expenses are not predicted</li>
            </ul>
            <p>
              <strong>Recommendation:</strong> Consult with multiple banks, a certified financial planner, and a tax 
              advisor before making home purchase decisions. Get pre-approved loan offers for accurate eligibility.
            </p>
            <p className="text-xs mt-4">
              The creators of this tool are not responsible for any financial decisions made based on these calculations. 
              All real estate purchases and loans carry inherent financial risks.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default HomeAffordabilityCalculator;

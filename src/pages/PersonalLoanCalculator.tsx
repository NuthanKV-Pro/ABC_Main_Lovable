import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Info, CheckCircle, AlertTriangle, TrendingUp, Lightbulb, CreditCard, IndianRupee, Percent, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const PersonalLoanCalculator = () => {
  const navigate = useNavigate();
  
  // Basic inputs
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [tenure, setTenure] = useState<number>(36); // months
  const [creditScore, setCreditScore] = useState<number>(750);
  
  // Eligibility inputs
  const [monthlyIncome, setMonthlyIncome] = useState<number>(80000);
  const [existingEMI, setExistingEMI] = useState<number>(0);
  const [employmentType, setEmploymentType] = useState<string>("salaried");
  const [employerType, setEmployerType] = useState<string>("mnc");
  
  // Prepayment inputs
  const [monthsCompleted, setMonthsCompleted] = useState<number>(12);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(100000);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Credit score based interest rate estimation
  const getInterestRate = (score: number, empType: string, employer: string) => {
    let baseRate = 12; // Base rate
    
    // Credit score adjustment
    if (score >= 800) baseRate -= 2.5;
    else if (score >= 750) baseRate -= 1.5;
    else if (score >= 700) baseRate -= 0.5;
    else if (score >= 650) baseRate += 1;
    else if (score >= 600) baseRate += 3;
    else baseRate += 6;
    
    // Employment type adjustment
    if (empType === 'self-employed') baseRate += 1;
    
    // Employer type adjustment
    if (employer === 'mnc' || employer === 'govt') baseRate -= 0.5;
    else if (employer === 'startup') baseRate += 0.5;
    
    return Math.max(10.5, Math.min(24, baseRate));
  };

  const interestRate = getInterestRate(creditScore, employmentType, employerType);
  
  // EMI Calculation
  const calculateEMI = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return emi;
  };

  const emi = calculateEMI(loanAmount, interestRate, tenure);
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - loanAmount;

  // Eligibility calculation
  const maxEMICapacity = monthlyIncome * 0.5; // 50% of income
  const availableEMICapacity = maxEMICapacity - existingEMI;
  const maxLoanEligible = availableEMICapacity > 0 
    ? (availableEMICapacity * (Math.pow(1 + interestRate/100/12, tenure) - 1)) / ((interestRate/100/12) * Math.pow(1 + interestRate/100/12, tenure))
    : 0;
  
  const foirRatio = ((existingEMI + emi) / monthlyIncome) * 100;
  const isEligible = foirRatio <= 50 && creditScore >= 600;

  // Prepayment penalty calculation
  const calculatePrepaymentDetails = () => {
    const remainingMonths = tenure - monthsCompleted;
    const outstandingPrincipal = loanAmount * (Math.pow(1 + interestRate/100/12, remainingMonths) - 1) / 
      (Math.pow(1 + interestRate/100/12, tenure) - 1) * (1 + interestRate/100/12);
    
    // Floating rate loans: typically 0-2% prepayment penalty
    // Fixed rate loans: typically 2-5% prepayment penalty
    const prepaymentPenaltyRate = 0.02; // 2% for example
    const prepaymentPenalty = Math.min(prepaymentAmount, outstandingPrincipal) * prepaymentPenaltyRate;
    
    // Interest saved calculation
    const remainingEMIs = emi * remainingMonths;
    const newOutstanding = Math.max(0, outstandingPrincipal - prepaymentAmount);
    const newRemainingMonths = newOutstanding > 0 
      ? Math.ceil(Math.log(emi / (emi - (newOutstanding * interestRate/100/12))) / Math.log(1 + interestRate/100/12))
      : 0;
    const newTotalPayment = emi * newRemainingMonths;
    const interestSaved = remainingEMIs - newTotalPayment - prepaymentAmount;
    
    return {
      outstandingPrincipal: Math.max(0, outstandingPrincipal),
      prepaymentPenalty,
      interestSaved: Math.max(0, interestSaved),
      newRemainingMonths: Math.max(0, newRemainingMonths),
      monthsReduced: remainingMonths - newRemainingMonths
    };
  };

  const prepaymentDetails = calculatePrepaymentDetails();

  // Credit score color
  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-500';
    if (score >= 650) return 'text-amber-500';
    return 'text-red-500';
  };

  const getCreditScoreRating = (score: number) => {
    if (score >= 800) return 'Excellent';
    if (score >= 750) return 'Very Good';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Personal Loan Calculator</h1>
              <p className="text-sm text-muted-foreground">EMI, eligibility & prepayment analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Tabs defaultValue="emi" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility Check</TabsTrigger>
              <TabsTrigger value="prepayment">Prepayment Analysis</TabsTrigger>
            </TabsList>

            {/* EMI Calculator Tab */}
            <TabsContent value="emi" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Loan Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Loan Amount</Label>
                          <span className="text-sm font-medium">{formatCurrency(loanAmount)}</span>
                        </div>
                        <Slider
                          value={[loanAmount]}
                          onValueChange={(v) => setLoanAmount(v[0])}
                          min={50000}
                          max={4000000}
                          step={10000}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>₹50K</span>
                          <span>₹40L</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Tenure (Months)</Label>
                          <span className="text-sm font-medium">{tenure} months ({(tenure/12).toFixed(1)} years)</span>
                        </div>
                        <Slider
                          value={[tenure]}
                          onValueChange={(v) => setTenure(v[0])}
                          min={12}
                          max={84}
                          step={6}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 Year</span>
                          <span>7 Years</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Credit Score (CIBIL)</Label>
                          <span className={`text-sm font-medium ${getCreditScoreColor(creditScore)}`}>
                            {creditScore} - {getCreditScoreRating(creditScore)}
                          </span>
                        </div>
                        <Slider
                          value={[creditScore]}
                          onValueChange={(v) => setCreditScore(v[0])}
                          min={300}
                          max={900}
                          step={10}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>300</span>
                          <span>900</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Employment Type</Label>
                          <Select value={employmentType} onValueChange={setEmploymentType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="salaried">Salaried</SelectItem>
                              <SelectItem value="self-employed">Self Employed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Employer Type</Label>
                          <Select value={employerType} onValueChange={setEmployerType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="govt">Government</SelectItem>
                              <SelectItem value="mnc">MNC/Listed</SelectItem>
                              <SelectItem value="private">Private Ltd</SelectItem>
                              <SelectItem value="startup">Startup</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Estimated Interest Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-primary">{interestRate.toFixed(2)}%</p>
                      <p className="text-sm text-muted-foreground mt-1">Based on your credit profile</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Monthly EMI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-green-500">{formatCurrency(emi)}</p>
                      <p className="text-sm text-muted-foreground mt-1">For {tenure} months</p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-2xl font-bold text-amber-500">{formatCurrency(totalInterest)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">Total Payment</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalPayment)}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Interest Rate Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Credit Score Based Interest Rates
                  </CardTitle>
                  <CardDescription>Typical personal loan rates based on CIBIL score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Credit Score Range</th>
                          <th className="text-left p-3">Rating</th>
                          <th className="text-left p-3">Interest Rate Range</th>
                          <th className="text-left p-3">Approval Chances</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 font-semibold text-green-500">800 - 900</td>
                          <td className="p-3">Excellent</td>
                          <td className="p-3">10.5% - 12%</td>
                          <td className="p-3">Very High</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-semibold text-green-400">750 - 799</td>
                          <td className="p-3">Very Good</td>
                          <td className="p-3">11% - 14%</td>
                          <td className="p-3">High</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-semibold text-amber-400">700 - 749</td>
                          <td className="p-3">Good</td>
                          <td className="p-3">13% - 16%</td>
                          <td className="p-3">Moderate</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 font-semibold text-amber-500">650 - 699</td>
                          <td className="p-3">Fair</td>
                          <td className="p-3">15% - 20%</td>
                          <td className="p-3">Low</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-red-500">Below 650</td>
                          <td className="p-3">Poor</td>
                          <td className="p-3">18% - 24%+</td>
                          <td className="p-3">Very Low / Rejected</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Eligibility Tab */}
            <TabsContent value="eligibility" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Your Financial Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Monthly Income (₹)</Label>
                      <Input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Existing EMIs (₹)</Label>
                      <Input
                        type="number"
                        value={existingEMI}
                        onChange={(e) => setExistingEMI(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">Total of all current loan EMIs</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Desired Loan Amount (₹)</Label>
                      <Input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className={isEligible ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {isEligible ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        Eligibility Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-3xl font-bold ${isEligible ? 'text-green-500' : 'text-red-500'}`}>
                        {isEligible ? 'Likely Eligible' : 'May Not Be Eligible'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isEligible 
                          ? 'Based on your income and credit score, you appear to be eligible for this loan.'
                          : creditScore < 600 
                            ? 'Your credit score is below the typical minimum requirement.'
                            : 'Your debt-to-income ratio exceeds 50%.'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Maximum Loan Eligible</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(Math.max(0, maxLoanEligible))}</p>
                      <p className="text-sm text-muted-foreground mt-1">Based on 50% FOIR limit</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Fixed Obligation to Income Ratio (FOIR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-3xl font-bold ${foirRatio <= 50 ? 'text-green-500' : 'text-red-500'}`}>
                        {foirRatio.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Should be ≤50% for approval
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    General Eligibility Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">For Salaried Individuals</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Age: 21-60 years</li>
                        <li>• Min Income: ₹15,000 - 25,000/month</li>
                        <li>• Min Employment: 1-2 years total, 6 months in current job</li>
                        <li>• Credit Score: 650+ (750+ for best rates)</li>
                        <li>• FOIR: Less than 50-55%</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">For Self-Employed</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Age: 21-65 years</li>
                        <li>• Min Business Vintage: 2-3 years</li>
                        <li>• ITR: Last 2-3 years filed</li>
                        <li>• Credit Score: 700+ preferred</li>
                        <li>• Turnover: As per lender norms</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prepayment Tab */}
            <TabsContent value="prepayment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      Prepayment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                      <p className="text-sm">Current Loan: {formatCurrency(loanAmount)} @ {interestRate.toFixed(2)}% for {tenure} months</p>
                      <p className="text-sm">Monthly EMI: {formatCurrency(emi)}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Months Completed</Label>
                      <Input
                        type="number"
                        value={monthsCompleted}
                        onChange={(e) => setMonthsCompleted(Math.min(tenure - 1, Number(e.target.value)))}
                        max={tenure - 1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prepayment Amount (₹)</Label>
                      <Input
                        type="number"
                        value={prepaymentAmount}
                        onChange={(e) => setPrepaymentAmount(Number(e.target.value))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Outstanding Principal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(prepaymentDetails.outstandingPrincipal)}</p>
                      <p className="text-sm text-muted-foreground mt-1">After {monthsCompleted} months</p>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Prepayment Penalty (Est.)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-amber-500">{formatCurrency(prepaymentDetails.prepaymentPenalty)}</p>
                      <p className="text-sm text-muted-foreground mt-1">~2% of prepayment (varies by lender)</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Tenure Reduced By</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-green-500">{prepaymentDetails.monthsReduced} months</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        New remaining tenure: {prepaymentDetails.newRemainingMonths} months
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Prepayment Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Prepayment Rules & Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-500">✅ RBI Guidelines (Floating Rate)</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• No prepayment penalty for floating rate loans</li>
                        <li>• Banks cannot charge foreclosure fees</li>
                        <li>• Part-payment allowed without charges</li>
                        <li>• Applicable to individual borrowers only</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-amber-500">⚠️ Fixed Rate Loans</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Prepayment penalty typically 2-5%</li>
                        <li>• Some banks charge lock-in for 12-24 months</li>
                        <li>• Check your loan agreement for exact terms</li>
                        <li>• NBFCs may have different rules</li>
                      </ul>
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
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This Personal Loan Calculator is provided for educational and informational purposes only.
                The interest rates, eligibility criteria, and calculations are estimates based on general market data.
              </p>
              <p>
                Actual interest rates and loan terms vary significantly between lenders and depend on multiple factors 
                including your credit history, income stability, employer profile, relationship with the bank, and current market conditions.
              </p>
              <p>
                Prepayment penalty rules may vary for different types of lenders (Banks vs NBFCs) and loan products.
                Always refer to your loan agreement for exact terms and conditions.
              </p>
              <p>
                This tool does not guarantee loan approval or specific interest rates. Please contact multiple 
                lenders directly or consult a financial advisor before making any borrowing decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PersonalLoanCalculator;

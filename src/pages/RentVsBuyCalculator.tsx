import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Home, Building2, TrendingUp, TrendingDown, Calculator, Info, AlertTriangle, CheckCircle, IndianRupee } from "lucide-react";
import Footer from "@/components/Footer";
import { Slider } from "@/components/ui/slider";

const RentVsBuyCalculator = () => {
  const navigate = useNavigate();
  
  // Buying inputs
  const [propertyPrice, setPropertyPrice] = useState<number>(5000000);
  const [downPayment, setDownPayment] = useState<number>(20);
  const [loanInterestRate, setLoanInterestRate] = useState<number>(8.5);
  const [loanTenure, setLoanTenure] = useState<number>(20);
  const [propertyAppreciation, setPropertyAppreciation] = useState<number>(5);
  const [maintenanceCost, setMaintenanceCost] = useState<number>(1);
  const [propertyTax, setPropertyTax] = useState<number>(0.5);
  const [registrationCharges, setRegistrationCharges] = useState<number>(7);
  
  // Renting inputs
  const [monthlyRent, setMonthlyRent] = useState<number>(20000);
  const [rentIncrease, setRentIncrease] = useState<number>(5);
  const [securityDeposit, setSecurityDeposit] = useState<number>(2);
  
  // Common inputs
  const [investmentReturn, setInvestmentReturn] = useState<number>(12);
  const [timeHorizon, setTimeHorizon] = useState<number>(10);
  const [taxBracket, setTaxBracket] = useState<number>(30);

  // Calculations
  const downPaymentAmount = (propertyPrice * downPayment) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;
  const registrationAmount = (propertyPrice * registrationCharges) / 100;
  const totalInitialCostBuying = downPaymentAmount + registrationAmount;
  
  // EMI Calculation
  const monthlyInterestRate = loanInterestRate / 100 / 12;
  const totalMonths = loanTenure * 12;
  const emi = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths) / 
              (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
  
  const totalEMIPaid = emi * Math.min(timeHorizon * 12, totalMonths);
  const totalInterestPaid = totalEMIPaid - (timeHorizon >= loanTenure ? loanAmount : 
    loanAmount - (loanAmount * Math.pow(1 + monthlyInterestRate, Math.min(timeHorizon * 12, totalMonths)) - totalEMIPaid * ((Math.pow(1 + monthlyInterestRate, Math.min(timeHorizon * 12, totalMonths)) - 1) / monthlyInterestRate)) / Math.pow(1 + monthlyInterestRate, Math.min(timeHorizon * 12, totalMonths)));
  
  // Property value after time horizon
  const futurePropertyValue = propertyPrice * Math.pow(1 + propertyAppreciation / 100, timeHorizon);
  
  // Maintenance and property tax over time
  let totalMaintenance = 0;
  let totalPropertyTax = 0;
  for (let i = 0; i < timeHorizon; i++) {
    const yearValue = propertyPrice * Math.pow(1 + propertyAppreciation / 100, i);
    totalMaintenance += (yearValue * maintenanceCost) / 100;
    totalPropertyTax += (yearValue * propertyTax) / 100;
  }
  
  // Tax benefit on home loan (Section 24 - up to 2L on interest, Section 80C - up to 1.5L on principal)
  const annualInterest = (totalInterestPaid / timeHorizon) || 0;
  const annualPrincipal = ((totalEMIPaid - totalInterestPaid) / timeHorizon) || 0;
  const taxBenefitInterest = Math.min(annualInterest, 200000) * (taxBracket / 100) * timeHorizon;
  const taxBenefitPrincipal = Math.min(annualPrincipal, 150000) * (taxBracket / 100) * timeHorizon;
  const totalTaxBenefit = taxBenefitInterest + taxBenefitPrincipal;
  
  // Total cost of buying
  const totalCostBuying = totalInitialCostBuying + totalEMIPaid + totalMaintenance + totalPropertyTax - totalTaxBenefit;
  const netCostBuying = totalCostBuying - futurePropertyValue + propertyPrice;
  
  // Renting calculations
  const securityDepositAmount = monthlyRent * securityDeposit;
  let totalRentPaid = 0;
  let currentRent = monthlyRent;
  for (let i = 0; i < timeHorizon; i++) {
    totalRentPaid += currentRent * 12;
    currentRent *= (1 + rentIncrease / 100);
  }
  
  // Opportunity cost - what if you invested the down payment + registration instead?
  const investedAmount = totalInitialCostBuying - securityDepositAmount;
  const futureInvestmentValue = investedAmount * Math.pow(1 + investmentReturn / 100, timeHorizon);
  
  // Monthly savings if renting (EMI - Rent) invested
  let totalInvestmentFromSavings = 0;
  currentRent = monthlyRent;
  for (let i = 0; i < timeHorizon * 12; i++) {
    const monthlySaving = Math.max(0, emi - currentRent);
    const monthsRemaining = timeHorizon * 12 - i;
    totalInvestmentFromSavings += monthlySaving * Math.pow(1 + investmentReturn / 100 / 12, monthsRemaining);
    if ((i + 1) % 12 === 0) {
      currentRent *= (1 + rentIncrease / 100);
    }
  }
  
  const totalWealthIfRenting = futureInvestmentValue + totalInvestmentFromSavings + securityDepositAmount;
  const netCostRenting = totalRentPaid - totalWealthIfRenting + investedAmount + securityDepositAmount;
  
  // Final comparison
  const buyingIsBetter = netCostBuying < netCostRenting;
  const difference = Math.abs(netCostBuying - netCostRenting);
  
  // Break-even calculation (simplified)
  const breakEvenYears = Math.log((totalInitialCostBuying + (emi * 12)) / (monthlyRent * 12 + totalInitialCostBuying * (investmentReturn / 100))) / 
                         Math.log((1 + propertyAppreciation / 100) / (1 + rentIncrease / 100));

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
            <h1 className="text-3xl font-bold text-foreground">Rent vs Buy Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Make an informed decision on whether to rent or buy a home based on your financial situation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buying Inputs */}
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-primary" />
                Buying Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Property Price</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{formatLakhs(propertyPrice)}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Down Payment: {downPayment}%</Label>
                <Slider
                  value={[downPayment]}
                  onValueChange={(value) => setDownPayment(value[0])}
                  min={10}
                  max={50}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">{formatLakhs(downPaymentAmount)}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Loan Interest Rate: {loanInterestRate}%</Label>
                <Slider
                  value={[loanInterestRate]}
                  onValueChange={(value) => setLoanInterestRate(value[0])}
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
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Property Appreciation: {propertyAppreciation}% p.a.</Label>
                <Slider
                  value={[propertyAppreciation]}
                  onValueChange={(value) => setPropertyAppreciation(value[0])}
                  min={0}
                  max={15}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Maintenance Cost: {maintenanceCost}% p.a.</Label>
                <Slider
                  value={[maintenanceCost]}
                  onValueChange={(value) => setMaintenanceCost(value[0])}
                  min={0}
                  max={3}
                  step={0.25}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Property Tax: {propertyTax}% p.a.</Label>
                <Slider
                  value={[propertyTax]}
                  onValueChange={(value) => setPropertyTax(value[0])}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Registration & Stamp Duty: {registrationCharges}%</Label>
                <Slider
                  value={[registrationCharges]}
                  onValueChange={(value) => setRegistrationCharges(value[0])}
                  min={3}
                  max={12}
                  step={0.5}
                />
                <p className="text-xs text-muted-foreground">{formatLakhs(registrationAmount)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Renting & Common Inputs */}
          <Card className="border-orange-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-orange-500" />
                Renting & Investment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Monthly Rent</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Annual Rent Increase: {rentIncrease}%</Label>
                <Slider
                  value={[rentIncrease]}
                  onValueChange={(value) => setRentIncrease(value[0])}
                  min={0}
                  max={15}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Security Deposit: {securityDeposit} months</Label>
                <Slider
                  value={[securityDeposit]}
                  onValueChange={(value) => setSecurityDeposit(value[0])}
                  min={1}
                  max={12}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">{formatCurrency(securityDepositAmount)}</p>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium mb-3 text-muted-foreground">Investment Parameters</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Expected Investment Return: {investmentReturn}% p.a.</Label>
                    <Slider
                      value={[investmentReturn]}
                      onValueChange={(value) => setInvestmentReturn(value[0])}
                      min={6}
                      max={20}
                      step={0.5}
                    />
                    <p className="text-xs text-muted-foreground">Return on alternative investments (MF, stocks, etc.)</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Time Horizon: {timeHorizon} years</Label>
                    <Slider
                      value={[timeHorizon]}
                      onValueChange={(value) => setTimeHorizon(value[0])}
                      min={3}
                      max={30}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Your Tax Bracket: {taxBracket}%</Label>
                    <Slider
                      value={[taxBracket]}
                      onValueChange={(value) => setTaxBracket(value[0])}
                      min={0}
                      max={30}
                      step={5}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className={`border-2 ${buyingIsBetter ? 'border-primary/50 bg-primary/5' : 'border-orange-500/50 bg-orange-500/5'}`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recommendation */}
              <div className={`p-4 rounded-lg ${buyingIsBetter ? 'bg-primary/10' : 'bg-orange-500/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`h-5 w-5 ${buyingIsBetter ? 'text-primary' : 'text-orange-500'}`} />
                  <span className="font-semibold">
                    {buyingIsBetter ? 'Buying is Better' : 'Renting is Better'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Over {timeHorizon} years, {buyingIsBetter ? 'buying' : 'renting'} saves you approximately {formatLakhs(difference)}
                </p>
              </div>

              {/* Buying Summary */}
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span className="font-medium">If You Buy</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Monthly EMI:</span>
                  <span className="font-medium text-right">{formatCurrency(emi)}</span>
                  
                  <span className="text-muted-foreground">Initial Cost:</span>
                  <span className="font-medium text-right">{formatLakhs(totalInitialCostBuying)}</span>
                  
                  <span className="text-muted-foreground">Total EMI Paid:</span>
                  <span className="font-medium text-right">{formatLakhs(totalEMIPaid)}</span>
                  
                  <span className="text-muted-foreground">Maintenance + Tax:</span>
                  <span className="font-medium text-right">{formatLakhs(totalMaintenance + totalPropertyTax)}</span>
                  
                  <span className="text-muted-foreground">Tax Benefits:</span>
                  <span className="font-medium text-right text-green-600">-{formatLakhs(totalTaxBenefit)}</span>
                  
                  <span className="text-muted-foreground">Property Value ({timeHorizon}yr):</span>
                  <span className="font-medium text-right text-primary">{formatLakhs(futurePropertyValue)}</span>
                  
                  <span className="text-muted-foreground font-medium border-t pt-2">Net Cost:</span>
                  <span className="font-bold text-right border-t pt-2">{formatLakhs(netCostBuying)}</span>
                </div>
              </div>

              {/* Renting Summary */}
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">If You Rent</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Starting Rent:</span>
                  <span className="font-medium text-right">{formatCurrency(monthlyRent)}/mo</span>
                  
                  <span className="text-muted-foreground">Total Rent Paid:</span>
                  <span className="font-medium text-right">{formatLakhs(totalRentPaid)}</span>
                  
                  <span className="text-muted-foreground">Security Deposit:</span>
                  <span className="font-medium text-right">{formatCurrency(securityDepositAmount)}</span>
                  
                  <span className="text-muted-foreground">Investment Growth:</span>
                  <span className="font-medium text-right text-green-600">{formatLakhs(futureInvestmentValue)}</span>
                  
                  <span className="text-muted-foreground">Savings Invested:</span>
                  <span className="font-medium text-right text-green-600">{formatLakhs(totalInvestmentFromSavings)}</span>
                  
                  <span className="text-muted-foreground font-medium border-t pt-2">Net Cost:</span>
                  <span className="font-bold text-right border-t pt-2">{formatLakhs(netCostRenting)}</span>
                </div>
              </div>

              {/* Key Insight */}
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-400">Key Insight</p>
                    <p className="text-muted-foreground">
                      {breakEvenYears > 0 && breakEvenYears < 30 && isFinite(breakEvenYears)
                        ? `Break-even point is approximately ${breakEvenYears.toFixed(1)} years. Beyond this, buying becomes more advantageous.`
                        : 'Your investment returns and property appreciation significantly impact this decision.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Factors Favoring Buying */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                When Buying Makes Sense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Long-term stability:</strong> You plan to stay in the same location for 7+ years</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>High property appreciation:</strong> Area has strong growth potential (metro cities, upcoming locations)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Tax benefits:</strong> High tax bracket to maximize Section 24 and 80C deductions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Emotional value:</strong> Sense of ownership, security, and ability to customize</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>High rent area:</strong> Rent is close to or exceeds potential EMI</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Forced savings:</strong> EMI creates discipline in building asset wealth</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Factors Favoring Renting */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                When Renting Makes Sense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <span><strong>Career mobility:</strong> Likely to relocate for job opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <span><strong>High investment returns:</strong> Disciplined investor earning 12%+ returns</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <span><strong>Expensive markets:</strong> Property prices are overvalued relative to rents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <span><strong>Flexibility:</strong> No maintenance hassles, easy to upgrade/downgrade</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <span><strong>Limited savings:</strong> Insufficient down payment or emergency fund</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <span><strong>Low rent areas:</strong> Rent is significantly lower than potential EMI</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Additional Considerations */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-blue-500" />
              Important Considerations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Hidden Costs of Buying</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Registration & stamp duty (5-12%)</li>
                  <li>• GST on under-construction property (5%)</li>
                  <li>• Brokerage fees (1-2%)</li>
                  <li>• Interior & furnishing costs</li>
                  <li>• Society maintenance charges</li>
                  <li>• Home insurance</li>
                  <li>• Repair and renovation costs</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Hidden Costs of Renting</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Annual rent increases (5-10%)</li>
                  <li>• Brokerage on each move</li>
                  <li>• Security deposit blocked</li>
                  <li>• Moving expenses</li>
                  <li>• No control over property changes</li>
                  <li>• Risk of eviction</li>
                  <li>• Limited personalization</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Tax Benefits (Buying)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Section 80C: ₹1.5L on principal</li>
                  <li>• Section 24: ₹2L on interest</li>
                  <li>• Section 80EEA: ₹1.5L additional (first-time buyers)</li>
                  <li>• LTCG exemption on sale (with conditions)</li>
                  <li>• HRA benefit if renting out</li>
                  <li>• Joint loan doubles benefits</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price to Rent Ratio */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5" />
              Price-to-Rent Ratio Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  The Price-to-Rent ratio helps compare property costs across different locations. 
                  It's calculated as: Property Price ÷ Annual Rent
                </p>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-2">
                    {(propertyPrice / (monthlyRent * 12)).toFixed(1)}x
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Price-to-Rent Ratio
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <div className="text-lg font-bold text-green-600">&lt;15x</div>
                  <div className="text-sm">
                    <span className="font-medium">Buy:</span> Property is fairly priced relative to rent
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">15-20x</div>
                  <div className="text-sm">
                    <span className="font-medium">Neutral:</span> Consider both options carefully
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                  <div className="text-lg font-bold text-red-600">&gt;20x</div>
                  <div className="text-sm">
                    <span className="font-medium">Rent:</span> Property may be overpriced
                  </div>
                </div>
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
              <strong>This calculator provides estimates for educational purposes only.</strong> The results are based on 
              assumptions that may not reflect actual market conditions, individual circumstances, or future performance.
            </p>
            <p>
              <strong>Key limitations:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Property appreciation rates vary significantly by location and market conditions</li>
              <li>Investment returns are assumed to be consistent, which is unrealistic for market-linked instruments</li>
              <li>Tax laws and benefits may change; consult a tax professional for current regulations</li>
              <li>Hidden costs, transaction fees, and other expenses may not be fully captured</li>
              <li>Emotional and lifestyle factors are not quantified in this analysis</li>
              <li>Interest rates may change during the loan tenure</li>
            </ul>
            <p>
              <strong>Recommendation:</strong> Consult with a certified financial planner, tax advisor, and real estate 
              expert before making major financial decisions. This tool should be one of many inputs in your decision-making process.
            </p>
            <p className="text-xs mt-4">
              The creators of this tool are not responsible for any financial decisions made based on these calculations. 
              All investments and real estate purchases carry inherent risks.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default RentVsBuyCalculator;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Info, AlertTriangle, CheckCircle, IndianRupee, TrendingUp, TrendingDown, Wallet, PiggyBank, Shield, Target, Plus, Trash2 } from "lucide-react";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";

const DebtToIncomeCalculator = () => {
  const navigate = useNavigate();
  
  // Income inputs
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [spouseIncome, setSpouseIncome] = useState<number>(0);
  const [rentalIncome, setRentalIncome] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  
  // Debt inputs with dynamic list
  const [debts, setDebts] = useState([
    { id: 1, name: "Home Loan EMI", amount: 25000 },
    { id: 2, name: "Car Loan EMI", amount: 8000 },
    { id: 3, name: "Personal Loan EMI", amount: 5000 },
    { id: 4, name: "Credit Card Min. Due", amount: 3000 },
  ]);

  const addDebt = () => {
    const newId = Math.max(...debts.map(d => d.id), 0) + 1;
    setDebts([...debts, { id: newId, name: "", amount: 0 }]);
  };

  const removeDebt = (id: number) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const updateDebt = (id: number, field: 'name' | 'amount', value: string | number) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // Calculations
  const totalMonthlyIncome = monthlyIncome + spouseIncome + rentalIncome + otherIncome;
  const totalMonthlyDebt = debts.reduce((sum, d) => sum + (d.amount || 0), 0);
  const dtiRatio = totalMonthlyIncome > 0 ? (totalMonthlyDebt / totalMonthlyIncome) * 100 : 0;
  const frontEndRatio = totalMonthlyIncome > 0 ? ((debts.find(d => d.name.toLowerCase().includes('home'))?.amount || 0) / totalMonthlyIncome) * 100 : 0;
  const disposableIncome = totalMonthlyIncome - totalMonthlyDebt;
  const annualIncome = totalMonthlyIncome * 12;
  const annualDebt = totalMonthlyDebt * 12;

  // DTI Rating
  const getDTIRating = (ratio: number) => {
    if (ratio <= 20) return { label: "Excellent", color: "text-green-600", bgColor: "bg-green-500", description: "You have very low debt relative to income. Excellent position for new loans." };
    if (ratio <= 30) return { label: "Good", color: "text-blue-600", bgColor: "bg-blue-500", description: "Healthy debt levels. You should qualify for most loans easily." };
    if (ratio <= 40) return { label: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-500", description: "Acceptable but approaching caution zone. Banks may scrutinize applications." };
    if (ratio <= 50) return { label: "High", color: "text-orange-600", bgColor: "bg-orange-500", description: "High debt burden. Loan approval may be difficult. Consider reducing debts." };
    return { label: "Critical", color: "text-red-600", bgColor: "bg-red-500", description: "Debt levels are unsustainable. Focus on debt repayment before new loans." };
  };

  const rating = getDTIRating(dtiRatio);

  // Loan eligibility estimates based on DTI
  const maxAdditionalEMI = Math.max(0, (totalMonthlyIncome * 0.40) - totalMonthlyDebt);
  const estimatedHomeLoanEligibility = maxAdditionalEMI > 0 ? maxAdditionalEMI * 100 : 0; // Rough estimate
  const estimatedPersonalLoanEligibility = maxAdditionalEMI > 0 ? maxAdditionalEMI * 36 : 0;

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
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Debt-to-Income Ratio Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Understand your financial health and loan eligibility by calculating your DTI ratio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-green-500" />
                Monthly Income
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Your Salary (Net)</Label>
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
                <Label className="text-sm">Spouse's Salary</Label>
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
                <Label className="text-sm">Rental Income</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={rentalIncome}
                    onChange={(e) => setRentalIncome(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Other Income</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(Number(e.target.value))}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Dividends, freelance, etc.</p>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Monthly Income</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(totalMonthlyIncome)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Annual: {formatLakhs(annualIncome)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Debt Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Monthly Debt Obligations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {debts.map((debt) => (
                <div key={debt.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Debt name"
                    value={debt.name}
                    onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <div className="relative w-28">
                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      type="number"
                      value={debt.amount}
                      onChange={(e) => updateDebt(debt.id, 'amount', Number(e.target.value))}
                      className="pl-6 text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDebt(debt.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={addDebt}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Debt
              </Button>

              <div className="p-4 bg-red-500/10 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Monthly Debt</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(totalMonthlyDebt)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Annual: {formatLakhs(annualDebt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* DTI Result */}
          <Card className={`border-2 ${rating.color.replace('text', 'border')}/30`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Your DTI Ratio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main DTI Display */}
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Debt-to-Income Ratio</p>
                <p className={`text-5xl font-bold ${rating.color}`}>
                  {dtiRatio.toFixed(1)}%
                </p>
                <p className={`text-lg font-medium ${rating.color} mt-1`}>
                  {rating.label}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>20%</span>
                  <span>40%</span>
                  <span>50%+</span>
                </div>
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${rating.bgColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, dtiRatio * 2)}%` }}
                  />
                  <div className="absolute top-0 left-[40%] w-px h-full bg-yellow-500" />
                  <div className="absolute top-0 left-[60%] w-px h-full bg-orange-500" />
                  <div className="absolute top-0 left-[80%] w-px h-full bg-red-500" />
                </div>
              </div>

              {/* Rating Description */}
              <div className={`p-3 rounded-lg ${rating.bgColor}/10`}>
                <p className="text-sm">{rating.description}</p>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Disposable Income</span>
                  <span className={`font-bold ${disposableIncome < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {formatCurrency(disposableIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Housing Ratio (Front-end)</span>
                  <span className="font-bold">{frontEndRatio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm">Max Additional EMI</span>
                  <span className="font-bold text-primary">{formatCurrency(maxAdditionalEMI)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Eligibility Estimates */}
        <Card className="mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Estimated Loan Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Home Loan (20 yr @ 8.5%)</p>
                <p className="text-2xl font-bold text-primary">{formatLakhs(estimatedHomeLoanEligibility)}</p>
                <p className="text-xs text-muted-foreground mt-1">Approx. eligibility</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Personal Loan (3 yr @ 12%)</p>
                <p className="text-2xl font-bold text-blue-600">{formatLakhs(estimatedPersonalLoanEligibility)}</p>
                <p className="text-xs text-muted-foreground mt-1">Approx. eligibility</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Available EMI Capacity</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(maxAdditionalEMI)}/mo</p>
                <p className="text-xs text-muted-foreground mt-1">Before hitting 40% DTI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DTI Benchmarks & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-500" />
                DTI Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <div className="w-16 text-center">
                    <span className="text-lg font-bold text-green-600">≤20%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-700 dark:text-green-400">Excellent</p>
                    <p className="text-xs text-muted-foreground">Easily qualify for all loans. Best interest rates.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                  <div className="w-16 text-center">
                    <span className="text-lg font-bold text-blue-600">21-30%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-700 dark:text-blue-400">Good</p>
                    <p className="text-xs text-muted-foreground">Healthy ratio. Should qualify for most loans.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                  <div className="w-16 text-center">
                    <span className="text-lg font-bold text-yellow-600">31-40%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">Moderate</p>
                    <p className="text-xs text-muted-foreground">Acceptable but approaching limits. May face scrutiny.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg">
                  <div className="w-16 text-center">
                    <span className="text-lg font-bold text-orange-600">41-50%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-orange-700 dark:text-orange-400">High</p>
                    <p className="text-xs text-muted-foreground">High risk. Loan approval difficult. Reduce debt first.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                  <div className="w-16 text-center">
                    <span className="text-lg font-bold text-red-600">&gt;50%</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-700 dark:text-red-400">Critical</p>
                    <p className="text-xs text-muted-foreground">Unsustainable. Focus on debt repayment immediately.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PiggyBank className="h-5 w-5 text-green-500" />
                Tips to Improve DTI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Pay off high-interest debt first:</strong> Credit cards and personal loans</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Avoid new debt:</strong> Don't take new loans before applying for a major loan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Increase income:</strong> Side hustles, promotions, or rental income</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Consolidate debt:</strong> Combine multiple loans into one with lower EMI</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Prepay loans:</strong> Use bonuses or windfalls to reduce principal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Close credit cards:</strong> Reduce available credit to avoid temptation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Extend loan tenure:</strong> Lower EMI (but more interest overall)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-blue-500" />
              Understanding DTI Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">What is DTI Ratio?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Debt-to-Income (DTI) ratio is the percentage of your gross monthly income that goes toward 
                  paying debts. Lenders use this to assess your ability to manage monthly payments and 
                  repay borrowed money.
                </p>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Formula:</p>
                  <p className="text-lg font-mono">DTI = (Total Monthly Debt ÷ Gross Monthly Income) × 100</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Types of DTI Ratios</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium text-sm">Front-End Ratio (Housing Ratio)</p>
                    <p className="text-xs text-muted-foreground">
                      Only housing costs (rent/EMI + property tax + insurance). 
                      Ideal: Below 28%
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium text-sm">Back-End Ratio (Total DTI)</p>
                    <p className="text-xs text-muted-foreground">
                      All monthly debt obligations including housing. 
                      Ideal: Below 36%, Max: 43%
                    </p>
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
              <strong>This calculator provides estimates for educational purposes only.</strong> The results 
              are indicative and may not reflect actual bank eligibility criteria.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Actual loan eligibility depends on credit score, employment history, and other factors</li>
              <li>Different lenders have different DTI thresholds and policies</li>
              <li>Income verification methods vary; banks may consider different income components</li>
              <li>This calculator uses simplified assumptions for loan eligibility estimates</li>
            </ul>
            <p>
              <strong>Recommendation:</strong> Consult with banks or a financial advisor for accurate 
              loan eligibility assessment. Always maintain an emergency fund before taking on new debt.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DebtToIncomeCalculator;

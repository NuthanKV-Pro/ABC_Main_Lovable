import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Calculator, TrendingUp, Wallet, PiggyBank } from "lucide-react";
import Footer from "@/components/Footer";

const RetirementCalculator = () => {
  const navigate = useNavigate();
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(50000);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [expectedReturn, setExpectedReturn] = useState<number>(8);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const yearsInRetirement = Math.max(0, lifeExpectancy - retirementAge);

  // Calculate future monthly expenses at retirement (adjusted for inflation)
  const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  const futureAnnualExpenses = futureMonthlyExpenses * 12;

  // Calculate corpus needed using present value of annuity formula
  // Considering post-retirement returns vs inflation
  const realReturnRate = ((1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1);
  
  let corpusNeeded: number;
  if (realReturnRate <= 0 || yearsInRetirement <= 0) {
    corpusNeeded = futureAnnualExpenses * yearsInRetirement;
  } else {
    // Present value of annuity formula
    corpusNeeded = futureAnnualExpenses * ((1 - Math.pow(1 + realReturnRate, -yearsInRetirement)) / realReturnRate);
  }

  // Calculate monthly savings needed
  const monthsToRetirement = yearsToRetirement * 12;
  const monthlyReturnRate = expectedReturn / 100 / 12;
  
  let monthlySavingsNeeded: number;
  if (monthsToRetirement <= 0 || monthlyReturnRate <= 0) {
    monthlySavingsNeeded = corpusNeeded / Math.max(1, monthsToRetirement);
  } else {
    // Future value of annuity formula solved for payment
    monthlySavingsNeeded = corpusNeeded / ((Math.pow(1 + monthlyReturnRate, monthsToRetirement) - 1) / monthlyReturnRate);
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Retirement Corpus Calculator</h1>
              <p className="text-sm text-muted-foreground">Plan your retirement savings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Basic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Age */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Current Age: <span className="text-primary">{currentAge} years</span>
                  </Label>
                  <Slider
                    value={[currentAge]}
                    onValueChange={(value) => setCurrentAge(value[0])}
                    min={18}
                    max={70}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>18</span>
                    <span>70</span>
                  </div>
                </div>

                {/* Retirement Age */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Retirement Age: <span className="text-primary">{retirementAge} years</span>
                  </Label>
                  <Slider
                    value={[retirementAge]}
                    onValueChange={(value) => setRetirementAge(value[0])}
                    min={Math.max(currentAge + 1, 40)}
                    max={80}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.max(currentAge + 1, 40)}</span>
                    <span>80</span>
                  </div>
                </div>

                {/* Life Expectancy */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Life Expectancy: <span className="text-primary">{lifeExpectancy} years</span>
                  </Label>
                  <Slider
                    value={[lifeExpectancy]}
                    onValueChange={(value) => setLifeExpectancy(value[0])}
                    min={Math.max(retirementAge + 1, 60)}
                    max={100}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.max(retirementAge + 1, 60)}</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Monthly Expenses */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Current Monthly Expenses
                  </Label>
                  <Input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value) || 0)}
                    className="text-lg"
                    min={0}
                  />
                  <Slider
                    value={[monthlyExpenses]}
                    onValueChange={(value) => setMonthlyExpenses(value[0])}
                    min={10000}
                    max={500000}
                    step={5000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹10,000</span>
                    <span>₹5,00,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Rate Assumptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Inflation Rate */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Expected Inflation Rate: <span className="text-primary">{inflationRate}%</span>
                  </Label>
                  <Slider
                    value={[inflationRate]}
                    onValueChange={(value) => setInflationRate(value[0])}
                    min={2}
                    max={12}
                    step={0.5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2%</span>
                    <span>12%</span>
                  </div>
                </div>

                {/* Expected Return */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Expected Return on Investment: <span className="text-primary">{expectedReturn}%</span>
                  </Label>
                  <Slider
                    value={[expectedReturn]}
                    onValueChange={(value) => setExpectedReturn(value[0])}
                    min={4}
                    max={15}
                    step={0.5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>4%</span>
                    <span>15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="text-center text-lg text-muted-foreground flex items-center justify-center gap-2">
                  <PiggyBank className="w-5 h-5" />
                  Retirement Corpus Needed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    {formatCurrency(corpusNeeded)}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    at age {retirementAge}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardHeader>
                <CardTitle className="text-center text-lg text-muted-foreground flex items-center justify-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Monthly Savings Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl lg:text-5xl font-bold text-accent">
                    {formatCurrency(monthlySavingsNeeded)}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    for next {yearsToRetirement} years
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Years to Retirement</span>
                  <span className="font-medium">{yearsToRetirement} years</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Years in Retirement</span>
                  <span className="font-medium">{yearsInRetirement} years</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Current Monthly Expenses</span>
                  <span className="font-medium">{formatCurrency(monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Expenses at Retirement</span>
                  <span className="font-medium">{formatCurrency(futureMonthlyExpenses)}/month</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Real Return Rate</span>
                  <span className="font-medium">{(realReturnRate * 100).toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Disclaimer:</strong> This calculator provides an estimate based on your inputs. Actual returns may vary. Consider consulting a financial advisor for personalized retirement planning.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RetirementCalculator;

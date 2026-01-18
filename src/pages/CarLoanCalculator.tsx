import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Car, IndianRupee, Percent, Calendar } from "lucide-react";
import Footer from "@/components/Footer";

const CarLoanCalculator = () => {
  const navigate = useNavigate();
  
  // Vehicle Details
  const [exShowroomPrice, setExShowroomPrice] = useState<number>(1000000);
  const [roadTax, setRoadTax] = useState<number>(100000);
  const [insurance, setInsurance] = useState<number>(50000);
  const [accessories, setAccessories] = useState<number>(25000);
  const [registration, setRegistration] = useState<number>(15000);
  
  // Loan Details
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [tenureMonths, setTenureMonths] = useState<number>(0);
  
  // Insurance Options
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);

  // Calculations
  const onRoadPrice = exShowroomPrice + roadTax + (includeInsurance ? insurance : 0) + accessories + registration;
  const downPaymentAmount = (onRoadPrice * downPaymentPercent) / 100;
  const loanAmount = onRoadPrice - downPaymentAmount;
  const totalTenureMonths = tenureYears * 12 + tenureMonths;

  // EMI Calculation
  const monthlyRate = interestRate / 12 / 100;
  const emi = loanAmount > 0 && totalTenureMonths > 0
    ? loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalTenureMonths) / (Math.pow(1 + monthlyRate, totalTenureMonths) - 1)
    : 0;
  
  const totalPayable = emi * totalTenureMonths;
  const totalInterest = totalPayable - loanAmount;
  const totalCost = downPaymentAmount + totalPayable;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const interestPercentage = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;
  const principalPercentage = totalPayable > 0 ? (loanAmount / totalPayable) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Car className="w-6 h-6" />
                Car Loan EMI Calculator
              </h1>
              <p className="text-sm text-muted-foreground">Calculate your vehicle financing</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Vehicle Cost Breakdown</CardTitle>
                <CardDescription>Enter on-road price components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    Ex-Showroom Price
                  </Label>
                  <Input
                    type="number"
                    value={exShowroomPrice}
                    onChange={(e) => setExShowroomPrice(Number(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Road Tax</Label>
                    <Input
                      type="number"
                      value={roadTax}
                      onChange={(e) => setRoadTax(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration</Label>
                    <Input
                      type="number"
                      value={registration}
                      onChange={(e) => setRegistration(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Insurance (1st Year)</Label>
                    <Input
                      type="number"
                      value={insurance}
                      onChange={(e) => setInsurance(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accessories</Label>
                    <Input
                      type="number"
                      value={accessories}
                      onChange={(e) => setAccessories(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="includeInsurance">Include insurance in loan?</Label>
                  <Switch
                    id="includeInsurance"
                    checked={includeInsurance}
                    onCheckedChange={setIncludeInsurance}
                  />
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">On-Road Price</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(onRoadPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>Configure your financing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Down Payment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Down Payment: {downPaymentPercent}%</Label>
                    <span className="text-sm font-medium text-primary">{formatCurrency(downPaymentAmount)}</span>
                  </div>
                  <Slider
                    value={[downPaymentPercent]}
                    onValueChange={(v) => setDownPaymentPercent(v[0])}
                    min={0}
                    max={90}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>90%</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Interest Rate (p.a.)
                    </Label>
                    <Input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-24 text-right"
                      step={0.1}
                    />
                  </div>
                  <Slider
                    value={[interestRate]}
                    onValueChange={(v) => setInterestRate(v[0])}
                    min={7}
                    max={18}
                    step={0.1}
                  />
                </div>

                {/* Tenure */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Loan Tenure
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Input
                        type="number"
                        value={tenureYears}
                        onChange={(e) => setTenureYears(Math.min(7, Math.max(0, Number(e.target.value))))}
                        min={0}
                        max={7}
                      />
                      <p className="text-xs text-muted-foreground text-center">Years</p>
                    </div>
                    <div className="space-y-1">
                      <Input
                        type="number"
                        value={tenureMonths}
                        onChange={(e) => setTenureMonths(Math.min(11, Math.max(0, Number(e.target.value))))}
                        min={0}
                        max={11}
                      />
                      <p className="text-xs text-muted-foreground text-center">Months</p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Total: {tenureYears} years {tenureMonths} months ({totalTenureMonths} months)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="text-center">Monthly EMI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-center text-primary mb-2">
                  {formatCurrency(emi)}
                </div>
                <p className="text-center text-muted-foreground">per month for {totalTenureMonths} months</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Bar */}
                <div className="h-8 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-primary transition-all duration-500"
                    style={{ width: `${principalPercentage}%` }}
                  />
                  <div 
                    className="bg-accent transition-all duration-500"
                    style={{ width: `${interestPercentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">Loan Amount</span>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(loanAmount)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(totalInterest)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-muted-foreground">Down Payment</span>
                    <span className="font-semibold text-green-600">{formatCurrency(downPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-card rounded-lg border">
                    <span className="text-muted-foreground">Total EMI Payments</span>
                    <span className="font-semibold">{formatCurrency(totalPayable)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted border-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost of Ownership</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(totalCost)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Down Payment + Total EMI Payments)
                  </p>
                </div>

                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Car loan interest rates vary based on credit score, loan amount, 
                    and lender. New cars typically get lower rates than used cars. Processing fees (1-2%) may apply.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarLoanCalculator;

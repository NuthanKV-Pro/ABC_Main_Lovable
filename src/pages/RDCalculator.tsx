import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Repeat, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

const RDCalculator = () => {
  const navigate = useNavigate();
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(7.0);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [tenureMonths, setTenureMonths] = useState<number>(0);

  const totalMonths = tenureYears * 12 + tenureMonths;
  const quarterlyRate = interestRate / 4 / 100;
  
  // RD maturity calculation (quarterly compounding)
  let maturityAmount = 0;
  for (let month = 1; month <= totalMonths; month++) {
    const remainingMonths = totalMonths - month + 1;
    const remainingQuarters = remainingMonths / 3;
    maturityAmount += monthlyDeposit * Math.pow(1 + quarterlyRate, remainingQuarters);
  }

  const totalDeposited = monthlyDeposit * totalMonths;
  const totalInterest = maturityAmount - totalDeposited;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">RD Calculator</h1>
              <p className="text-sm text-muted-foreground">Recurring Deposit Maturity</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-primary" />
                RD Details
              </CardTitle>
              <CardDescription>Enter your recurring deposit details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyDeposit">Monthly Deposit (₹)</Label>
                <Input
                  id="monthlyDeposit"
                  type="number"
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                  min={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={1}
                  max={15}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">Compounded quarterly</p>
              </div>
              <div className="space-y-2">
                <Label>Tenure</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Input
                      type="number"
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      min={0}
                      max={10}
                    />
                    <p className="text-xs text-muted-foreground text-center">Years</p>
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      value={tenureMonths}
                      onChange={(e) => setTenureMonths(Number(e.target.value))}
                      min={0}
                      max={11}
                    />
                    <p className="text-xs text-muted-foreground text-center">Months</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mt-4">
                <p className="text-sm font-medium text-primary">About RD</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recurring Deposit is a term deposit where you deposit a fixed amount monthly. Interest is compounded quarterly and paid at maturity.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>RD Maturity Summary</CardTitle>
              <CardDescription>Your estimated returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Maturity Amount</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(maturityAmount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Deposited</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalDeposited)}</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Interest Earned</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-card rounded-lg border text-sm">
                  <span className="text-muted-foreground">Monthly Deposit</span>
                  <span className="font-medium">{formatCurrency(monthlyDeposit)}</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg border text-sm">
                  <span className="text-muted-foreground">Total Tenure</span>
                  <span className="font-medium">{tenureYears} yrs {tenureMonths} months ({totalMonths} months)</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg border text-sm">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium">{interestRate}% p.a.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://groww.in/calculators/rd-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Groww RD Calc
          </Button>
          <Button variant="outline" onClick={() => window.open("https://cleartax.in/s/rd-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> ClearTax RD Calc
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RDCalculator;

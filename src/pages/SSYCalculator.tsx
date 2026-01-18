import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, ExternalLink, Info } from "lucide-react";
import Footer from "@/components/Footer";

const SSYCalculator = () => {
  const navigate = useNavigate();
  const [yearlyDeposit, setYearlyDeposit] = useState<number>(150000);
  const [girlAge, setGirlAge] = useState<number>(5);
  const [interestRate, setInterestRate] = useState<number>(8.2);

  // SSY rules: Deposit for 15 years, maturity at 21 years from account opening
  const depositYears = 15;
  const maturityYears = 21;
  const postDepositYears = maturityYears - depositYears; // 6 years of interest-only growth

  // Calculate year-wise breakdown
  let balance = 0;
  let totalDeposit = 0;
  const yearlyBreakdown: { year: number; deposit: number; interest: number; balance: number }[] = [];

  for (let year = 1; year <= maturityYears; year++) {
    const deposit = year <= depositYears ? yearlyDeposit : 0;
    totalDeposit += deposit;
    
    const openingBalance = balance;
    balance = (openingBalance + deposit) * (1 + interestRate / 100);
    const interest = balance - openingBalance - deposit;
    
    yearlyBreakdown.push({
      year,
      deposit,
      interest,
      balance
    });
  }

  const maturityAmount = balance;
  const totalInterest = maturityAmount - (yearlyDeposit * depositYears);
  const maturityAge = girlAge + maturityYears;

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
              <h1 className="text-2xl font-bold text-primary">SSY Calculator</h1>
              <p className="text-sm text-muted-foreground">Sukanya Samriddhi Yojana</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                SSY Details
              </CardTitle>
              <CardDescription>Girl child savings scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yearlyDeposit">Yearly Deposit (₹)</Label>
                <Input
                  id="yearlyDeposit"
                  type="number"
                  value={yearlyDeposit}
                  onChange={(e) => setYearlyDeposit(Math.min(150000, Math.max(250, Number(e.target.value))))}
                  min={250}
                  max={150000}
                />
                <p className="text-xs text-muted-foreground">Min: ₹250 | Max: ₹1,50,000 per year</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="girlAge">Girl's Current Age (Years)</Label>
                <Input
                  id="girlAge"
                  type="number"
                  value={girlAge}
                  onChange={(e) => setGirlAge(Math.min(10, Math.max(0, Number(e.target.value))))}
                  min={0}
                  max={10}
                />
                <p className="text-xs text-muted-foreground">Account can be opened before age 10</p>
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
                <p className="text-xs text-muted-foreground">Current rate: 8.2% (Jan-Mar 2024)</p>
              </div>

              <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <p className="text-sm font-medium text-pink-600">Key Features</p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Deposit for 15 years, maturity at 21 years</li>
                  <li>• 50% withdrawal allowed after age 18</li>
                  <li>• Complete tax exemption (EEE status)</li>
                  <li>• Section 80C benefit up to ₹1.5 lakh</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/5 to-primary/5">
            <CardHeader>
              <CardTitle>SSY Maturity Summary</CardTitle>
              <CardDescription>Amount at age {maturityAge}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Maturity Amount</p>
                <p className="text-3xl font-bold text-pink-600">{formatCurrency(maturityAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">At age {maturityAge}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Deposit</p>
                  <p className="text-lg font-semibold">{formatCurrency(yearlyDeposit * depositYears)}</p>
                  <p className="text-xs text-muted-foreground">over 15 years</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalInterest)}</p>
                  <p className="text-xs text-muted-foreground">tax-free</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Timeline</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-card rounded border">
                    <span>Deposit Period</span>
                    <span className="font-medium">Age {girlAge} to {girlAge + 15}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-card rounded border">
                    <span>Partial Withdrawal</span>
                    <span className="font-medium">After age 18</span>
                  </div>
                  <div className="flex justify-between p-2 bg-card rounded border">
                    <span>Maturity</span>
                    <span className="font-medium">Age {maturityAge}</span>
                  </div>
                </div>
              </div>

              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm font-medium text-green-600">Tax Saved (80C)</p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(Math.min(yearlyDeposit, 150000) * 0.30)} /year
                </p>
                <p className="text-xs text-muted-foreground">at 30% tax bracket</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://groww.in/calculators/sukanya-samriddhi-yojana-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Groww SSY Calc
          </Button>
          <Button variant="outline" onClick={() => window.open("https://cleartax.in/s/sukanya-samriddhi-yojana", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> ClearTax SSY Info
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SSYCalculator;

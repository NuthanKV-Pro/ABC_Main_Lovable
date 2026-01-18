import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Home, AlertTriangle, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

const HomeLoanEligibility = () => {
  const navigate = useNavigate();
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [existingEMI, setExistingEMI] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [creditScore, setCreditScore] = useState<string>("750-799");

  // FOIR (Fixed Obligation to Income Ratio) based on credit score
  const getFOIR = (score: string) => {
    switch (score) {
      case "800+": return 0.65;
      case "750-799": return 0.55;
      case "700-749": return 0.50;
      case "650-699": return 0.45;
      default: return 0.40;
    }
  };

  const foir = getFOIR(creditScore);
  const maxEMI = (monthlyIncome * foir) - existingEMI;
  
  // Calculate max loan amount using EMI formula reversed
  const monthlyRate = interestRate / 12 / 100;
  const tenureMonths = tenureYears * 12;
  const maxLoanAmount = maxEMI > 0 
    ? maxEMI * (Math.pow(1 + monthlyRate, tenureMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths))
    : 0;

  // Property value estimate (assuming 80% LTV)
  const maxPropertyValue = maxLoanAmount / 0.80;
  
  // Monthly EMI for max loan
  const calculatedEMI = maxLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

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
              <h1 className="text-2xl font-bold text-primary">Home Loan Eligibility</h1>
              <p className="text-sm text-muted-foreground">Estimate your maximum loan amount</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Your Financial Details
              </CardTitle>
              <CardDescription>Enter your income and obligations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  min={10000}
                />
                <p className="text-xs text-muted-foreground">Gross monthly salary/income</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="existingEMI">Existing EMIs (₹/month)</Label>
                <Input
                  id="existingEMI"
                  type="number"
                  value={existingEMI}
                  onChange={(e) => setExistingEMI(Number(e.target.value))}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">Car loan, personal loan, credit card EMIs, etc.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit Score (CIBIL)</Label>
                <Select value={creditScore} onValueChange={setCreditScore}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="800+">800+ (Excellent)</SelectItem>
                    <SelectItem value="750-799">750-799 (Very Good)</SelectItem>
                    <SelectItem value="700-749">700-749 (Good)</SelectItem>
                    <SelectItem value="650-699">650-699 (Fair)</SelectItem>
                    <SelectItem value="below-650">Below 650 (Poor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Expected Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={6}
                  max={15}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenureYears">Loan Tenure (Years)</Label>
                <Input
                  id="tenureYears"
                  type="number"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  min={5}
                  max={30}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Eligibility Summary</CardTitle>
              <CardDescription>Based on your financial profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Maximum Loan Eligibility</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(Math.max(0, maxLoanAmount))}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Max Property Value</p>
                  <p className="text-lg font-semibold">{formatCurrency(Math.max(0, maxPropertyValue))}</p>
                  <p className="text-xs text-muted-foreground">(80% LTV)</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Estimated EMI</p>
                  <p className="text-lg font-semibold">{formatCurrency(Math.max(0, calculatedEMI))}</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-card rounded-lg border text-sm">
                  <span className="text-muted-foreground">FOIR Applied</span>
                  <span className="font-medium">{(foir * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg border text-sm">
                  <span className="text-muted-foreground">Max Affordable EMI</span>
                  <span className="font-medium">{formatCurrency(Math.max(0, maxEMI))}</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg border text-sm">
                  <span className="text-muted-foreground">Tenure</span>
                  <span className="font-medium">{tenureYears} years ({tenureYears * 12} months)</span>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-600">Disclaimer</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is an indicative estimate only. Actual loan eligibility varies from bank to bank and depends on various factors including employment type, company profile, property location, age, and internal credit policies. Please consult with specific lenders for accurate eligibility.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://www.hdfcbank.com/personal/tools-and-calculators/home-loan-eligibility-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> HDFC Eligibility
          </Button>
          <Button variant="outline" onClick={() => window.open("https://sbi.co.in/web/personal-banking/loans/home-loans/home-loan-eligibility-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> SBI Eligibility
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomeLoanEligibility;

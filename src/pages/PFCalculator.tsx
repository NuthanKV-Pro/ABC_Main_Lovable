import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Wallet, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

const PFCalculator = () => {
  const navigate = useNavigate();
  const [basicSalary, setBasicSalary] = useState<number>(50000);
  const [currentAge, setCurrentAge] = useState<number>(25);
  const [retirementAge, setRetirementAge] = useState<number>(58);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [employeeContribution, setEmployeeContribution] = useState<number>(12);
  const [employerContribution, setEmployerContribution] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(8.25);
  const [salaryGrowth, setSalaryGrowth] = useState<number>(5);

  const years = retirementAge - currentAge;
  
  // Calculate PF corpus with salary growth
  let totalCorpus = currentBalance;
  let totalEmployeeContribution = 0;
  let totalEmployerContribution = 0;
  let currentSalary = basicSalary;

  for (let year = 0; year < years; year++) {
    const yearlyEmployeeContrib = (currentSalary * employeeContribution / 100) * 12;
    const yearlyEmployerContrib = (currentSalary * employerContribution / 100) * 12;
    
    totalEmployeeContribution += yearlyEmployeeContrib;
    totalEmployerContribution += yearlyEmployerContrib;
    
    // Add contributions and interest
    totalCorpus = (totalCorpus + yearlyEmployeeContrib + yearlyEmployerContrib) * (1 + interestRate / 100);
    
    // Increment salary for next year
    currentSalary = currentSalary * (1 + salaryGrowth / 100);
  }

  const totalContribution = totalEmployeeContribution + totalEmployerContribution + currentBalance;
  const totalInterest = totalCorpus - totalContribution;

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
              <h1 className="text-2xl font-bold text-primary">PF Calculator</h1>
              <p className="text-sm text-muted-foreground">Provident Fund Corpus Estimator</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                PF Details
              </CardTitle>
              <CardDescription>Enter your EPF contribution details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="basicSalary">Basic Salary (₹/month)</Label>
                <Input
                  id="basicSalary"
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  min={1000}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAge">Current Age</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    min={18}
                    max={58}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                    min={50}
                    max={60}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentBalance">Current PF Balance (₹)</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeContribution">Employee (%)</Label>
                  <Input
                    id="employeeContribution"
                    type="number"
                    value={employeeContribution}
                    onChange={(e) => setEmployeeContribution(Number(e.target.value))}
                    min={1}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerContribution">Employer (%)</Label>
                  <Input
                    id="employerContribution"
                    type="number"
                    value={employerContribution}
                    onChange={(e) => setEmployerContribution(Number(e.target.value))}
                    min={1}
                    max={100}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    min={1}
                    max={15}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryGrowth">Salary Growth (%)</Label>
                  <Input
                    id="salaryGrowth"
                    type="number"
                    value={salaryGrowth}
                    onChange={(e) => setSalaryGrowth(Number(e.target.value))}
                    min={0}
                    max={20}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>PF Corpus Summary</CardTitle>
              <CardDescription>Estimated corpus at retirement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Total PF Corpus</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalCorpus)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Your Contribution</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalEmployeeContribution)}</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Employer Contribution</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalEmployerContribution)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Contribution</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalContribution)}</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Investment Period: <span className="font-semibold">{years} years</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://groww.in/calculators/epf-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Groww EPF Calc
          </Button>
          <Button variant="outline" onClick={() => window.open("https://cleartax.in/s/epf-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> ClearTax EPF Calc
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PFCalculator;

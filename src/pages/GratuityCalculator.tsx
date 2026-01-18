import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Calculator, ExternalLink, IndianRupee } from "lucide-react";

const GratuityCalculator = () => {
  const navigate = useNavigate();
  const [salaryDA, setSalaryDA] = useState<number>(50000);
  const [yearsOfService, setYearsOfService] = useState<number>(10);

  // Gratuity Formula: (Last drawn salary × 15 × Number of years of service) / 26
  const gratuity = Math.round((salaryDA * 15 * yearsOfService) / 26);

  const formatCurrency = (amount: number) => {
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
              <h1 className="text-2xl font-bold text-primary">Gratuity Calculator</h1>
              <p className="text-sm text-muted-foreground">Calculate your gratuity entitlement</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Enter Your Details
              </CardTitle>
              <CardDescription>
                Provide your salary and service details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Salary + DA */}
              <div className="space-y-3">
                <Label htmlFor="salaryDA" className="text-base font-medium">
                  Monthly Salary + DA (Basic + Dearness Allowance)
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="salaryDA"
                    type="number"
                    value={salaryDA}
                    onChange={(e) => setSalaryDA(Number(e.target.value) || 0)}
                    className="pl-9 text-lg"
                    min={0}
                  />
                </div>
                <Slider
                  value={[salaryDA]}
                  onValueChange={(value) => setSalaryDA(value[0])}
                  min={10000}
                  max={500000}
                  step={1000}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹10,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>

              {/* Years of Service */}
              <div className="space-y-3">
                <Label htmlFor="years" className="text-base font-medium">
                  Number of Years of Service
                </Label>
                <Input
                  id="years"
                  type="number"
                  value={yearsOfService}
                  onChange={(e) => setYearsOfService(Number(e.target.value) || 0)}
                  className="text-lg"
                  min={0}
                  max={50}
                />
                <Slider
                  value={[yearsOfService]}
                  onValueChange={(value) => setYearsOfService(value[0])}
                  min={0}
                  max={50}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 years</span>
                  <span>50 years</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Gratuity is payable to employees who have completed at least 5 years of continuous service. The formula used is: <br />
                  <code className="text-primary">(Salary × 15 × Years) / 26</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="text-center text-lg text-muted-foreground">
                  Total Gratuity Payable To You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl lg:text-5xl font-bold text-primary">
                    {formatCurrency(gratuity)}
                  </p>
                  {yearsOfService < 5 && (
                    <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ Minimum 5 years of service required to be eligible for gratuity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calculation Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculation Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Monthly Salary + DA</span>
                  <span className="font-medium">{formatCurrency(salaryDA)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Years of Service</span>
                  <span className="font-medium">{yearsOfService} years</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Formula</span>
                  <span className="font-medium text-sm">(Salary × 15 × Years) / 26</span>
                </div>
                <div className="flex justify-between py-2 text-lg">
                  <span className="font-semibold">Gratuity Amount</span>
                  <span className="font-bold text-primary">{formatCurrency(gratuity)}</span>
                </div>
              </CardContent>
            </Card>

            {/* External Calculator Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Other Gratuity Calculators</CardTitle>
                <CardDescription>
                  Cross-verify your calculations with these trusted platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open("https://groww.in/calculators/gratuity-calculator", "_blank")}
                >
                  <span>Groww's Gratuity Calculator</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.open("https://cleartax.in/s/gratuity-calculator", "_blank")}
                >
                  <span>ClearTax's Gratuity Calculator</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GratuityCalculator;

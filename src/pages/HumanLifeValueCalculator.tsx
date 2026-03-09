import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, Shield, AlertTriangle } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

const HumanLifeValueCalculator = () => {
  const goBack = useGoBack();
  const [annualIncome, setAnnualIncome] = useState("");
  const [annualExpenses, setAnnualExpenses] = useState("");
  const [age, setAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("60");
  const [existingLifeCover, setExistingLifeCover] = useState("");
  const [liabilities, setLiabilities] = useState("");
  const [inflationRate, setInflationRate] = useState("6");
  const [discountRate, setDiscountRate] = useState("8");

  const income = parseFloat(annualIncome) || 0;
  const expenses = parseFloat(annualExpenses) || 0;
  const currentAge = parseInt(age) || 30;
  const retirement = parseInt(retirementAge) || 60;
  const existingCover = parseFloat(existingLifeCover) || 0;
  const debt = parseFloat(liabilities) || 0;
  const inflation = parseFloat(inflationRate) / 100 || 0.06;
  const discount = parseFloat(discountRate) / 100 || 0.08;

  const yearsToRetire = Math.max(0, retirement - currentAge);
  const netIncome = income - expenses;
  
  // Income Replacement Method
  const incomeMultiplier = income > 0 ? Math.min(20, Math.max(10, yearsToRetire)) : 0;
  const incomeReplacementHLV = income * incomeMultiplier;

  // Present Value Method (more accurate)
  const realRate = (1 + discount) / (1 + inflation) - 1;
  let pvHLV = 0;
  for (let i = 1; i <= yearsToRetire; i++) {
    pvHLV += netIncome / Math.pow(1 + realRate, i);
  }

  // Expense Method
  const expenseHLV = expenses * yearsToRetire * 1.5; // 1.5x for buffer

  // Final HLV (using income replacement + liabilities)
  const totalHLV = incomeReplacementHLV + debt;
  const coverGap = totalHLV - existingCover;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Human Life Value Calculator</CardTitle>
              <CardDescription>Calculate the right life insurance coverage for your family</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Age</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Retirement Age</Label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Annual Income (₹)</Label>
                  <Input
                    type="number"
                    placeholder="1200000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Annual Personal Expenses (₹)</Label>
                  <Input
                    type="number"
                    placeholder="400000"
                    value={annualExpenses}
                    onChange={(e) => setAnnualExpenses(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your expenses (excluded from family needs)</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Existing Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Total Liabilities (₹)</Label>
                  <Input
                    type="number"
                    placeholder="5000000"
                    value={liabilities}
                    onChange={(e) => setLiabilities(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Home loan, car loan, etc.</p>
                </div>
                <div>
                  <Label>Existing Life Cover (₹)</Label>
                  <Input
                    type="number"
                    placeholder="5000000"
                    value={existingLifeCover}
                    onChange={(e) => setExistingLifeCover(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Inflation Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="6"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Discount Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="8"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Human Life Value Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Income Multiplier Method</p>
                  <p className="text-xl font-bold">₹{(incomeReplacementHLV / 10000000).toFixed(2)} Cr</p>
                  <p className="text-xs text-muted-foreground">{incomeMultiplier}x annual income</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Present Value Method</p>
                  <p className="text-xl font-bold">₹{(pvHLV / 10000000).toFixed(2)} Cr</p>
                  <p className="text-xs text-muted-foreground">PV of {yearsToRetire} years income</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Expense Method</p>
                  <p className="text-xl font-bold">₹{(expenseHLV / 10000000).toFixed(2)} Cr</p>
                  <p className="text-xs text-muted-foreground">Family expenses coverage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-green-500" />
                  <span className="font-semibold">Recommended Life Cover</span>
                </div>
                <p className="text-3xl font-bold text-green-600">₹{(totalHLV / 10000000).toFixed(2)} Cr</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Income Replacement:</span>
                    <span className="font-mono">₹{incomeReplacementHLV.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liabilities:</span>
                    <span className="font-mono">₹{debt.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${coverGap > 0 ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  {coverGap > 0 ? (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  ) : (
                    <Shield className="h-6 w-6 text-green-500" />
                  )}
                  <span className="font-semibold">Coverage Gap</span>
                </div>
                <p className={`text-3xl font-bold ${coverGap > 0 ? "text-red-600" : "text-green-600"}`}>
                  {coverGap > 0 ? `₹${(coverGap / 10000000).toFixed(2)} Cr` : "Adequately Covered"}
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Required:</span>
                    <span className="font-mono">₹{totalHLV.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Existing:</span>
                    <span className="font-mono">₹{existingCover.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">💡 Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Rule of thumb: Life cover = 10-15x annual income</li>
                <li>• Add liabilities (loans) separately to the base HLV</li>
                <li>• Term insurance is the most cost-effective option</li>
                <li>• Review coverage every 3-5 years or after major life events</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default HumanLifeValueCalculator;

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, TrendingUp, Wallet, Home, Car, Heart, GraduationCap, Users, Briefcase, PiggyBank, Target, CheckCircle, Info, Clock, Building, Lightbulb, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const EmergencyFundCalculator = () => {
  const navigate = useNavigate();
  
  // Income & Expenses
  const [monthlyIncome, setMonthlyIncome] = useState<number>(75000);
  const [rent, setRent] = useState<number>(15000);
  const [utilities, setUtilities] = useState<number>(5000);
  const [groceries, setGroceries] = useState<number>(8000);
  const [transportation, setTransportation] = useState<number>(5000);
  const [insurance, setInsurance] = useState<number>(3000);
  const [emiPayments, setEmiPayments] = useState<number>(10000);
  const [otherExpenses, setOtherExpenses] = useState<number>(5000);
  
  // Risk Factors
  const [jobStability, setJobStability] = useState<string>("moderate");
  const [dependents, setDependents] = useState<number>(2);
  const [healthConditions, setHealthConditions] = useState<string>("none");
  const [hasSpouseIncome, setHasSpouseIncome] = useState<string>("no");
  const [industryType, setIndustryType] = useState<string>("stable");
  
  // Current Savings
  const [currentSavings, setCurrentSavings] = useState<number>(100000);
  const [monthlySavingCapacity, setMonthlySavingCapacity] = useState<number>(15000);

  // Calculations
  const totalMonthlyExpenses = rent + utilities + groceries + transportation + insurance + emiPayments + otherExpenses;
  
  const getRecommendedMonths = () => {
    let months = 6; // Base recommendation
    
    // Job stability factor
    if (jobStability === "unstable") months += 3;
    else if (jobStability === "moderate") months += 1;
    
    // Dependents factor
    if (dependents >= 3) months += 2;
    else if (dependents >= 1) months += 1;
    
    // Health conditions factor
    if (healthConditions === "chronic") months += 2;
    else if (healthConditions === "minor") months += 1;
    
    // Spouse income factor
    if (hasSpouseIncome === "yes") months -= 2;
    
    // Industry type factor
    if (industryType === "volatile") months += 2;
    else if (industryType === "seasonal") months += 1;
    
    return Math.max(3, Math.min(12, months));
  };
  
  const recommendedMonths = getRecommendedMonths();
  const recommendedFund = totalMonthlyExpenses * recommendedMonths;
  const minimumFund = totalMonthlyExpenses * 3;
  const comfortFund = totalMonthlyExpenses * 6;
  const robustFund = totalMonthlyExpenses * 12;
  
  const fundingGap = Math.max(0, recommendedFund - currentSavings);
  const monthsToGoal = fundingGap > 0 && monthlySavingCapacity > 0 
    ? Math.ceil(fundingGap / monthlySavingCapacity) 
    : 0;
  
  const progressPercentage = Math.min(100, (currentSavings / recommendedFund) * 100);
  const currentCoverage = currentSavings / totalMonthlyExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatLakhs = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return formatCurrency(value);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getFundStatus = () => {
    if (currentSavings >= robustFund) return { label: "Excellent", color: "text-green-500", icon: Shield };
    if (currentSavings >= comfortFund) return { label: "Good", color: "text-blue-500", icon: CheckCircle };
    if (currentSavings >= minimumFund) return { label: "Adequate", color: "text-yellow-500", icon: Info };
    if (currentSavings >= totalMonthlyExpenses) return { label: "At Risk", color: "text-orange-500", icon: AlertTriangle };
    return { label: "Critical", color: "text-red-500", icon: AlertTriangle };
  };

  const fundStatus = getFundStatus();
  const StatusIcon = fundStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Emergency Fund Calculator
              </h1>
              <p className="text-sm text-muted-foreground">Plan your financial safety net</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Monthly Expenses
                </CardTitle>
                <CardDescription>Enter your essential monthly expenditures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Rent / Mortgage EMI
                    </Label>
                    <Input
                      type="number"
                      value={rent}
                      onChange={(e) => setRent(Number(e.target.value))}
                      placeholder="Enter rent amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Utilities (Electricity, Water, Gas)
                    </Label>
                    <Input
                      type="number"
                      value={utilities}
                      onChange={(e) => setUtilities(Number(e.target.value))}
                      placeholder="Enter utilities"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      Groceries & Household
                    </Label>
                    <Input
                      type="number"
                      value={groceries}
                      onChange={(e) => setGroceries(Number(e.target.value))}
                      placeholder="Enter groceries"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Transportation
                    </Label>
                    <Input
                      type="number"
                      value={transportation}
                      onChange={(e) => setTransportation(Number(e.target.value))}
                      placeholder="Enter transportation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Insurance Premiums
                    </Label>
                    <Input
                      type="number"
                      value={insurance}
                      onChange={(e) => setInsurance(Number(e.target.value))}
                      placeholder="Enter insurance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Loan EMIs
                    </Label>
                    <Input
                      type="number"
                      value={emiPayments}
                      onChange={(e) => setEmiPayments(Number(e.target.value))}
                      placeholder="Enter EMI payments"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Other Essential Expenses
                    </Label>
                    <Input
                      type="number"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(Number(e.target.value))}
                      placeholder="Enter other expenses"
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Monthly Expenses</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(totalMonthlyExpenses)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Factors that determine your ideal emergency fund size</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Job Stability
                    </Label>
                    <Select value={jobStability} onValueChange={setJobStability}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable">Stable (Govt/MNC/10+ years)</SelectItem>
                        <SelectItem value="moderate">Moderate (5-10 years)</SelectItem>
                        <SelectItem value="unstable">Unstable (Startup/Contract)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Industry Type
                    </Label>
                    <Select value={industryType} onValueChange={setIndustryType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable">Stable (IT, Healthcare, Govt)</SelectItem>
                        <SelectItem value="seasonal">Seasonal (Tourism, Retail)</SelectItem>
                        <SelectItem value="volatile">Volatile (Startups, Crypto)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Number of Dependents: {dependents}
                    </Label>
                    <Slider
                      value={[dependents]}
                      onValueChange={([value]) => setDependents(value)}
                      min={0}
                      max={6}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>6+</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Health Conditions
                    </Label>
                    <Select value={healthConditions} onValueChange={setHealthConditions}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select health status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No major conditions</SelectItem>
                        <SelectItem value="minor">Minor conditions</SelectItem>
                        <SelectItem value="chronic">Chronic illness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Spouse/Partner Income
                    </Label>
                    <Select value={hasSpouseIncome} onValueChange={setHasSpouseIncome}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Single Income Household</SelectItem>
                        <SelectItem value="yes">Dual Income Household</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Monthly Income
                    </Label>
                    <Input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      placeholder="Enter monthly income"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Savings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  Current Savings & Capacity
                </CardTitle>
                <CardDescription>Your existing emergency fund and saving potential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Current Emergency Fund</Label>
                    <Input
                      type="number"
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(Number(e.target.value))}
                      placeholder="Enter current savings"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Saving Capacity</Label>
                    <Input
                      type="number"
                      value={monthlySavingCapacity}
                      onChange={(e) => setMonthlySavingCapacity(Number(e.target.value))}
                      placeholder="How much can you save monthly"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Fund Status */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Emergency Fund Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`h-8 w-8 ${fundStatus.color}`} />
                  <div>
                    <p className={`text-2xl font-bold ${fundStatus.color}`}>{fundStatus.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentCoverage.toFixed(1)} months of expenses covered
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Goal</span>
                    <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercentage} className={getProgressColor(progressPercentage)} />
                </div>
              </CardContent>
            </Card>

            {/* Recommended Fund */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Recommended Fund
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{formatLakhs(recommendedFund)}</p>
                  <p className="text-sm text-muted-foreground">{recommendedMonths} months of expenses</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Minimum (3 months)</span>
                    <span className="font-medium">{formatLakhs(minimumFund)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Comfortable (6 months)</span>
                    <span className="font-medium">{formatLakhs(comfortFund)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Robust (12 months)</span>
                    <span className="font-medium">{formatLakhs(robustFund)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funding Gap */}
            {fundingGap > 0 && (
              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-500">
                    <AlertTriangle className="h-5 w-5" />
                    Funding Gap
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">{formatLakhs(fundingGap)}</p>
                    <p className="text-sm text-muted-foreground">needed to reach goal</p>
                  </div>
                  
                  {monthsToGoal > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{monthsToGoal} months to goal</p>
                        <p className="text-xs text-muted-foreground">
                          At ₹{monthlySavingCapacity.toLocaleString('en-IN')}/month
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Saving Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="font-medium text-green-600 text-sm">High-Yield Savings Account</p>
                  <p className="text-xs text-muted-foreground">Keep 3-4 months in liquid savings (4-6% returns)</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="font-medium text-blue-600 text-sm">Liquid Mutual Funds</p>
                  <p className="text-xs text-muted-foreground">Rest in liquid funds for better returns (6-7%)</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="font-medium text-purple-600 text-sm">Sweep-in FD</p>
                  <p className="text-xs text-muted-foreground">Auto-sweep excess to FD (7-7.5% returns)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* What to Include */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                What to Include
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Housing costs (rent, EMI, maintenance)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Essential utilities and bills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Groceries and daily necessities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Insurance premiums (health, life, vehicle)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Loan EMIs and credit card minimums</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Education and childcare expenses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Essential transportation costs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* What NOT to Include */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                What NOT to Include
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Discretionary spending (entertainment)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Vacation and travel expenses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Dining out and luxury purchases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Subscription services (OTT, gym)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Shopping and retail therapy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Investment contributions (SIP, stocks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Non-essential services</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Emergency Fund Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Golden Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">1.</span>
                  <span><strong>Keep it liquid</strong> - Accessible within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">2.</span>
                  <span><strong>Separate account</strong> - Don't mix with regular savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">3.</span>
                  <span><strong>Review annually</strong> - Update as expenses change</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">4.</span>
                  <span><strong>Replenish quickly</strong> - Rebuild after using</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">5.</span>
                  <span><strong>Don't invest it</strong> - Avoid stocks, crypto, equity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">6.</span>
                  <span><strong>True emergencies only</strong> - Job loss, medical, repairs</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* When to Use */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              When to Use Your Emergency Fund
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="font-semibold text-green-600 mb-2">✓ Appropriate Uses</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Job loss or income reduction</li>
                  <li>• Medical emergencies</li>
                  <li>• Urgent home repairs</li>
                  <li>• Vehicle breakdown (essential)</li>
                  <li>• Family emergency travel</li>
                </ul>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="font-semibold text-red-600 mb-2">✗ Not Appropriate</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Vacation or holiday</li>
                  <li>• New gadgets or electronics</li>
                  <li>• Investment opportunities</li>
                  <li>• Wedding expenses</li>
                  <li>• Down payment for a house</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-blue-600 mb-2">📊 Industry Standards</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>3 months:</strong> Minimum baseline</li>
                  <li>• <strong>6 months:</strong> Recommended standard</li>
                  <li>• <strong>9-12 months:</strong> High risk profiles</li>
                  <li>• <strong>12+ months:</strong> Self-employed, volatile income</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h4 className="font-semibold text-purple-600 mb-2">💡 Pro Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Start small (₹1,000/month)</li>
                  <li>• Automate transfers on salary day</li>
                  <li>• Use windfalls to boost fund</li>
                  <li>• Review every 6 months</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-6 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-5 w-5" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong>General Information Only:</strong> This Emergency Fund Calculator is designed for informational and educational purposes only. 
              The calculations and recommendations provided are based on general financial planning principles and may not account for your specific 
              financial situation, goals, or risk tolerance.
            </p>
            <p>
              <strong>Not Financial Advice:</strong> The output of this calculator should not be construed as professional financial, investment, 
              tax, or legal advice. We strongly recommend consulting with a qualified financial advisor, chartered accountant, or certified 
              financial planner before making any significant financial decisions.
            </p>
            <p>
              <strong>Assumptions & Limitations:</strong> This calculator uses simplified assumptions and formulas. Actual emergency fund requirements 
              may vary based on factors such as inflation, changes in employment status, unexpected expenses, health emergencies, market conditions, 
              and personal circumstances that cannot be fully captured in this tool.
            </p>
            <p>
              <strong>No Guarantee:</strong> We do not guarantee the accuracy, completeness, or reliability of the calculations. The recommended 
              emergency fund amounts are estimates only and should be treated as starting points for your financial planning, not definitive targets.
            </p>
            <p>
              <strong>Personal Responsibility:</strong> You are solely responsible for evaluating the appropriateness of the information provided 
              and for any decisions or actions you take based on this calculator. Building and maintaining an emergency fund is a personal 
              financial decision that requires careful consideration of your individual needs and circumstances.
            </p>
            <p>
              <strong>Regular Review:</strong> Financial situations change over time. We recommend reviewing and adjusting your emergency fund 
              calculations periodically (at least annually) or whenever there are significant changes in your income, expenses, family situation, 
              or employment status.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default EmergencyFundCalculator;

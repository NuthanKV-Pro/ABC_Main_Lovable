import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  PiggyBank, 
  Heart, 
  Home, 
  GraduationCap, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Coins
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface IncomeValues {
  salary: number;
  hp: number;
  pgbp: number;
  cg: number;
  os: number;
}

interface TaxSavingsRecommendationsProps {
  incomeValues: IncomeValues;
}

interface InvestmentOption {
  name: string;
  type: string;
  lockIn: string;
  returns: string;
  risk: "Low" | "Medium" | "High";
  taxBenefit: string;
  suitableFor: string[];
}

interface Recommendation {
  id: string;
  title: string;
  section: string;
  maxLimit: number;
  currentUsed: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: "high" | "medium" | "low";
  tips: string[];
  investmentOptions: InvestmentOption[];
}

const TaxSavingsRecommendations = ({ incomeValues }: TaxSavingsRecommendationsProps) => {
  const grossIncome = Object.values(incomeValues).reduce((sum, val) => sum + val, 0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("recommendations");

  // Simulate used deductions (in real app, these would come from stored data)
  const usedDeductions = useMemo(() => ({
    section80C: parseFloat(localStorage.getItem('deduction_80C') || '0'),
    section80D: parseFloat(localStorage.getItem('deduction_80D') || '0'),
    section80E: parseFloat(localStorage.getItem('deduction_80E') || '0'),
    section80G: parseFloat(localStorage.getItem('deduction_80G') || '0'),
    section80TTA: parseFloat(localStorage.getItem('deduction_80TTA') || '0'),
    section24b: parseFloat(localStorage.getItem('deduction_24b') || '0'),
    nps80CCD: parseFloat(localStorage.getItem('deduction_80CCD') || '0'),
  }), []);

  // Determine income bracket for personalized tips
  const incomeBracket = useMemo(() => {
    if (grossIncome <= 500000) return "low";
    if (grossIncome <= 1000000) return "medium";
    if (grossIncome <= 2000000) return "high";
    return "veryHigh";
  }, [grossIncome]);

  const getPersonalizedTips = (section: string): string[] => {
    const tips: Record<string, Record<string, string[]>> = {
      "80C": {
        low: [
          "Focus on PPF for guaranteed tax-free returns",
          "ELSS is good if you can lock funds for 3 years",
          "EPF contributions from salary already count here"
        ],
        medium: [
          "Maximize ELSS for better returns with equity exposure",
          "Consider SSY if you have a daughter under 10",
          "Split between PPF and ELSS for balanced approach"
        ],
        high: [
          "Max out 80C with ELSS for highest potential returns",
          "Consider ULIP for insurance + investment",
          "Tax-saver FDs are safe but returns are taxable"
        ],
        veryHigh: [
          "80C limit may feel insufficient - focus on quality investments",
          "Consider 80CCD(1B) for additional ₹50K deduction via NPS",
          "Look at life insurance with high coverage for 80C + protection"
        ]
      },
      "80D": {
        low: ["Basic health cover of ₹5L is sufficient", "Add parents if they're uninsured"],
        medium: ["Consider ₹10L cover with critical illness rider", "Family floater is cost-effective"],
        high: ["Go for ₹25L+ cover with super top-up", "Separate policy for parents maximizes deduction"],
        veryHigh: ["Premium comprehensive cover with OPD benefits", "Consider global health coverage"]
      },
      "80CCD": {
        low: ["NPS Tier 1 gives extra ₹50K deduction", "Start with minimal contribution to build habit"],
        medium: ["Employer NPS (80CCD2) gives additional 10% deduction", "Aggressive allocation suits long horizon"],
        high: ["Max out 80CCD(1B) for full ₹50K benefit", "Consider active choice for better control"],
        veryHigh: ["NPS is efficient for retirement + tax", "Combine with personal pension plans"]
      }
    };
    return tips[section]?.[incomeBracket] || [];
  };

  const recommendations: Recommendation[] = useMemo(() => [
    {
      id: "80C",
      title: "Section 80C Investments",
      section: "80C",
      maxLimit: 150000,
      currentUsed: usedDeductions.section80C,
      description: "Invest in PPF, ELSS, LIC, NSC, or Tax Saver FDs",
      icon: PiggyBank,
      priority: usedDeductions.section80C < 150000 ? "high" : "low",
      tips: getPersonalizedTips("80C"),
      investmentOptions: [
        { name: "ELSS Mutual Funds", type: "Equity", lockIn: "3 years", returns: "10-15%", risk: "High", taxBenefit: "Up to ₹46,800", suitableFor: ["Young earners", "Risk takers"] },
        { name: "PPF", type: "Debt", lockIn: "15 years", returns: "7.1%", risk: "Low", taxBenefit: "Up to ₹46,800", suitableFor: ["Conservative investors", "Long-term planners"] },
        { name: "NSC", type: "Debt", lockIn: "5 years", returns: "7.7%", risk: "Low", taxBenefit: "Up to ₹46,800", suitableFor: ["Fixed income seekers"] },
        { name: "Tax Saver FD", type: "Debt", lockIn: "5 years", returns: "6-7%", risk: "Low", taxBenefit: "Up to ₹46,800", suitableFor: ["Senior citizens", "Risk averse"] },
        { name: "ULIP", type: "Hybrid", lockIn: "5 years", returns: "8-12%", risk: "Medium", taxBenefit: "Up to ₹46,800", suitableFor: ["Insurance + Investment seekers"] },
        { name: "SSY (Sukanya Samriddhi)", type: "Debt", lockIn: "21 years", returns: "8.2%", risk: "Low", taxBenefit: "Up to ₹46,800", suitableFor: ["Parents of girl child"] }
      ]
    },
    {
      id: "80D",
      title: "Health Insurance Premium",
      section: "80D",
      maxLimit: 75000,
      currentUsed: usedDeductions.section80D,
      description: "Self, family & parents health insurance premiums",
      icon: Heart,
      priority: usedDeductions.section80D < 25000 ? "high" : "medium",
      tips: getPersonalizedTips("80D"),
      investmentOptions: [
        { name: "Family Floater (₹5L)", type: "Health", lockIn: "1 year", returns: "N/A", risk: "Low", taxBenefit: "Up to ₹25,000", suitableFor: ["Small families"] },
        { name: "Family Floater (₹10L)", type: "Health", lockIn: "1 year", returns: "N/A", risk: "Low", taxBenefit: "Up to ₹25,000", suitableFor: ["Growing families"] },
        { name: "Parents Policy (₹5L)", type: "Health", lockIn: "1 year", returns: "N/A", risk: "Low", taxBenefit: "Up to ₹50,000", suitableFor: ["Senior parents"] },
        { name: "Critical Illness Cover", type: "Health", lockIn: "1 year", returns: "N/A", risk: "Low", taxBenefit: "Included in 80D", suitableFor: ["High-risk individuals"] }
      ]
    },
    {
      id: "24b",
      title: "Home Loan Interest",
      section: "24(b)",
      maxLimit: 200000,
      currentUsed: usedDeductions.section24b,
      description: "Interest on housing loan for self-occupied property",
      icon: Home,
      priority: usedDeductions.section24b === 0 && grossIncome > 1000000 ? "high" : "low",
      tips: [
        "Up to ₹2 lakh deduction for self-occupied property",
        "No limit for let-out property",
        "Pre-construction interest claimable in 5 equal installments",
        "Both co-borrowers can claim separately"
      ],
      investmentOptions: [
        { name: "Home Loan (Floating)", type: "Loan", lockIn: "15-30 years", returns: "8.5-9.5%", risk: "Medium", taxBenefit: "Up to ₹2L interest + ₹1.5L principal", suitableFor: ["First-time buyers"] },
        { name: "Home Loan (Fixed)", type: "Loan", lockIn: "15-30 years", returns: "9-10%", risk: "Low", taxBenefit: "Up to ₹2L interest + ₹1.5L principal", suitableFor: ["Stability seekers"] }
      ]
    },
    {
      id: "80CCD",
      title: "NPS Contribution",
      section: "80CCD(1B)",
      maxLimit: 50000,
      currentUsed: usedDeductions.nps80CCD,
      description: "Additional NPS contribution beyond 80C",
      icon: Shield,
      priority: usedDeductions.nps80CCD === 0 ? "high" : "low",
      tips: getPersonalizedTips("80CCD"),
      investmentOptions: [
        { name: "NPS Tier 1 - Aggressive", type: "Hybrid", lockIn: "Till 60", returns: "10-12%", risk: "High", taxBenefit: "Extra ₹50,000", suitableFor: ["Young professionals"] },
        { name: "NPS Tier 1 - Moderate", type: "Hybrid", lockIn: "Till 60", returns: "8-10%", risk: "Medium", taxBenefit: "Extra ₹50,000", suitableFor: ["Mid-career professionals"] },
        { name: "NPS Tier 1 - Conservative", type: "Debt", lockIn: "Till 60", returns: "7-9%", risk: "Low", taxBenefit: "Extra ₹50,000", suitableFor: ["Near retirement"] }
      ]
    },
    {
      id: "80E",
      title: "Education Loan Interest",
      section: "80E",
      maxLimit: Infinity,
      currentUsed: usedDeductions.section80E,
      description: "Interest on higher education loan",
      icon: GraduationCap,
      priority: "medium",
      tips: [
        "No upper limit on deduction",
        "Available for 8 years from start of repayment",
        "Covers loans for self, spouse, or children",
        "Only interest component is deductible, not principal"
      ],
      investmentOptions: []
    },
    {
      id: "80TTA",
      title: "Savings Account Interest",
      section: "80TTA/80TTB",
      maxLimit: 10000,
      currentUsed: usedDeductions.section80TTA,
      description: "Interest from savings bank accounts",
      icon: TrendingUp,
      priority: usedDeductions.section80TTA < 10000 ? "medium" : "low",
      tips: [
        "Up to ₹10,000 for non-senior citizens (80TTA)",
        "Up to ₹50,000 for senior citizens (80TTB)",
        "Includes all savings accounts",
        "FD interest not covered under 80TTA"
      ],
      investmentOptions: []
    },
  ], [usedDeductions, grossIncome, incomeBracket]);

  const totalPotentialSavings = recommendations.reduce((sum, rec) => {
    const unused = Math.max(0, rec.maxLimit === Infinity ? 0 : rec.maxLimit - rec.currentUsed);
    return sum + unused;
  }, 0);

  // Calculate tax saved based on actual income bracket
  const getTaxRate = () => {
    if (grossIncome <= 300000) return 0;
    if (grossIncome <= 700000) return 0.05;
    if (grossIncome <= 1000000) return 0.10;
    if (grossIncome <= 1200000) return 0.15;
    if (grossIncome <= 1500000) return 0.20;
    return 0.30;
  };

  const taxSaved = Math.round(totalPotentialSavings * getTaxRate());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High": return "text-red-600 dark:text-red-400";
      case "Medium": return "text-yellow-600 dark:text-yellow-400";
      default: return "text-green-600 dark:text-green-400";
    }
  };

  // Chart data for comparison
  const comparisonChartData = recommendations
    .filter(rec => rec.maxLimit !== Infinity)
    .map(rec => ({
      name: rec.section,
      used: rec.currentUsed,
      remaining: Math.max(0, rec.maxLimit - rec.currentUsed),
      limit: rec.maxLimit
    }));

  const pieChartData = recommendations
    .filter(rec => rec.maxLimit !== Infinity && rec.currentUsed > 0)
    .map(rec => ({
      name: rec.section,
      value: rec.currentUsed
    }));

  const chartConfig = {
    used: { label: "Used", color: "hsl(var(--primary))" },
    remaining: { label: "Remaining", color: "hsl(var(--muted))" }
  };

  if (grossIncome === 0) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Enter your income details to get personalized tax saving recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Tax Savings Recommendations</CardTitle>
              <CardDescription>
                Based on your income of ₹{grossIncome.toLocaleString('en-IN')} 
                <Badge variant="outline" className="ml-2 text-xs">
                  {incomeBracket === "low" ? "≤5L" : incomeBracket === "medium" ? "5L-10L" : incomeBracket === "high" ? "10L-20L" : ">20L"} bracket
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground">Potential Savings</p>
              <p className="text-xl font-bold text-primary">₹{taxSaved.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <p className="text-xs text-muted-foreground">Tax Rate</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{(getTaxRate() * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="recommendations" className="gap-2">
              <Target className="w-4 h-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Comparison Charts
            </TabsTrigger>
            <TabsTrigger value="investments" className="gap-2">
              <Coins className="w-4 h-4" />
              Investment Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {recommendations
              .filter(rec => rec.priority === "high" || rec.currentUsed < rec.maxLimit)
              .slice(0, 6)
              .map((rec) => {
                const Icon = rec.icon;
                const unusedLimit = rec.maxLimit === Infinity ? rec.currentUsed : rec.maxLimit - rec.currentUsed;
                const usagePercent = rec.maxLimit === Infinity ? 100 : (rec.currentUsed / rec.maxLimit) * 100;
                const isFullyUsed = rec.currentUsed >= rec.maxLimit && rec.maxLimit !== Infinity;
                const isExpanded = expandedSection === rec.id;

                return (
                  <div 
                    key={rec.id}
                    className={`rounded-lg border ${isFullyUsed ? 'bg-muted/30 border-muted' : 'bg-card border-border hover:border-primary/30'} transition-all`}
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedSection(isExpanded ? null : rec.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isFullyUsed ? 'bg-muted' : 'bg-primary/10'}`}>
                          <Icon className={`w-5 h-5 ${isFullyUsed ? 'text-muted-foreground' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-medium truncate">{rec.title}</h4>
                            <div className="flex items-center gap-2">
                              {isFullyUsed ? (
                                <Badge variant="outline" className="gap-1 shrink-0">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Utilized
                                </Badge>
                              ) : (
                                <Badge className={`${getPriorityColor(rec.priority)} shrink-0`}>
                                  {rec.priority} priority
                                </Badge>
                              )}
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                          
                          {rec.maxLimit !== Infinity && (
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Used: ₹{rec.currentUsed.toLocaleString('en-IN')}</span>
                                <span>Limit: ₹{rec.maxLimit.toLocaleString('en-IN')}</span>
                              </div>
                              <Progress value={Math.min(usagePercent, 100)} className="h-2" />
                            </div>
                          )}

                          {!isFullyUsed && unusedLimit > 0 && rec.maxLimit !== Infinity && (
                            <p className="text-sm font-medium text-primary">
                              💡 You can still invest ₹{unusedLimit.toLocaleString('en-IN')} under Section {rec.section}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t bg-muted/30">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          Personalized Tips for Your Income Level
                        </h5>
                        <div className="space-y-2 mb-4">
                          {rec.tips.map((tip, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {tip}
                            </p>
                          ))}
                        </div>

                        {rec.investmentOptions.length > 0 && (
                          <>
                            <h5 className="font-medium mb-2">Top Investment Options</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {rec.investmentOptions.slice(0, 4).map((option, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-card border text-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{option.name}</span>
                                    <Badge variant="outline" className={getRiskColor(option.risk)}>
                                      {option.risk} Risk
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <p>Lock-in: {option.lockIn} | Returns: {option.returns}</p>
                                    <p>Tax Benefit: {option.taxBenefit}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Used vs Remaining */}
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Deduction Utilization</CardTitle>
                  <CardDescription>Used vs Remaining limits by section</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonChartData} layout="vertical">
                        <XAxis type="number" tickFormatter={(val) => `₹${(val/1000).toFixed(0)}K`} />
                        <YAxis type="category" dataKey="name" width={60} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="used" stackId="a" fill="hsl(var(--primary))" name="Used" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="remaining" stackId="a" fill="hsl(var(--muted))" name="Remaining" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Pie Chart - Distribution */}
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Current Deductions Distribution</CardTitle>
                  <CardDescription>How your deductions are allocated</CardDescription>
                </CardHeader>
                <CardContent>
                  {pieChartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieChartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 60 + 200}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No deductions claimed yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Limit Available</p>
                <p className="text-2xl font-bold text-primary">₹{(485000).toLocaleString('en-IN')}</p>
              </Card>
              <Card className="border p-4 text-center">
                <p className="text-sm text-muted-foreground">Currently Used</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{Object.values(usedDeductions).reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
                </p>
              </Card>
              <Card className="border p-4 text-center">
                <p className="text-sm text-muted-foreground">Remaining to Invest</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  ₹{totalPotentialSavings.toLocaleString('en-IN')}
                </p>
              </Card>
              <Card className="border p-4 text-center">
                <p className="text-sm text-muted-foreground">Potential Tax Saved</p>
                <p className="text-2xl font-bold text-primary">₹{taxSaved.toLocaleString('en-IN')}</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="investments" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {recommendations
                .filter(rec => rec.investmentOptions.length > 0)
                .map((rec) => (
                  <Card key={rec.id} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <rec.icon className="w-5 h-5 text-primary" />
                        {rec.title} - Investment Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">Option</th>
                              <th className="text-left py-2 px-2">Type</th>
                              <th className="text-left py-2 px-2">Lock-in</th>
                              <th className="text-left py-2 px-2">Returns</th>
                              <th className="text-left py-2 px-2">Risk</th>
                              <th className="text-left py-2 px-2">Best For</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rec.investmentOptions.map((option, idx) => (
                              <tr key={idx} className="border-b last:border-0">
                                <td className="py-2 px-2 font-medium">{option.name}</td>
                                <td className="py-2 px-2">{option.type}</td>
                                <td className="py-2 px-2">{option.lockIn}</td>
                                <td className="py-2 px-2">{option.returns}</td>
                                <td className={`py-2 px-2 ${getRiskColor(option.risk)}`}>{option.risk}</td>
                                <td className="py-2 px-2 text-xs text-muted-foreground">
                                  {option.suitableFor.join(", ")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaxSavingsRecommendations;
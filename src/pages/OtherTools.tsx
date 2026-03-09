import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Calculator, Coins, Globe, PieChart, TrendingUp, Layers, Heart, Target, TrendingDown, CreditCard, Briefcase, Users, Search } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

const tools = [
  { id: "ais-tis-reconciliation", title: "AIS/TIS Reconciliation", description: "Match Form 26AS with AIS/TIS data, flag discrepancies", icon: FileText, route: "/ais-tis-reconciliation", category: "Tax & Compliance" },
  { id: "presumptive-tax", title: "Presumptive Tax Calculator", description: "44AD/44ADA eligibility & presumptive income calculation", icon: Calculator, route: "/presumptive-tax", category: "Tax & Compliance" },
  { id: "crypto-tax", title: "Crypto Tax Calculator", description: "30% VDA tax, 1% TDS, no loss set-off rules", icon: Coins, route: "/crypto-tax", category: "Tax & Compliance" },
  { id: "nri-tax", title: "NRI Tax Calculator", description: "Residency status, RNOR, taxable income determination", icon: Globe, route: "/nri-tax", category: "Tax & Compliance" },
  { id: "asset-allocation", title: "Asset Allocation Optimizer", description: "Age & goal-based portfolio rebalancing recommendations", icon: PieChart, route: "/asset-allocation", category: "Investment & Wealth" },
  { id: "ipo-analysis", title: "IPO Analysis Tool", description: "GMP tracking, allotment probability, listing gains", icon: TrendingUp, route: "/ipo-analysis", category: "Investment & Wealth" },
  { id: "bond-ladder", title: "Bond Ladder Calculator", description: "Maturity staggering & yield optimization", icon: Layers, route: "/bond-ladder", category: "Investment & Wealth" },
  { id: "human-life-value", title: "Human Life Value Calculator", description: "Insurance needs based on income & dependents", icon: Heart, route: "/human-life-value", category: "Financial Planning" },
  { id: "multiple-goals", title: "Multiple Goals Dashboard", description: "Track progress across multiple financial goals", icon: Target, route: "/multiple-goals", category: "Financial Planning" },
  { id: "inflation-corpus", title: "Inflation-Adjusted Corpus", description: "Future value with inflation erosion for retirement", icon: TrendingDown, route: "/inflation-corpus", category: "Financial Planning" },
  { id: "breakeven-analysis", title: "Break-even Analysis", description: "Fixed/variable costs, units to break even", icon: Target, route: "/breakeven-analysis", category: "Business" },
  { id: "working-capital", title: "Working Capital Calculator", description: "Current ratio, operating cycle, cash conversion", icon: Calculator, route: "/working-capital", category: "Business" },
  { id: "invoice-aging", title: "Invoice Aging Dashboard", description: "AR aging buckets, overdue tracking", icon: FileText, route: "/invoice-aging", category: "Business" },
  { id: "subscription-audit", title: "Subscription Audit Tool", description: "Track recurring expenses, identify waste", icon: CreditCard, route: "/subscription-audit", category: "Lifestyle" },
  { id: "side-hustle", title: "Side Hustle Tracker", description: "Multi-source income tracking, tax implications", icon: Briefcase, route: "/side-hustle", category: "Lifestyle" },
  { id: "expense-split", title: "Expense Split Calculator", description: "Roommate/group expense splitting", icon: Users, route: "/expense-split", category: "Lifestyle" },
  { id: "rent-receipt", title: "Rent Receipt Generator", description: "Generate rent receipts for HRA claims", icon: FileText, route: "/rent-receipt", category: "Lifestyle" },
  { id: "emi-prepayment", title: "EMI Prepayment Optimizer", description: "Compare EMI reduction vs tenure reduction", icon: Calculator, route: "/emi-prepayment", category: "Lifestyle" }
];

const categories = ["All", "Tax & Compliance", "Investment & Wealth", "Financial Planning", "Business", "Lifestyle"];

const OtherTools = () => {
  const goBack = useGoBack();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTools = categories.slice(1).reduce((acc, category) => {
    acc[category] = filteredTools.filter(tool => tool.category === category);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📦 Other Tools</h1>
        <p className="text-muted-foreground">Additional utilities for tax, investment, business, and financial planning</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {selectedCategory === "All" ? (
        Object.entries(groupedTools).map(([category, categoryTools]) => (
          categoryTools.length > 0 && (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryTools.map(tool => (
                  <Card
                    key={tool.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                    onClick={() => navigate(tool.route)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <tool.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{tool.title}</CardTitle>
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">New</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ))
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map(tool => (
            <Card
              key={tool.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
              onClick={() => navigate(tool.route)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tool.title}</CardTitle>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">New</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tools found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default OtherTools;

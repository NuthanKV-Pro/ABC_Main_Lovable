import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, FileText, Calculator, Coins, Globe, PieChart,
  TrendingUp, Layers, Heart, Target, TrendingDown, CreditCard,
  Briefcase, Users, Search, ShieldCheck, Landmark, Building2,
  Sparkles, ArrowRight
} from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { motion, AnimatePresence } from "framer-motion";

const categoryMeta: Record<string, { icon: any; color: string; bg: string }> = {
  "Tax & Compliance": { icon: ShieldCheck, color: "text-red-500", bg: "bg-red-500/10" },
  "Investment & Wealth": { icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  "Financial Planning": { icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
  "Business": { icon: Building2, color: "text-amber-500", bg: "bg-amber-500/10" },
  "Lifestyle": { icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
};

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

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" as const }
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, staggerChildren: 0.04 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

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

  const ToolCard = ({ tool, index }: { tool: typeof tools[0]; index: number }) => {
    const catMeta = categoryMeta[tool.category];
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        custom={index}
        layout
      >
        <Card
          className="group cursor-pointer border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative h-full"
          onClick={() => navigate(tool.route)}
        >
          <div className={`absolute top-0 left-0 right-0 h-1 ${catMeta.bg.replace('/10', '/60')} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${catMeta.bg} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className={`h-5 w-5 ${catMeta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-semibold text-sm text-foreground truncate">{tool.title}</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-primary/10 text-primary border-0">
                    New
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tool.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const CategoryHeader = ({ category }: { category: string }) => {
    const meta = categoryMeta[category];
    const CategoryIcon = meta.icon;
    const count = groupedTools[category]?.length || 0;
    return (
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`p-2 rounded-lg ${meta.bg}`}>
          <CategoryIcon className={`h-5 w-5 ${meta.color}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{category}</h2>
          <p className="text-xs text-muted-foreground">{count} tool{count !== 1 ? 's' : ''}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">📦 Other Tools</h1>
        <p className="text-muted-foreground text-sm">18 specialized utilities for tax, investment, business & lifestyle</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
          {categories.map(category => {
            const isActive = selectedCategory === category;
            const meta = category !== "All" ? categoryMeta[category] : null;
            return (
              <motion.div key={category} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {meta && <meta.icon className="h-3.5 w-3.5 mr-1" />}
                  {category}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      <AnimatePresence mode="wait">
        {selectedCategory === "All" ? (
          <motion.div key="all" variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              categoryTools.length > 0 && (
                <div key={category} className="mb-10">
                  <CategoryHeader category={category} />
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {categoryTools.map((tool, i) => (
                      <ToolCard key={tool.id} tool={tool} index={i} />
                    ))}
                  </div>
                </div>
              )
            ))}
          </motion.div>
        ) : (
          <motion.div key={selectedCategory} variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
            <CategoryHeader category={selectedCategory} />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredTools.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No tools found matching your search.</p>
        </motion.div>
      )}
    </div>
  );
};

export default OtherTools;

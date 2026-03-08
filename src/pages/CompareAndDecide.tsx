import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, TrendingUp, GitCompare, Shield } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { motion } from "framer-motion";

const comparisonTools = [
  {
    id: "tax-saving-comparison",
    title: "PPF vs ELSS vs NPS vs FD",
    description: "Compare 80C investments: after-tax returns, lock-in period, risk level & liquidity side by side",
    icon: Scale,
    route: "/tax-saving-comparison",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "investment-mode-comparison",
    title: "SIP vs Lumpsum vs RD",
    description: "Find the best investment mode for your goal amount, timeline & risk appetite",
    icon: TrendingUp,
    route: "/investment-mode-comparison",
    color: "from-blue-500/20 to-indigo-500/20",
  },
  {
    id: "regime-optimizer",
    title: "Old vs New Tax Regime",
    description: "Data-driven tax regime recommendation based on your income & deductions",
    icon: GitCompare,
    route: "/regime-optimizer",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "insurance-comparison",
    title: "Term vs Endowment vs ULIP",
    description: "Insurance products compared: real returns, wealth gap analysis & smart strategy",
    icon: Shield,
    route: "/insurance-comparison",
    color: "from-purple-500/20 to-pink-500/20",
  },
];

const CompareAndDecide = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GitCompare className="h-6 w-6 text-primary" />
              Compare & Decide
            </h1>
            <p className="text-sm text-muted-foreground">Side-by-side comparisons for smarter financial decisions</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisonTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/30 h-full"
                  onClick={() => navigate(tool.route)}
                >
                  <CardHeader>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${tool.color} w-fit mb-2`}>
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription className="text-sm">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={(e) => { e.stopPropagation(); navigate(tool.route); }}>
                      Compare Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CompareAndDecide;

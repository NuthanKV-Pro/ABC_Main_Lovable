import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, TrendingUp, Building, Receipt, Calculator, Sparkles, Wallet, HelpCircle, Home, DollarSign, MoreHorizontal, Banknote, Gift, PiggyBank, LineChart, Landmark, Coins, Shield, ScrollText, Briefcase } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const modules = [
  {
    id: "income-tax",
    title: "Income Tax",
    description: "Tax planning & filing",
    icon: Calculator,
    route: "/dashboard",
    tag: "Kinda Built",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "gst",
    title: "GST",
    description: "Goods & Services Tax",
    icon: Receipt,
    route: "external:https://abcgst1.lovable.app",
    tag: "ok-ok built",
    tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  {
    id: "financial-ratios",
    title: "Financial Ratios",
    description: "Key performance metrics",
    icon: TrendingUp,
    route: "/financial-ratios",
    tag: "ok-ok built",
    tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/30"
  },
  {
    id: "mca",
    title: "MCA",
    description: "Ministry of Corporate Affairs",
    icon: Building,
    route: "external:https://abcmca1.lovable.app",
    tag: "WIP",
    tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    id: "mis-reports",
    title: "MIS Reports",
    description: "Management Information System",
    icon: BarChart3,
    route: "external:https://abcmis1.lovable.app",
    tag: "WIP",
    tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    id: "financial-statements",
    title: "Financial Statements",
    description: "Balance Sheet, P&L, Cash Flow",
    icon: FileText,
    route: null,
    tag: "Coming Soon",
    tagColor: "bg-muted text-muted-foreground border-muted-foreground/30"
  }
];

const amazingTools = [
  {
    id: "salary-optimisation",
    title: "Salary Optimisation Engine",
    description: "Optimize your salary structure",
    icon: Wallet,
    route: "external:https://abcsalop1.lovable.app",
    tag: "WIP",
    tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    id: "when-to-sell",
    title: "When to Sell?",
    description: "Investment exit timing analysis",
    icon: HelpCircle,
    route: null,
    tag: "Coming Soon",
    tagColor: "bg-muted text-muted-foreground border-muted-foreground/30"
  },
  {
    id: "hra-calc",
    title: "HRA Calc",
    description: "House Rent Allowance calculator",
    icon: Home,
    route: "external:https://abcsalop1.lovable.app/hra-calc",
    tag: "WIP",
    tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    id: "advance-tax-calc",
    title: "Advance Tax CalC",
    description: "Calculate advance tax payments",
    icon: DollarSign,
    route: "external:https://abcadv1.lovable.app",
    tag: "WIP",
    tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    id: "emi-calc",
    title: "EMI Calculator",
    description: "Calculate loan EMI instantly",
    icon: Banknote,
    route: "/emi-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "gratuity-calc",
    title: "Gratuity CalC",
    description: "Calculate your gratuity entitlement",
    icon: Gift,
    route: "/gratuity-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "retirement-calc",
    title: "Retirement Corpus Calculator",
    description: "Estimate savings needed for retirement",
    icon: PiggyBank,
    route: "/retirement-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "sip-calc",
    title: "SIP CalC",
    description: "Calculate SIP returns & maturity",
    icon: LineChart,
    route: "/sip-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "ppf-calc",
    title: "PPF CalC",
    description: "Calculate PPF maturity amount",
    icon: Landmark,
    route: "/ppf-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "fd-calc",
    title: "FD Calculator",
    description: "Calculate Fixed Deposit maturity",
    icon: Banknote,
    route: "/fd-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "lumpsum-calc",
    title: "Lumpsum Calculator",
    description: "Calculate one-time investment returns",
    icon: Coins,
    route: "/lumpsum-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "nps-calc",
    title: "NPS CalC",
    description: "National Pension Scheme calculator",
    icon: Shield,
    route: "/nps-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "nsc-calc",
    title: "NSC CalC",
    description: "National Savings Certificate returns",
    icon: ScrollText,
    route: "/nsc-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "pf-calc",
    title: "PF CalC",
    description: "Provident Fund corpus estimator",
    icon: Briefcase,
    route: "/pf-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "product-builder",
    title: "Product Builder",
    description: "Framework for idea-to-blueprint development",
    icon: Sparkles,
    route: "external:https://abcprodev1.lovable.app",
    tag: "WIP",
    tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    id: "more-calcs",
    title: "More CalCs coming soon💖!",
    description: "Exciting tools on the way",
    icon: MoreHorizontal,
    route: null,
    tag: "",
    tagColor: ""
  }
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">ABC</h1>
              <p className="text-sm text-muted-foreground">AI Legal & Tax Co-pilot</p>
            </div>
            <div className="flex items-center gap-3">
              <SearchBar />
              <Button 
                variant="default" 
                onClick={() => navigate("/auth")}
              >
                Sign-In/Sign-Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-6 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <p className="text-primary font-medium flex items-center gap-2">
              <span className="text-xl">✨</span> AI-Powered Tax Consultation
            </p>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
          >
            AnyBody Can Consult
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Your intelligent co-pilot for legal and tax consultation.
            Analyze income, optimize deductions, and get expert AI guidance.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-[var(--shadow-gold)] px-8 py-6 text-lg"
              onClick={() => navigate("/dashboard")}
            >
              Get Started →
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg"
              onClick={() => window.open("https://abcpro1.odoo.com/about-us", "_blank")}
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Module</h2>
          <p className="text-lg text-muted-foreground">
            Select a module to get started with your consultation
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            const isDisabled = !module.route;
            
            return (
              <Card 
                key={module.id}
                className={`hover:shadow-[var(--shadow-card)] transition-all cursor-pointer border-2 hover:border-primary/30 ${
                  isDisabled ? 'opacity-75' : ''
                }`}
                onClick={() => {
                  if (module.route) {
                    if (module.route.startsWith('external:')) {
                      window.open(module.route.replace('external:', ''), '_blank');
                    } else {
                      navigate(module.route);
                    }
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${module.tagColor}`}>
                      {module.tag}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{module.title}</CardTitle>
                  <CardDescription className="text-base">{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    variant={isDisabled ? "outline" : "default"}
                    disabled={isDisabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (module.route) {
                        if (module.route.startsWith('external:')) {
                          window.open(module.route.replace('external:', ''), '_blank');
                        } else {
                          navigate(module.route);
                        }
                      }
                    }}
                  >
                    {isDisabled ? "Coming Soon" : "Open Module"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Amazing Tools Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold">Amazing Tools</h2>
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground">
              Specialized calculators and utilities to simplify your finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amazingTools.map((tool) => {
              const Icon = tool.icon;
              const isDisabled = !tool.route;
              const isPlaceholder = tool.id === "more-calcs";
              
              if (isPlaceholder) {
                return (
                  <Card 
                    key={tool.id}
                    className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center min-h-[200px]"
                  >
                    <div className="text-center p-6">
                      <Icon className="w-10 h-10 text-primary/50 mx-auto mb-3" />
                      <p className="text-lg font-medium text-primary/70">{tool.title}</p>
                    </div>
                  </Card>
                );
              }
              
              return (
                <Card 
                  key={tool.id}
                  className={`hover:shadow-[var(--shadow-card)] transition-all cursor-pointer border-2 hover:border-primary/30 ${
                    isDisabled ? 'opacity-75' : ''
                  }`}
                  onClick={() => {
                    if (tool.route) {
                      if (tool.route.startsWith('external:')) {
                        window.open(tool.route.replace('external:', ''), '_blank');
                      } else {
                        navigate(tool.route);
                      }
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      {tool.tag && (
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${tool.tagColor}`}>
                          {tool.tag}
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription className="text-base">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      variant={isDisabled ? "outline" : "default"}
                      disabled={isDisabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tool.route) {
                          if (tool.route.startsWith('external:')) {
                            window.open(tool.route.replace('external:', ''), '_blank');
                          } else {
                            navigate(tool.route);
                          }
                        }
                      }}
                    >
                      {isDisabled ? "Coming Soon" : "Open Tool"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

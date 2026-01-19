import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, TrendingUp, Building, Receipt, Calculator, Sparkles, Wallet, HelpCircle, Home, DollarSign, MoreHorizontal, Banknote, Gift, PiggyBank, LineChart, Landmark, Coins, Shield, ScrollText, Briefcase, Scale, Heart, BarChart, Repeat, Users, CreditCard, FileCheck, Car, GraduationCap, MessageSquare, GitCompare, Building2, Target, Umbrella, Flag, ClipboardList, BadgeDollarSign, PieChart, Scissors, UserCheck, ShieldCheck, Layers, Workflow, Factory, Split, Briefcase as Portfolio, Goal, TrendingUp as Compound, TrendingDown, CircleDollarSign } from "lucide-react";
import { useRef } from "react";
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
    id: "tax-loss-harvesting",
    title: "Tax Loss Harvesting",
    description: "Offset capital gains with losses",
    icon: Scissors,
    route: "/tax-loss-harvesting",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
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
    id: "tax-saving-comparison",
    title: "Tax Saving Comparison",
    description: "Compare 80C investments side by side",
    icon: Scale,
    route: "/tax-saving-comparison",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "ssy-calc",
    title: "SSY CalC",
    description: "Sukanya Samriddhi Yojana calculator",
    icon: Heart,
    route: "/ssy-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "cagr-calc",
    title: "CAGR CalC",
    description: "Compound Annual Growth Rate",
    icon: BarChart,
    route: "/cagr-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "rd-calc",
    title: "RD CalC",
    description: "Recurring Deposit calculator",
    icon: Repeat,
    route: "/rd-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "scss-calc",
    title: "SCSS CalC",
    description: "Senior Citizen Savings Scheme",
    icon: Users,
    route: "/scss-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "home-loan-eligibility",
    title: "Home Loan Eligibility",
    description: "Check your maximum loan amount",
    icon: Home,
    route: "/home-loan-eligibility",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "elss-calc",
    title: "ELSS CalC",
    description: "Equity Linked Savings Scheme",
    icon: TrendingUp,
    route: "/elss-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "credit-score-calc",
    title: "Credit Score CalC",
    description: "Estimate your CIBIL score",
    icon: CreditCard,
    route: "/credit-score-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "stamp-duty-calc",
    title: "Stamp Duty CalC",
    description: "Property registration charges",
    icon: FileCheck,
    route: "/stamp-duty-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "car-loan-calc",
    title: "Car Loan EMI CalC",
    description: "Vehicle financing calculator",
    icon: Car,
    route: "/car-loan-calculator",
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
    id: "gold-loan-calc",
    title: "Gold Loan CalC",
    description: "Estimate loan on your gold",
    icon: Coins,
    route: "/gold-loan-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "education-loan-calc",
    title: "Education Loan CalC",
    description: "Plan your education financing",
    icon: GraduationCap,
    route: "/education-loan-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "swp-calc",
    title: "SWP CalC",
    description: "Plan regular income from MF",
    icon: TrendingUp,
    route: "/swp-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "loan-advisor",
    title: "Loan Advisor",
    description: "EMI vs Tenure reduction guidance",
    icon: MessageSquare,
    route: "/loan-advisor",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "loan-comparison",
    title: "Loan Comparison Tool",
    description: "Compare multiple loan offers side-by-side",
    icon: GitCompare,
    route: "/loan-comparison",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "rent-vs-buy",
    title: "Rent vs Buy Calculator",
    description: "Should you rent or buy a home?",
    icon: Building2,
    route: "/rent-vs-buy",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "home-affordability",
    title: "Home Affordability CalC",
    description: "How much house can you afford?",
    icon: Home,
    route: "/home-affordability",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "debt-to-income",
    title: "Debt-to-Income CalC",
    description: "Check your financial health",
    icon: Target,
    route: "/debt-to-income",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "emergency-fund",
    title: "Emergency Fund CalC",
    description: "Plan your financial safety net",
    icon: Umbrella,
    route: "/emergency-fund",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "financial-goal-tracker",
    title: "Financial Goal Tracker",
    description: "Set, track & achieve financial goals",
    icon: Flag,
    route: "/financial-goal-tracker",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "budget-planner",
    title: "Budget Planner",
    description: "Create & track monthly budgets",
    icon: ClipboardList,
    route: "/budget-planner",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "net-worth-calculator",
    title: "Net Worth Calculator",
    description: "Track assets vs liabilities",
    icon: BadgeDollarSign,
    route: "/net-worth-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "capital-budgeting",
    title: "Capital Budgeting",
    description: "NPV, IRR, MIRR & more techniques",
    icon: PieChart,
    route: "/capital-budgeting",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "personal-loan-calc",
    title: "Personal Loan CalC",
    description: "Credit score based EMI & eligibility",
    icon: UserCheck,
    route: "/personal-loan-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "insurance-premium-calc",
    title: "Insurance Premium Calculator",
    description: "Term life & health insurance premiums",
    icon: ShieldCheck,
    route: "/insurance-premium-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "mf-overlap-analyzer",
    title: "MF Overlap Analyzer",
    description: "Find duplicate holdings in MF portfolio",
    icon: Layers,
    route: "/mf-overlap-analyzer",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "cashflow-budgeting",
    title: "Cash Flow Budgeting Tool",
    description: "Comprehensive cash flow planning",
    icon: Workflow,
    route: "/cashflow-budgeting",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "factoring-tool",
    title: "Factoring Tool",
    description: "Evaluate factoring cost vs benefits",
    icon: Factory,
    route: "/factoring-tool",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "dividend-decision",
    title: "Dividend Decision Tool",
    description: "Gordon's, Lintner's & dividend theories",
    icon: Split,
    route: "/dividend-decision",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "stock-portfolio",
    title: "Stock Portfolio Tracker",
    description: "Monitor equity investments with P&L",
    icon: Portfolio,
    route: "/stock-portfolio",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "goal-sip-calc",
    title: "Goal-Based SIP CalC",
    description: "Plan SIP for financial goals",
    icon: Target,
    route: "/goal-sip-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "compound-interest",
    title: "Compound Interest CalC",
    description: "Step-up SIP & yearly growth breakdown",
    icon: Compound,
    route: "/compound-interest",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "inflation-calc",
    title: "Inflation Impact CalC",
    description: "Real vs nominal returns & purchasing power",
    icon: TrendingDown,
    route: "/inflation-calculator",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "80c-optimizer",
    title: "Tax Saver 80C Optimizer",
    description: "Maximize 80C deductions allocation",
    icon: CircleDollarSign,
    route: "/80c-optimizer",
    tag: "Live",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "more-calcs",
    title: "More Amazing Tools🥂 Coming Sooooon💖!",
    description: "Exciting tools on the way",
    icon: MoreHorizontal,
    route: null,
    tag: "",
    tagColor: ""
  }
];

const Index = () => {
  const navigate = useNavigate();
  const modulesRef = useRef<HTMLDivElement>(null);
  const amazingToolsRef = useRef<HTMLDivElement>(null);

  const scrollToModules = () => {
    const headerHeight = 80;
    if (modulesRef.current) {
      const elementPosition = modulesRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToAmazingTools = () => {
    const headerHeight = 80;
    if (amazingToolsRef.current) {
      const elementPosition = amazingToolsRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: 'smooth'
      });
    }
  };

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
              onClick={scrollToModules}
            >
              Explore Modules ↓
            </Button>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-[var(--shadow-gold)] px-8 py-6 text-lg"
              onClick={scrollToAmazingTools}
            >
              Explore Amazing Tools ↓
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
        <div ref={modulesRef} className="text-center mb-12">
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
        <div ref={amazingToolsRef} className="mt-16 max-w-6xl mx-auto">
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

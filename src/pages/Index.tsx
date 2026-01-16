import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, TrendingUp, Building, Receipt, Calculator } from "lucide-react";

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
            <Button 
              variant="default" 
              onClick={() => navigate("/auth")}
            >
              Sign-In/Sign-Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-6 py-2 rounded-full bg-primary/10 border border-primary/20">
            <p className="text-primary font-medium flex items-center gap-2">
              <span className="text-xl">✨</span> AI-Powered Tax Consultation
            </p>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            AnyBody Can Consult
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your intelligent co-pilot for legal and tax consultation.
            Analyze income, optimize deductions, and get expert AI guidance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
            >
              Learn More
            </Button>
          </div>
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
      </main>
    </div>
  );
};

export default Index;

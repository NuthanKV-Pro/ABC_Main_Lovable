import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, TrendingUp, Building, Receipt, Calculator } from "lucide-react";

const modules = [
  {
    id: "financial-statements",
    title: "Financial Statements",
    description: "Balance Sheet, P&L, Cash Flow",
    icon: FileText,
    route: null,
    comingSoon: true
  },
  {
    id: "mis-reports",
    title: "MIS Reports",
    description: "Management Information System",
    icon: BarChart3,
    route: null,
    comingSoon: true
  },
  {
    id: "financial-ratios",
    title: "Financial Ratios",
    description: "Key performance metrics",
    icon: TrendingUp,
    route: null,
    comingSoon: true,
    small: true
  },
  {
    id: "mca",
    title: "MCA",
    description: "Ministry of Corporate Affairs",
    icon: Building,
    route: null,
    comingSoon: true
  },
  {
    id: "gst",
    title: "GST",
    description: "Goods & Services Tax",
    icon: Receipt,
    route: null,
    comingSoon: true
  },
  {
    id: "income-tax",
    title: "Income Tax",
    description: "Tax planning & filing",
    icon: Calculator,
    route: "/dashboard",
    comingSoon: false
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
              onClick={() => navigate("/auth")}
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
            
            return (
              <Card 
                key={module.id}
                className={`hover:shadow-[var(--shadow-card)] transition-all cursor-pointer border-2 hover:border-primary/30 ${
                  module.comingSoon ? 'opacity-75' : ''
                } ${module.small ? 'md:col-span-1' : ''}`}
                onClick={() => {
                  if (!module.comingSoon && module.route) {
                    navigate(module.route);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    {module.comingSoon && (
                      <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        Coming Soon
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{module.title}</CardTitle>
                  <CardDescription className="text-base">{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    variant={module.comingSoon ? "outline" : "default"}
                    disabled={module.comingSoon}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!module.comingSoon && module.route) {
                        navigate(module.route);
                      }
                    }}
                  >
                    {module.comingSoon ? "Coming Soon" : "Open Module"}
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

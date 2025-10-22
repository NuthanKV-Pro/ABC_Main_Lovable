import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Home, Building2, Briefcase, TrendingUp, Wallet, LogOut } from "lucide-react";
import Chatbot from "@/components/Chatbot";

const incomeCategories = [
  {
    id: "salary",
    title: "Salary",
    description: "Income from employment",
    icon: Briefcase,
    route: "/salary"
  },
  {
    id: "hp",
    title: "House Property",
    description: "Rental income from property",
    icon: Home,
    route: "/hp"
  },
  {
    id: "pgbp",
    title: "Business & Profession",
    description: "Business and professional income",
    icon: Building2,
    route: "/pgbp"
  },
  {
    id: "cg",
    title: "Capital Gains",
    description: "Profit/Loss from asset sales",
    icon: TrendingUp,
    route: "/cg"
  },
  {
    id: "os",
    title: "Other Sources",
    description: "Interest, dividends, etc.",
    icon: Wallet,
    route: "/os"
  }
];

const previousYears = ["FY 2023-24", "FY 2022-23", "FY 2021-22", "FY 2020-21", "FY 2019-20"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState("FY 2023-24");
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

  const handleFileUpload = (categoryId: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [categoryId]: file }));
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
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">PAN: ABCDE1234F</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Year Selector Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-[73px] z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap mr-2">
              Assessment Year:
            </span>
            {previousYears.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(year)}
                className={selectedYear === year ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]" : ""}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Income Tax Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your income sources and upload supporting documents
          </p>
        </div>

        {/* Income Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {incomeCategories.map((category) => {
            const Icon = category.icon;
            const hasFile = uploadedFiles[category.id];
            
            return (
              <Card 
                key={category.id}
                className="hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer border-2 hover:border-primary/30"
                onClick={() => navigate(category.route)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {hasFile && (
                      <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        File uploaded
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(category.route);
                      }}
                    >
                      Enter Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.xlsx,.csv';
                        input.onchange = (event) => {
                          const file = (event.target as HTMLInputElement).files?.[0];
                          if (file) handleFileUpload(category.id, file);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 mb-6">
          <CardHeader>
            <CardTitle>Income Summary - {selectedYear}</CardTitle>
            <CardDescription>
              Complete all sections for accurate tax computation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {incomeCategories.map((category) => (
                <div key={category.id} className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{category.title}</p>
                  <p className="text-lg font-bold text-primary">₹0</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tax Planning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Tax Saving Suggestions</CardTitle>
              <CardDescription>
                Based on your current and previous returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete your income details to get personalized tax-saving recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Tax Regime Comparison</CardTitle>
              <CardDescription>
                Old vs New tax regime analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We'll calculate which regime saves you more tax based on your income
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Deductions & Exemptions</CardTitle>
              <CardDescription>
                Maximize your tax benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your eligible deductions under various sections
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;

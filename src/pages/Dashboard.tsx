import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Home, Building2, Briefcase, TrendingUp, Wallet, LogOut, Pencil, Check, X, Settings, CalendarDays } from "lucide-react";
import Chatbot from "@/components/Chatbot";
import TaxHub from "@/components/TaxHub";
import TaxSavingsRecommendations from "@/components/TaxSavingsRecommendations";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import IncomeTaxCalendar from "@/components/IncomeTaxCalendar";

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

const previousYears = ["2026-27", "2025-26", "2024-25", "2023-24", "2022-23", "2021-22", "2020-21", "2019-20"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserProfile();
  const [selectedYear, setSelectedYear] = useState("2026-27");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editPan, setEditPan] = useState(profile.pan);
  const [incomeValues, setIncomeValues] = useState({
    salary: 0,
    hp: 0,
    pgbp: 0,
    cg: 0,
    os: 0
  });

  const handleSaveProfile = () => {
    updateProfile({ name: editName, pan: editPan.toUpperCase() });
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditName(profile.name);
    setEditPan(profile.pan);
    setIsEditingProfile(false);
  };

  // Load income values from localStorage on mount and whenever the page becomes visible
  useState(() => {
    const loadIncomeValues = () => {
      setIncomeValues({
        salary: parseFloat(localStorage.getItem('salary_total') || '0'),
        hp: parseFloat(localStorage.getItem('hp_total') || '0'),
        pgbp: parseFloat(localStorage.getItem('pgbp_total') || '0'),
        cg: parseFloat(localStorage.getItem('cg_total') || '0'),
        os: parseFloat(localStorage.getItem('os_total') || '0'),
      });
    };

    loadIncomeValues();
    
    // Reload when window gains focus (user returns from income page)
    const handleFocus = () => loadIncomeValues();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  });
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
              {isEditingProfile ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm w-40"
                      placeholder="Name"
                    />
                    <Input
                      value={editPan}
                      onChange={(e) => setEditPan(e.target.value.toUpperCase())}
                      className="h-6 text-xs w-40"
                      placeholder="PAN"
                      maxLength={10}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveProfile}>
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">PAN: {profile.pan}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingProfile(true)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <TaxHub />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/profile")}
                title="Profile Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
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

        {/* Gross Total Income */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 mb-6">
          <CardHeader>
            <CardTitle>Gross Total Income</CardTitle>
            <CardDescription>Summary of all income heads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {incomeCategories.map((category) => (
                <div key={category.id} className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{category.title}</p>
                  <p className="text-lg font-bold text-primary">
                    ₹{incomeValues[category.id as keyof typeof incomeValues].toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="default" className="gap-2">
                Sync Tally
              </Button>
              <Button variant="default" className="gap-2">
                MIS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Tax Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer" onClick={() => navigate("/deductions")}>
            <CardHeader>
              <CardTitle className="text-lg">Deductions</CardTitle>
              <CardDescription>Chapter VI-A deductions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Details</Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer" onClick={() => navigate("/exempt-income")}>
            <CardHeader>
              <CardTitle className="text-lg">Exempt Income</CardTitle>
              <CardDescription>Income not subject to tax</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Details</Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer" onClick={() => navigate("/regime-comparison")}>
            <CardHeader>
              <CardTitle className="text-lg">Compare Regimes</CardTitle>
              <CardDescription>Old vs New tax regime</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Compare</Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer" onClick={() => navigate("/year-comparison")}>
            <CardHeader>
              <CardTitle className="text-lg">Year Comparison</CardTitle>
              <CardDescription>Compare with previous year</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Compare</Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer" onClick={() => navigate("/tax-payments")}>
            <CardHeader>
              <CardTitle className="text-lg">Advance Tax, TDS & TCS</CardTitle>
              <CardDescription>Tax payments & deductions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Details</Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer" onClick={() => navigate("/total-income-tax")}>
            <CardHeader>
              <CardTitle className="text-lg">Total Income & Tax</CardTitle>
              <CardDescription>Complete tax summary</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">View Summary</Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg text-primary">How to Save Tax</CardTitle>
              <CardDescription>Next year tax planning</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary hover:bg-primary/90 shadow-[var(--shadow-gold)]">Get Advice</Button>
            </CardContent>
          </Card>
        </div>

        {/* Tax Savings Recommendations */}
        <div className="mb-6">
          <TaxSavingsRecommendations incomeValues={incomeValues} />
        </div>

        {/* Income Tax Calendar */}
        <div className="mb-6">
          <IncomeTaxCalendar />
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;

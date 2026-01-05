import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Download, ExternalLink, RefreshCw } from "lucide-react";
import Chatbot from "@/components/Chatbot";
import TaxBreakdownCharts from "@/components/TaxBreakdownCharts";
import TaxDeadlineReminders from "@/components/TaxDeadlineReminders";
import IncomeHistory from "@/components/IncomeHistory";
import Form16Parser, { ParsedSalaryData } from "@/components/Form16Parser";
import { HRACalculator } from "@/components/HRACalculator";
import { StandardDeductionCalculator } from "@/components/StandardDeductionCalculator";
import { exportSalaryReport } from "@/utils/pdfExport";
import { useToast } from "@/hooks/use-toast";

interface IncomeRow {
  particulars: string;
  income: string;
  exemption: string;
  taxableIncome: string;
}

const Salary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [employerName, setEmployerName] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [employmentNature, setEmploymentNature] = useState("");
  const [employerTAN, setEmployerTAN] = useState("");
  const [employerPAN, setEmployerPAN] = useState("");

  const [incomeData, setIncomeData] = useState<IncomeRow[]>([
    { particulars: "Basic Salary", income: "", exemption: "", taxableIncome: "" },
    { particulars: "HRA", income: "", exemption: "", taxableIncome: "" },
    { particulars: "Commission", income: "", exemption: "", taxableIncome: "" },
    { particulars: "Dearness Allowance", income: "", exemption: "", taxableIncome: "" },
    { particulars: "Travel Allowance", income: "", exemption: "", taxableIncome: "" },
    { particulars: "ESOPs", income: "", exemption: "", taxableIncome: "" },
    { particulars: "Gift", income: "", exemption: "", taxableIncome: "" },
    { particulars: "Bonus", income: "", exemption: "", taxableIncome: "" },
    { particulars: "Free Food", income: "", exemption: "", taxableIncome: "" },
  ]);

  const calculateTaxable = (income: string, exemption: string) => {
    const incomeNum = parseFloat(income) || 0;
    const exemptionNum = parseFloat(exemption) || 0;
    return (incomeNum - exemptionNum).toFixed(2);
  };

  // Function to apply Form 16 data to fields
  const applyForm16Data = useCallback((data: ParsedSalaryData) => {
    // Update employer details
    setEmployerName(data.employerName || "");
    setOfficeAddress(data.officeAddress || "");
    setEmploymentNature(data.employmentNature || "");
    setEmployerTAN(data.employerTAN || "");
    setEmployerPAN(data.employerPAN || "");

    // Map Form 16 data to income rows
    const newIncomeData: IncomeRow[] = [
      { 
        particulars: "Basic Salary", 
        income: data.basicSalary?.toString() || "", 
        exemption: "", 
        taxableIncome: data.basicSalary?.toString() || "" 
      },
      { 
        particulars: "HRA", 
        income: data.hra?.toString() || "", 
        exemption: "", 
        taxableIncome: data.hra?.toString() || "" 
      },
      { 
        particulars: "Commission", 
        income: data.commission?.toString() || "", 
        exemption: "", 
        taxableIncome: data.commission?.toString() || "" 
      },
      { 
        particulars: "Dearness Allowance", 
        income: data.dearnessAllowance?.toString() || "", 
        exemption: "", 
        taxableIncome: data.dearnessAllowance?.toString() || "" 
      },
      { 
        particulars: "Travel Allowance", 
        income: data.travelAllowance?.toString() || "", 
        exemption: "", 
        taxableIncome: data.travelAllowance?.toString() || "" 
      },
      { 
        particulars: "ESOPs", 
        income: data.esops?.toString() || "", 
        exemption: "", 
        taxableIncome: data.esops?.toString() || "" 
      },
      { 
        particulars: "Gift", 
        income: data.gift?.toString() || "", 
        exemption: "", 
        taxableIncome: data.gift?.toString() || "" 
      },
      { 
        particulars: "Bonus", 
        income: data.bonus?.toString() || "", 
        exemption: "", 
        taxableIncome: data.bonus?.toString() || "" 
      },
      { 
        particulars: "Free Food", 
        income: data.freeFood?.toString() || "", 
        exemption: "", 
        taxableIncome: data.freeFood?.toString() || "" 
      },
    ];

    setIncomeData(newIncomeData);

    toast({
      title: "Salary Details Updated",
      description: "Form 16 data has been auto-populated in all fields.",
    });
  }, [toast]);

  // Load Form 16 data on mount if available
  useEffect(() => {
    const storedData = localStorage.getItem('form16_data');
    const autoApplied = localStorage.getItem('form16_auto_applied');
    
    if (storedData && autoApplied === 'true') {
      try {
        const data = JSON.parse(storedData) as ParsedSalaryData;
        applyForm16Data(data);
        // Clear the auto-apply flag after applying
        localStorage.removeItem('form16_auto_applied');
      } catch (e) {
        console.error('Failed to parse stored Form 16 data:', e);
      }
    }
  }, [applyForm16Data]);

  // Listen for Form 16 data updates
  useEffect(() => {
    const handleForm16Update = (event: CustomEvent<ParsedSalaryData>) => {
      applyForm16Data(event.detail);
    };

    window.addEventListener('form16DataUpdated', handleForm16Update as EventListener);
    return () => {
      window.removeEventListener('form16DataUpdated', handleForm16Update as EventListener);
    };
  }, [applyForm16Data]);

  const updateIncomeRow = (index: number, field: keyof IncomeRow, value: string) => {
    const newData = [...incomeData];
    newData[index][field] = value;
    
    if (field === "income" || field === "exemption") {
      newData[index].taxableIncome = calculateTaxable(
        newData[index].income,
        newData[index].exemption
      );
    }
    
    setIncomeData(newData);
  };

  const calculateTotals = () => {
    return incomeData.reduce((acc, row) => {
      return {
        income: acc.income + (parseFloat(row.income) || 0),
        exemption: acc.exemption + (parseFloat(row.exemption) || 0),
        taxableIncome: acc.taxableIncome + (parseFloat(row.taxableIncome) || 0),
      };
    }, { income: 0, exemption: 0, taxableIncome: 0 });
  };

  const handleSave = () => {
    const total = calculateTotals();
    localStorage.setItem('salary_total', total.taxableIncome.toString());
    toast({
      title: "Salary details saved",
      description: "Your income information has been saved successfully.",
    });
  };

  const handleExportPDF = () => {
    const totals = calculateTotals();
    exportSalaryReport(
      incomeData,
      { employerName, officeAddress, employmentNature },
      totals
    );
    toast({
      title: "PDF Downloaded",
      description: "Your salary report has been downloaded successfully.",
    });
  };

  const handleClearForm = () => {
    setEmployerName("");
    setOfficeAddress("");
    setEmploymentNature("");
    setEmployerTAN("");
    setEmployerPAN("");
    setIncomeData([
      { particulars: "Basic Salary", income: "", exemption: "", taxableIncome: "" },
      { particulars: "HRA", income: "", exemption: "", taxableIncome: "" },
      { particulars: "Commission", income: "", exemption: "", taxableIncome: "" },
      { particulars: "Dearness Allowance", income: "", exemption: "", taxableIncome: "" },
      { particulars: "Travel Allowance", income: "", exemption: "", taxableIncome: "" },
      { particulars: "ESOPs", income: "", exemption: "", taxableIncome: "" },
      { particulars: "Gift", income: "", exemption: "", taxableIncome: "" },
      { particulars: "Bonus", income: "", exemption: "", taxableIncome: "" },
      { particulars: "Free Food", income: "", exemption: "", taxableIncome: "" },
    ]);
    localStorage.removeItem('form16_data');
    toast({
      title: "Form Cleared",
      description: "All salary details have been reset.",
    });
  };

  const totals = calculateTotals();

  // Prepare chart data
  const chartIncomeData = incomeData.map(row => ({
    particulars: row.particulars,
    income: parseFloat(row.income) || 0,
    exemption: parseFloat(row.exemption) || 0,
    taxableIncome: parseFloat(row.taxableIncome) || 0
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">Salary Income</h1>
                <p className="text-sm text-muted-foreground">Income from employment</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <StandardDeductionCalculator grossSalary={totals.taxableIncome} />
              <HRACalculator 
                basicSalary={parseFloat(incomeData.find(r => r.particulars === "Basic Salary")?.income || "0")}
                hraReceived={parseFloat(incomeData.find(r => r.particulars === "HRA")?.income || "0")}
              />
              <Button 
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleClearForm}
              >
                <RefreshCw className="w-4 h-4" />
                Clear
              </Button>
              <Button 
                variant="outline"
                className="gap-2 border-2 border-primary/50 hover:bg-primary/10"
                onClick={() => window.open('https://abcsalop.lovable.app', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Get Optimal Salary Structure
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
                onClick={handleExportPDF}
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button 
                onClick={handleSave}
                className="gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-[var(--shadow-gold)]"
              >
              <Save className="w-4 h-4" />
                Auto Saved
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Form 16 Parser - Moved to top for prominence */}
        <div className="mb-6">
          <Form16Parser 
            onDataParsed={applyForm16Data}
            autoApply={true}
          />
        </div>

        {/* Basic Details */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>Information about your employer (auto-filled from Form 16)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employer">Name of the Employer</Label>
                <Input
                  id="employer"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="Enter employer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nature">Nature of Employment</Label>
                <Select value={employmentNature} onValueChange={setEmploymentNature}>
                  <SelectTrigger id="nature">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="pension">Pension</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tan">TAN of Employer</Label>
                <Input
                  id="tan"
                  value={employerTAN}
                  onChange={(e) => setEmployerTAN(e.target.value)}
                  placeholder="Enter TAN"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan">PAN of Employer</Label>
                <Input
                  id="pan"
                  value={employerPAN}
                  onChange={(e) => setEmployerPAN(e.target.value)}
                  placeholder="Enter PAN"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address of the Office</Label>
              <Input
                id="address"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="Enter complete office address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Income Details */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Income Details</CardTitle>
            <CardDescription>
              Salary components (auto-filled from Form 16 or enter manually)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left p-3 font-semibold bg-muted/50">Particulars</th>
                    <th className="text-right p-3 font-semibold bg-muted/50">Income (₹)</th>
                    <th className="text-right p-3 font-semibold bg-muted/50">Exemption (₹)</th>
                    <th className="text-right p-3 font-semibold bg-muted/50">Taxable Income (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{row.particulars}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={row.income}
                          onChange={(e) => updateIncomeRow(index, "income", e.target.value)}
                          placeholder="0.00"
                          className="text-right"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={row.exemption}
                          onChange={(e) => updateIncomeRow(index, "exemption", e.target.value)}
                          placeholder="0.00"
                          className="text-right"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={row.taxableIncome}
                          readOnly
                          className="text-right bg-muted/50 font-semibold"
                        />
                      </td>
                    </tr>
                  ))}
                  
                  {/* Totals Row */}
                  <tr className="border-t-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                    <td className="p-3 font-bold text-lg">Total</td>
                    <td className="p-3">
                      <div className="text-right font-bold text-lg text-primary">
                        ₹{totals.income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-right font-bold text-lg text-primary">
                        ₹{totals.exemption.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-right font-bold text-lg text-primary">
                        ₹{totals.taxableIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tax Breakdown Charts */}
        <TaxBreakdownCharts incomeData={chartIncomeData} />

        {/* Tax Deadline Reminders */}
        <div className="mt-6">
          <TaxDeadlineReminders />
        </div>

        {/* Income History */}
        <IncomeHistory />
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Salary;

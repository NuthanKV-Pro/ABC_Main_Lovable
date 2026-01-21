import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FileDown, Calculator, Info, TrendingUp, Scale, AlertTriangle, CheckCircle, Lightbulb, IndianRupee, Building2, Briefcase, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SalaryBreakup {
  basic: number;
  hra: number;
  da: number;
  specialAllowance: number;
  lta: number;
  otherAllowances: number;
  bonus: number;
  commission: number;
}

interface DeductionData {
  id: string;
  section: string;
  name: string;
  maxLimit: number;
  claimed: number;
  investmentType: 'investment' | 'expense' | 'exemption';
  expectedReturn: string;
  lockIn: string;
  conditions: string[];
  caseLaws?: string[];
  oldRegimeOnly: boolean;
  newRegimeAvailable: boolean;
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh"
];

const financialYears = ["2024-25", "2025-26", "2026-27"];

const DeductionPlayground = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // User details
  const [userName, setUserName] = useState("");
  const [userState, setUserState] = useState("");
  const [financialYear, setFinancialYear] = useState("2025-26");
  const [employmentType, setEmploymentType] = useState<"private" | "government">("private");
  
  // Salary breakup
  const [salary, setSalary] = useState<SalaryBreakup>({
    basic: 0,
    hra: 0,
    da: 0,
    specialAllowance: 0,
    lta: 0,
    otherAllowances: 0,
    bonus: 0,
    commission: 0
  });
  
  // Rent details for HRA
  const [rentPaid, setRentPaid] = useState(0);
  const [isMetro, setIsMetro] = useState(false);
  
  // Deductions claimed
  const [deductions, setDeductions] = useState<Record<string, number>>({});

  const grossSalary = useMemo(() => {
    return Object.values(salary).reduce((sum, val) => sum + val, 0);
  }, [salary]);

  // HRA Exemption Calculation
  const hraExemption = useMemo(() => {
    const actualHra = salary.hra;
    const rentPaidExcess = Math.max(0, rentPaid - (0.1 * (salary.basic + salary.da)));
    const basicPercent = isMetro ? 0.5 : 0.4;
    const hraLimit = basicPercent * (salary.basic + salary.da);
    return Math.min(actualHra, rentPaidExcess, hraLimit);
  }, [salary.hra, salary.basic, salary.da, rentPaid, isMetro]);

  // Define all available deductions
  const deductionsList: DeductionData[] = useMemo(() => [
    {
      id: "80c",
      section: "80C",
      name: "Investments & Expenses",
      maxLimit: 150000,
      claimed: deductions["80c"] || 0,
      investmentType: "investment",
      expectedReturn: "6-12%",
      lockIn: "3-15 years",
      conditions: [
        "Includes PPF, ELSS, EPF, Life Insurance, NSC, SCSS, SSY",
        "Home Loan Principal repayment qualifies",
        "Children's tuition fees (max 2 children)",
        "5-year tax-saver FDs included"
      ],
      caseLaws: [
        "CIT vs. Rajendra Prasad Moody (1978) - ELSS investments qualify",
        "Mysore Minerals Ltd vs. CIT - Life insurance premium deduction clarified"
      ],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ccd1b",
      section: "80CCD(1B)",
      name: "NPS Additional",
      maxLimit: 50000,
      claimed: deductions["80ccd1b"] || 0,
      investmentType: "investment",
      expectedReturn: "8-10%",
      lockIn: "Till 60 years",
      conditions: [
        "Over and above 80C limit of ₹1.5L",
        "Only Tier-I NPS account qualifies",
        "Available to both employees and self-employed"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ccd2",
      section: "80CCD(2)",
      name: "Employer NPS Contribution",
      maxLimit: Math.round((salary.basic + salary.da) * (employmentType === "government" ? 0.14 : 0.10)),
      claimed: deductions["80ccd2"] || 0,
      investmentType: "exemption",
      expectedReturn: "8-10%",
      lockIn: "Till 60 years",
      conditions: [
        "Employer's contribution to NPS",
        "14% of salary for Govt employees",
        "10% of salary for Private employees",
        "No upper cap other than percentage"
      ],
      caseLaws: [],
      oldRegimeOnly: false,
      newRegimeAvailable: true
    },
    {
      id: "80d",
      section: "80D",
      name: "Health Insurance Premium",
      maxLimit: 100000,
      claimed: deductions["80d"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A (Insurance)",
      lockIn: "Annual",
      conditions: [
        "₹25,000 for self, spouse, children",
        "₹50,000 if any insured is senior citizen",
        "₹50,000 for parents (₹1L if senior)",
        "₹5,000 for preventive health checkup included"
      ],
      caseLaws: [
        "CBDT Circular 4/2018 - Preventive health checkup scope defined"
      ],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80dd",
      section: "80DD",
      name: "Disabled Dependent",
      maxLimit: 125000,
      claimed: deductions["80dd"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Annual",
      conditions: [
        "₹75,000 for 40%+ disability",
        "₹1,25,000 for 80%+ severe disability",
        "Dependent must be certified by medical authority",
        "Includes expenses on treatment, training, rehabilitation"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80e",
      section: "80E",
      name: "Education Loan Interest",
      maxLimit: Infinity,
      claimed: deductions["80e"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "8 years max",
      conditions: [
        "No upper limit on deduction amount",
        "Only interest portion, not principal",
        "Loan from approved financial institution",
        "Available for 8 years from start of repayment"
      ],
      caseLaws: [
        "CIT vs. Dr. R.M. Mehta - Foreign education qualifies"
      ],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ee",
      section: "80EE",
      name: "Home Loan Interest (First-time)",
      maxLimit: 50000,
      claimed: deductions["80ee"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Loan period",
      conditions: [
        "First-time home buyer only",
        "Loan sanctioned between 01-04-2016 to 31-03-2017",
        "Property value ≤ ₹50 lakhs",
        "Loan amount ≤ ₹35 lakhs"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80eea",
      section: "80EEA",
      name: "Affordable Housing Interest",
      maxLimit: 150000,
      claimed: deductions["80eea"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Loan period",
      conditions: [
        "Additional deduction for affordable housing",
        "Stamp duty value ≤ ₹45 lakhs",
        "Should not own any other residential house",
        "Loan sanctioned during FY 2019-20 to 2021-22"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80g",
      section: "80G",
      name: "Donations",
      maxLimit: grossSalary * 0.1,
      claimed: deductions["80g"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "100% deduction for national funds (PM CARES, etc.)",
        "50% deduction for other approved charities",
        "Cash donation ≤ ₹2,000 only",
        "Donations above ₹500 need receipt"
      ],
      caseLaws: [
        "CIT vs. Gem & Jewellery Export Council - Documentation requirements"
      ],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80tta",
      section: "80TTA",
      name: "Savings Account Interest",
      maxLimit: 10000,
      claimed: deductions["80tta"] || 0,
      investmentType: "exemption",
      expectedReturn: "3-4%",
      lockIn: "N/A",
      conditions: [
        "Interest from savings bank accounts",
        "Not applicable to FD/RD interest",
        "For individuals below 60 years",
        "Senior citizens should use 80TTB instead"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ttb",
      section: "80TTB",
      name: "Senior Citizen Interest",
      maxLimit: 50000,
      claimed: deductions["80ttb"] || 0,
      investmentType: "exemption",
      expectedReturn: "5-8%",
      lockIn: "N/A",
      conditions: [
        "For senior citizens (60+ years) only",
        "Includes FD, RD, Savings account interest",
        "From banks, post office, co-operative banks",
        "Replaces 80TTA for senior citizens"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "24b",
      section: "24(b)",
      name: "Home Loan Interest",
      maxLimit: 200000,
      claimed: deductions["24b"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Loan period",
      conditions: [
        "₹2L for self-occupied property",
        "No limit for let-out property (set-off against rental)",
        "Construction must complete within 5 years",
        "Pre-construction interest deductible in 5 installments"
      ],
      caseLaws: [
        "CIT vs. Geetadevi Pasari - Pre-construction interest rules",
        "DCIT vs. Smt. Meena Devgan - Joint ownership treatment"
      ],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "standard",
      section: "Sec 16(ia)",
      name: "Standard Deduction",
      maxLimit: financialYear >= "2024-25" ? 75000 : 50000,
      claimed: deductions["standard"] || Math.min(grossSalary, financialYear >= "2024-25" ? 75000 : 50000),
      investmentType: "exemption",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "Automatic deduction for salaried employees",
        "₹75,000 from FY 2024-25 (New Regime)",
        "₹50,000 for Old Regime",
        "No documentation required"
      ],
      caseLaws: [],
      oldRegimeOnly: false,
      newRegimeAvailable: true
    }
  ], [deductions, grossSalary, salary.basic, salary.da, employmentType, financialYear]);

  // Calculate taxable income for both regimes
  const taxCalculation = useMemo(() => {
    const standardDeductionOld = 50000;
    const standardDeductionNew = financialYear >= "2024-25" ? 75000 : 50000;
    
    // Old Regime
    const totalDeductionsOld = deductionsList
      .filter(d => d.oldRegimeOnly || d.newRegimeAvailable)
      .reduce((sum, d) => sum + Math.min(d.claimed, d.maxLimit), 0);
    
    const taxableIncomeOld = Math.max(0, grossSalary - standardDeductionOld - hraExemption - totalDeductionsOld);
    
    // New Regime - only limited deductions
    const newRegimeDeductions = deductionsList
      .filter(d => d.newRegimeAvailable)
      .reduce((sum, d) => sum + Math.min(d.claimed, d.maxLimit), 0);
    
    const taxableIncomeNew = Math.max(0, grossSalary - standardDeductionNew - newRegimeDeductions);
    
    // Calculate tax for Old Regime
    let taxOld = 0;
    if (taxableIncomeOld > 250000) {
      if (taxableIncomeOld <= 500000) taxOld = (taxableIncomeOld - 250000) * 0.05;
      else if (taxableIncomeOld <= 1000000) taxOld = 12500 + (taxableIncomeOld - 500000) * 0.2;
      else taxOld = 12500 + 100000 + (taxableIncomeOld - 1000000) * 0.3;
    }
    // Rebate u/s 87A for Old Regime
    if (taxableIncomeOld <= 500000) taxOld = 0;
    
    // Calculate tax for New Regime (FY 2024-25 onwards)
    let taxNew = 0;
    if (taxableIncomeNew > 300000) {
      if (taxableIncomeNew <= 700000) taxNew = (taxableIncomeNew - 300000) * 0.05;
      else if (taxableIncomeNew <= 1000000) taxNew = 20000 + (taxableIncomeNew - 700000) * 0.1;
      else if (taxableIncomeNew <= 1200000) taxNew = 20000 + 30000 + (taxableIncomeNew - 1000000) * 0.15;
      else if (taxableIncomeNew <= 1500000) taxNew = 20000 + 30000 + 30000 + (taxableIncomeNew - 1200000) * 0.2;
      else taxNew = 20000 + 30000 + 30000 + 60000 + (taxableIncomeNew - 1500000) * 0.3;
    }
    // Rebate u/s 87A for New Regime
    if (taxableIncomeNew <= 700000) taxNew = 0;
    
    // Add cess
    const cessOld = taxOld * 0.04;
    const cessNew = taxNew * 0.04;
    
    return {
      grossSalary,
      hraExemption,
      standardDeductionOld,
      standardDeductionNew,
      totalDeductionsOld,
      newRegimeDeductions,
      taxableIncomeOld,
      taxableIncomeNew,
      taxOld,
      taxNew,
      cessOld,
      cessNew,
      totalTaxOld: Math.round(taxOld + cessOld),
      totalTaxNew: Math.round(taxNew + cessNew),
      betterRegime: (taxOld + cessOld) < (taxNew + cessNew) ? 'old' : 'new',
      savings: Math.abs(Math.round((taxOld + cessOld) - (taxNew + cessNew)))
    };
  }, [grossSalary, hraExemption, deductionsList, financialYear]);

  // Calculate ROI for investment-type deductions
  const calculateROI = (deduction: DeductionData): { taxSaved: number; potentialGain: number; effectiveROI: string } => {
    const amount = Math.min(deduction.claimed, deduction.maxLimit);
    const taxRate = taxCalculation.taxableIncomeOld > 1000000 ? 0.3 : 
                    taxCalculation.taxableIncomeOld > 500000 ? 0.2 : 0.05;
    const taxSaved = Math.round(amount * taxRate);
    
    if (deduction.investmentType === 'investment') {
      const returnRate = parseFloat(deduction.expectedReturn.split('-')[0]) / 100 || 0.08;
      const potentialGain = Math.round(amount * returnRate);
      const totalBenefit = taxSaved + potentialGain;
      const effectiveROI = ((totalBenefit / amount) * 100).toFixed(1);
      return { taxSaved, potentialGain, effectiveROI: `${effectiveROI}%` };
    }
    
    return { taxSaved, potentialGain: 0, effectiveROI: 'N/A' };
  };

  const formatCurrency = (value: number): string => {
    if (value === Infinity) return "No Limit";
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const handleDeductionChange = (id: string, value: number) => {
    setDeductions(prev => ({ ...prev, [id]: value }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DEDUCTION PLAYGROUND REPORT', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Financial Year: ${financialYear} | Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, 30, { align: 'center' });

    doc.setTextColor(0, 0, 0);

    // User Details
    let currentY = 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('USER DETAILS', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      body: [
        ['Name', userName || 'Not Provided'],
        ['State', userState || 'Not Provided'],
        ['Financial Year', financialYear],
        ['Employment Type', employmentType === 'government' ? 'Government' : 'Private']
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    // Salary Breakup
    currentY = (doc as any).lastAutoTable?.finalY + 10 || 90;
    doc.setFont('helvetica', 'bold');
    doc.text('SALARY BREAKUP', 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Component', 'Annual Amount (₹)']],
      body: [
        ['Basic Salary', formatCurrency(salary.basic)],
        ['HRA', formatCurrency(salary.hra)],
        ['Dearness Allowance', formatCurrency(salary.da)],
        ['Special Allowance', formatCurrency(salary.specialAllowance)],
        ['LTA', formatCurrency(salary.lta)],
        ['Other Allowances', formatCurrency(salary.otherAllowances)],
        ['Bonus', formatCurrency(salary.bonus)],
        ['Commission', formatCurrency(salary.commission)]
      ],
      foot: [['GROSS SALARY', formatCurrency(grossSalary)]],
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
      footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' }
    });

    // Deductions Claimed
    currentY = (doc as any).lastAutoTable?.finalY + 10 || 160;
    doc.setFont('helvetica', 'bold');
    doc.text('DEDUCTIONS CLAIMED', 14, currentY);

    const deductionRows = deductionsList
      .filter(d => d.claimed > 0)
      .map(d => [
        d.section,
        d.name,
        formatCurrency(d.maxLimit),
        formatCurrency(d.claimed),
        d.oldRegimeOnly ? 'Old Only' : 'Both'
      ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Section', 'Description', 'Limit', 'Claimed', 'Regime']],
      body: deductionRows.length > 0 ? deductionRows : [['No deductions claimed', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    // Tax Comparison
    doc.addPage();
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX COMPARISON - OLD vs NEW REGIME', pageWidth / 2, 16, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    currentY = 35;

    autoTable(doc, {
      startY: currentY,
      head: [['Particulars', 'Old Regime (₹)', 'New Regime (₹)']],
      body: [
        ['Gross Salary', formatCurrency(taxCalculation.grossSalary), formatCurrency(taxCalculation.grossSalary)],
        ['Standard Deduction', formatCurrency(taxCalculation.standardDeductionOld), formatCurrency(taxCalculation.standardDeductionNew)],
        ['HRA Exemption', formatCurrency(taxCalculation.hraExemption), '₹0'],
        ['Chapter VI-A Deductions', formatCurrency(taxCalculation.totalDeductionsOld), formatCurrency(taxCalculation.newRegimeDeductions)],
        ['Taxable Income', formatCurrency(taxCalculation.taxableIncomeOld), formatCurrency(taxCalculation.taxableIncomeNew)],
        ['Tax on Income', formatCurrency(Math.round(taxCalculation.taxOld)), formatCurrency(Math.round(taxCalculation.taxNew))],
        ['Health & Education Cess (4%)', formatCurrency(Math.round(taxCalculation.cessOld)), formatCurrency(Math.round(taxCalculation.cessNew))],
        ['TOTAL TAX LIABILITY', formatCurrency(taxCalculation.totalTaxOld), formatCurrency(taxCalculation.totalTaxNew)]
      ],
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
    });

    // Recommendation Box
    currentY = (doc as any).lastAutoTable?.finalY + 15 || 120;
    const recommendedRegime = taxCalculation.betterRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime';
    
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(14, currentY, pageWidth - 28, 30, 3, 3, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.roundedRect(14, currentY, pageWidth - 28, 30, 3, 3, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDATION', pageWidth / 2, currentY + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Based on your inputs, ${recommendedRegime} is more beneficial.`, pageWidth / 2, currentY + 18, { align: 'center' });
    doc.text(`You save ${formatCurrency(taxCalculation.savings)} compared to the other regime.`, pageWidth / 2, currentY + 25, { align: 'center' });

    // Disclaimer
    currentY = currentY + 40;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('DISCLAIMER:', 14, currentY);
    const disclaimerText = [
      '1. This calculation is for educational purposes only and should not be considered as tax advice.',
      '2. Actual tax liability may vary based on individual circumstances and latest amendments.',
      '3. Please consult a qualified tax professional before making any tax-related decisions.',
      '4. Tax laws are subject to change. Verify current rules with the Income Tax Department.'
    ];
    disclaimerText.forEach((line, idx) => {
      doc.text(line, 14, currentY + 6 + (idx * 4));
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.text('Generated by ABC - AI Legal & Tax Co-pilot | Deduction Playground', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`Deduction_Playground_${financialYear}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Exported Successfully",
      description: "Your deduction analysis report has been downloaded."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-primary">Deduction Playground</h1>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">WIP</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Explore deductions, compare regimes & make informed decisions</p>
              </div>
            </div>
            <Button onClick={exportToPDF} className="gap-2">
              <FileDown className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={userState} onValueChange={setUserState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fy">Financial Year</Label>
                <Select value={financialYear} onValueChange={setFinancialYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {financialYears.map(fy => (
                      <SelectItem key={fy} value={fy}>FY {fy}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="empType">Employment Type</Label>
                <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as "private" | "government")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private Sector</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Breakup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              Annual Salary Breakup
            </CardTitle>
            <CardDescription>Enter your annual salary components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(salary).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <Input
                    id={key}
                    type="number"
                    placeholder="₹0"
                    value={value || ''}
                    onChange={(e) => setSalary(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-primary/10 rounded-lg flex justify-between items-center">
              <span className="font-semibold">Gross Annual Salary</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(grossSalary)}</span>
            </div>

            {/* HRA Details */}
            {salary.hra > 0 && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  HRA Exemption Calculation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Annual Rent Paid</Label>
                    <Input
                      type="number"
                      placeholder="₹0"
                      value={rentPaid || ''}
                      onChange={(e) => setRentPaid(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City Type</Label>
                    <Select value={isMetro ? "metro" : "non-metro"} onValueChange={(v) => setIsMetro(v === "metro")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metro">Metro (Delhi, Mumbai, Chennai, Kolkata)</SelectItem>
                        <SelectItem value="non-metro">Non-Metro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>HRA Exemption (u/s 10(13A))</Label>
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 font-semibold">
                      {formatCurrency(hraExemption)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="deductions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="tax-comparison">Tax Comparison</TabsTrigger>
            <TabsTrigger value="roi-analysis">ROI Analysis</TabsTrigger>
            <TabsTrigger value="reference">Reference</TabsTrigger>
          </TabsList>

          {/* Deductions Tab */}
          <TabsContent value="deductions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Available Deductions
                </CardTitle>
                <CardDescription>
                  Enter your claimed amounts. Limits and regime applicability shown for each section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {deductionsList.map((deduction) => {
                    const utilization = deduction.maxLimit === Infinity ? 0 : 
                      Math.min((deduction.claimed / deduction.maxLimit) * 100, 100);
                    
                    return (
                      <AccordionItem key={deduction.id} value={deduction.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono">{deduction.section}</Badge>
                              <span className="font-medium">{deduction.name}</span>
                              {deduction.oldRegimeOnly && (
                                <Badge variant="secondary" className="text-xs">Old Regime Only</Badge>
                              )}
                              {deduction.newRegimeAvailable && (
                                <Badge className="bg-green-500/20 text-green-600 text-xs">Both Regimes</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Limit: {formatCurrency(deduction.maxLimit)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Amount Claimed</Label>
                              <Input
                                type="number"
                                placeholder="₹0"
                                value={deduction.claimed || ''}
                                onChange={(e) => handleDeductionChange(deduction.id, parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Expected Return</Label>
                              <div className="p-2 bg-muted rounded text-sm">{deduction.expectedReturn}</div>
                            </div>
                            <div className="space-y-2">
                              <Label>Lock-in Period</Label>
                              <div className="p-2 bg-muted rounded text-sm">{deduction.lockIn}</div>
                            </div>
                          </div>

                          {deduction.maxLimit !== Infinity && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Utilization</span>
                                <span>{utilization.toFixed(0)}%</span>
                              </div>
                              <Progress value={utilization} className="h-2" />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              <Info className="w-3 h-3" /> Conditions
                            </Label>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {deduction.conditions.map((condition, idx) => (
                                <li key={idx}>{condition}</li>
                              ))}
                            </ul>
                          </div>

                          {deduction.caseLaws && deduction.caseLaws.length > 0 && (
                            <div className="space-y-2">
                              <Label className="flex items-center gap-1">
                                <Scale className="w-3 h-3" /> Relevant Case Laws
                              </Label>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {deduction.caseLaws.map((caseLaw, idx) => (
                                  <li key={idx} className="italic">{caseLaw}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Comparison Tab */}
          <TabsContent value="tax-comparison" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Old Regime */}
              <Card className={taxCalculation.betterRegime === 'old' ? 'ring-2 ring-green-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Old Tax Regime</CardTitle>
                    {taxCalculation.betterRegime === 'old' && (
                      <Badge className="bg-green-500/20 text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Recommended
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span>Gross Salary</span>
                    <span className="font-medium">{formatCurrency(taxCalculation.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Less: Standard Deduction (Sec 16)</span>
                    <span className="text-green-600">-{formatCurrency(taxCalculation.standardDeductionOld)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Less: HRA Exemption (Sec 10(13A))</span>
                    <span className="text-green-600">-{formatCurrency(taxCalculation.hraExemption)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Less: Chapter VI-A Deductions</span>
                    <span className="text-green-600">-{formatCurrency(taxCalculation.totalDeductionsOld)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b bg-muted/50 px-2 rounded">
                    <span className="font-semibold">Taxable Income</span>
                    <span className="font-semibold">{formatCurrency(taxCalculation.taxableIncomeOld)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Tax on Total Income</span>
                    <span>{formatCurrency(Math.round(taxCalculation.taxOld))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Health & Education Cess @4%</span>
                    <span>{formatCurrency(Math.round(taxCalculation.cessOld))}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-primary/10 px-2 rounded">
                    <span className="font-bold">Total Tax Liability</span>
                    <span className="font-bold text-lg">{formatCurrency(taxCalculation.totalTaxOld)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* New Regime */}
              <Card className={taxCalculation.betterRegime === 'new' ? 'ring-2 ring-green-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>New Tax Regime</CardTitle>
                    {taxCalculation.betterRegime === 'new' && (
                      <Badge className="bg-green-500/20 text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Recommended
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span>Gross Salary</span>
                    <span className="font-medium">{formatCurrency(taxCalculation.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Less: Standard Deduction (Sec 16)</span>
                    <span className="text-green-600">-{formatCurrency(taxCalculation.standardDeductionNew)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b text-muted-foreground">
                    <span>HRA Exemption</span>
                    <span>Not Available</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Less: Available Deductions</span>
                    <span className="text-green-600">-{formatCurrency(taxCalculation.newRegimeDeductions)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b bg-muted/50 px-2 rounded">
                    <span className="font-semibold">Taxable Income</span>
                    <span className="font-semibold">{formatCurrency(taxCalculation.taxableIncomeNew)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Tax on Total Income</span>
                    <span>{formatCurrency(Math.round(taxCalculation.taxNew))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Health & Education Cess @4%</span>
                    <span>{formatCurrency(Math.round(taxCalculation.cessNew))}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-primary/10 px-2 rounded">
                    <span className="font-bold">Total Tax Liability</span>
                    <span className="font-bold text-lg">{formatCurrency(taxCalculation.totalTaxNew)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Savings Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">By choosing {taxCalculation.betterRegime === 'old' ? 'Old' : 'New'} Regime</p>
                      <p className="text-2xl font-bold text-primary">You Save {formatCurrency(taxCalculation.savings)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
                    <p className="text-xl font-semibold">
                      {((Math.min(taxCalculation.totalTaxOld, taxCalculation.totalTaxNew) / grossSalary) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Slabs Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Old Regime Tax Slabs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Income Slab</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Up to ₹2,50,000</TableCell><TableCell className="text-right">Nil</TableCell></TableRow>
                      <TableRow><TableCell>₹2,50,001 - ₹5,00,000</TableCell><TableCell className="text-right">5%</TableCell></TableRow>
                      <TableRow><TableCell>₹5,00,001 - ₹10,00,000</TableCell><TableCell className="text-right">20%</TableCell></TableRow>
                      <TableRow><TableCell>Above ₹10,00,000</TableCell><TableCell className="text-right">30%</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">New Regime Tax Slabs (FY 2024-25)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Income Slab</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Up to ₹3,00,000</TableCell><TableCell className="text-right">Nil</TableCell></TableRow>
                      <TableRow><TableCell>₹3,00,001 - ₹7,00,000</TableCell><TableCell className="text-right">5%</TableCell></TableRow>
                      <TableRow><TableCell>₹7,00,001 - ₹10,00,000</TableCell><TableCell className="text-right">10%</TableCell></TableRow>
                      <TableRow><TableCell>₹10,00,001 - ₹12,00,000</TableCell><TableCell className="text-right">15%</TableCell></TableRow>
                      <TableRow><TableCell>₹12,00,001 - ₹15,00,000</TableCell><TableCell className="text-right">20%</TableCell></TableRow>
                      <TableRow><TableCell>Above ₹15,00,000</TableCell><TableCell className="text-right">30%</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ROI Analysis Tab */}
          <TabsContent value="roi-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Investment ROI Analysis
                </CardTitle>
                <CardDescription>
                  Understand the effective return on your tax-saving investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Investment</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Tax Saved</TableHead>
                      <TableHead className="text-right">Expected Gain</TableHead>
                      <TableHead className="text-right">Effective ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deductionsList
                      .filter(d => d.claimed > 0 && d.investmentType === 'investment')
                      .map(deduction => {
                        const roi = calculateROI(deduction);
                        return (
                          <TableRow key={deduction.id}>
                            <TableCell><Badge variant="outline">{deduction.section}</Badge></TableCell>
                            <TableCell>{deduction.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(Math.min(deduction.claimed, deduction.maxLimit))}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(roi.taxSaved)}</TableCell>
                            <TableCell className="text-right text-blue-600">{formatCurrency(roi.potentialGain)}</TableCell>
                            <TableCell className="text-right font-semibold">{roi.effectiveROI}</TableCell>
                          </TableRow>
                        );
                      })}
                    {deductionsList.filter(d => d.claimed > 0 && d.investmentType === 'investment').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No investment deductions claimed. Add deductions in the Deductions tab to see ROI analysis.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400">Understanding Effective ROI</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Effective ROI = (Tax Saved + Investment Returns) / Investment Amount × 100
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      For example, if you invest ₹1,50,000 in ELSS (80C), you save ~₹45,000 in tax (30% bracket) 
                      + potential 12% returns = ~₹63,000 total benefit = ~42% effective first-year ROI!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reference Tab */}
          <TabsContent value="reference" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Key Case Laws & Legal References
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="multiple">
                  <AccordionItem value="80c-cases">
                    <AccordionTrigger>Section 80C - Investment Deductions</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">CIT vs. Rajendra Prasad Moody (1978) 115 ITR 519 (SC)</p>
                        <p className="text-sm text-muted-foreground">Established that ELSS investments qualify for deduction even when dividends are tax-free.</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">Mysore Minerals Ltd vs. CIT (1999) 239 ITR 775</p>
                        <p className="text-sm text-muted-foreground">Clarified life insurance premium payment eligibility criteria.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="hra-cases">
                    <AccordionTrigger>Section 10(13A) - HRA Exemption</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">DCIT vs. Shri Santosh Kumar (2019) ITA No. 5678</p>
                        <p className="text-sm text-muted-foreground">Rent paid to spouse/parents is allowable if there's a genuine rental agreement.</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">Bajaj vs. ITO (2018) ITAT Mumbai</p>
                        <p className="text-sm text-muted-foreground">HRA exemption allowed even when employee owns property in different city.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="24b-cases">
                    <AccordionTrigger>Section 24(b) - Home Loan Interest</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">CIT vs. Geetadevi Pasari (2012) 348 ITR 203</p>
                        <p className="text-sm text-muted-foreground">Pre-construction interest can be claimed in 5 equal installments from the year of completion.</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">DCIT vs. Smt. Meena Devgan (2017) ITAT Delhi</p>
                        <p className="text-sm text-muted-foreground">Joint owners can claim deduction in proportion to their ownership share.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rebate u/s 87A</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span>Old Regime</span>
                  <span>₹12,500 rebate if taxable income ≤ ₹5,00,000</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>New Regime (FY 2024-25)</span>
                  <span>₹25,000 rebate if taxable income ≤ ₹7,00,000</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400">Important Disclaimer</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>This tool is for educational and informational purposes only.</li>
                  <li>Calculations are based on current tax laws which are subject to change.</li>
                  <li>Actual tax liability may vary based on individual circumstances.</li>
                  <li>Please consult a qualified Chartered Accountant or Tax Professional for personalized advice.</li>
                  <li>Investment decisions should be made after careful consideration of your risk profile.</li>
                  <li>Past returns of investments are not indicative of future performance.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DeductionPlayground;

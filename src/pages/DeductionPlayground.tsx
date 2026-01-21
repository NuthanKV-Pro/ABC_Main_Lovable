import { useState, useMemo, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, FileDown, Calculator, Info, TrendingUp, Scale, AlertTriangle, CheckCircle, Lightbulb, IndianRupee, Building2, Briefcase, Calendar, User, Plus, Trash2, BarChart3, Upload, Wand2, RotateCcw, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Form16Parser, { ParsedSalaryData } from "@/components/Form16Parser";
import PerquisitesCalculator from "@/components/PerquisitesCalculator";
import SmartDeductionOptimizer from "@/components/SmartDeductionOptimizer";
import DeductionPlaygroundCalendar from "@/components/DeductionPlaygroundCalendar";

// ================== TYPE DEFINITIONS ==================

interface SalaryComponent {
  id: string;
  name: string;
  category: 'basic' | 'allowance' | 'perquisite' | 'custom';
  amount: number;
  exemptAmount: number;
  description?: string;
  isCustom?: boolean;
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
  isCustom?: boolean;
}

interface CustomDeduction {
  id: string;
  section: string;
  name: string;
  amount: number;
}

// ================== CONSTANTS ==================

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh"
];

const financialYears = ["2024-25", "2025-26", "2026-27"];

const metroStates = ["Delhi", "Maharashtra", "Tamil Nadu", "West Bengal", "Karnataka"];

// Default salary components by category
const defaultSalaryComponents: SalaryComponent[] = [
  // Basic Components
  { id: 'basic', name: 'Basic Salary', category: 'basic', amount: 0, exemptAmount: 0, description: 'Fixed component, forms base for PF/Gratuity calculation' },
  { id: 'fees_commission', name: 'Fees/Commission', category: 'basic', amount: 0, exemptAmount: 0, description: 'Commission received on sales or services' },
  { id: 'bonus', name: 'Bonus', category: 'basic', amount: 0, exemptAmount: 0, description: 'Performance/Festival bonus, fully taxable' },
  { id: 'ltc', name: 'Leave Travel Concession (LTC)', category: 'basic', amount: 0, exemptAmount: 0, description: 'Exempt for actual travel costs, 2 journeys in 4 years' },
  { id: 'gratuity', name: 'Gratuity', category: 'basic', amount: 0, exemptAmount: 0, description: 'Exempt up to ₹20L for govt, limits apply for private' },
  { id: 'uncommuted_pension', name: 'Uncommuted Pension', category: 'basic', amount: 0, exemptAmount: 0, description: 'Fully taxable monthly pension' },
  { id: 'commuted_pension', name: 'Commuted Pension', category: 'basic', amount: 0, exemptAmount: 0, description: 'Exempt for govt; 1/3 exempt if gratuity received, else 1/2' },
  { id: 'leave_encashment', name: 'Leave Encashment', category: 'basic', amount: 0, exemptAmount: 0, description: 'Exempt on retirement up to limits, taxable during service' },
  { id: 'vrs_compensation', name: 'Voluntary Retirement Compensation', category: 'basic', amount: 0, exemptAmount: 0, description: 'Exempt up to ₹5L u/s 10(10C)' },
  { id: 'retrenchment_compensation', name: 'Retrenchment Compensation', category: 'basic', amount: 0, exemptAmount: 0, description: 'Exempt up to ₹5L u/s 10(10B)' },
  
  // Allowances
  { id: 'da', name: 'Dearness Allowance (DA)', category: 'allowance', amount: 0, exemptAmount: 0, description: 'Fully taxable, forms part of basic for HRA/PF' },
  { id: 'hra', name: 'House Rent Allowance (HRA)', category: 'allowance', amount: 0, exemptAmount: 0, description: 'Exempt u/s 10(13A) based on rent paid & location' },
  { id: 'children_edu', name: "Children's Education Allowance", category: 'allowance', amount: 0, exemptAmount: 0, description: 'Exempt ₹100/month per child (max 2 children)' },
  { id: 'children_hostel', name: "Children's Hostel Allowance", category: 'allowance', amount: 0, exemptAmount: 0, description: 'Exempt ₹300/month per child (max 2 children)' },
  { id: 'transport', name: 'Transport Allowance', category: 'allowance', amount: 0, exemptAmount: 0, description: 'Exempt for disabled persons ₹3,200/month' },
  { id: 'entertainment', name: 'Entertainment Allowance', category: 'allowance', amount: 0, exemptAmount: 0, description: 'Deduction only for govt employees u/s 16(ii)' },
  { id: 'travel_conveyance', name: 'Travelling/Daily/Conveyance Allowance', category: 'allowance', amount: 0, exemptAmount: 0, description: 'Exempt to extent of actual expenditure' },
  { id: 'other_allowances', name: 'Other Allowances (Overtime, City Compensatory, etc.)', category: 'allowance', amount: 0, exemptAmount: 0, description: 'Generally fully taxable' },
  
  // Perquisites
  { id: 'rent_free_accom', name: 'Rent-Free Accommodation', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Valued at 15% (metro) or 10% (non-metro) of salary' },
  { id: 'rent_concessional', name: 'Accommodation at Concessional Rate', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Value of rent-free minus amount recovered' },
  { id: 'accom_govt', name: 'Accommodation by Govt', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'License fee determined by govt rules' },
  { id: 'accom_other_employer', name: 'Accommodation by Other Employer', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Based on formula (15%/10% of salary or actual rent)' },
  { id: 'accom_lease', name: 'Accommodation Taken on Lease by Employer', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Lower of actual rent paid or 15% of salary' },
  { id: 'obligation_discharged', name: 'Obligation of Employee Discharged by Employer', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Full amount taxable as perquisite' },
  { id: 'life_annuity', name: 'Life Insurance/Annuity by Employer', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Amount paid by employer for employee life insurance' },
  { id: 'pf_nps_contribution', name: 'Employer PF/NPS/Superannuation Contribution', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Taxable to extent exceeding ₹7,50,000 aggregate' },
  { id: 'pf_interest_accretion', name: 'Annual Accretion (Interest/Dividend) on PF/NPS', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Taxable on employer contribution already included' },
  { id: 'motor_car', name: 'Value of Use of Motor Car', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Varies based on cubic capacity and usage (refer table)' },
  { id: 'domestic_servant', name: 'Services (Sweeper/Gardener/Watchman/Attendant)', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Actual cost to employer minus amount paid by employee' },
  { id: 'gas_electricity', name: 'Gas/Electricity/Water for Household', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Amount paid by employer minus recovery from employee' },
  { id: 'education_facility', name: 'Free/Concessional Education for Family', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'No perquisite if value ≤₹1,000/month per child' },
  { id: 'interest_free_loan', name: 'Interest-Free/Concessional Loan (>₹20,000)', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Interest at SBI rate minus actual interest paid' },
  { id: 'free_food', name: 'Free Food & Non-Alcoholic Beverages', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Exempt: office hours food or vouchers ≤₹50/meal' },
  { id: 'gift_voucher', name: 'Gifts/Vouchers from Employer', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'No perquisite if aggregate value <₹5,000/year' },
  { id: 'moveable_use', name: 'Use of Moveable Assets', category: 'perquisite', amount: 0, exemptAmount: 0, description: '10% of cost/rent paid minus employee recovery' },
  { id: 'moveable_transfer', name: 'Transfer of Moveable Assets', category: 'perquisite', amount: 0, exemptAmount: 0, description: 'Cost minus wear & tear minus recovery from employee' },
];

// Sample data for demonstration
const sampleUserData = {
  userName: "Rahul Sharma",
  userState: "Maharashtra",
  stateOfEmployment: "Maharashtra",
  financialYear: "2025-26",
  employmentType: "private" as const,
  rentPaid: 240000,
  professionalTax: 2500,
};

const sampleSalaryData: Partial<Record<string, number>> = {
  basic: 600000,
  da: 60000,
  hra: 300000,
  bonus: 50000,
  travel_conveyance: 24000,
  other_allowances: 36000,
};

const sampleDeductions: Record<string, number> = {
  "80c": 150000,
  "80d": 25000,
  "80ccd1b": 50000,
  "24b": 100000,
};

// ================== MAIN COMPONENT ==================

const DeductionPlayground = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // User details
  const [userName, setUserName] = useState("");
  const [userState, setUserState] = useState("");
  const [stateOfEmployment, setStateOfEmployment] = useState("");
  const [financialYear, setFinancialYear] = useState("2025-26");
  const [employmentType, setEmploymentType] = useState<"private" | "government">("private");
  
  // Salary Components
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>(defaultSalaryComponents);
  const [customSalaryComponents, setCustomSalaryComponents] = useState<SalaryComponent[]>([]);
  const [newCustomComponent, setNewCustomComponent] = useState({ name: '', amount: 0, category: 'allowance' as const });
  
  // Professional Tax
  const [professionalTax, setProfessionalTax] = useState(0);
  
  // HRA Details
  const [rentPaid, setRentPaid] = useState(0);
  const [isMetro, setIsMetro] = useState(false);
  
  // Deductions claimed
  const [deductions, setDeductions] = useState<Record<string, number>>({});
  
  // Custom Deductions
  const [customDeductions, setCustomDeductions] = useState<CustomDeduction[]>([]);
  const [newCustomDeduction, setNewCustomDeduction] = useState({ section: '', name: '', amount: 0 });
  
  // Perquisites from calculator
  const [calculatedPerquisites, setCalculatedPerquisites] = useState(0);
  
  // Sample data state
  const [isSampleDataEnabled, setIsSampleDataEnabled] = useState(false);
  
  // Reset all data to default
  const handleReset = () => {
    setUserName("");
    setUserState("");
    setStateOfEmployment("");
    setFinancialYear("2025-26");
    setEmploymentType("private");
    setSalaryComponents(defaultSalaryComponents);
    setCustomSalaryComponents([]);
    setNewCustomComponent({ name: '', amount: 0, category: 'allowance' });
    setProfessionalTax(0);
    setRentPaid(0);
    setIsMetro(false);
    setDeductions({});
    setCustomDeductions([]);
    setNewCustomDeduction({ section: '', name: '', amount: 0 });
    setCalculatedPerquisites(0);
    setIsSampleDataEnabled(false);
    
    toast({
      title: "Data Cleared",
      description: "All fields have been reset to default values.",
    });
  };
  
  // Load sample data
  const loadSampleData = () => {
    setUserName(sampleUserData.userName);
    setUserState(sampleUserData.userState);
    setStateOfEmployment(sampleUserData.stateOfEmployment);
    setFinancialYear(sampleUserData.financialYear);
    setEmploymentType(sampleUserData.employmentType);
    setRentPaid(sampleUserData.rentPaid);
    setProfessionalTax(sampleUserData.professionalTax);
    setIsMetro(metroStates.includes(sampleUserData.stateOfEmployment));
    
    setSalaryComponents(prev => prev.map(comp => ({
      ...comp,
      amount: sampleSalaryData[comp.id] || 0
    })));
    
    setDeductions(sampleDeductions);
    setIsSampleDataEnabled(true);
    
    toast({
      title: "Sample Data Loaded",
      description: "Example data has been populated to demonstrate the tool.",
    });
  };
  
  // Clear sample data
  const clearSampleData = () => {
    handleReset();
  };
  
  // Toggle sample data
  const toggleSampleData = (enabled: boolean) => {
    if (enabled) {
      loadSampleData();
    } else {
      clearSampleData();
    }
  };
  
  // Form 16 Parser handler
  const handleForm16Parsed = (data: ParsedSalaryData) => {
    // Apply parsed data to salary components
    setSalaryComponents(prev => prev.map(comp => {
      switch (comp.id) {
        case 'basic': return { ...comp, amount: data.basicSalary || 0 };
        case 'hra': return { ...comp, amount: data.hra || 0 };
        case 'da': return { ...comp, amount: data.dearnessAllowance || 0 };
        case 'bonus': return { ...comp, amount: data.bonus || 0 };
        case 'fees_commission': return { ...comp, amount: data.commission || 0 };
        case 'travel_conveyance': return { ...comp, amount: data.travelAllowance || 0 };
        case 'free_food': return { ...comp, amount: data.freeFood || 0 };
        case 'other_allowances': return { ...comp, amount: data.otherAllowances || 0 };
        default: return comp;
      }
    }));
    
    // Apply deductions
    setDeductions(prev => ({
      ...prev,
      "80c": data.deductions80C || 0,
      "80d": data.deductions80D || 0
    }));
    
    toast({
      title: "Form 16 Data Applied!",
      description: "Salary breakup has been auto-populated from your document.",
    });
  };
  
  // Handle deduction optimization suggestions
  const handleApplyOptimizedDeduction = (deductionId: string, amount: number) => {
    setDeductions(prev => ({ ...prev, [deductionId]: amount }));
    toast({
      title: "Deduction Applied",
      description: `${deductionId.toUpperCase()} set to ₹${amount.toLocaleString()}`,
    });
  };

  // ================== CALCULATIONS ==================
  
  const allSalaryComponents = useMemo(() => 
    [...salaryComponents, ...customSalaryComponents],
    [salaryComponents, customSalaryComponents]
  );
  
  const basicSalary = useMemo(() => 
    salaryComponents.find(c => c.id === 'basic')?.amount || 0,
    [salaryComponents]
  );
  
  const da = useMemo(() => 
    salaryComponents.find(c => c.id === 'da')?.amount || 0,
    [salaryComponents]
  );
  
  const hraReceived = useMemo(() => 
    salaryComponents.find(c => c.id === 'hra')?.amount || 0,
    [salaryComponents]
  );
  
  const employerPFContribution = useMemo(() => {
    return Math.round((basicSalary + da) * 0.12);
  }, [basicSalary, da]);

  const grossSalary = useMemo(() => {
    return allSalaryComponents.reduce((sum, comp) => sum + comp.amount, 0);
  }, [allSalaryComponents]);

  // HRA Exemption Calculation
  const hraExemption = useMemo(() => {
    if (hraReceived === 0) return 0;
    const actualHra = hraReceived;
    const rentPaidExcess = Math.max(0, rentPaid - (0.1 * (basicSalary + da)));
    const basicPercent = isMetro ? 0.5 : 0.4;
    const hraLimit = basicPercent * (basicSalary + da);
    return Math.min(actualHra, rentPaidExcess, hraLimit);
  }, [hraReceived, basicSalary, da, rentPaid, isMetro]);

  // All deductions list
  const deductionsList: DeductionData[] = useMemo(() => [
    {
      id: "80c",
      section: "80C",
      name: "Investments & Expenses (PPF, ELSS, EPF, LIC, NSC, SSY, SCSS, etc.)",
      maxLimit: 150000,
      claimed: deductions["80c"] || 0,
      investmentType: "investment",
      expectedReturn: "6-12%",
      lockIn: "3-15 years",
      conditions: [
        "Includes PPF, ELSS, EPF, Life Insurance, NSC, SCSS, SSY",
        "Home Loan Principal repayment qualifies",
        "Children's tuition fees (max 2 children)",
        "5-year tax-saver FDs included",
        "Stamp duty & registration charges for house purchase"
      ],
      caseLaws: [
        "CIT vs. Rajendra Prasad Moody (1978) - ELSS investments qualify",
        "Mysore Minerals Ltd vs. CIT - Life insurance premium deduction clarified"
      ],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ccc",
      section: "80CCC",
      name: "Pension Fund Contribution",
      maxLimit: 150000, // Combined with 80C
      claimed: deductions["80ccc"] || 0,
      investmentType: "investment",
      expectedReturn: "5-8%",
      lockIn: "Till retirement",
      conditions: [
        "Contribution to annuity plan of LIC or other insurer",
        "Combined limit with 80C & 80CCD(1) is ₹1.5L",
        "Pension received will be taxable"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ccd1",
      section: "80CCD(1)",
      name: "Employee NPS Contribution",
      maxLimit: Math.round((basicSalary + da) * 0.1), // 10% of salary
      claimed: deductions["80ccd1"] || 0,
      investmentType: "investment",
      expectedReturn: "8-10%",
      lockIn: "Till 60 years",
      conditions: [
        "Employee's own contribution to NPS",
        "Max 10% of salary (Basic + DA)",
        "Falls within overall 80C limit of ₹1.5L"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ccd1b",
      section: "80CCD(1B)",
      name: "NPS Additional (Self Contribution)",
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
      maxLimit: Math.round((basicSalary + da) * (employmentType === "government" ? 0.14 : 0.10)),
      claimed: deductions["80ccd2"] || 0,
      investmentType: "exemption",
      expectedReturn: "8-10%",
      lockIn: "Till 60 years",
      conditions: [
        "Employer's contribution to NPS",
        "14% of salary for Govt employees",
        "10% of salary for Private employees",
        "No upper cap other than percentage - additional benefit over 80C"
      ],
      caseLaws: [],
      oldRegimeOnly: false,
      newRegimeAvailable: true
    },
    {
      id: "80cch",
      section: "80CCH",
      name: "Agnipath Scheme Contribution",
      maxLimit: Infinity,
      claimed: deductions["80cch"] || 0,
      investmentType: "exemption",
      expectedReturn: "N/A",
      lockIn: "4 years",
      conditions: [
        "Contribution to Agniveer Corpus Fund",
        "Available from FY 2022-23 onwards",
        "Entire contribution is deductible",
        "Amount received on completion is also exempt"
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
        "₹50,000 additional for parents (₹1L if senior)",
        "₹5,000 for preventive health checkup included in above limits"
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
      name: "Maintenance of Disabled Dependent",
      maxLimit: 125000,
      claimed: deductions["80dd"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Annual",
      conditions: [
        "₹75,000 for 40%+ disability",
        "₹1,25,000 for 80%+ severe disability",
        "Dependent must be certified by medical authority",
        "Includes expenses on treatment, training, rehabilitation",
        "Fixed deduction regardless of actual expense"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ddb",
      section: "80DDB",
      name: "Medical Treatment of Specified Diseases",
      maxLimit: 100000,
      claimed: deductions["80ddb"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Annual",
      conditions: [
        "₹40,000 for self/dependent treatment",
        "₹1,00,000 if patient is senior citizen",
        "Specified diseases: neurological, cancer, AIDS, chronic renal failure, etc.",
        "Prescription from specialist required",
        "Less: Amount received from insurance"
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
        "Available for 8 years from start of repayment",
        "For higher education of self, spouse, children"
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
      name: "Home Loan Interest (First-time Buyer)",
      maxLimit: 50000,
      claimed: deductions["80ee"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Loan period",
      conditions: [
        "First-time home buyer only",
        "Loan sanctioned between 01-04-2016 to 31-03-2017",
        "Property value ≤ ₹50 lakhs",
        "Loan amount ≤ ₹35 lakhs",
        "Over and above Sec 24(b) deduction"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80eea",
      section: "80EEA",
      name: "Affordable Housing Loan Interest",
      maxLimit: 150000,
      claimed: deductions["80eea"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Loan period",
      conditions: [
        "Additional deduction for affordable housing",
        "Stamp duty value ≤ ₹45 lakhs",
        "Should not own any other residential house",
        "Loan sanctioned during FY 2019-20 to 2021-22",
        "Over and above Sec 24(b) deduction"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80eeb",
      section: "80EEB",
      name: "Electric Vehicle Loan Interest",
      maxLimit: 150000,
      claimed: deductions["80eeb"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Loan period",
      conditions: [
        "Interest on loan for electric vehicle",
        "Loan sanctioned between 01-04-2019 to 31-03-2023",
        "Loan from financial institution or NBFC",
        "Deduction available till loan is repaid"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80g",
      section: "80G",
      name: "Donations to Approved Funds/Charities",
      maxLimit: Math.round(grossSalary * 0.1), // Varies
      claimed: deductions["80g"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "100% deduction for national funds (PM CARES, PMNRF, etc.)",
        "50% deduction for other approved charities",
        "Cash donation ≤ ₹2,000 only",
        "Donations above ₹500 need receipt with 80G registration"
      ],
      caseLaws: [
        "CIT vs. Gem & Jewellery Export Council - Documentation requirements"
      ],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80gg",
      section: "80GG",
      name: "Rent Paid (Without HRA)",
      maxLimit: 60000,
      claimed: deductions["80gg"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "Only if HRA is not received from employer",
        "Least of: ₹5,000/month, 25% of total income, Rent paid minus 10% of income",
        "Self/spouse/minor child should not own house in place of employment",
        "Form 10BA declaration required"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80gga",
      section: "80GGA",
      name: "Donation for Scientific Research/Rural Development",
      maxLimit: Infinity,
      claimed: deductions["80gga"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "100% deduction for donations to approved research associations",
        "Donation for rural development programs",
        "Not available if assessee has income from business/profession",
        "Receipt from approved institution required"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ggb",
      section: "80GGB",
      name: "Company Contribution to Political Parties",
      maxLimit: Infinity,
      claimed: deductions["80ggb"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "Contribution by Indian company to political party",
        "Electoral trust contributions included",
        "No cash donations allowed",
        "Receipt from political party required"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "80ggc",
      section: "80GGC",
      name: "Individual Contribution to Political Parties",
      maxLimit: Infinity,
      claimed: deductions["80ggc"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "Contribution by any person (except company/local authority)",
        "Electoral trust contributions included",
        "No cash donations allowed",
        "Receipt from political party required"
      ],
      caseLaws: [],
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
      name: "Senior Citizen Interest Income",
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
      id: "80u",
      section: "80U",
      name: "Disabled Individual (Self)",
      maxLimit: 125000,
      claimed: deductions["80u"] || 0,
      investmentType: "exemption",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "₹75,000 for 40%+ disability",
        "₹1,25,000 for 80%+ severe disability",
        "Self must be certified by medical authority",
        "Fixed deduction regardless of expenses",
        "Certificate from govt hospital required"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "24b",
      section: "24(b)",
      name: "Home Loan Interest (Self-Occupied Property)",
      maxLimit: 200000,
      claimed: deductions["24b"] || 0,
      investmentType: "expense",
      expectedReturn: "N/A",
      lockIn: "Loan period",
      conditions: [
        "₹2L for self-occupied property",
        "No limit for let-out property (set-off against rental income)",
        "Construction must complete within 5 years from loan date",
        "Pre-construction interest deductible in 5 equal installments"
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
      claimed: Math.min(grossSalary, financialYear >= "2024-25" ? 75000 : 50000),
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
    },
    {
      id: "lta_exemption",
      section: "Sec 10(5)",
      name: "Leave Travel Allowance (LTA) Exemption",
      maxLimit: Infinity,
      claimed: deductions["lta_exemption"] || 0,
      investmentType: "exemption",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "Actual travel expenses only (economy air/AC train fare)",
        "2 journeys in a block of 4 calendar years",
        "Family travel included (spouse, children, parents)",
        "Destination must be within India only"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    },
    {
      id: "food_exemption",
      section: "Rule 3(7)(iii)",
      name: "Free Food/Meal Vouchers Exemption",
      maxLimit: 26400, // ₹50 x 2 meals x 22 days x 12 months
      claimed: deductions["food_exemption"] || 0,
      investmentType: "exemption",
      expectedReturn: "N/A",
      lockIn: "N/A",
      conditions: [
        "Free food during working hours is exempt",
        "Meal vouchers up to ₹50 per meal are exempt",
        "Remote work: tea/snacks ≤₹50 per day exempt",
        "Approximate annual exemption: ₹26,400"
      ],
      caseLaws: [],
      oldRegimeOnly: true,
      newRegimeAvailable: false
    }
  ], [deductions, grossSalary, basicSalary, da, employmentType, financialYear]);

  // Calculate taxable income for both regimes
  const taxCalculation = useMemo(() => {
    const standardDeductionOld = 50000;
    const standardDeductionNew = financialYear >= "2024-25" ? 75000 : 50000;
    
    // Old Regime
    const totalDeductionsOld = deductionsList
      .filter(d => d.oldRegimeOnly || d.newRegimeAvailable)
      .reduce((sum, d) => sum + Math.min(d.claimed, d.maxLimit === Infinity ? d.claimed : d.maxLimit), 0)
      + customDeductions.reduce((sum, d) => sum + d.amount, 0);
    
    const taxableIncomeOld = Math.max(0, grossSalary - standardDeductionOld - hraExemption - professionalTax - totalDeductionsOld);
    
    // New Regime - only limited deductions
    const newRegimeDeductions = deductionsList
      .filter(d => d.newRegimeAvailable)
      .reduce((sum, d) => sum + Math.min(d.claimed, d.maxLimit === Infinity ? d.claimed : d.maxLimit), 0);
    
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
      professionalTax,
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
  }, [grossSalary, hraExemption, professionalTax, deductionsList, customDeductions, financialYear]);

  // Investment Scenarios for Chart
  const investmentScenarios = useMemo(() => {
    const scenarios = [
      { name: 'No Investments', investment80C: 0, investment80D: 0 },
      { name: '80C Only (₹1.5L)', investment80C: 150000, investment80D: 0 },
      { name: '80C + 80D Basic', investment80C: 150000, investment80D: 25000 },
      { name: '80C + 80D + NPS', investment80C: 150000, investment80D: 25000, investmentNPS: 50000 },
      { name: 'Full Optimization', investment80C: 150000, investment80D: 100000, investmentNPS: 50000, investmentHRA: hraExemption },
    ];

    return scenarios.map(scenario => {
      const totalDeductions = (scenario.investment80C || 0) + (scenario.investment80D || 0) + 
                             (scenario.investmentNPS || 0) + (scenario.investmentHRA || 0) + 50000; // +50k standard
      const taxableIncome = Math.max(0, grossSalary - totalDeductions - professionalTax);
      
      let tax = 0;
      if (taxableIncome > 250000) {
        if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
        else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.2;
        else tax = 12500 + 100000 + (taxableIncome - 1000000) * 0.3;
      }
      if (taxableIncome <= 500000) tax = 0;
      
      const cess = tax * 0.04;
      const totalTax = Math.round(tax + cess);
      
      return {
        scenario: scenario.name,
        taxLiability: totalTax,
        savings: Math.max(0, (grossSalary > 500000 ? Math.round((grossSalary - 250000) * 0.30 * 1.04) : 0) - totalTax)
      };
    });
  }, [grossSalary, hraExemption, professionalTax]);

  // Calculate ROI for investment-type deductions
  const calculateROI = (deduction: DeductionData): { taxSaved: number; potentialGain: number; effectiveROI: string } => {
    const amount = Math.min(deduction.claimed, deduction.maxLimit === Infinity ? deduction.claimed : deduction.maxLimit);
    const taxRate = taxCalculation.taxableIncomeOld > 1000000 ? 0.3 : 
                    taxCalculation.taxableIncomeOld > 500000 ? 0.2 : 0.05;
    const taxSaved = Math.round(amount * taxRate);
    
    if (deduction.investmentType === 'investment') {
      const returnRate = parseFloat(deduction.expectedReturn.split('-')[0]) / 100 || 0.08;
      const potentialGain = Math.round(amount * returnRate);
      const totalBenefit = taxSaved + potentialGain;
      const effectiveROI = amount > 0 ? ((totalBenefit / amount) * 100).toFixed(1) : '0';
      return { taxSaved, potentialGain, effectiveROI: `${effectiveROI}%` };
    }
    
    return { taxSaved, potentialGain: 0, effectiveROI: 'N/A' };
  };

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === 0) return "₹";
    if (value === Infinity) return "No Limit";
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatCurrencyWithZero = (value: number | undefined): string => {
    if (value === undefined) return "₹0";
    if (value === Infinity) return "No Limit";
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // ================== HANDLERS ==================

  const handleSalaryComponentChange = (id: string, value: number) => {
    setSalaryComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, amount: value } : comp
    ));
  };

  const handleDeductionChange = (id: string, value: number) => {
    setDeductions(prev => ({ ...prev, [id]: value }));
  };

  const addCustomSalaryComponent = () => {
    if (!newCustomComponent.name.trim()) return;
    
    const newComp: SalaryComponent = {
      id: `custom_${Date.now()}`,
      name: newCustomComponent.name,
      category: newCustomComponent.category,
      amount: newCustomComponent.amount,
      exemptAmount: 0,
      isCustom: true
    };
    
    setCustomSalaryComponents(prev => [...prev, newComp]);
    setNewCustomComponent({ name: '', amount: 0, category: 'allowance' });
    
    toast({
      title: "Component Added",
      description: `${newCustomComponent.name} has been added to your salary breakup.`
    });
  };

  const removeCustomSalaryComponent = (id: string) => {
    setCustomSalaryComponents(prev => prev.filter(c => c.id !== id));
  };

  const addCustomDeduction = () => {
    if (!newCustomDeduction.section.trim() || !newCustomDeduction.name.trim()) return;
    
    const newDed: CustomDeduction = {
      id: `custom_ded_${Date.now()}`,
      section: newCustomDeduction.section,
      name: newCustomDeduction.name,
      amount: newCustomDeduction.amount
    };
    
    setCustomDeductions(prev => [...prev, newDed]);
    setNewCustomDeduction({ section: '', name: '', amount: 0 });
    
    toast({
      title: "Deduction Added",
      description: `${newCustomDeduction.section} - ${newCustomDeduction.name} has been added.`
    });
  };

  const removeCustomDeduction = (id: string) => {
    setCustomDeductions(prev => prev.filter(d => d.id !== id));
  };

  // ================== PDF EXPORT ==================

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
        ['Name *', userName || 'Not Provided'],
        ['State of Employment *', stateOfEmployment || 'Not Provided'],
        ['State of Residence', userState || 'Not Provided'],
        ['Financial Year', financialYear],
        ['Employment Type *', employmentType === 'government' ? 'Government' : 'Private'],
        ['Professional Tax Paid', formatCurrencyWithZero(professionalTax)]
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    // Salary Breakup
    currentY = (doc as any).lastAutoTable?.finalY + 10 || 90;
    doc.setFont('helvetica', 'bold');
    doc.text('ANNUAL SALARY BREAKUP', 14, currentY);

    const salaryRows = allSalaryComponents
      .filter(c => c.amount > 0)
      .map(c => [c.name, c.category.charAt(0).toUpperCase() + c.category.slice(1), formatCurrencyWithZero(c.amount)]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Component', 'Category', 'Annual Amount']],
      body: salaryRows.length > 0 ? salaryRows : [['No salary components entered', '', '']],
      foot: [['GROSS SALARY', '', formatCurrencyWithZero(grossSalary)]],
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
      footStyles: { fillColor: [240, 240, 240], fontStyle: 'bold' }
    });

    // Employer PF Info
    currentY = (doc as any).lastAutoTable?.finalY + 5 || 150;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Note: Employer PF Contribution (12% of Basic + DA) = ${formatCurrencyWithZero(employerPFContribution)}`, 14, currentY);

    // HRA Details if applicable
    if (hraReceived > 0) {
      currentY = currentY + 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('HRA EXEMPTION CALCULATION u/s 10(13A)', 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 3,
        body: [
          ['Actual HRA Received', formatCurrencyWithZero(hraReceived)],
          ['Annual Rent Paid', formatCurrencyWithZero(rentPaid)],
          ['City Type', isMetro ? 'Metro City' : 'Non-Metro City'],
          ['HRA Exemption Calculated', formatCurrencyWithZero(hraExemption)]
        ],
        theme: 'plain',
        styles: { fontSize: 9 }
      });
    }

    // Deductions Claimed
    currentY = (doc as any).lastAutoTable?.finalY + 10 || 180;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DEDUCTIONS CLAIMED', 14, currentY);

    const deductionRows = deductionsList
      .filter(d => d.claimed > 0)
      .map(d => [
        d.section,
        d.name.substring(0, 40) + (d.name.length > 40 ? '...' : ''),
        formatCurrency(d.maxLimit),
        formatCurrencyWithZero(d.claimed),
        d.oldRegimeOnly ? 'Old Only' : 'Both'
      ]);

    // Add custom deductions
    customDeductions.forEach(d => {
      deductionRows.push([d.section, d.name, 'Custom', formatCurrencyWithZero(d.amount), 'Old Only']);
    });

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Section', 'Description', 'Limit', 'Claimed', 'Regime']],
      body: deductionRows.length > 0 ? deductionRows : [['No deductions claimed', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });

    // Tax Comparison - New Page
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
      head: [['Particulars', 'Old Regime', 'New Regime']],
      body: [
        ['Gross Salary', formatCurrencyWithZero(taxCalculation.grossSalary), formatCurrencyWithZero(taxCalculation.grossSalary)],
        ['Standard Deduction', formatCurrencyWithZero(taxCalculation.standardDeductionOld), formatCurrencyWithZero(taxCalculation.standardDeductionNew)],
        ['Professional Tax u/s 16(iii)', formatCurrencyWithZero(professionalTax), '₹0 (Not allowed)'],
        ['HRA Exemption u/s 10(13A)', formatCurrencyWithZero(taxCalculation.hraExemption), '₹0 (Not allowed)'],
        ['Chapter VI-A Deductions', formatCurrencyWithZero(taxCalculation.totalDeductionsOld), formatCurrencyWithZero(taxCalculation.newRegimeDeductions)],
        ['Taxable Income', formatCurrencyWithZero(taxCalculation.taxableIncomeOld), formatCurrencyWithZero(taxCalculation.taxableIncomeNew)],
        ['Tax on Income', formatCurrencyWithZero(Math.round(taxCalculation.taxOld)), formatCurrencyWithZero(Math.round(taxCalculation.taxNew))],
        ['Health & Education Cess (4%)', formatCurrencyWithZero(Math.round(taxCalculation.cessOld)), formatCurrencyWithZero(Math.round(taxCalculation.cessNew))],
        ['TOTAL TAX LIABILITY', formatCurrencyWithZero(taxCalculation.totalTaxOld), formatCurrencyWithZero(taxCalculation.totalTaxNew)]
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
    doc.roundedRect(14, currentY, pageWidth - 28, 35, 3, 3, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.roundedRect(14, currentY, pageWidth - 28, 35, 3, 3, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDATION', pageWidth / 2, currentY + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Based on your inputs, ${recommendedRegime} is more beneficial.`, pageWidth / 2, currentY + 20, { align: 'center' });
    doc.text(`You save ${formatCurrencyWithZero(taxCalculation.savings)} compared to the other regime.`, pageWidth / 2, currentY + 28, { align: 'center' });

    // Tax Savings Explanation
    currentY = currentY + 45;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('HOW YOUR TAX IS SAVED - DETAILED EXPLANATION', 14, currentY);
    
    currentY = currentY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const explanations = [
      `1. GROSS SALARY: Your total salary before any deductions is ${formatCurrencyWithZero(grossSalary)}.`,
      `2. STANDARD DEDUCTION: Under Old Regime, you get ₹50,000 automatically. Under New Regime (FY 2024-25+), you get ₹75,000.`,
      `3. HRA EXEMPTION: Based on rent paid (${formatCurrencyWithZero(rentPaid)}) and ${isMetro ? 'metro' : 'non-metro'} city, your HRA exemption is ${formatCurrencyWithZero(hraExemption)}.`,
      `4. PROFESSIONAL TAX: Deductible under Old Regime only: ${formatCurrencyWithZero(professionalTax)}.`,
      `5. CHAPTER VI-A: Your deductions under various sections (80C, 80D, etc.) total ${formatCurrencyWithZero(taxCalculation.totalDeductionsOld)}.`,
      `6. TAXABLE INCOME: After all deductions, Old Regime: ${formatCurrencyWithZero(taxCalculation.taxableIncomeOld)}, New Regime: ${formatCurrencyWithZero(taxCalculation.taxableIncomeNew)}.`,
      `7. TAX SLABS: Tax is calculated based on slab rates. Old has 4 slabs, New has 6 slabs with lower rates.`,
      `8. CESS: 4% Health & Education Cess is added on the tax amount.`,
      `9. FINAL COMPARISON: Old Regime Tax: ${formatCurrencyWithZero(taxCalculation.totalTaxOld)} vs New Regime Tax: ${formatCurrencyWithZero(taxCalculation.totalTaxNew)}.`
    ];
    
    explanations.forEach((line, idx) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, 14, currentY);
      currentY += 6;
    });

    // Disclaimer
    currentY = currentY + 10;
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTANT DISCLAIMER:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    const disclaimerText = [
      '1. This calculation is for educational purposes only and should not be considered as tax advice.',
      '2. Actual tax liability may vary based on individual circumstances and latest amendments.',
      '3. Please consult a qualified Chartered Accountant or Tax Professional before making any tax-related decisions.',
      '4. Tax laws are subject to change. Verify current rules with the Income Tax Department.',
      '5. Investment decisions should be made after careful consideration of your risk profile.'
    ];
    disclaimerText.forEach((line, idx) => {
      doc.text(line, 14, currentY + 5 + (idx * 4));
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.text('Generated by ABC - AI Legal & Tax Co-pilot | Deduction Playground', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`Deduction_Playground_${userName || 'Report'}_${financialYear}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Exported Successfully",
      description: "Your comprehensive deduction analysis report has been downloaded."
    });
  };

  // ================== RENDER ==================

  const basicComponents = salaryComponents.filter(c => c.category === 'basic');
  const allowanceComponents = salaryComponents.filter(c => c.category === 'allowance');
  const perquisiteComponents = salaryComponents.filter(c => c.category === 'perquisite');

  const chartConfig = {
    taxLiability: { label: "Tax Liability", color: "hsl(var(--destructive))" },
    savings: { label: "Tax Saved", color: "hsl(var(--primary))" }
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
            <div className="flex items-center gap-3">
              {/* Sample Data Toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50">
                <PlayCircle className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="sample-data" className="text-sm font-medium cursor-pointer">
                  Sample Data
                </Label>
                <Switch
                  id="sample-data"
                  checked={isSampleDataEnabled}
                  onCheckedChange={toggleSampleData}
                />
              </div>
              
              {/* Reset Button */}
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              
              {/* Export Button */}
              <Button onClick={exportToPDF} className="gap-2">
                <FileDown className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
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
            <CardDescription>Fields marked with * are mandatory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateOfEmployment">State of Employment *</Label>
                <Select value={stateOfEmployment} onValueChange={(v) => {
                  setStateOfEmployment(v);
                  setIsMetro(metroStates.includes(v));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {indianStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State of Residence</Label>
                <Select value={userState} onValueChange={setUserState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
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
                  <SelectContent className="bg-background border z-50">
                    {financialYears.map(fy => (
                      <SelectItem key={fy} value={fy}>FY {fy}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="empType">Employment Type *</Label>
                <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as "private" | "government")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="private">Private Sector</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pt">Professional Tax Paid (Annual)</Label>
                <Input
                  id="pt"
                  type="number"
                  placeholder="₹"
                  value={professionalTax || ''}
                  onChange={(e) => setProfessionalTax(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form 16 / Salary Slip Parser */}
        <Form16Parser 
          onDataParsed={handleForm16Parsed} 
          autoApply={false} 
        />

        {/* Salary Breakup - 3 Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              <span className="text-primary font-bold">Annual</span> Salary Breakup
            </CardTitle>
            <CardDescription>Enter your annual salary components across categories or upload Form 16 above for auto-fill</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Components */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                <Briefcase className="w-4 h-4" />
                Basic Components
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {basicComponents.map(comp => (
                  <div key={comp.id} className="space-y-1">
                    <Label htmlFor={comp.id} className="text-xs" title={comp.description}>
                      {comp.name}
                    </Label>
                    <Input
                      id={comp.id}
                      type="number"
                      placeholder="₹"
                      value={comp.amount || ''}
                      onChange={(e) => handleSalaryComponentChange(comp.id, parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Allowances */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                <Building2 className="w-4 h-4" />
                Allowances
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {allowanceComponents.map(comp => (
                  <div key={comp.id} className="space-y-1">
                    <Label htmlFor={comp.id} className="text-xs" title={comp.description}>
                      {comp.name}
                    </Label>
                    <Input
                      id={comp.id}
                      type="number"
                      placeholder="₹"
                      value={comp.amount || ''}
                      onChange={(e) => handleSalaryComponentChange(comp.id, parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Perquisites */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600">
                <TrendingUp className="w-4 h-4" />
                Perquisites (Taxable Value)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {perquisiteComponents.map(comp => (
                  <div key={comp.id} className="space-y-1">
                    <Label htmlFor={comp.id} className="text-xs" title={comp.description}>
                      {comp.name}
                    </Label>
                    <Input
                      id={comp.id}
                      type="number"
                      placeholder="₹"
                      value={comp.amount || ''}
                      onChange={(e) => handleSalaryComponentChange(comp.id, parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </div>
                ))}
              </div>
              
              {/* Perquisite Info Box */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Note:</strong> For furnished accommodation, add 10% p.a. of furniture cost. 
                  Employer PF/NPS/Superannuation contributions exceeding ₹7,50,000 aggregate are taxable.
                </p>
              </div>
            </div>

            {/* Custom Components */}
            {customSalaryComponents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-600">
                  <Plus className="w-4 h-4" />
                  Custom Components
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {customSalaryComponents.map(comp => (
                    <div key={comp.id} className="space-y-1 relative group">
                      <Label className="text-xs">{comp.name}</Label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          placeholder="₹"
                          value={comp.amount || ''}
                          onChange={(e) => setCustomSalaryComponents(prev => 
                            prev.map(c => c.id === comp.id ? { ...c, amount: parseFloat(e.target.value) || 0 } : c)
                          )}
                          className="h-9"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => removeCustomSalaryComponent(comp.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Component */}
            <div className="p-4 border border-dashed rounded-lg space-y-3">
              <h4 className="text-sm font-medium">Add Custom Salary Component</h4>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1 flex-1 min-w-[150px]">
                  <Label className="text-xs">Component Name</Label>
                  <Input
                    placeholder="e.g., Special Bonus"
                    value={newCustomComponent.name}
                    onChange={(e) => setNewCustomComponent(prev => ({ ...prev, name: e.target.value }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1 w-32">
                  <Label className="text-xs">Category</Label>
                  <Select 
                    value={newCustomComponent.category} 
                    onValueChange={(v) => setNewCustomComponent(prev => ({ ...prev, category: v as any }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="allowance">Allowance</SelectItem>
                      <SelectItem value="perquisite">Perquisite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 w-28">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    placeholder="₹"
                    value={newCustomComponent.amount || ''}
                    onChange={(e) => setNewCustomComponent(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="h-9"
                  />
                </div>
                <Button onClick={addCustomSalaryComponent} size="sm" className="h-9">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Gross Salary Summary */}
            <div className="mt-4 p-4 bg-primary/10 rounded-lg flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-col">
                <span className="font-semibold">Gross <span className="text-primary">Annual</span> Salary</span>
                <span className="text-xs text-muted-foreground">Sum of all salary components</span>
              </div>
              <span className="text-2xl font-bold text-primary">{formatCurrency(grossSalary)}</span>
            </div>

            {/* Employer PF Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Employer PF Contribution:</strong> 12% of (Basic + DA) = <strong>{formatCurrency(employerPFContribution)}</strong>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  This is mandatory as per EPF Act. Employer contributes 12% split as 3.67% to EPF and 8.33% to EPS (capped at ₹15,000 wage).
                </p>
              </div>
            </div>

            {/* HRA Details */}
            {hraReceived > 0 && (
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  HRA Exemption Calculation u/s 10(13A)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Annual Rent Paid</Label>
                    <Input
                      type="number"
                      placeholder="₹"
                      value={rentPaid || ''}
                      onChange={(e) => setRentPaid(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Metro City?</Label>
                    <div className="flex items-center gap-3 pt-2">
                      <Switch checked={isMetro} onCheckedChange={setIsMetro} />
                      <span className="text-sm">{isMetro ? 'Yes (50% of Basic+DA)' : 'No (40% of Basic+DA)'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Least of 3 conditions</Label>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>1. Actual HRA: {formatCurrency(hraReceived)}</div>
                      <div>2. Rent - 10% Salary: {formatCurrency(Math.max(0, rentPaid - (0.1 * (basicSalary + da))))}</div>
                      <div>3. {isMetro ? '50%' : '40%'} of Salary: {formatCurrency((isMetro ? 0.5 : 0.4) * (basicSalary + da))}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>HRA Exemption</Label>
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 font-semibold text-lg">
                      {formatCurrency(hraExemption)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="deductions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="perquisites" className="flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              Perquisites
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              Optimizer
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="tax-comparison">Tax Comparison</TabsTrigger>
            <TabsTrigger value="savings-chart">Savings Chart</TabsTrigger>
            <TabsTrigger value="roi-analysis">ROI Analysis</TabsTrigger>
            <TabsTrigger value="reference">Reference</TabsTrigger>
          </TabsList>

          {/* Deductions Tab */}
          <TabsContent value="deductions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Available Deductions (Chapter VI-A & Others)
                </CardTitle>
                <CardDescription>
                  Enter your claimed amounts. Limits and regime applicability shown for each section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {deductionsList.map((deduction) => {
                    const maxLimitValue = deduction.maxLimit === Infinity ? deduction.claimed : deduction.maxLimit;
                    const utilization = maxLimitValue === 0 ? 0 : 
                      Math.min((deduction.claimed / maxLimitValue) * 100, 100);
                    
                    return (
                      <AccordionItem key={deduction.id} value={deduction.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono text-xs">{deduction.section}</Badge>
                              <span className="font-medium text-sm text-left">{deduction.name}</span>
                              {deduction.oldRegimeOnly && (
                                <Badge variant="secondary" className="text-xs">Old Only</Badge>
                              )}
                              {deduction.newRegimeAvailable && (
                                <Badge className="bg-green-500/20 text-green-600 text-xs">Both</Badge>
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
                                placeholder="₹"
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

                {/* Custom Deductions */}
                {customDeductions.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-purple-600">Custom Deductions</h4>
                    {customDeductions.map(ded => (
                      <div key={ded.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <Badge variant="outline" className="font-mono">{ded.section}</Badge>
                        <span className="flex-1">{ded.name}</span>
                        <span className="font-semibold">{formatCurrency(ded.amount)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeCustomDeduction(ded.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Deduction */}
                <div className="mt-6 p-4 border border-dashed rounded-lg space-y-3">
                  <h4 className="text-sm font-medium">Add Custom Deduction</h4>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="space-y-1 w-28">
                      <Label className="text-xs">Section</Label>
                      <Input
                        placeholder="e.g., 80X"
                        value={newCustomDeduction.section}
                        onChange={(e) => setNewCustomDeduction(prev => ({ ...prev, section: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[150px]">
                      <Label className="text-xs">Deduction Name</Label>
                      <Input
                        placeholder="e.g., Custom Deduction"
                        value={newCustomDeduction.name}
                        onChange={(e) => setNewCustomDeduction(prev => ({ ...prev, name: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1 w-28">
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        placeholder="₹"
                        value={newCustomDeduction.amount || ''}
                        onChange={(e) => setNewCustomDeduction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        className="h-9"
                      />
                    </div>
                    <Button onClick={addCustomDeduction} size="sm" className="h-9">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Perquisites Calculator Tab */}
          <TabsContent value="perquisites" className="space-y-4">
            <PerquisitesCalculator
              basicSalary={basicSalary}
              da={da}
              isMetro={isMetro}
              isGovtEmployee={employmentType === "government"}
              onPerquisiteValueChange={setCalculatedPerquisites}
            />
            
            {calculatedPerquisites > 0 && (
              <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-purple-700 dark:text-purple-400">Total Calculated Perquisites</h4>
                      <p className="text-sm text-muted-foreground">This amount will be added to your gross salary for tax calculation</p>
                    </div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {formatCurrency(calculatedPerquisites)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Smart Optimizer Tab */}
          <TabsContent value="optimizer" className="space-y-4">
            <SmartDeductionOptimizer
              grossSalary={grossSalary}
              currentDeductions={deductions}
              taxableIncome={taxCalculation.taxableIncomeOld}
              hraExemption={hraExemption}
              isEligibleForHRA={hraReceived > 0}
              rentPaid={rentPaid}
              hasHomeLoan={(deductions["24b"] || 0) > 0}
              onApplySuggestion={handleApplyOptimizedDeduction}
            />
          </TabsContent>

          {/* Tax Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <DeductionPlaygroundCalendar financialYear={financialYear} />
          </TabsContent>

          {/* Tax Comparison Tab */}
          <TabsContent value="tax-comparison" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Old Regime */}
              <Card className="border-2 border-amber-300 dark:border-amber-700">
                <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Scale className="w-5 h-5" />
                    Old Tax Regime
                  </CardTitle>
                  <CardDescription>With all deductions & exemptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between py-2 border-b">
                    <span>Gross Salary</span>
                    <span className="font-medium">{formatCurrency(taxCalculation.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>(-) Standard Deduction u/s 16(ia)</span>
                    <span className="text-green-600">{formatCurrency(taxCalculation.standardDeductionOld)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>(-) Professional Tax u/s 16(iii)</span>
                    <span className="text-green-600">{formatCurrency(professionalTax)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>(-) HRA Exemption u/s 10(13A)</span>
                    <span className="text-green-600">{formatCurrency(taxCalculation.hraExemption)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>(-) Chapter VI-A Deductions</span>
                    <span className="text-green-600">{formatCurrency(taxCalculation.totalDeductionsOld)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b font-semibold">
                    <span>Taxable Income</span>
                    <span>{formatCurrency(taxCalculation.taxableIncomeOld)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Tax on Income</span>
                    <span>{formatCurrency(Math.round(taxCalculation.taxOld))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>(+) Health & Education Cess (4%)</span>
                    <span>{formatCurrency(Math.round(taxCalculation.cessOld))}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg px-3 -mx-3">
                    <span className="font-bold text-lg">Total Tax Liability</span>
                    <span className="font-bold text-lg text-amber-700 dark:text-amber-400">
                      {formatCurrency(taxCalculation.totalTaxOld)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* New Regime */}
              <Card className="border-2 border-blue-300 dark:border-blue-700">
                <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <TrendingUp className="w-5 h-5" />
                    New Tax Regime (FY 2024-25)
                  </CardTitle>
                  <CardDescription>Lower rates, limited deductions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between py-2 border-b">
                    <span>Gross Salary</span>
                    <span className="font-medium">{formatCurrency(taxCalculation.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>(-) Standard Deduction u/s 16(ia)</span>
                    <span className="text-green-600">{formatCurrency(taxCalculation.standardDeductionNew)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b text-muted-foreground">
                    <span>(-) Professional Tax</span>
                    <span>Not Allowed</span>
                  </div>
                  <div className="flex justify-between py-2 border-b text-muted-foreground">
                    <span>(-) HRA Exemption</span>
                    <span>Not Allowed</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>(-) Limited Deductions (80CCD(2), 80CCH)</span>
                    <span className="text-green-600">{formatCurrency(taxCalculation.newRegimeDeductions)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b font-semibold">
                    <span>Taxable Income</span>
                    <span>{formatCurrency(taxCalculation.taxableIncomeNew)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Tax on Income</span>
                    <span>{formatCurrency(Math.round(taxCalculation.taxNew))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>(+) Health & Education Cess (4%)</span>
                    <span>{formatCurrency(Math.round(taxCalculation.cessNew))}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg px-3 -mx-3">
                    <span className="font-bold text-lg">Total Tax Liability</span>
                    <span className="font-bold text-lg text-blue-700 dark:text-blue-400">
                      {formatCurrency(taxCalculation.totalTaxNew)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendation */}
            <Card className={`border-2 ${taxCalculation.betterRegime === 'old' 
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' 
              : 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <CheckCircle className={`w-12 h-12 ${taxCalculation.betterRegime === 'old' ? 'text-amber-600' : 'text-blue-600'}`} />
                  <div>
                    <h3 className="text-xl font-bold">
                      {taxCalculation.betterRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'} is Better for You!
                    </h3>
                    <p className="text-lg mt-2">
                      You save <span className="font-bold text-green-600">{formatCurrency(taxCalculation.savings)}</span> compared to the other regime.
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

          {/* Savings Chart Tab */}
          <TabsContent value="savings-chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Tax Savings Comparison by Investment Scenario
                </CardTitle>
                <CardDescription>
                  Compare tax liability across different investment levels under Old Regime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <BarChart data={investmentScenarios} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="scenario" 
                      angle={-20} 
                      textAnchor="end" 
                      height={80} 
                      tick={{ fontSize: 11 }}
                      className="fill-foreground"
                    />
                    <YAxis 
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                      className="fill-foreground"
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => formatCurrencyWithZero(value)}
                    />
                    <Legend />
                    <Bar dataKey="taxLiability" name="Tax Liability" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="savings" name="Tax Saved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800 dark:text-green-400">Key Insight</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      The chart shows how your tax liability decreases as you maximize deductions. 
                      With full optimization (80C ₹1.5L + 80D ₹1L + NPS ₹50K + HRA), you can significantly 
                      reduce your tax burden under the Old Regime.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                            <TableCell>{deduction.name.substring(0, 30)}...</TableCell>
                            <TableCell className="text-right">{formatCurrency(Math.min(deduction.claimed, deduction.maxLimit === Infinity ? deduction.claimed : deduction.maxLimit))}</TableCell>
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

                  <AccordionItem value="80gg-cases">
                    <AccordionTrigger>Section 80GG - Rent Without HRA</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">ITAT Mumbai - Rent Deduction for Self-Employed</p>
                        <p className="text-sm text-muted-foreground">Self-employed individuals and those not receiving HRA can claim 80GG subject to conditions.</p>
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

        {/* Detailed Tax Savings Explanation */}
        <Card className="border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Lightbulb className="w-5 h-5" />
              How Your Tax is Saved - Detailed Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Step 1: Calculate Gross Salary</h4>
                <p className="text-sm text-muted-foreground">
                  Your gross salary of <strong>{formatCurrency(grossSalary)}</strong> includes all components: 
                  Basic, DA, HRA, Allowances, Bonus, and Perquisites.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Step 2: Apply Exemptions</h4>
                <p className="text-sm text-muted-foreground">
                  HRA Exemption of <strong>{formatCurrency(hraExemption)}</strong> (if applicable) reduces 
                  your taxable salary based on rent paid and city type.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Step 3: Standard Deduction</h4>
                <p className="text-sm text-muted-foreground">
                  Flat deduction of <strong>₹50,000</strong> (Old) or <strong>₹75,000</strong> (New) is 
                  automatically applied u/s 16(ia).
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Step 4: Professional Tax</h4>
                <p className="text-sm text-muted-foreground">
                  Professional Tax of <strong>{formatCurrency(professionalTax)}</strong> paid to state 
                  government is deductible u/s 16(iii) - Old Regime only.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Step 5: Chapter VI-A Deductions</h4>
                <p className="text-sm text-muted-foreground">
                  Investments in 80C ({formatCurrency(deductions["80c"] || 0)}), 80D ({formatCurrency(deductions["80d"] || 0)}), 
                  NPS, home loan, etc. reduce taxable income - mostly Old Regime only.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Step 6: Apply Tax Slabs</h4>
                <p className="text-sm text-muted-foreground">
                  Tax is calculated on remaining income using slab rates. Old Regime has 4 slabs (5%, 20%, 30%), 
                  New Regime has 6 slabs (5%, 10%, 15%, 20%, 30%).
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg mt-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Your Tax Savings Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(hraExemption)}</div>
                  <div className="text-xs text-muted-foreground">HRA Exemption</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(taxCalculation.standardDeductionOld)}</div>
                  <div className="text-xs text-muted-foreground">Standard Deduction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(taxCalculation.totalDeductionsOld)}</div>
                  <div className="text-xs text-muted-foreground">Ch. VI-A Deductions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(taxCalculation.savings)}</div>
                  <div className="text-xs text-muted-foreground">Net Tax Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400">Important Disclaimer</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>This tool is for educational and informational purposes only.</li>
                  <li>Calculations are based on current tax laws (FY 2024-25) which are subject to change.</li>
                  <li>Actual tax liability may vary based on individual circumstances, surcharge, and amendments.</li>
                  <li>Please consult a qualified Chartered Accountant or Tax Professional for personalized advice.</li>
                  <li>Investment decisions should be made after careful consideration of your risk profile.</li>
                  <li>Past returns of investments are not indicative of future performance.</li>
                  <li>Perquisite valuations are indicative - refer to Income Tax Rules for exact calculations.</li>
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

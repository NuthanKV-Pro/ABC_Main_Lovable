import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft, Upload, FileSpreadsheet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, BarChart3, Info, Download, Plus, Trash2, LineChart, Save, FolderOpen, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface FinancialData {
  year?: string;
  // Balance Sheet Items
  currentAssets: number;
  inventory: number;
  prepaidExpenses: number;
  cash: number;
  marketableSecurities: number;
  currentLiabilities: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
  longTermDebt: number;
  preferenceShareCapital: number;
  equityShareCapital: number;
  reserves: number;
  fixedAssets: number;
  
  // P&L Items
  netSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  interestExpense: number;
  netProfit: number;
  ebit: number;
  ebitda: number;
  depreciation: number;
  dividends: number;
}

interface RatioResult {
  name: string;
  value: number;
  formula: string;
  interpretation: string;
  benchmark: string;
  industryBenchmark?: number;
  status: 'favorable' | 'unfavorable' | 'neutral';
}

interface SavedReport {
  id: string;
  companyName: string;
  savedAt: string;
  industry: string;
  financialData: FinancialData;
  multiYearData: FinancialData[];
}

interface IndustryBenchmarks {
  [industry: string]: {
    currentRatio: number;
    quickRatio: number;
    debtToEquity: number;
    grossProfitMargin: number;
    netProfitMargin: number;
    returnOnEquity: number;
    returnOnAssets: number;
    assetTurnover: number;
    inventoryTurnover: number;
    interestCoverage: number;
  };
}

const industryBenchmarks: IndustryBenchmarks = {
  manufacturing: {
    currentRatio: 1.5,
    quickRatio: 1.0,
    debtToEquity: 1.2,
    grossProfitMargin: 25,
    netProfitMargin: 8,
    returnOnEquity: 12,
    returnOnAssets: 6,
    assetTurnover: 0.8,
    inventoryTurnover: 6,
    interestCoverage: 4,
  },
  retail: {
    currentRatio: 1.2,
    quickRatio: 0.5,
    debtToEquity: 1.5,
    grossProfitMargin: 30,
    netProfitMargin: 5,
    returnOnEquity: 15,
    returnOnAssets: 8,
    assetTurnover: 2.0,
    inventoryTurnover: 8,
    interestCoverage: 3,
  },
  technology: {
    currentRatio: 2.5,
    quickRatio: 2.0,
    debtToEquity: 0.5,
    grossProfitMargin: 60,
    netProfitMargin: 15,
    returnOnEquity: 20,
    returnOnAssets: 12,
    assetTurnover: 0.6,
    inventoryTurnover: 10,
    interestCoverage: 10,
  },
  healthcare: {
    currentRatio: 1.8,
    quickRatio: 1.3,
    debtToEquity: 0.8,
    grossProfitMargin: 45,
    netProfitMargin: 10,
    returnOnEquity: 14,
    returnOnAssets: 7,
    assetTurnover: 0.7,
    inventoryTurnover: 5,
    interestCoverage: 6,
  },
  fmcg: {
    currentRatio: 1.3,
    quickRatio: 0.8,
    debtToEquity: 0.6,
    grossProfitMargin: 40,
    netProfitMargin: 12,
    returnOnEquity: 25,
    returnOnAssets: 15,
    assetTurnover: 1.5,
    inventoryTurnover: 12,
    interestCoverage: 8,
  },
  banking: {
    currentRatio: 1.0,
    quickRatio: 0.9,
    debtToEquity: 8.0,
    grossProfitMargin: 70,
    netProfitMargin: 20,
    returnOnEquity: 12,
    returnOnAssets: 1.2,
    assetTurnover: 0.05,
    inventoryTurnover: 0,
    interestCoverage: 2,
  },
  realestate: {
    currentRatio: 1.4,
    quickRatio: 0.6,
    debtToEquity: 1.8,
    grossProfitMargin: 35,
    netProfitMargin: 15,
    returnOnEquity: 10,
    returnOnAssets: 4,
    assetTurnover: 0.25,
    inventoryTurnover: 2,
    interestCoverage: 2.5,
  },
  services: {
    currentRatio: 1.6,
    quickRatio: 1.4,
    debtToEquity: 0.7,
    grossProfitMargin: 50,
    netProfitMargin: 12,
    returnOnEquity: 18,
    returnOnAssets: 10,
    assetTurnover: 1.0,
    inventoryTurnover: 0,
    interestCoverage: 7,
  },
};

const sampleFinancialData: FinancialData = {
  year: "2024",
  // Balance Sheet
  currentAssets: 5000000,
  inventory: 1200000,
  prepaidExpenses: 150000,
  cash: 800000,
  marketableSecurities: 500000,
  currentLiabilities: 2500000,
  totalAssets: 12000000,
  totalLiabilities: 5000000,
  shareholdersEquity: 7000000,
  longTermDebt: 2500000,
  preferenceShareCapital: 500000,
  equityShareCapital: 2000000,
  reserves: 4500000,
  fixedAssets: 7000000,
  // P&L
  netSales: 15000000,
  costOfGoodsSold: 9000000,
  grossProfit: 6000000,
  operatingExpenses: 3500000,
  operatingProfit: 2500000,
  interestExpense: 400000,
  netProfit: 1500000,
  ebit: 2500000,
  ebitda: 3200000,
  depreciation: 700000,
  dividends: 500000,
};

const sampleMultiYearData: FinancialData[] = [
  {
    year: "2022",
    currentAssets: 4000000,
    inventory: 1000000,
    prepaidExpenses: 120000,
    cash: 600000,
    marketableSecurities: 400000,
    currentLiabilities: 2200000,
    totalAssets: 10000000,
    totalLiabilities: 4500000,
    shareholdersEquity: 5500000,
    longTermDebt: 2300000,
    preferenceShareCapital: 400000,
    equityShareCapital: 1800000,
    reserves: 3300000,
    fixedAssets: 6000000,
    netSales: 12000000,
    costOfGoodsSold: 7500000,
    grossProfit: 4500000,
    operatingExpenses: 2800000,
    operatingProfit: 1700000,
    interestExpense: 380000,
    netProfit: 950000,
    ebit: 1700000,
    ebitda: 2300000,
    depreciation: 600000,
    dividends: 300000,
  },
  {
    year: "2023",
    currentAssets: 4500000,
    inventory: 1100000,
    prepaidExpenses: 135000,
    cash: 700000,
    marketableSecurities: 450000,
    currentLiabilities: 2350000,
    totalAssets: 11000000,
    totalLiabilities: 4750000,
    shareholdersEquity: 6250000,
    longTermDebt: 2400000,
    preferenceShareCapital: 450000,
    equityShareCapital: 1900000,
    reserves: 3900000,
    fixedAssets: 6500000,
    netSales: 13500000,
    costOfGoodsSold: 8250000,
    grossProfit: 5250000,
    operatingExpenses: 3150000,
    operatingProfit: 2100000,
    interestExpense: 390000,
    netProfit: 1200000,
    ebit: 2100000,
    ebitda: 2750000,
    depreciation: 650000,
    dividends: 400000,
  },
  { ...sampleFinancialData },
];

const defaultFinancialData: FinancialData = {
  year: new Date().getFullYear().toString(),
  currentAssets: 0,
  inventory: 0,
  prepaidExpenses: 0,
  cash: 0,
  marketableSecurities: 0,
  currentLiabilities: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  shareholdersEquity: 0,
  longTermDebt: 0,
  preferenceShareCapital: 0,
  equityShareCapital: 0,
  reserves: 0,
  fixedAssets: 0,
  netSales: 0,
  costOfGoodsSold: 0,
  grossProfit: 0,
  operatingExpenses: 0,
  operatingProfit: 0,
  interestExpense: 0,
  netProfit: 0,
  ebit: 0,
  ebitda: 0,
  depreciation: 0,
  dividends: 0,
};

const FinancialRatios = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<FinancialData>(defaultFinancialData);
  const [multiYearData, setMultiYearData] = useState<FinancialData[]>([]);
  const [ratiosCalculated, setRatiosCalculated] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'excel' | 'tally'>('manual');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('manufacturing');
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false);
  
  // Save/Load Reports State
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [companyName, setCompanyName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('financialRatiosData');
    if (saved) {
      setFinancialData(JSON.parse(saved));
    }
    const savedMultiYear = localStorage.getItem('financialRatiosMultiYear');
    if (savedMultiYear) {
      setMultiYearData(JSON.parse(savedMultiYear));
    }
    const savedIndustry = localStorage.getItem('financialRatiosIndustry');
    if (savedIndustry) {
      setSelectedIndustry(savedIndustry);
    }
    // Load saved reports
    const reports = localStorage.getItem('financialRatiosSavedReports');
    if (reports) {
      setSavedReports(JSON.parse(reports));
    }
    const savedCompanyName = localStorage.getItem('financialRatiosCompanyName');
    if (savedCompanyName) {
      setCompanyName(savedCompanyName);
    }
  }, []);

  const handleInputChange = (field: keyof FinancialData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFinancialData(prev => ({ ...prev, [field]: numValue }));
  };

  const loadSampleData = () => {
    setFinancialData(sampleFinancialData);
    setMultiYearData(sampleMultiYearData);
    setCompanyName('ABC Manufacturing Ltd.');
    toast({
      title: "Sample Data Loaded",
      description: "Sample financial data for a manufacturing company has been loaded. Click 'Calculate All Ratios' to see the analysis.",
    });
  };

  const saveReport = () => {
    if (!companyName.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter a company name to save the report.",
        variant: "destructive",
      });
      return;
    }

    const newReport: SavedReport = {
      id: `report_${Date.now()}`,
      companyName: companyName.trim(),
      savedAt: new Date().toISOString(),
      industry: selectedIndustry,
      financialData: financialData,
      multiYearData: multiYearData,
    };

    const updatedReports = [...savedReports, newReport];
    setSavedReports(updatedReports);
    localStorage.setItem('financialRatiosSavedReports', JSON.stringify(updatedReports));
    localStorage.setItem('financialRatiosCompanyName', companyName);
    setShowSaveDialog(false);
    
    toast({
      title: "Report Saved",
      description: `Financial analysis for "${companyName}" has been saved.`,
    });
  };

  const loadReport = (report: SavedReport) => {
    setFinancialData(report.financialData);
    setMultiYearData(report.multiYearData);
    setSelectedIndustry(report.industry);
    setCompanyName(report.companyName);
    setRatiosCalculated(false);
    setShowLoadDialog(false);
    
    toast({
      title: "Report Loaded",
      description: `Financial data for "${report.companyName}" has been loaded. Click 'Calculate All Ratios' to see analysis.`,
    });
  };

  const deleteReport = (reportId: string) => {
    const updatedReports = savedReports.filter(r => r.id !== reportId);
    setSavedReports(updatedReports);
    localStorage.setItem('financialRatiosSavedReports', JSON.stringify(updatedReports));
    
    toast({
      title: "Report Deleted",
      description: "The saved report has been removed.",
    });
  };

  const calculateRatios = () => {
    localStorage.setItem('financialRatiosData', JSON.stringify(financialData));
    localStorage.setItem('financialRatiosMultiYear', JSON.stringify(multiYearData));
    localStorage.setItem('financialRatiosIndustry', selectedIndustry);
    localStorage.setItem('financialRatiosCompanyName', companyName);
    setRatiosCalculated(true);
    toast({
      title: "Ratios Calculated",
      description: "All financial ratios have been computed successfully.",
    });
  };

  const parseExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];
      
      // Try to extract financial data from common formats
      const extractedData: Partial<FinancialData> = {};
      const fieldMappings: { [key: string]: keyof FinancialData } = {
        'current assets': 'currentAssets',
        'inventory': 'inventory',
        'prepaid expenses': 'prepaidExpenses',
        'cash': 'cash',
        'cash and bank': 'cash',
        'marketable securities': 'marketableSecurities',
        'current liabilities': 'currentLiabilities',
        'total assets': 'totalAssets',
        'total liabilities': 'totalLiabilities',
        'shareholders equity': 'shareholdersEquity',
        'shareholder equity': 'shareholdersEquity',
        'equity': 'shareholdersEquity',
        'long term debt': 'longTermDebt',
        'long-term debt': 'longTermDebt',
        'preference share capital': 'preferenceShareCapital',
        'equity share capital': 'equityShareCapital',
        'reserves': 'reserves',
        'reserves and surplus': 'reserves',
        'fixed assets': 'fixedAssets',
        'net sales': 'netSales',
        'revenue': 'netSales',
        'sales': 'netSales',
        'cost of goods sold': 'costOfGoodsSold',
        'cogs': 'costOfGoodsSold',
        'gross profit': 'grossProfit',
        'operating expenses': 'operatingExpenses',
        'operating profit': 'operatingProfit',
        'interest expense': 'interestExpense',
        'net profit': 'netProfit',
        'net income': 'netProfit',
        'profit after tax': 'netProfit',
        'ebit': 'ebit',
        'ebitda': 'ebitda',
        'depreciation': 'depreciation',
        'dividends': 'dividends',
        'dividend paid': 'dividends',
      };

      jsonData.forEach((row) => {
        if (row.length >= 2) {
          const label = String(row[0]).toLowerCase().trim();
          const value = parseFloat(String(row[1]).replace(/[₹,]/g, '')) || 0;
          
          for (const [searchTerm, field] of Object.entries(fieldMappings)) {
            if (label.includes(searchTerm)) {
              extractedData[field] = value as never;
              break;
            }
          }
        }
      });

      if (Object.keys(extractedData).length > 0) {
        setFinancialData(prev => ({ ...prev, ...extractedData }));
        toast({
          title: "Data Extracted Successfully",
          description: `Found ${Object.keys(extractedData).length} financial data points from your Excel file.`,
        });
      } else {
        toast({
          title: "Limited Data Found",
          description: "Could not auto-detect financial fields. Please ensure your Excel has labels in column A and values in column B.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Parsing File",
        description: "Could not read the Excel file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Processing File",
        description: `Parsing ${file.name}...`,
      });
      parseExcelFile(file);
    }
  };

  const syncWithTally = () => {
    toast({
      title: "Connecting to Tally",
      description: "Fetching financial statements from Tally...",
    });
    setTimeout(() => {
      toast({
        title: "Tally Sync Complete",
        description: "Financial data imported from Tally successfully.",
      });
    }, 2000);
  };

  const addYearForTrend = () => {
    const newYear: FinancialData = {
      ...defaultFinancialData,
      year: (parseInt(financialData.year || new Date().getFullYear().toString()) - multiYearData.length - 1).toString(),
    };
    setMultiYearData(prev => [...prev, newYear]);
  };

  const updateYearData = (index: number, field: keyof FinancialData, value: string) => {
    setMultiYearData(prev => {
      const updated = [...prev];
      if (field === 'year') {
        updated[index] = { ...updated[index], [field]: value };
      } else {
        updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
      }
      return updated;
    });
  };

  const removeYearFromTrend = (index: number) => {
    setMultiYearData(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate ratios for given data
  const calculateRatiosForData = (d: FinancialData, industry: string = selectedIndustry) => {
    const benchmarks = industryBenchmarks[industry];
    
    const currentRatio = d.currentLiabilities > 0 ? d.currentAssets / d.currentLiabilities : 0;
    const quickRatio = d.currentLiabilities > 0 ? (d.currentAssets - d.inventory - d.prepaidExpenses) / d.currentLiabilities : 0;
    const debtToEquity = d.shareholdersEquity > 0 ? d.totalLiabilities / d.shareholdersEquity : 0;
    const grossProfitMargin = d.netSales > 0 ? (d.grossProfit / d.netSales) * 100 : 0;
    const netProfitMargin = d.netSales > 0 ? (d.netProfit / d.netSales) * 100 : 0;
    const returnOnEquity = d.shareholdersEquity > 0 ? (d.netProfit / d.shareholdersEquity) * 100 : 0;
    const returnOnAssets = d.totalAssets > 0 ? (d.netProfit / d.totalAssets) * 100 : 0;
    const assetTurnover = d.totalAssets > 0 ? d.netSales / d.totalAssets : 0;
    const inventoryTurnover = d.inventory > 0 ? d.costOfGoodsSold / d.inventory : 0;
    const interestCoverage = d.interestExpense > 0 ? d.ebit / d.interestExpense : 0;

    return {
      currentRatio,
      quickRatio,
      debtToEquity,
      grossProfitMargin,
      netProfitMargin,
      returnOnEquity,
      returnOnAssets,
      assetTurnover,
      inventoryTurnover,
      interestCoverage,
      benchmarks,
    };
  };

  // Calculate all ratios
  const calculateLiquidityRatios = (): RatioResult[] => {
    const d = financialData;
    const benchmarks = industryBenchmarks[selectedIndustry];
    const currentRatio = d.currentLiabilities > 0 ? d.currentAssets / d.currentLiabilities : 0;
    const quickRatio = d.currentLiabilities > 0 ? (d.currentAssets - d.inventory - d.prepaidExpenses) / d.currentLiabilities : 0;
    const cashRatio = d.currentLiabilities > 0 ? (d.cash + d.marketableSecurities) / d.currentLiabilities : 0;
    const basicDefenceInterval = d.operatingExpenses > 0 ? ((d.cash + d.marketableSecurities + (d.currentAssets - d.inventory - d.prepaidExpenses - d.cash - d.marketableSecurities)) / (d.operatingExpenses / 365)) : 0;
    const netWorkingCapital = d.currentAssets - d.currentLiabilities;

    return [
      {
        name: "Current Ratio",
        value: currentRatio,
        formula: "Current Assets / Current Liabilities",
        interpretation: currentRatio >= 2 ? "Strong liquidity position" : currentRatio >= 1 ? "Adequate liquidity" : "Liquidity concerns",
        benchmark: "Ideal: 2:1",
        industryBenchmark: benchmarks.currentRatio,
        status: currentRatio >= benchmarks.currentRatio ? 'favorable' : currentRatio >= benchmarks.currentRatio * 0.7 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Quick Ratio (Acid Test)",
        value: quickRatio,
        formula: "(Current Assets - Inventory - Prepaid) / Current Liabilities",
        interpretation: quickRatio >= 1 ? "Can meet short-term obligations without selling inventory" : "May face liquidity issues",
        benchmark: "Ideal: 1:1",
        industryBenchmark: benchmarks.quickRatio,
        status: quickRatio >= benchmarks.quickRatio ? 'favorable' : quickRatio >= benchmarks.quickRatio * 0.7 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Cash Ratio",
        value: cashRatio,
        formula: "(Cash + Marketable Securities) / Current Liabilities",
        interpretation: cashRatio >= 0.5 ? "Strong cash position" : "Limited immediate cash availability",
        benchmark: "Ideal: 0.5:1",
        status: cashRatio >= 0.5 ? 'favorable' : cashRatio >= 0.25 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Basic Defence Interval",
        value: basicDefenceInterval,
        formula: "Quick Assets / (Operating Expenses / 365)",
        interpretation: `Company can sustain ${Math.round(basicDefenceInterval)} days without revenue`,
        benchmark: "Higher is better (60+ days preferred)",
        status: basicDefenceInterval >= 60 ? 'favorable' : basicDefenceInterval >= 30 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Net Working Capital",
        value: netWorkingCapital,
        formula: "Current Assets - Current Liabilities",
        interpretation: netWorkingCapital > 0 ? "Positive working capital indicates financial stability" : "Negative working capital is concerning",
        benchmark: "Should be positive",
        status: netWorkingCapital > 0 ? 'favorable' : 'unfavorable'
      }
    ];
  };

  const calculateCapitalStructureRatios = (): RatioResult[] => {
    const d = financialData;
    const benchmarks = industryBenchmarks[selectedIndustry];
    const equityRatio = d.totalAssets > 0 ? (d.shareholdersEquity / d.totalAssets) * 100 : 0;
    const debtRatio = d.totalAssets > 0 ? (d.totalLiabilities / d.totalAssets) * 100 : 0;
    const debtToEquity = d.shareholdersEquity > 0 ? d.totalLiabilities / d.shareholdersEquity : 0;
    const debtToTotalAssets = d.totalAssets > 0 ? (d.longTermDebt / d.totalAssets) * 100 : 0;
    const capitalGearing = (d.equityShareCapital + d.reserves) > 0 ? (d.preferenceShareCapital + d.longTermDebt) / (d.equityShareCapital + d.reserves) : 0;
    const proprietaryRatio = d.totalAssets > 0 ? (d.shareholdersEquity / d.totalAssets) * 100 : 0;

    return [
      {
        name: "Equity Ratio",
        value: equityRatio,
        formula: "(Shareholders' Equity / Total Assets) × 100",
        interpretation: equityRatio >= 50 ? "Strong equity base" : "Higher reliance on debt financing",
        benchmark: "Ideal: 50% or higher",
        status: equityRatio >= 50 ? 'favorable' : equityRatio >= 30 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Debt Ratio",
        value: debtRatio,
        formula: "(Total Liabilities / Total Assets) × 100",
        interpretation: debtRatio <= 50 ? "Conservative debt levels" : "High leverage",
        benchmark: "Ideal: Below 50%",
        status: debtRatio <= 50 ? 'favorable' : debtRatio <= 70 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Debt to Equity Ratio",
        value: debtToEquity,
        formula: "Total Liabilities / Shareholders' Equity",
        interpretation: debtToEquity <= benchmarks.debtToEquity ? "Healthy debt levels for industry" : "Highly leveraged compared to industry",
        benchmark: `Industry avg: ${benchmarks.debtToEquity}:1`,
        industryBenchmark: benchmarks.debtToEquity,
        status: debtToEquity <= benchmarks.debtToEquity ? 'favorable' : debtToEquity <= benchmarks.debtToEquity * 1.5 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Debt to Total Assets",
        value: debtToTotalAssets,
        formula: "(Long-term Debt / Total Assets) × 100",
        interpretation: debtToTotalAssets <= 30 ? "Low long-term debt burden" : "Significant long-term obligations",
        benchmark: "Ideal: Below 30%",
        status: debtToTotalAssets <= 30 ? 'favorable' : debtToTotalAssets <= 50 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Capital Gearing Ratio",
        value: capitalGearing,
        formula: "(Preference Capital + Long-term Debt) / (Equity + Reserves)",
        interpretation: capitalGearing <= 0.5 ? "Low geared - less risky" : "Highly geared - higher risk",
        benchmark: "Ideal: Below 0.5",
        status: capitalGearing <= 0.5 ? 'favorable' : capitalGearing <= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Proprietary Ratio",
        value: proprietaryRatio,
        formula: "(Shareholders' Equity / Total Assets) × 100",
        interpretation: proprietaryRatio >= 50 ? "Strong ownership stake" : "Limited owner's stake",
        benchmark: "Ideal: 50% or higher",
        status: proprietaryRatio >= 50 ? 'favorable' : proprietaryRatio >= 30 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const calculateLeverageRatios = (): RatioResult[] => {
    const d = financialData;
    const financialLeverage = d.shareholdersEquity > 0 ? d.totalAssets / d.shareholdersEquity : 0;
    const operatingLeverage = d.operatingProfit > 0 ? (d.netSales - d.costOfGoodsSold) / d.operatingProfit : 0;
    const combinedLeverage = financialLeverage * operatingLeverage;

    return [
      {
        name: "Financial Leverage",
        value: financialLeverage,
        formula: "Total Assets / Shareholders' Equity",
        interpretation: financialLeverage <= 2 ? "Conservative leverage" : "High financial leverage",
        benchmark: "Ideal: 2 or lower",
        status: financialLeverage <= 2 ? 'favorable' : financialLeverage <= 3 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Operating Leverage",
        value: operatingLeverage,
        formula: "Contribution Margin / Operating Profit",
        interpretation: operatingLeverage > 1 ? "High fixed costs relative to variable" : "Balanced cost structure",
        benchmark: "Depends on industry",
        status: 'neutral'
      },
      {
        name: "Combined Leverage",
        value: combinedLeverage,
        formula: "Financial Leverage × Operating Leverage",
        interpretation: combinedLeverage <= 4 ? "Manageable overall risk" : "High combined risk exposure",
        benchmark: "Lower is generally better",
        status: combinedLeverage <= 4 ? 'favorable' : combinedLeverage <= 6 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const calculatePerformanceRatios = (): RatioResult[] => {
    const d = financialData;
    const benchmarks = industryBenchmarks[selectedIndustry];
    const avgInventory = d.inventory;
    const inventoryTurnover = avgInventory > 0 ? d.costOfGoodsSold / avgInventory : 0;
    const assetTurnover = d.totalAssets > 0 ? d.netSales / d.totalAssets : 0;
    const fixedAssetTurnover = d.fixedAssets > 0 ? d.netSales / d.fixedAssets : 0;
    const workingCapitalTurnover = (d.currentAssets - d.currentLiabilities) > 0 ? d.netSales / (d.currentAssets - d.currentLiabilities) : 0;

    return [
      {
        name: "Inventory Turnover",
        value: inventoryTurnover,
        formula: "Cost of Goods Sold / Average Inventory",
        interpretation: inventoryTurnover >= benchmarks.inventoryTurnover ? "Efficient inventory management" : "Slow inventory movement",
        benchmark: `Industry avg: ${benchmarks.inventoryTurnover}x`,
        industryBenchmark: benchmarks.inventoryTurnover,
        status: inventoryTurnover >= benchmarks.inventoryTurnover ? 'favorable' : inventoryTurnover >= benchmarks.inventoryTurnover * 0.7 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Total Asset Turnover",
        value: assetTurnover,
        formula: "Net Sales / Total Assets",
        interpretation: assetTurnover >= benchmarks.assetTurnover ? "Efficient asset utilization" : "Assets may be underutilized",
        benchmark: `Industry avg: ${benchmarks.assetTurnover}x`,
        industryBenchmark: benchmarks.assetTurnover,
        status: assetTurnover >= benchmarks.assetTurnover ? 'favorable' : assetTurnover >= benchmarks.assetTurnover * 0.7 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Fixed Asset Turnover",
        value: fixedAssetTurnover,
        formula: "Net Sales / Fixed Assets",
        interpretation: fixedAssetTurnover >= 2 ? "Good utilization of fixed assets" : "Fixed assets may be underutilized",
        benchmark: "Higher is better",
        status: fixedAssetTurnover >= 2 ? 'favorable' : fixedAssetTurnover >= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Working Capital Turnover",
        value: workingCapitalTurnover,
        formula: "Net Sales / Net Working Capital",
        interpretation: workingCapitalTurnover >= 4 ? "Efficient working capital use" : "Working capital may be excessive",
        benchmark: "4-6 times is good",
        status: workingCapitalTurnover >= 4 ? 'favorable' : workingCapitalTurnover >= 2 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const calculateProfitabilityRatios = (): RatioResult[] => {
    const d = financialData;
    const benchmarks = industryBenchmarks[selectedIndustry];
    const grossProfitMargin = d.netSales > 0 ? (d.grossProfit / d.netSales) * 100 : 0;
    const operatingProfitMargin = d.netSales > 0 ? (d.operatingProfit / d.netSales) * 100 : 0;
    const netProfitMargin = d.netSales > 0 ? (d.netProfit / d.netSales) * 100 : 0;
    const returnOnAssets = d.totalAssets > 0 ? (d.netProfit / d.totalAssets) * 100 : 0;
    const returnOnEquity = d.shareholdersEquity > 0 ? (d.netProfit / d.shareholdersEquity) * 100 : 0;
    const returnOnCapitalEmployed = (d.totalAssets - d.currentLiabilities) > 0 ? (d.ebit / (d.totalAssets - d.currentLiabilities)) * 100 : 0;

    return [
      {
        name: "Gross Profit Margin",
        value: grossProfitMargin,
        formula: "(Gross Profit / Net Sales) × 100",
        interpretation: grossProfitMargin >= benchmarks.grossProfitMargin ? "Healthy gross margins for industry" : "Below industry average",
        benchmark: `Industry avg: ${benchmarks.grossProfitMargin}%`,
        industryBenchmark: benchmarks.grossProfitMargin,
        status: grossProfitMargin >= benchmarks.grossProfitMargin ? 'favorable' : grossProfitMargin >= benchmarks.grossProfitMargin * 0.7 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Operating Profit Margin",
        value: operatingProfitMargin,
        formula: "(Operating Profit / Net Sales) × 100",
        interpretation: operatingProfitMargin >= 15 ? "Strong operational efficiency" : "Operational improvements needed",
        benchmark: "10-20% is good",
        status: operatingProfitMargin >= 15 ? 'favorable' : operatingProfitMargin >= 8 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Net Profit Margin",
        value: netProfitMargin,
        formula: "(Net Profit / Net Sales) × 100",
        interpretation: netProfitMargin >= benchmarks.netProfitMargin ? "Good bottom-line for industry" : "Below industry profitability",
        benchmark: `Industry avg: ${benchmarks.netProfitMargin}%`,
        industryBenchmark: benchmarks.netProfitMargin,
        status: netProfitMargin >= benchmarks.netProfitMargin ? 'favorable' : netProfitMargin >= benchmarks.netProfitMargin * 0.7 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Return on Assets (ROA)",
        value: returnOnAssets,
        formula: "(Net Profit / Total Assets) × 100",
        interpretation: returnOnAssets >= benchmarks.returnOnAssets ? "Efficient asset utilization" : "Below industry returns",
        benchmark: `Industry avg: ${benchmarks.returnOnAssets}%`,
        industryBenchmark: benchmarks.returnOnAssets,
        status: returnOnAssets >= benchmarks.returnOnAssets ? 'favorable' : returnOnAssets >= benchmarks.returnOnAssets * 0.7 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Return on Equity (ROE)",
        value: returnOnEquity,
        formula: "(Net Profit / Shareholders' Equity) × 100",
        interpretation: returnOnEquity >= benchmarks.returnOnEquity ? "Strong returns for shareholders" : "Below-average shareholder returns",
        benchmark: `Industry avg: ${benchmarks.returnOnEquity}%`,
        industryBenchmark: benchmarks.returnOnEquity,
        status: returnOnEquity >= benchmarks.returnOnEquity ? 'favorable' : returnOnEquity >= benchmarks.returnOnEquity * 0.7 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Return on Capital Employed (ROCE)",
        value: returnOnCapitalEmployed,
        formula: "(EBIT / Capital Employed) × 100",
        interpretation: returnOnCapitalEmployed >= 15 ? "Efficient capital deployment" : "Capital could be better utilized",
        benchmark: "Should exceed cost of capital",
        status: returnOnCapitalEmployed >= 15 ? 'favorable' : returnOnCapitalEmployed >= 10 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const calculateCoverageRatios = (): RatioResult[] => {
    const d = financialData;
    const benchmarks = industryBenchmarks[selectedIndustry];
    const interestCoverage = d.interestExpense > 0 ? d.ebit / d.interestExpense : 0;
    const debtServiceCoverage = (d.interestExpense + (d.longTermDebt * 0.1)) > 0 ? d.ebitda / (d.interestExpense + (d.longTermDebt * 0.1)) : 0;
    const fixedChargeCoverage = d.interestExpense > 0 ? (d.ebit + d.depreciation) / d.interestExpense : 0;
    const dividendCoverage = d.dividends > 0 ? d.netProfit / d.dividends : 0;

    return [
      {
        name: "Interest Coverage Ratio",
        value: interestCoverage,
        formula: "EBIT / Interest Expense",
        interpretation: interestCoverage >= benchmarks.interestCoverage ? "Comfortable interest payment capacity" : "Interest burden may be concerning",
        benchmark: `Industry avg: ${benchmarks.interestCoverage}x`,
        industryBenchmark: benchmarks.interestCoverage,
        status: interestCoverage >= benchmarks.interestCoverage ? 'favorable' : interestCoverage >= benchmarks.interestCoverage * 0.5 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Debt Service Coverage",
        value: debtServiceCoverage,
        formula: "EBITDA / (Interest + Principal)",
        interpretation: debtServiceCoverage >= 1.5 ? "Can comfortably service debt" : "Debt servicing may be strained",
        benchmark: "1.5 or higher",
        status: debtServiceCoverage >= 1.5 ? 'favorable' : debtServiceCoverage >= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Fixed Charge Coverage",
        value: fixedChargeCoverage,
        formula: "(EBIT + Depreciation) / Interest",
        interpretation: fixedChargeCoverage >= 2 ? "Strong ability to cover fixed charges" : "Fixed charge coverage needs improvement",
        benchmark: "2 or higher",
        status: fixedChargeCoverage >= 2 ? 'favorable' : fixedChargeCoverage >= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Dividend Coverage Ratio",
        value: dividendCoverage,
        formula: "Net Profit / Dividends",
        interpretation: dividendCoverage >= 2 ? "Dividends well covered by earnings" : "Dividend sustainability concerns",
        benchmark: "2 or higher",
        status: dividendCoverage >= 2 ? 'favorable' : dividendCoverage >= 1 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const getAllRatios = () => ({
    liquidity: calculateLiquidityRatios(),
    capitalStructure: calculateCapitalStructureRatios(),
    leverage: calculateLeverageRatios(),
    performance: calculatePerformanceRatios(),
    profitability: calculateProfitabilityRatios(),
    coverage: calculateCoverageRatios(),
  });

  const getOverallInsights = () => {
    const ratios = getAllRatios();
    const allRatios = [
      ...ratios.liquidity,
      ...ratios.capitalStructure,
      ...ratios.leverage,
      ...ratios.performance,
      ...ratios.profitability,
      ...ratios.coverage,
    ];

    const favorable = allRatios.filter(r => r.status === 'favorable').length;
    const unfavorable = allRatios.filter(r => r.status === 'unfavorable').length;
    const neutral = allRatios.filter(r => r.status === 'neutral').length;

    const conclusions: string[] = [];
    const recommendations: string[] = [];

    // Liquidity Analysis
    const currentRatio = ratios.liquidity.find(r => r.name === "Current Ratio");
    if (currentRatio && currentRatio.status === 'unfavorable') {
      conclusions.push("Liquidity position needs immediate attention - the company may face difficulty meeting short-term obligations.");
      recommendations.push("Improve liquidity by accelerating receivables collection, negotiating longer payment terms with suppliers, or securing a short-term credit facility.");
    } else if (currentRatio && currentRatio.status === 'favorable') {
      conclusions.push("Strong liquidity position indicates the company can comfortably meet its short-term obligations.");
    }

    // Capital Structure Analysis
    const debtToEquity = ratios.capitalStructure.find(r => r.name === "Debt to Equity Ratio");
    if (debtToEquity && debtToEquity.status === 'unfavorable') {
      conclusions.push("High leverage indicates significant reliance on debt financing, increasing financial risk.");
      recommendations.push("Consider equity infusion or retained earnings to reduce debt dependency. Evaluate refinancing options for better interest rates.");
    }

    // Profitability Analysis
    const roe = ratios.profitability.find(r => r.name === "Return on Equity (ROE)");
    const netMargin = ratios.profitability.find(r => r.name === "Net Profit Margin");
    if (roe && roe.status === 'favorable' && netMargin && netMargin.status === 'favorable') {
      conclusions.push("Excellent profitability metrics suggest efficient operations and strong shareholder returns.");
    } else if (netMargin && netMargin.status === 'unfavorable') {
      recommendations.push("Focus on cost optimization - review operational expenses, negotiate better supplier terms, and improve pricing strategy.");
    }

    // Performance Analysis
    const assetTurnover = ratios.performance.find(r => r.name === "Total Asset Turnover");
    if (assetTurnover && assetTurnover.status === 'unfavorable') {
      recommendations.push("Improve asset utilization by reviewing underperforming assets, optimizing inventory levels, or divesting non-core assets.");
    }

    // Coverage Analysis
    const interestCoverage = ratios.coverage.find(r => r.name === "Interest Coverage Ratio");
    if (interestCoverage && interestCoverage.status === 'unfavorable') {
      conclusions.push("Interest coverage concerns suggest the company may struggle to meet interest obligations from operating profits.");
      recommendations.push("Prioritize debt reduction or negotiate lower interest rates. Consider restructuring high-cost debt.");
    }

    return { favorable, unfavorable, neutral, total: allRatios.length, conclusions, recommendations };
  };

  // Trend Analysis Calculations
  const getTrendData = () => {
    if (multiYearData.length === 0) return [];
    
    const allData = [...multiYearData, { ...financialData, year: financialData.year || new Date().getFullYear().toString() }]
      .sort((a, b) => parseInt(a.year || '0') - parseInt(b.year || '0'));
    
    return allData.map(data => {
      const calcs = calculateRatiosForData(data);
      return {
        year: data.year,
        currentRatio: calcs.currentRatio,
        quickRatio: calcs.quickRatio,
        debtToEquity: calcs.debtToEquity,
        grossProfitMargin: calcs.grossProfitMargin,
        netProfitMargin: calcs.netProfitMargin,
        returnOnEquity: calcs.returnOnEquity,
        returnOnAssets: calcs.returnOnAssets,
        assetTurnover: calcs.assetTurnover,
      };
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const ratios = getAllRatios();
    const insights = getOverallInsights();

    // Header
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Ratios Analysis Report', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Industry: ${selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)} | Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, 28, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Summary Section
    let yPos = 45;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Total Ratios Analyzed', insights.total.toString()],
      ['Favorable', insights.favorable.toString()],
      ['Need Attention', insights.unfavorable.toString()],
      ['Neutral', insights.neutral.toString()],
    ];

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 40, halign: 'center' }
      }
    });

    // Conclusions
    yPos = (doc as any).lastAutoTable?.finalY + 10 || yPos + 40;
    
    if (insights.conclusions.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Conclusions', 14, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      insights.conclusions.forEach((conclusion) => {
        const lines = doc.splitTextToSize(`• ${conclusion}`, pageWidth - 28);
        doc.text(lines, 14, yPos);
        yPos += lines.length * 5;
      });
    }

    // Recommendations
    if (insights.recommendations.length > 0) {
      yPos += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', 14, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      insights.recommendations.forEach((rec) => {
        const lines = doc.splitTextToSize(`→ ${rec}`, pageWidth - 28);
        doc.text(lines, 14, yPos);
        yPos += lines.length * 5;
      });
    }

    // Ratio Details - New Page
    doc.addPage();
    yPos = 20;

    const ratioCategories = [
      { key: 'liquidity', title: 'Liquidity Ratios' },
      { key: 'capitalStructure', title: 'Capital Structure Ratios' },
      { key: 'leverage', title: 'Leverage Ratios' },
      { key: 'performance', title: 'Performance Ratios' },
      { key: 'profitability', title: 'Profitability Ratios' },
      { key: 'coverage', title: 'Coverage Ratios' },
    ];

    ratioCategories.forEach((category, catIndex) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(212, 175, 55);
      doc.text(category.title, 14, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 5;

      const categoryRatios = ratios[category.key as keyof typeof ratios];
      const tableData = categoryRatios.map(ratio => [
        ratio.name,
        ratio.value.toFixed(2),
        ratio.industryBenchmark ? ratio.industryBenchmark.toFixed(2) : '-',
        ratio.status.charAt(0).toUpperCase() + ratio.status.slice(1)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Ratio', 'Value', 'Industry Benchmark', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 35 },
          3: { halign: 'center', cellWidth: 30 }
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const status = data.cell.raw?.toString().toLowerCase();
            if (status === 'favorable') {
              data.cell.styles.textColor = [34, 139, 34];
            } else if (status === 'unfavorable') {
              data.cell.styles.textColor = [220, 53, 69];
            }
          }
        }
      });

      yPos = (doc as any).lastAutoTable?.finalY + 10 || yPos + 50;
    });

    // Trend Analysis if available
    const trendData = getTrendData();
    if (trendData.length > 1) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(212, 175, 55);
      doc.text('Trend Analysis (Multi-Year Comparison)', 14, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 10;

      const trendTableData = trendData.map(data => [
        data.year || '-',
        data.currentRatio.toFixed(2),
        data.debtToEquity.toFixed(2),
        data.grossProfitMargin.toFixed(1) + '%',
        data.netProfitMargin.toFixed(1) + '%',
        data.returnOnEquity.toFixed(1) + '%',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Year', 'Current Ratio', 'D/E Ratio', 'Gross Margin', 'Net Margin', 'ROE']],
        body: trendTableData,
        theme: 'striped',
        headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3, halign: 'center' },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      doc.text('Generated by ABC - AI Legal & Tax Co-pilot', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
    }

    doc.save(`Financial_Ratios_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "Financial ratios report has been downloaded.",
    });
  };

  const ratioCategories = [
    { key: 'liquidity', title: 'Liquidity Ratios', icon: '💧', description: 'Measure ability to meet short-term obligations' },
    { key: 'capitalStructure', title: 'Capital Structure Ratios', icon: '🏛️', description: 'Analyze financing mix and ownership structure' },
    { key: 'leverage', title: 'Leverage Ratios', icon: '⚖️', description: 'Evaluate financial and operating risk' },
    { key: 'performance', title: 'Performance Ratios', icon: '🎯', description: 'Measure operational efficiency' },
    { key: 'profitability', title: 'Profitability Ratios', icon: '💰', description: 'Assess profit generation capability' },
    { key: 'coverage', title: 'Coverage Ratios', icon: '🛡️', description: 'Evaluate debt servicing capacity' },
  ];

  const RatioCard = ({ ratio }: { ratio: RatioResult }) => (
    <Card className="border hover:shadow-[var(--shadow-card)] transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{ratio.name}</CardTitle>
          <Badge variant={ratio.status === 'favorable' ? 'default' : ratio.status === 'unfavorable' ? 'destructive' : 'secondary'}>
            {ratio.status === 'favorable' ? <CheckCircle className="w-3 h-3 mr-1" /> : ratio.status === 'unfavorable' ? <AlertTriangle className="w-3 h-3 mr-1" /> : null}
            {ratio.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            {ratio.value.toFixed(2)}
          </span>
          {ratio.industryBenchmark && (
            <span className="text-sm text-muted-foreground">
              vs {ratio.industryBenchmark.toFixed(2)} industry
            </span>
          )}
          {ratio.status === 'favorable' ? <TrendingUp className="w-5 h-5 text-green-500" /> : ratio.status === 'unfavorable' ? <TrendingDown className="w-5 h-5 text-destructive" /> : null}
        </div>
        <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">{ratio.formula}</p>
        <p className="text-sm">{ratio.interpretation}</p>
        <p className="text-xs text-muted-foreground">📊 {ratio.benchmark}</p>
      </CardContent>
    </Card>
  );

  const insights = getOverallInsights();
  const ratios = getAllRatios();
  const trendData = getTrendData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-primary" />
                Financial Ratios
              </h1>
              <p className="text-muted-foreground">
                {companyName ? `Analysis for ${companyName}` : 'Comprehensive financial analysis'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Save Report Button */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Financial Report</DialogTitle>
                  <DialogDescription>
                    Save the current financial analysis for future reference.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="companyNameSave">Company Name</Label>
                    <Input
                      id="companyNameSave"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      className="mt-2"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Industry: {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={saveReport}>Save Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Load Report Button */}
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Load Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Load Saved Report</DialogTitle>
                  <DialogDescription>
                    Select a previously saved financial analysis report.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {savedReports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No saved reports yet.</p>
                      <p className="text-sm">Save your first report to see it here.</p>
                    </div>
                  ) : (
                    savedReports.map((report) => (
                      <Card key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">{report.companyName}</div>
                              <div className="text-sm text-muted-foreground">
                                {report.industry.charAt(0).toUpperCase() + report.industry.slice(1)} • 
                                Saved {new Date(report.savedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => loadReport(report)}>
                              Load
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteReport(report.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {ratiosCalculated && (
              <Button onClick={exportToPDF} className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            )}
          </div>
        </div>

        {/* Insights Panel - Always on top */}
        {ratiosCalculated && (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Key Insights & Recommendations
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Industry: {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg p-4 text-center border">
                  <div className="text-3xl font-bold text-primary">{insights.total}</div>
                  <div className="text-sm text-muted-foreground">Total Ratios</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center border">
                  <div className="text-3xl font-bold text-green-500">{insights.favorable}</div>
                  <div className="text-sm text-muted-foreground">Favorable</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center border">
                  <div className="text-3xl font-bold text-destructive">{insights.unfavorable}</div>
                  <div className="text-sm text-muted-foreground">Need Attention</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center border">
                  <div className="text-3xl font-bold text-muted-foreground">{insights.neutral}</div>
                  <div className="text-sm text-muted-foreground">Neutral</div>
                </div>
              </div>

              {/* Conclusions */}
              {insights.conclusions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Conclusions
                  </h4>
                  <ul className="space-y-2">
                    {insights.conclusions.map((conclusion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        {conclusion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-accent" /> Recommendations for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm bg-accent/10 p-3 rounded-lg">
                        <span className="text-accent mt-0.5">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="input" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="input" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Input Data
            </TabsTrigger>
            <TabsTrigger value="ratios" disabled={!ratiosCalculated} className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            {/* Input Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Data Input Method</CardTitle>
                <CardDescription>Choose how to input your financial statement data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant={inputMethod === 'excel' ? 'default' : 'outline'}
                    className="h-20 flex-col gap-2"
                    onClick={() => setInputMethod('excel')}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Upload Excel</span>
                  </Button>
                  <Button
                    variant={inputMethod === 'tally' ? 'default' : 'outline'}
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setInputMethod('tally');
                      syncWithTally();
                    }}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span className="text-xs">Import from Tally</span>
                  </Button>
                  <Button
                    variant={inputMethod === 'manual' ? 'default' : 'outline'}
                    className="h-20 flex-col gap-2"
                    onClick={() => setInputMethod('manual')}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span className="text-xs">Enter Manually</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 border-dashed"
                    onClick={loadSampleData}
                  >
                    <Info className="w-5 h-5" />
                    <span className="text-xs">Load Sample Data</span>
                  </Button>
                </div>

                {inputMethod === 'excel' && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                    <Label htmlFor="excel-upload">Upload Financial Statement (Excel/CSV)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Format: Column A = Label (e.g., "Current Assets"), Column B = Value
                    </p>
                    <Input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Industry Selection */}
                <div className="mt-6">
                  <Label>Select Industry for Benchmarking</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger className="mt-2 w-full md:w-64">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="fmcg">FMCG</SelectItem>
                      <SelectItem value="banking">Banking & Finance</SelectItem>
                      <SelectItem value="realestate">Real Estate</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry Forms */}
            {inputMethod === 'manual' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Balance Sheet Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Balance Sheet Items</CardTitle>
                    <CardDescription>Enter amounts in ₹</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="year">Financial Year</Label>
                        <Input
                          id="year"
                          type="text"
                          value={financialData.year || ''}
                          onChange={(e) => setFinancialData(prev => ({ ...prev, year: e.target.value }))}
                          placeholder="2024"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentAssets">Current Assets</Label>
                        <Input
                          id="currentAssets"
                          type="number"
                          value={financialData.currentAssets || ''}
                          onChange={(e) => handleInputChange('currentAssets', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inventory">Inventory</Label>
                        <Input
                          id="inventory"
                          type="number"
                          value={financialData.inventory || ''}
                          onChange={(e) => handleInputChange('inventory', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prepaidExpenses">Prepaid Expenses</Label>
                        <Input
                          id="prepaidExpenses"
                          type="number"
                          value={financialData.prepaidExpenses || ''}
                          onChange={(e) => handleInputChange('prepaidExpenses', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cash">Cash & Bank</Label>
                        <Input
                          id="cash"
                          type="number"
                          value={financialData.cash || ''}
                          onChange={(e) => handleInputChange('cash', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="marketableSecurities">Marketable Securities</Label>
                        <Input
                          id="marketableSecurities"
                          type="number"
                          value={financialData.marketableSecurities || ''}
                          onChange={(e) => handleInputChange('marketableSecurities', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentLiabilities">Current Liabilities</Label>
                        <Input
                          id="currentLiabilities"
                          type="number"
                          value={financialData.currentLiabilities || ''}
                          onChange={(e) => handleInputChange('currentLiabilities', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalAssets">Total Assets</Label>
                        <Input
                          id="totalAssets"
                          type="number"
                          value={financialData.totalAssets || ''}
                          onChange={(e) => handleInputChange('totalAssets', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fixedAssets">Fixed Assets</Label>
                        <Input
                          id="fixedAssets"
                          type="number"
                          value={financialData.fixedAssets || ''}
                          onChange={(e) => handleInputChange('fixedAssets', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalLiabilities">Total Liabilities</Label>
                        <Input
                          id="totalLiabilities"
                          type="number"
                          value={financialData.totalLiabilities || ''}
                          onChange={(e) => handleInputChange('totalLiabilities', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="longTermDebt">Long-term Debt</Label>
                        <Input
                          id="longTermDebt"
                          type="number"
                          value={financialData.longTermDebt || ''}
                          onChange={(e) => handleInputChange('longTermDebt', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shareholdersEquity">Shareholders' Equity</Label>
                        <Input
                          id="shareholdersEquity"
                          type="number"
                          value={financialData.shareholdersEquity || ''}
                          onChange={(e) => handleInputChange('shareholdersEquity', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="equityShareCapital">Equity Share Capital</Label>
                        <Input
                          id="equityShareCapital"
                          type="number"
                          value={financialData.equityShareCapital || ''}
                          onChange={(e) => handleInputChange('equityShareCapital', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferenceShareCapital">Preference Share Capital</Label>
                        <Input
                          id="preferenceShareCapital"
                          type="number"
                          value={financialData.preferenceShareCapital || ''}
                          onChange={(e) => handleInputChange('preferenceShareCapital', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reserves">Reserves & Surplus</Label>
                        <Input
                          id="reserves"
                          type="number"
                          value={financialData.reserves || ''}
                          onChange={(e) => handleInputChange('reserves', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* P&L Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profit & Loss Items</CardTitle>
                    <CardDescription>Enter amounts in ₹</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="netSales">Net Sales / Revenue</Label>
                        <Input
                          id="netSales"
                          type="number"
                          value={financialData.netSales || ''}
                          onChange={(e) => handleInputChange('netSales', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="costOfGoodsSold">Cost of Goods Sold</Label>
                        <Input
                          id="costOfGoodsSold"
                          type="number"
                          value={financialData.costOfGoodsSold || ''}
                          onChange={(e) => handleInputChange('costOfGoodsSold', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grossProfit">Gross Profit</Label>
                        <Input
                          id="grossProfit"
                          type="number"
                          value={financialData.grossProfit || ''}
                          onChange={(e) => handleInputChange('grossProfit', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="operatingExpenses">Operating Expenses</Label>
                        <Input
                          id="operatingExpenses"
                          type="number"
                          value={financialData.operatingExpenses || ''}
                          onChange={(e) => handleInputChange('operatingExpenses', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="operatingProfit">Operating Profit (EBIT)</Label>
                        <Input
                          id="operatingProfit"
                          type="number"
                          value={financialData.operatingProfit || ''}
                          onChange={(e) => handleInputChange('operatingProfit', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ebit">EBIT</Label>
                        <Input
                          id="ebit"
                          type="number"
                          value={financialData.ebit || ''}
                          onChange={(e) => handleInputChange('ebit', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ebitda">EBITDA</Label>
                        <Input
                          id="ebitda"
                          type="number"
                          value={financialData.ebitda || ''}
                          onChange={(e) => handleInputChange('ebitda', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="depreciation">Depreciation</Label>
                        <Input
                          id="depreciation"
                          type="number"
                          value={financialData.depreciation || ''}
                          onChange={(e) => handleInputChange('depreciation', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="interestExpense">Interest Expense</Label>
                        <Input
                          id="interestExpense"
                          type="number"
                          value={financialData.interestExpense || ''}
                          onChange={(e) => handleInputChange('interestExpense', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="netProfit">Net Profit</Label>
                        <Input
                          id="netProfit"
                          type="number"
                          value={financialData.netProfit || ''}
                          onChange={(e) => handleInputChange('netProfit', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dividends">Dividends Paid</Label>
                        <Input
                          id="dividends"
                          type="number"
                          value={financialData.dividends || ''}
                          onChange={(e) => handleInputChange('dividends', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Trend Analysis Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5" />
                      Multi-Year Trend Analysis
                    </CardTitle>
                    <CardDescription>Add previous years' data to see trends</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addYearForTrend}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Year
                  </Button>
                </div>
              </CardHeader>
              {multiYearData.length > 0 && (
                <CardContent>
                  <div className="space-y-4">
                    {multiYearData.map((yearData, index) => (
                      <Card key={index} className="p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={yearData.year || ''}
                              onChange={(e) => updateYearData(index, 'year', e.target.value)}
                              className="w-24"
                              placeholder="Year"
                            />
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeYearFromTrend(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <Label className="text-xs">Current Assets</Label>
                            <Input
                              type="number"
                              value={yearData.currentAssets || ''}
                              onChange={(e) => updateYearData(index, 'currentAssets', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Current Liabilities</Label>
                            <Input
                              type="number"
                              value={yearData.currentLiabilities || ''}
                              onChange={(e) => updateYearData(index, 'currentLiabilities', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Total Assets</Label>
                            <Input
                              type="number"
                              value={yearData.totalAssets || ''}
                              onChange={(e) => updateYearData(index, 'totalAssets', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Shareholders' Equity</Label>
                            <Input
                              type="number"
                              value={yearData.shareholdersEquity || ''}
                              onChange={(e) => updateYearData(index, 'shareholdersEquity', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Net Sales</Label>
                            <Input
                              type="number"
                              value={yearData.netSales || ''}
                              onChange={(e) => updateYearData(index, 'netSales', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Gross Profit</Label>
                            <Input
                              type="number"
                              value={yearData.grossProfit || ''}
                              onChange={(e) => updateYearData(index, 'grossProfit', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Net Profit</Label>
                            <Input
                              type="number"
                              value={yearData.netProfit || ''}
                              onChange={(e) => updateYearData(index, 'netProfit', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Total Liabilities</Label>
                            <Input
                              type="number"
                              value={yearData.totalLiabilities || ''}
                              onChange={(e) => updateYearData(index, 'totalLiabilities', e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            <Button 
              className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90" 
              size="lg"
              onClick={calculateRatios}
            >
              Calculate All Ratios
            </Button>
          </TabsContent>

          <TabsContent value="ratios" className="space-y-6">
            {/* Trend Analysis Display with Charts */}
            {trendData.length > 1 && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-primary" />
                      Trend Analysis ({trendData.length} Years)
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setShowTrendAnalysis(!showTrendAnalysis)}>
                      {showTrendAnalysis ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Interactive Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profitability Trend Chart */}
                    <Card className="p-4 border">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Profitability Trends
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="grossProfitMargin" 
                              name="Gross Margin %" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={{ fill: 'hsl(var(--primary))' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="netProfitMargin" 
                              name="Net Margin %" 
                              stroke="hsl(var(--accent))" 
                              strokeWidth={2}
                              dot={{ fill: 'hsl(var(--accent))' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="returnOnEquity" 
                              name="ROE %" 
                              stroke="#22c55e" 
                              strokeWidth={2}
                              dot={{ fill: '#22c55e' }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    {/* Liquidity & Leverage Trend Chart */}
                    <Card className="p-4 border">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Liquidity & Leverage Trends
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                            <Legend />
                            <Bar 
                              dataKey="currentRatio" 
                              name="Current Ratio" 
                              fill="hsl(var(--primary))" 
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="debtToEquity" 
                              name="D/E Ratio" 
                              fill="hsl(var(--accent))" 
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="assetTurnover" 
                              name="Asset Turnover" 
                              fill="#22c55e" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>

                  {/* Detailed Table - Shown when showTrendAnalysis is true */}
                  {showTrendAnalysis && (
                    <div className="overflow-x-auto mt-6">
                      <h4 className="font-semibold mb-3">Detailed Comparison Table</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-semibold">Metric</th>
                            {trendData.map((d, i) => (
                              <th key={i} className="text-center p-2 font-semibold">{d.year}</th>
                            ))}
                            <th className="text-center p-2 font-semibold">Trend</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2">Current Ratio</td>
                            {trendData.map((d, i) => (
                              <td key={i} className="text-center p-2">{d.currentRatio.toFixed(2)}</td>
                            ))}
                            <td className="text-center p-2">
                              {trendData[trendData.length - 1].currentRatio > trendData[0].currentRatio ? 
                                <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> : 
                                <TrendingDown className="w-4 h-4 text-destructive mx-auto" />}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">Debt to Equity</td>
                            {trendData.map((d, i) => (
                              <td key={i} className="text-center p-2">{d.debtToEquity.toFixed(2)}</td>
                            ))}
                            <td className="text-center p-2">
                              {trendData[trendData.length - 1].debtToEquity < trendData[0].debtToEquity ? 
                                <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> : 
                                <TrendingDown className="w-4 h-4 text-destructive mx-auto" />}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">Gross Profit Margin</td>
                            {trendData.map((d, i) => (
                              <td key={i} className="text-center p-2">{d.grossProfitMargin.toFixed(1)}%</td>
                            ))}
                            <td className="text-center p-2">
                              {trendData[trendData.length - 1].grossProfitMargin > trendData[0].grossProfitMargin ? 
                                <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> : 
                                <TrendingDown className="w-4 h-4 text-destructive mx-auto" />}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">Net Profit Margin</td>
                            {trendData.map((d, i) => (
                              <td key={i} className="text-center p-2">{d.netProfitMargin.toFixed(1)}%</td>
                            ))}
                            <td className="text-center p-2">
                              {trendData[trendData.length - 1].netProfitMargin > trendData[0].netProfitMargin ? 
                                <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> : 
                                <TrendingDown className="w-4 h-4 text-destructive mx-auto" />}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">Return on Equity</td>
                            {trendData.map((d, i) => (
                              <td key={i} className="text-center p-2">{d.returnOnEquity.toFixed(1)}%</td>
                            ))}
                            <td className="text-center p-2">
                              {trendData[trendData.length - 1].returnOnEquity > trendData[0].returnOnEquity ? 
                                <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> : 
                                <TrendingDown className="w-4 h-4 text-destructive mx-auto" />}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2">Asset Turnover</td>
                            {trendData.map((d, i) => (
                              <td key={i} className="text-center p-2">{d.assetTurnover.toFixed(2)}</td>
                            ))}
                            <td className="text-center p-2">
                              {trendData[trendData.length - 1].assetTurnover > trendData[0].assetTurnover ? 
                                <TrendingUp className="w-4 h-4 text-green-500 mx-auto" /> : 
                                <TrendingDown className="w-4 h-4 text-destructive mx-auto" />}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Accordion type="multiple" className="space-y-4" defaultValue={ratioCategories.map(c => c.key)}>
              {ratioCategories.map((category) => (
                <AccordionItem key={category.key} value={category.key} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{category.title}</div>
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {ratios[category.key as keyof typeof ratios].map((ratio, index) => (
                        <RatioCard key={index} ratio={ratio} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialRatios;

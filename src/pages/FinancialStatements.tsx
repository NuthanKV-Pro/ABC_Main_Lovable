import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, FileText, TrendingUp, Wallet, Plus, Trash2, Save, FolderOpen, Download, RefreshCw, Calculator, BarChart3, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

// Types
interface LedgerEntry {
  id: string;
  particulars: string;
  amount: number;
  type: 'debit' | 'credit';
}

interface AccountGroup {
  id: string;
  name: string;
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subCategory: string;
  entries: LedgerEntry[];
}

interface FinancialData {
  companyName: string;
  financialYear: string;
  asOfDate: string;
  accountGroups: AccountGroup[];
}

interface SavedStatement {
  id: string;
  companyName: string;
  savedAt: string;
  data: FinancialData;
}

// Default account structure
const defaultAccountGroups: AccountGroup[] = [
  // Assets
  { id: 'ca_cash', name: 'Cash & Bank', category: 'asset', subCategory: 'Current Assets', entries: [] },
  { id: 'ca_receivables', name: 'Trade Receivables', category: 'asset', subCategory: 'Current Assets', entries: [] },
  { id: 'ca_inventory', name: 'Inventory', category: 'asset', subCategory: 'Current Assets', entries: [] },
  { id: 'ca_prepaid', name: 'Prepaid Expenses', category: 'asset', subCategory: 'Current Assets', entries: [] },
  { id: 'ca_other', name: 'Other Current Assets', category: 'asset', subCategory: 'Current Assets', entries: [] },
  { id: 'fa_ppe', name: 'Property, Plant & Equipment', category: 'asset', subCategory: 'Fixed Assets', entries: [] },
  { id: 'fa_intangible', name: 'Intangible Assets', category: 'asset', subCategory: 'Fixed Assets', entries: [] },
  { id: 'fa_investments', name: 'Long-term Investments', category: 'asset', subCategory: 'Fixed Assets', entries: [] },
  // Liabilities
  { id: 'cl_payables', name: 'Trade Payables', category: 'liability', subCategory: 'Current Liabilities', entries: [] },
  { id: 'cl_shortterm', name: 'Short-term Borrowings', category: 'liability', subCategory: 'Current Liabilities', entries: [] },
  { id: 'cl_provisions', name: 'Provisions', category: 'liability', subCategory: 'Current Liabilities', entries: [] },
  { id: 'cl_other', name: 'Other Current Liabilities', category: 'liability', subCategory: 'Current Liabilities', entries: [] },
  { id: 'ncl_longterm', name: 'Long-term Borrowings', category: 'liability', subCategory: 'Non-Current Liabilities', entries: [] },
  { id: 'ncl_deferred', name: 'Deferred Tax Liability', category: 'liability', subCategory: 'Non-Current Liabilities', entries: [] },
  // Equity
  { id: 'eq_capital', name: 'Share Capital', category: 'equity', subCategory: 'Equity', entries: [] },
  { id: 'eq_reserves', name: 'Reserves & Surplus', category: 'equity', subCategory: 'Equity', entries: [] },
  { id: 'eq_retained', name: 'Retained Earnings', category: 'equity', subCategory: 'Equity', entries: [] },
  // Revenue
  { id: 'rev_sales', name: 'Sales Revenue', category: 'revenue', subCategory: 'Operating Revenue', entries: [] },
  { id: 'rev_service', name: 'Service Revenue', category: 'revenue', subCategory: 'Operating Revenue', entries: [] },
  { id: 'rev_other', name: 'Other Income', category: 'revenue', subCategory: 'Other Revenue', entries: [] },
  { id: 'rev_interest', name: 'Interest Income', category: 'revenue', subCategory: 'Other Revenue', entries: [] },
  // Expenses
  { id: 'exp_cogs', name: 'Cost of Goods Sold', category: 'expense', subCategory: 'Operating Expenses', entries: [] },
  { id: 'exp_salaries', name: 'Salaries & Wages', category: 'expense', subCategory: 'Operating Expenses', entries: [] },
  { id: 'exp_rent', name: 'Rent Expense', category: 'expense', subCategory: 'Operating Expenses', entries: [] },
  { id: 'exp_utilities', name: 'Utilities', category: 'expense', subCategory: 'Operating Expenses', entries: [] },
  { id: 'exp_depreciation', name: 'Depreciation', category: 'expense', subCategory: 'Operating Expenses', entries: [] },
  { id: 'exp_interest', name: 'Interest Expense', category: 'expense', subCategory: 'Finance Costs', entries: [] },
  { id: 'exp_tax', name: 'Income Tax Expense', category: 'expense', subCategory: 'Tax', entries: [] },
  { id: 'exp_other', name: 'Other Expenses', category: 'expense', subCategory: 'Other Expenses', entries: [] },
];

const defaultFinancialData: FinancialData = {
  companyName: '',
  financialYear: '2024-25',
  asOfDate: new Date().toISOString().split('T')[0],
  accountGroups: defaultAccountGroups,
};

// Sample data for demonstration
const sampleFinancialData: FinancialData = {
  companyName: 'ABC Enterprises Pvt. Ltd.',
  financialYear: '2024-25',
  asOfDate: '2025-03-31',
  accountGroups: [
    { id: 'ca_cash', name: 'Cash & Bank', category: 'asset', subCategory: 'Current Assets', entries: [{ id: '1', particulars: 'Bank Balance - SBI', amount: 500000, type: 'debit' }, { id: '2', particulars: 'Petty Cash', amount: 25000, type: 'debit' }] },
    { id: 'ca_receivables', name: 'Trade Receivables', category: 'asset', subCategory: 'Current Assets', entries: [{ id: '1', particulars: 'Customer A', amount: 350000, type: 'debit' }, { id: '2', particulars: 'Customer B', amount: 180000, type: 'debit' }] },
    { id: 'ca_inventory', name: 'Inventory', category: 'asset', subCategory: 'Current Assets', entries: [{ id: '1', particulars: 'Raw Materials', amount: 200000, type: 'debit' }, { id: '2', particulars: 'Finished Goods', amount: 300000, type: 'debit' }] },
    { id: 'ca_prepaid', name: 'Prepaid Expenses', category: 'asset', subCategory: 'Current Assets', entries: [{ id: '1', particulars: 'Prepaid Insurance', amount: 24000, type: 'debit' }] },
    { id: 'ca_other', name: 'Other Current Assets', category: 'asset', subCategory: 'Current Assets', entries: [] },
    { id: 'fa_ppe', name: 'Property, Plant & Equipment', category: 'asset', subCategory: 'Fixed Assets', entries: [{ id: '1', particulars: 'Building', amount: 1500000, type: 'debit' }, { id: '2', particulars: 'Machinery', amount: 800000, type: 'debit' }, { id: '3', particulars: 'Furniture', amount: 150000, type: 'debit' }] },
    { id: 'fa_intangible', name: 'Intangible Assets', category: 'asset', subCategory: 'Fixed Assets', entries: [{ id: '1', particulars: 'Software License', amount: 100000, type: 'debit' }] },
    { id: 'fa_investments', name: 'Long-term Investments', category: 'asset', subCategory: 'Fixed Assets', entries: [{ id: '1', particulars: 'Equity Investments', amount: 200000, type: 'debit' }] },
    { id: 'cl_payables', name: 'Trade Payables', category: 'liability', subCategory: 'Current Liabilities', entries: [{ id: '1', particulars: 'Supplier X', amount: 280000, type: 'credit' }, { id: '2', particulars: 'Supplier Y', amount: 120000, type: 'credit' }] },
    { id: 'cl_shortterm', name: 'Short-term Borrowings', category: 'liability', subCategory: 'Current Liabilities', entries: [{ id: '1', particulars: 'Working Capital Loan', amount: 300000, type: 'credit' }] },
    { id: 'cl_provisions', name: 'Provisions', category: 'liability', subCategory: 'Current Liabilities', entries: [{ id: '1', particulars: 'Provision for Expenses', amount: 50000, type: 'credit' }] },
    { id: 'cl_other', name: 'Other Current Liabilities', category: 'liability', subCategory: 'Current Liabilities', entries: [{ id: '1', particulars: 'Outstanding Expenses', amount: 45000, type: 'credit' }] },
    { id: 'ncl_longterm', name: 'Long-term Borrowings', category: 'liability', subCategory: 'Non-Current Liabilities', entries: [{ id: '1', particulars: 'Term Loan - HDFC', amount: 800000, type: 'credit' }] },
    { id: 'ncl_deferred', name: 'Deferred Tax Liability', category: 'liability', subCategory: 'Non-Current Liabilities', entries: [{ id: '1', particulars: 'Deferred Tax', amount: 75000, type: 'credit' }] },
    { id: 'eq_capital', name: 'Share Capital', category: 'equity', subCategory: 'Equity', entries: [{ id: '1', particulars: 'Equity Share Capital', amount: 1000000, type: 'credit' }] },
    { id: 'eq_reserves', name: 'Reserves & Surplus', category: 'equity', subCategory: 'Equity', entries: [{ id: '1', particulars: 'General Reserve', amount: 500000, type: 'credit' }] },
    { id: 'eq_retained', name: 'Retained Earnings', category: 'equity', subCategory: 'Equity', entries: [{ id: '1', particulars: 'Opening Balance', amount: 659000, type: 'credit' }] },
    { id: 'rev_sales', name: 'Sales Revenue', category: 'revenue', subCategory: 'Operating Revenue', entries: [{ id: '1', particulars: 'Product Sales', amount: 3500000, type: 'credit' }] },
    { id: 'rev_service', name: 'Service Revenue', category: 'revenue', subCategory: 'Operating Revenue', entries: [{ id: '1', particulars: 'Consulting Services', amount: 500000, type: 'credit' }] },
    { id: 'rev_other', name: 'Other Income', category: 'revenue', subCategory: 'Other Revenue', entries: [{ id: '1', particulars: 'Misc Income', amount: 50000, type: 'credit' }] },
    { id: 'rev_interest', name: 'Interest Income', category: 'revenue', subCategory: 'Other Revenue', entries: [{ id: '1', particulars: 'FD Interest', amount: 30000, type: 'credit' }] },
    { id: 'exp_cogs', name: 'Cost of Goods Sold', category: 'expense', subCategory: 'Operating Expenses', entries: [{ id: '1', particulars: 'Material Cost', amount: 1800000, type: 'debit' }] },
    { id: 'exp_salaries', name: 'Salaries & Wages', category: 'expense', subCategory: 'Operating Expenses', entries: [{ id: '1', particulars: 'Staff Salaries', amount: 960000, type: 'debit' }] },
    { id: 'exp_rent', name: 'Rent Expense', category: 'expense', subCategory: 'Operating Expenses', entries: [{ id: '1', particulars: 'Office Rent', amount: 180000, type: 'debit' }] },
    { id: 'exp_utilities', name: 'Utilities', category: 'expense', subCategory: 'Operating Expenses', entries: [{ id: '1', particulars: 'Electricity & Water', amount: 72000, type: 'debit' }] },
    { id: 'exp_depreciation', name: 'Depreciation', category: 'expense', subCategory: 'Operating Expenses', entries: [{ id: '1', particulars: 'Annual Depreciation', amount: 245000, type: 'debit' }] },
    { id: 'exp_interest', name: 'Interest Expense', category: 'expense', subCategory: 'Finance Costs', entries: [{ id: '1', particulars: 'Loan Interest', amount: 96000, type: 'debit' }] },
    { id: 'exp_tax', name: 'Income Tax Expense', category: 'expense', subCategory: 'Tax', entries: [{ id: '1', particulars: 'Current Tax', amount: 168000, type: 'debit' }] },
    { id: 'exp_other', name: 'Other Expenses', category: 'expense', subCategory: 'Other Expenses', entries: [{ id: '1', particulars: 'Misc Expenses', amount: 120000, type: 'debit' }] },
  ],
};

const FinancialStatements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<FinancialData>(defaultFinancialData);
  const [savedStatements, setSavedStatements] = useState<SavedStatement[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('entry');
  const [selectedCategory, setSelectedCategory] = useState<string>('asset');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('financialStatementsData');
    if (saved) {
      setData(JSON.parse(saved));
    }
    const savedList = localStorage.getItem('financialStatementsSaved');
    if (savedList) {
      setSavedStatements(JSON.parse(savedList));
    }
  }, []);

  // Auto-save data
  useEffect(() => {
    localStorage.setItem('financialStatementsData', JSON.stringify(data));
  }, [data]);

  // Calculate group total
  const getGroupTotal = (groupId: string) => {
    const group = data.accountGroups.find(g => g.id === groupId);
    if (!group) return 0;
    return group.entries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  // Calculate category total
  const getCategoryTotal = (category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense') => {
    return data.accountGroups
      .filter(g => g.category === category)
      .reduce((sum, group) => sum + group.entries.reduce((s, e) => s + e.amount, 0), 0);
  };

  // Calculate subcategory total
  const getSubCategoryTotal = (subCategory: string) => {
    return data.accountGroups
      .filter(g => g.subCategory === subCategory)
      .reduce((sum, group) => sum + group.entries.reduce((s, e) => s + e.amount, 0), 0);
  };

  // Add entry to group
  const addEntry = (groupId: string) => {
    setData(prev => ({
      ...prev,
      accountGroups: prev.accountGroups.map(g => 
        g.id === groupId 
          ? { ...g, entries: [...g.entries, { id: `${Date.now()}`, particulars: '', amount: 0, type: g.category === 'asset' || g.category === 'expense' ? 'debit' : 'credit' }] }
          : g
      )
    }));
  };

  // Update entry
  const updateEntry = (groupId: string, entryId: string, field: keyof LedgerEntry, value: string | number) => {
    setData(prev => ({
      ...prev,
      accountGroups: prev.accountGroups.map(g => 
        g.id === groupId 
          ? { ...g, entries: g.entries.map(e => e.id === entryId ? { ...e, [field]: value } : e) }
          : g
      )
    }));
  };

  // Remove entry
  const removeEntry = (groupId: string, entryId: string) => {
    setData(prev => ({
      ...prev,
      accountGroups: prev.accountGroups.map(g => 
        g.id === groupId 
          ? { ...g, entries: g.entries.filter(e => e.id !== entryId) }
          : g
      )
    }));
  };

  // Load sample data
  const loadSampleData = () => {
    setData(sampleFinancialData);
    toast({ title: "Sample Data Loaded", description: "Sample financial data has been loaded for demonstration." });
  };

  // Reset data
  const resetData = () => {
    setData(defaultFinancialData);
    toast({ title: "Data Reset", description: "All financial data has been cleared." });
  };

  // Save statement
  const saveStatement = () => {
    if (!data.companyName.trim()) {
      toast({ title: "Company Name Required", description: "Please enter a company name to save.", variant: "destructive" });
      return;
    }
    const newStatement: SavedStatement = {
      id: `stmt_${Date.now()}`,
      companyName: data.companyName,
      savedAt: new Date().toISOString(),
      data: { ...data }
    };
    const updated = [...savedStatements, newStatement];
    setSavedStatements(updated);
    localStorage.setItem('financialStatementsSaved', JSON.stringify(updated));
    setShowSaveDialog(false);
    toast({ title: "Statement Saved", description: `Financial statements for "${data.companyName}" saved.` });
  };

  // Load statement
  const loadStatement = (stmt: SavedStatement) => {
    setData(stmt.data);
    setShowLoadDialog(false);
    toast({ title: "Statement Loaded", description: `Loaded data for "${stmt.companyName}".` });
  };

  // Delete saved statement
  const deleteStatement = (id: string) => {
    const updated = savedStatements.filter(s => s.id !== id);
    setSavedStatements(updated);
    localStorage.setItem('financialStatementsSaved', JSON.stringify(updated));
    toast({ title: "Statement Deleted" });
  };

  // Calculate Net Profit
  const getNetProfit = () => {
    const totalRevenue = getCategoryTotal('revenue');
    const totalExpenses = getCategoryTotal('expense');
    return totalRevenue - totalExpenses;
  };

  // Get groups by category
  const getGroupsByCategory = (category: string) => {
    return data.accountGroups.filter(g => g.category === category);
  };

  // Get unique subcategories
  const getSubCategories = (category: string) => {
    const groups = getGroupsByCategory(category);
    return [...new Set(groups.map(g => g.subCategory))];
  };

  // Render account entry form
  const renderAccountEntry = (group: AccountGroup) => (
    <Card key={group.id} className="mb-4">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{group.name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">{formatCurrency(getGroupTotal(group.id))}</span>
            <Button size="sm" variant="outline" onClick={() => addEntry(group.id)}>
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
        </div>
      </CardHeader>
      {group.entries.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {group.entries.map(entry => (
              <div key={entry.id} className="flex items-center gap-2">
                <Input
                  placeholder="Particulars"
                  value={entry.particulars}
                  onChange={(e) => updateEntry(group.id, entry.id, 'particulars', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={entry.amount || ''}
                  onChange={(e) => updateEntry(group.id, entry.id, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-32"
                />
                <Button size="icon" variant="ghost" onClick={() => removeEntry(group.id, entry.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );

  // Render Balance Sheet
  const renderBalanceSheet = () => {
    const totalAssets = getCategoryTotal('asset');
    const totalLiabilities = getCategoryTotal('liability');
    const totalEquity = getCategoryTotal('equity');
    const netProfit = getNetProfit();
    const retainedEarnings = getGroupTotal('eq_retained') + netProfit;
    const totalEquityWithProfit = totalEquity - getGroupTotal('eq_retained') + retainedEarnings;

    return (
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Balance Sheet
          </CardTitle>
          <CardDescription>
            {data.companyName || 'Company Name'} | As at {data.asOfDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* Assets Side */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-4 text-primary">ASSETS</h3>
              {['Current Assets', 'Fixed Assets'].map(subCat => (
                <div key={subCat} className="mb-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{subCat}</h4>
                  {data.accountGroups.filter(g => g.category === 'asset' && g.subCategory === subCat).map(group => {
                    const total = getGroupTotal(group.id);
                    if (total === 0) return null;
                    return (
                      <div key={group.id} className="flex justify-between py-1 text-sm">
                        <span>{group.name}</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between py-1 font-medium border-t mt-2">
                    <span>Total {subCat}</span>
                    <span>{formatCurrency(getSubCategoryTotal(subCat))}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-primary mt-4">
                <span>TOTAL ASSETS</span>
                <span className="text-primary">{formatCurrency(totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity Side */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-4 text-primary">LIABILITIES & EQUITY</h3>
              {['Current Liabilities', 'Non-Current Liabilities'].map(subCat => (
                <div key={subCat} className="mb-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{subCat}</h4>
                  {data.accountGroups.filter(g => g.category === 'liability' && g.subCategory === subCat).map(group => {
                    const total = getGroupTotal(group.id);
                    if (total === 0) return null;
                    return (
                      <div key={group.id} className="flex justify-between py-1 text-sm">
                        <span>{group.name}</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between py-1 font-medium border-t mt-2">
                    <span>Total {subCat}</span>
                    <span>{formatCurrency(getSubCategoryTotal(subCat))}</span>
                  </div>
                </div>
              ))}
              <div className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Shareholders' Equity</h4>
                {data.accountGroups.filter(g => g.category === 'equity').map(group => {
                  let total = getGroupTotal(group.id);
                  if (group.id === 'eq_retained') {
                    total += netProfit;
                  }
                  if (total === 0 && group.id !== 'eq_retained') return null;
                  return (
                    <div key={group.id} className="flex justify-between py-1 text-sm">
                      <span>{group.name} {group.id === 'eq_retained' && netProfit !== 0 ? `(incl. Net Profit: ${formatCurrency(netProfit)})` : ''}</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between py-1 font-medium border-t mt-2">
                  <span>Total Equity</span>
                  <span>{formatCurrency(totalEquityWithProfit)}</span>
                </div>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-primary mt-4">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="text-primary">{formatCurrency(totalLiabilities + totalEquityWithProfit)}</span>
              </div>
            </div>
          </div>
          {Math.abs(totalAssets - (totalLiabilities + totalEquityWithProfit)) > 0.01 && (
            <div className="p-4 bg-destructive/10 border-t">
              <p className="text-destructive text-sm font-medium">
                ⚠️ Balance Sheet is not balanced. Difference: {formatCurrency(Math.abs(totalAssets - (totalLiabilities + totalEquityWithProfit)))}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render Profit & Loss Account
  const renderProfitLoss = () => {
    const operatingRevenue = getSubCategoryTotal('Operating Revenue');
    const otherRevenue = getSubCategoryTotal('Other Revenue');
    const totalRevenue = operatingRevenue + otherRevenue;
    const cogs = getGroupTotal('exp_cogs');
    const grossProfit = operatingRevenue - cogs;
    const operatingExpenses = data.accountGroups
      .filter(g => g.category === 'expense' && g.subCategory === 'Operating Expenses' && g.id !== 'exp_cogs')
      .reduce((sum, g) => sum + g.entries.reduce((s, e) => s + e.amount, 0), 0);
    const operatingProfit = grossProfit - operatingExpenses;
    const financeCosts = getSubCategoryTotal('Finance Costs');
    const profitBeforeTax = operatingProfit + otherRevenue - financeCosts;
    const taxExpense = getSubCategoryTotal('Tax');
    const netProfit = profitBeforeTax - taxExpense;

    return (
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Profit & Loss Account
          </CardTitle>
          <CardDescription>
            {data.companyName || 'Company Name'} | For the year ended {data.asOfDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Particulars</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Revenue Section */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold">Revenue</TableCell>
              </TableRow>
              {data.accountGroups.filter(g => g.category === 'revenue').map(group => {
                const total = getGroupTotal(group.id);
                if (total === 0) return null;
                return (
                  <TableRow key={group.id}>
                    <TableCell className="pl-8">{group.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="font-medium border-t-2">
                <TableCell>Total Revenue</TableCell>
                <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
              </TableRow>

              {/* COGS */}
              <TableRow>
                <TableCell>Less: Cost of Goods Sold</TableCell>
                <TableCell className="text-right text-destructive">({formatCurrency(cogs)})</TableCell>
              </TableRow>
              <TableRow className="font-medium bg-green-500/10">
                <TableCell>Gross Profit</TableCell>
                <TableCell className="text-right text-green-600">{formatCurrency(grossProfit)}</TableCell>
              </TableRow>

              {/* Operating Expenses */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold">Less: Operating Expenses</TableCell>
              </TableRow>
              {data.accountGroups.filter(g => g.category === 'expense' && g.subCategory === 'Operating Expenses' && g.id !== 'exp_cogs').map(group => {
                const total = getGroupTotal(group.id);
                if (total === 0) return null;
                return (
                  <TableRow key={group.id}>
                    <TableCell className="pl-8">{group.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="font-medium">
                <TableCell>Operating Profit (EBIT)</TableCell>
                <TableCell className="text-right">{formatCurrency(operatingProfit)}</TableCell>
              </TableRow>

              {/* Other Income & Finance Costs */}
              {otherRevenue > 0 && (
                <TableRow>
                  <TableCell>Add: Other Income</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(otherRevenue)}</TableCell>
                </TableRow>
              )}
              {financeCosts > 0 && (
                <TableRow>
                  <TableCell>Less: Finance Costs</TableCell>
                  <TableCell className="text-right text-destructive">({formatCurrency(financeCosts)})</TableCell>
                </TableRow>
              )}
              <TableRow className="font-medium">
                <TableCell>Profit Before Tax</TableCell>
                <TableCell className="text-right">{formatCurrency(profitBeforeTax)}</TableCell>
              </TableRow>

              {/* Tax */}
              <TableRow>
                <TableCell>Less: Income Tax Expense</TableCell>
                <TableCell className="text-right text-destructive">({formatCurrency(taxExpense)})</TableCell>
              </TableRow>

              {/* Net Profit */}
              <TableRow className="font-bold text-lg border-t-2 border-primary bg-primary/10">
                <TableCell>Net Profit / (Loss)</TableCell>
                <TableCell className={`text-right ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatCurrency(netProfit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // Render Cash Flow Statement
  const renderCashFlow = () => {
    const netProfit = getNetProfit();
    const depreciation = getGroupTotal('exp_depreciation');
    
    // Operating activities adjustments
    const receivablesChange = -getGroupTotal('ca_receivables');
    const inventoryChange = -getGroupTotal('ca_inventory');
    const prepaidChange = -getGroupTotal('ca_prepaid');
    const payablesChange = getGroupTotal('cl_payables');
    const provisionsChange = getGroupTotal('cl_provisions');
    
    const operatingCashFlow = netProfit + depreciation + receivablesChange + inventoryChange + prepaidChange + payablesChange + provisionsChange;
    
    // Investing activities
    const ppeInvestment = -getGroupTotal('fa_ppe');
    const intangibleInvestment = -getGroupTotal('fa_intangible');
    const investmentsChange = -getGroupTotal('fa_investments');
    const investingCashFlow = ppeInvestment + intangibleInvestment + investmentsChange;
    
    // Financing activities
    const shortTermBorrowing = getGroupTotal('cl_shortterm');
    const longTermBorrowing = getGroupTotal('ncl_longterm');
    const shareCapital = getGroupTotal('eq_capital');
    const financingCashFlow = shortTermBorrowing + longTermBorrowing + shareCapital;
    
    const netCashChange = operatingCashFlow + investingCashFlow + financingCashFlow;
    const closingCash = getGroupTotal('ca_cash');

    return (
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Cash Flow Statement
          </CardTitle>
          <CardDescription>
            {data.companyName || 'Company Name'} | For the year ended {data.asOfDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Particulars</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Operating Activities */}
              <TableRow className="bg-blue-500/10">
                <TableCell colSpan={2} className="font-semibold">A. Cash Flow from Operating Activities</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Net Profit Before Tax</TableCell>
                <TableCell className="text-right">{formatCurrency(netProfit + getGroupTotal('exp_tax'))}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Add: Depreciation</TableCell>
                <TableCell className="text-right">{formatCurrency(depreciation)}</TableCell>
              </TableRow>
              <TableRow className="text-muted-foreground text-sm">
                <TableCell colSpan={2} className="pl-8 italic">Changes in Working Capital:</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-12">(Increase)/Decrease in Receivables</TableCell>
                <TableCell className="text-right">{formatCurrency(receivablesChange)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-12">(Increase)/Decrease in Inventory</TableCell>
                <TableCell className="text-right">{formatCurrency(inventoryChange)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-12">Increase/(Decrease) in Payables</TableCell>
                <TableCell className="text-right">{formatCurrency(payablesChange)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Less: Tax Paid</TableCell>
                <TableCell className="text-right text-destructive">({formatCurrency(getGroupTotal('exp_tax'))})</TableCell>
              </TableRow>
              <TableRow className="font-medium border-t bg-blue-500/5">
                <TableCell>Net Cash from Operating Activities</TableCell>
                <TableCell className={`text-right ${operatingCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatCurrency(operatingCashFlow)}
                </TableCell>
              </TableRow>

              {/* Investing Activities */}
              <TableRow className="bg-orange-500/10">
                <TableCell colSpan={2} className="font-semibold">B. Cash Flow from Investing Activities</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Purchase of Property, Plant & Equipment</TableCell>
                <TableCell className="text-right text-destructive">({formatCurrency(Math.abs(ppeInvestment))})</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Purchase of Intangible Assets</TableCell>
                <TableCell className="text-right text-destructive">({formatCurrency(Math.abs(intangibleInvestment))})</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Purchase of Investments</TableCell>
                <TableCell className="text-right text-destructive">({formatCurrency(Math.abs(investmentsChange))})</TableCell>
              </TableRow>
              <TableRow className="font-medium border-t bg-orange-500/5">
                <TableCell>Net Cash from Investing Activities</TableCell>
                <TableCell className={`text-right ${investingCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatCurrency(investingCashFlow)}
                </TableCell>
              </TableRow>

              {/* Financing Activities */}
              <TableRow className="bg-purple-500/10">
                <TableCell colSpan={2} className="font-semibold">C. Cash Flow from Financing Activities</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Proceeds from Share Capital</TableCell>
                <TableCell className="text-right">{formatCurrency(shareCapital)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Proceeds from Short-term Borrowings</TableCell>
                <TableCell className="text-right">{formatCurrency(shortTermBorrowing)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Proceeds from Long-term Borrowings</TableCell>
                <TableCell className="text-right">{formatCurrency(longTermBorrowing)}</TableCell>
              </TableRow>
              <TableRow className="font-medium border-t bg-purple-500/5">
                <TableCell>Net Cash from Financing Activities</TableCell>
                <TableCell className={`text-right ${financingCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatCurrency(financingCashFlow)}
                </TableCell>
              </TableRow>

              {/* Net Change & Closing */}
              <TableRow className="font-bold text-lg border-t-2 border-primary bg-primary/10">
                <TableCell>Net Change in Cash (A+B+C)</TableCell>
                <TableCell className={`text-right ${netCashChange >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {formatCurrency(netCashChange)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Closing Cash & Bank Balance</TableCell>
                <TableCell className="text-right text-primary">{formatCurrency(closingCash)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Note: This is an indirect method cash flow statement. Actual changes should reflect opening vs closing balances.
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Financial Statements</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadSampleData}>
                <Calculator className="h-4 w-4 mr-2" /> Sample Data
              </Button>
              <Button variant="outline" size="sm" onClick={resetData}>
                <RefreshCw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" /> Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Financial Statements</DialogTitle>
                    <DialogDescription>Enter company name to save the current data.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label>Company Name</Label>
                    <Input 
                      value={data.companyName} 
                      onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={saveStatement}>Save Statement</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderOpen className="h-4 w-4 mr-2" /> Load
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Load Saved Statements</DialogTitle>
                    <DialogDescription>Select a previously saved statement to load.</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-64 overflow-y-auto">
                    {savedStatements.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No saved statements found.</p>
                    ) : (
                      <div className="space-y-2">
                        {savedStatements.map(stmt => (
                          <div key={stmt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div>
                              <p className="font-medium">{stmt.companyName}</p>
                              <p className="text-xs text-muted-foreground">{new Date(stmt.savedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => loadStatement(stmt)}>Load</Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteStatement(stmt.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Company Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input 
                  value={data.companyName} 
                  onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label>Financial Year</Label>
                <Select value={data.financialYear} onValueChange={(v) => setData(prev => ({ ...prev, financialYear: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2022-23">2022-23</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>As of Date</Label>
                <Input 
                  type="date" 
                  value={data.asOfDate} 
                  onChange={(e) => setData(prev => ({ ...prev, asOfDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="entry" className="gap-2">
              <Wallet className="h-4 w-4" /> Data Entry
            </TabsTrigger>
            <TabsTrigger value="bs" className="gap-2">
              <FileText className="h-4 w-4" /> Balance Sheet
            </TabsTrigger>
            <TabsTrigger value="pl" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Profit & Loss
            </TabsTrigger>
            <TabsTrigger value="cfs" className="gap-2">
              <ArrowUpDown className="h-4 w-4" /> Cash Flow
            </TabsTrigger>
          </TabsList>

          {/* Data Entry Tab */}
          <TabsContent value="entry">
            <div className="grid lg:grid-cols-4 gap-4 mb-6">
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedCategory('asset')}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold text-blue-500">{formatCurrency(getCategoryTotal('asset'))}</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedCategory('liability')}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Total Liabilities</p>
                  <p className="text-2xl font-bold text-red-500">{formatCurrency(getCategoryTotal('liability'))}</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedCategory('equity')}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Total Equity</p>
                  <p className="text-2xl font-bold text-purple-500">{formatCurrency(getCategoryTotal('equity'))}</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedCategory('revenue')}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className={`text-2xl font-bold ${getNetProfit() >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                    {formatCurrency(getNetProfit())}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-5 gap-2 mb-6">
              {['asset', 'liability', 'equity', 'revenue', 'expense'].map(cat => (
                <Button 
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  {cat === 'asset' ? 'Assets' : cat === 'liability' ? 'Liabilities' : cat === 'equity' ? 'Equity' : cat === 'revenue' ? 'Revenue' : 'Expenses'}
                </Button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {getSubCategories(selectedCategory).map(subCat => (
                <div key={subCat}>
                  <h3 className="font-semibold text-lg mb-4 text-primary">{subCat}</h3>
                  {data.accountGroups.filter(g => g.category === selectedCategory && g.subCategory === subCat).map(group => renderAccountEntry(group))}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="bs">
            {renderBalanceSheet()}
          </TabsContent>

          {/* Profit & Loss Tab */}
          <TabsContent value="pl">
            {renderProfitLoss()}
          </TabsContent>

          {/* Cash Flow Statement Tab */}
          <TabsContent value="cfs">
            {renderCashFlow()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FinancialStatements;

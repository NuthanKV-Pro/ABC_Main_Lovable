import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, CheckCircle, Clock, AlertTriangle, Building, FileText, Receipt, Bell, BellOff, Filter, List, CalendarDays, ChevronLeft, ChevronRight, Download, CalendarPlus, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ComplianceEvent {
  id: string;
  title: string;
  dueDate: string;
  category: 'income-tax' | 'gst' | 'roc' | 'tds-tcs' | 'audit';
  applicable: string;
  description: string;
  penalty: string;
  formNo?: string;
  section?: string;
  completed: boolean;
}

const allEvents: ComplianceEvent[] = [
  // ============ CARRY-OVER from FY 2025-26 (Due in April 2026) ============
  { id: "tds-mar26", title: "TDS/TCS Payment – March 2026", dueDate: "2026-04-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in March 2026 (carry-over from FY 2025-26)", penalty: "Interest @ 1.5% per month u/s 201(1A)", section: "Section 200(1)", completed: false },
  { id: "gstr1-mar26", title: "GSTR-1 – March 2026", dueDate: "2026-04-11", category: "gst", applicable: "Regular GST (Monthly)", description: "Outward supply details for March 2026 (FY 2025-26)", penalty: "₹50/day (₹20 NIL return), max ₹10,000", formNo: "GSTR-1", section: "Section 37", completed: false },
  { id: "cmp08-q4-2526", title: "CMP-08 – Q4 (Jan–Mar 2026)", dueDate: "2026-04-18", category: "gst", applicable: "Composition Scheme", description: "Quarterly statement-cum-challan for Q4 FY 2025-26", penalty: "₹50/day (₹20 NIL), max ₹10,000", formNo: "CMP-08", section: "Section 10", completed: false },
  { id: "gstr3b-mar26", title: "GSTR-3B – March 2026", dueDate: "2026-04-20", category: "gst", applicable: "Regular GST (Monthly)", description: "Summary return with tax payment for March 2026 (FY 2025-26)", penalty: "₹50/day (₹20 NIL return), max ₹10,000 + 18% interest", formNo: "GSTR-3B", section: "Section 39", completed: false },
  { id: "gstr4-2526", title: "GSTR-4 Annual – FY 2025-26", dueDate: "2026-04-30", category: "gst", applicable: "Composition Scheme", description: "Annual return for composition dealers for FY 2025-26", penalty: "₹50/day (₹20 NIL), max ₹10,000", formNo: "GSTR-4", section: "Section 10", completed: false },
  { id: "updated-itr-ay2425", title: "Updated ITR – AY 2024-25 (u/s 139(8A))", dueDate: "2026-04-01", category: "income-tax", applicable: "All", description: "Last date to file updated return for AY 2024-25 within 24 months with 50% additional tax", penalty: "50% additional tax on tax + interest", section: "Section 139(8A)", completed: false },

  // ============ INCOME TAX - Advance Tax ============
  { id: "at1", title: "Advance Tax – 1st Installment (15%)", dueDate: "2026-06-15", category: "income-tax", applicable: "All assessees", description: "Pay 15% of estimated tax liability for FY 2026-27", penalty: "Interest u/s 234C @ 1% per month", section: "Section 208-211", completed: false },
  { id: "at2", title: "Advance Tax – 2nd Installment (45%)", dueDate: "2026-09-15", category: "income-tax", applicable: "All assessees", description: "Pay 45% cumulative of estimated tax for FY 2026-27", penalty: "Interest u/s 234C @ 1% per month", section: "Section 208-211", completed: false },
  { id: "at3", title: "Advance Tax – 3rd Installment (75%)", dueDate: "2026-12-15", category: "income-tax", applicable: "All assessees", description: "Pay 75% cumulative of estimated tax for FY 2026-27", penalty: "Interest u/s 234C @ 1% per month", section: "Section 208-211", completed: false },
  { id: "at4", title: "Advance Tax – 4th Installment (100%)", dueDate: "2027-03-15", category: "income-tax", applicable: "All assessees", description: "Pay 100% of estimated tax for FY 2026-27", penalty: "Interest u/s 234B & 234C", section: "Section 208-211", completed: false },

  // ============ INCOME TAX - ITR Filing ============
  { id: "itr1", title: "ITR Filing – Individual/HUF (Non-audit)", dueDate: "2027-07-31", category: "income-tax", applicable: "Individual/HUF (non-audit)", description: "Last date to file ITR for FY 2026-27 (AY 2027-28) for non-audit cases", penalty: "₹5,000 u/s 234F (₹1,000 if income ≤₹5L)", formNo: "ITR-1/2/3", section: "Section 139(1)", completed: false },
  { id: "itr2", title: "ITR Filing – Firms (Non-audit)", dueDate: "2027-07-31", category: "income-tax", applicable: "Partnership Firm (non-audit)", description: "Last date for partnership firms not requiring audit", penalty: "₹5,000 u/s 234F", formNo: "ITR-5", section: "Section 139(1)", completed: false },
  { id: "itr3", title: "ITR Filing – Companies (Audit)", dueDate: "2027-10-31", category: "income-tax", applicable: "Company", description: "Due date for companies requiring audit for FY 2026-27", penalty: "₹5,000 u/s 234F + interest u/s 234A", formNo: "ITR-6", section: "Section 139(1)", completed: false },
  { id: "itr4", title: "ITR Filing – Audit cases (Non-TP)", dueDate: "2027-10-31", category: "income-tax", applicable: "All audit cases (excl. TP)", description: "Due date for assessees requiring audit (excl. transfer pricing)", penalty: "₹5,000 u/s 234F + interest", formNo: "ITR-3/5/6", section: "Section 139(1)", completed: false },
  { id: "itr5", title: "ITR Filing – Transfer Pricing", dueDate: "2027-11-30", category: "income-tax", applicable: "TP cases", description: "Due date for assessees with international/specified domestic transactions", penalty: "₹5,000 u/s 234F + interest", formNo: "ITR-6", section: "Section 139(1) r/w 92E", completed: false },
  { id: "itr6", title: "Belated / Revised ITR", dueDate: "2027-12-31", category: "income-tax", applicable: "All", description: "Last date to file belated or revised return for AY 2027-28", penalty: "₹10,000 if income > ₹5L", formNo: "As applicable", section: "Section 139(4)/139(5)", completed: false },
  { id: "itr7", title: "Updated ITR (u/s 139(8A))", dueDate: "2028-03-31", category: "income-tax", applicable: "All", description: "File updated return within 12 months with 25% additional tax", penalty: "25% additional tax on tax + interest", section: "Section 139(8A)", completed: false },

  // ============ TDS/TCS Payment & Filing ============
  // Monthly TDS/TCS Payments
  { id: "tds-apr", title: "TDS/TCS Payment – April 2026", dueDate: "2026-05-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in April 2026", penalty: "Interest @ 1.5% per month u/s 201(1A)", section: "Section 200(1)", completed: false },
  { id: "tds-may", title: "TDS/TCS Payment – May 2026", dueDate: "2026-06-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in May 2026", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-jun", title: "TDS/TCS Payment – June 2026", dueDate: "2026-07-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in June 2026", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-jul", title: "TDS/TCS Payment – July 2026", dueDate: "2026-08-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in July 2026", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-aug", title: "TDS/TCS Payment – August 2026", dueDate: "2026-09-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in August 2026", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-sep", title: "TDS/TCS Payment – September 2026", dueDate: "2026-10-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in September 2026", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-oct", title: "TDS/TCS Payment – October 2026", dueDate: "2026-11-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in October 2026", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-nov", title: "TDS/TCS Payment – November 2026", dueDate: "2026-12-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in November 2026", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-dec", title: "TDS/TCS Payment – December 2026", dueDate: "2027-01-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in December 2026", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-jan", title: "TDS/TCS Payment – January 2027", dueDate: "2027-02-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in January 2027", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-feb", title: "TDS/TCS Payment – February 2027", dueDate: "2027-03-07", category: "tds-tcs", applicable: "All Deductors/Collectors", description: "Deposit TDS/TCS deducted/collected in February 2027", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-mar", title: "TDS/TCS Payment – March 2027 (Govt)", dueDate: "2027-03-07", category: "tds-tcs", applicable: "Government Deductors", description: "Govt deductors: same day deposit for March. Others: April 30", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },
  { id: "tds-mar-other", title: "TDS/TCS Payment – March 2027 (Others)", dueDate: "2027-04-30", category: "tds-tcs", applicable: "Non-Govt Deductors", description: "Non-government deductors: deposit TDS for March by April 30", penalty: "Interest @ 1.5% per month", section: "Section 200(1)", completed: false },

  // Quarterly TDS/TCS Returns
  { id: "tds-q1-ret", title: "TDS Return – Q1 (Apr–Jun 2026)", dueDate: "2026-07-31", category: "tds-tcs", applicable: "All Deductors", description: "File Form 24Q (Salary) / 26Q (Non-salary) / 27Q (NRI) for Q1", penalty: "₹200/day u/s 234E + penalty u/s 271H", formNo: "24Q/26Q/27Q", section: "Section 200(3)", completed: false },
  { id: "tds-q2-ret", title: "TDS Return – Q2 (Jul–Sep 2026)", dueDate: "2026-10-31", category: "tds-tcs", applicable: "All Deductors", description: "File quarterly TDS return for Q2", penalty: "₹200/day u/s 234E", formNo: "24Q/26Q/27Q", section: "Section 200(3)", completed: false },
  { id: "tds-q3-ret", title: "TDS Return – Q3 (Oct–Dec 2026)", dueDate: "2027-01-31", category: "tds-tcs", applicable: "All Deductors", description: "File quarterly TDS return for Q3", penalty: "₹200/day u/s 234E", formNo: "24Q/26Q/27Q", section: "Section 200(3)", completed: false },
  { id: "tds-q4-ret", title: "TDS Return – Q4 (Jan–Mar 2027)", dueDate: "2027-05-31", category: "tds-tcs", applicable: "All Deductors", description: "File quarterly TDS return for Q4", penalty: "₹200/day u/s 234E", formNo: "24Q/26Q/27Q", section: "Section 200(3)", completed: false },
  { id: "tcs-q1-ret", title: "TCS Return – Q1 (Apr–Jun 2026)", dueDate: "2026-07-15", category: "tds-tcs", applicable: "All Collectors", description: "File Form 27EQ for Q1 TCS", penalty: "₹200/day u/s 234E", formNo: "27EQ", section: "Section 206C(3)", completed: false },
  { id: "tcs-q2-ret", title: "TCS Return – Q2 (Jul–Sep 2026)", dueDate: "2026-10-15", category: "tds-tcs", applicable: "All Collectors", description: "File Form 27EQ for Q2 TCS", penalty: "₹200/day u/s 234E", formNo: "27EQ", section: "Section 206C(3)", completed: false },
  { id: "tcs-q3-ret", title: "TCS Return – Q3 (Oct–Dec 2026)", dueDate: "2027-01-15", category: "tds-tcs", applicable: "All Collectors", description: "File Form 27EQ for Q3 TCS", penalty: "₹200/day u/s 234E", formNo: "27EQ", section: "Section 206C(3)", completed: false },
  { id: "tcs-q4-ret", title: "TCS Return – Q4 (Jan–Mar 2027)", dueDate: "2027-05-15", category: "tds-tcs", applicable: "All Collectors", description: "File Form 27EQ for Q4 TCS", penalty: "₹200/day u/s 234E", formNo: "27EQ", section: "Section 206C(3)", completed: false },

  // TDS Certificates
  { id: "form16-q1", title: "Form 16A – Q1 (Apr–Jun 2026)", dueDate: "2026-08-15", category: "tds-tcs", applicable: "All Deductors", description: "Issue TDS certificate Form 16A for Q1", penalty: "₹100/day u/s 272A(2)(g)", formNo: "Form 16A", completed: false },
  { id: "form16-q2", title: "Form 16A – Q2 (Jul–Sep 2026)", dueDate: "2026-11-15", category: "tds-tcs", applicable: "All Deductors", description: "Issue TDS certificate Form 16A for Q2", penalty: "₹100/day u/s 272A(2)(g)", formNo: "Form 16A", completed: false },
  { id: "form16-q3", title: "Form 16A – Q3 (Oct–Dec 2026)", dueDate: "2027-02-15", category: "tds-tcs", applicable: "All Deductors", description: "Issue TDS certificate Form 16A for Q3", penalty: "₹100/day u/s 272A(2)(g)", formNo: "Form 16A", completed: false },
  { id: "form16-q4", title: "Form 16A – Q4 (Jan–Mar 2027)", dueDate: "2027-06-15", category: "tds-tcs", applicable: "All Deductors", description: "Issue TDS certificate Form 16A for Q4", penalty: "₹100/day u/s 272A(2)(g)", formNo: "Form 16A", completed: false },
  { id: "form16-salary", title: "Form 16 (Salary TDS Certificate)", dueDate: "2027-06-15", category: "tds-tcs", applicable: "Employers", description: "Issue Form 16 to employees for FY 2026-27", penalty: "₹100/day u/s 272A(2)(g)", formNo: "Form 16", completed: false },

  // ============ GST Returns ============
  // GSTR-1 (Monthly – 11th of next month)
  ...Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, 3 + i, 1);
    const dueMonth = new Date(2026, 4 + i, 11);
    const monthName = month.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    return {
      id: `gstr1-${i}`,
      title: `GSTR-1 – ${monthName}`,
      dueDate: `${dueMonth.getFullYear()}-${String(dueMonth.getMonth() + 1).padStart(2, '0')}-11`,
      category: "gst" as const,
      applicable: "Regular GST (Monthly)",
      description: `Outward supply details for ${monthName}`,
      penalty: "₹50/day (₹20 NIL return), max ₹10,000",
      formNo: "GSTR-1",
      section: "Section 37",
      completed: false,
    };
  }),
  // GSTR-3B (Monthly – 20th of next month)
  ...Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, 3 + i, 1);
    const dueMonth = new Date(2026, 4 + i, 20);
    const monthName = month.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    return {
      id: `gstr3b-${i}`,
      title: `GSTR-3B – ${monthName}`,
      dueDate: `${dueMonth.getFullYear()}-${String(dueMonth.getMonth() + 1).padStart(2, '0')}-20`,
      category: "gst" as const,
      applicable: "Regular GST (Monthly)",
      description: `Summary return with tax payment for ${monthName}`,
      penalty: "₹50/day + 18% interest on tax due",
      formNo: "GSTR-3B",
      section: "Section 39",
      completed: false,
    };
  }),
  // GSTR-9 Annual
  { id: "gstr9", title: "GSTR-9 Annual Return (FY 2025-26)", dueDate: "2026-12-31", category: "gst", applicable: "Turnover > ₹2 Cr", description: "Annual return for FY 2025-26", penalty: "₹200/day (₹100 CGST + ₹100 SGST), max 0.5% of turnover", formNo: "GSTR-9", section: "Section 44", completed: false },
  { id: "gstr9c", title: "GSTR-9C Reconciliation (FY 2025-26)", dueDate: "2026-12-31", category: "gst", applicable: "Turnover > ₹5 Cr", description: "Reconciliation statement for FY 2025-26", penalty: "Same as GSTR-9", formNo: "GSTR-9C", section: "Section 44", completed: false },
  // CMP-08 (Composition quarterly)
  { id: "cmp08-q1", title: "CMP-08 – Q1 (Apr–Jun 2026)", dueDate: "2026-07-18", category: "gst", applicable: "Composition Dealers", description: "Quarterly payment challan for composition dealers", penalty: "Interest @ 18% on tax due", formNo: "CMP-08", completed: false },
  { id: "cmp08-q2", title: "CMP-08 – Q2 (Jul–Sep 2026)", dueDate: "2026-10-18", category: "gst", applicable: "Composition Dealers", description: "Quarterly payment challan for composition dealers", penalty: "Interest @ 18%", formNo: "CMP-08", completed: false },
  { id: "cmp08-q3", title: "CMP-08 – Q3 (Oct–Dec 2026)", dueDate: "2027-01-18", category: "gst", applicable: "Composition Dealers", description: "Quarterly payment challan for composition dealers", penalty: "Interest @ 18%", formNo: "CMP-08", completed: false },
  { id: "cmp08-q4", title: "CMP-08 – Q4 (Jan–Mar 2027)", dueDate: "2027-04-18", category: "gst", applicable: "Composition Dealers", description: "Quarterly payment challan for composition dealers", penalty: "Interest @ 18%", formNo: "CMP-08", completed: false },
  // GSTR-4 Annual (Composition)
  { id: "gstr4", title: "GSTR-4 Annual (Composition) FY 2026-27", dueDate: "2027-04-30", category: "gst", applicable: "Composition Dealers", description: "Annual return for composition dealers", penalty: "₹200/day, max ₹5,000", formNo: "GSTR-4", completed: false },

  // ============ ROC / Company Filings ============
  { id: "agm", title: "Annual General Meeting (AGM)", dueDate: "2026-09-30", category: "roc", applicable: "Company", description: "Hold AGM within 6 months from FY end (31 Mar 2026)", penalty: "₹1L on company + ₹5,000/day on officers", section: "Section 96", completed: false },
  { id: "aoc4", title: "AOC-4 (Financial Statements)", dueDate: "2026-10-30", category: "roc", applicable: "Company", description: "File financial statements within 30 days of AGM", penalty: "₹100/day additional fee per document", formNo: "AOC-4", section: "Section 137", completed: false },
  { id: "aoc4-xbrl", title: "AOC-4 XBRL", dueDate: "2026-10-30", category: "roc", applicable: "Company (XBRL applicable)", description: "XBRL filing of financial statements", penalty: "₹100/day additional fee", formNo: "AOC-4 XBRL", section: "Section 137", completed: false },
  { id: "mgt7", title: "MGT-7/MGT-7A (Annual Return)", dueDate: "2026-11-28", category: "roc", applicable: "Company", description: "File annual return within 60 days of AGM", penalty: "₹100/day additional fee", formNo: "MGT-7/7A", section: "Section 92", completed: false },
  { id: "adt1", title: "ADT-1 (Auditor Appointment)", dueDate: "2026-10-15", category: "roc", applicable: "Company", description: "Intimate auditor appointment to ROC within 15 days of AGM", penalty: "₹300/day additional fee", formNo: "ADT-1", section: "Section 139(1)", completed: false },
  { id: "dir3kyc", title: "DIR-3 KYC (Directors KYC)", dueDate: "2026-09-30", category: "roc", applicable: "All Directors (DIN holders)", description: "Annual KYC for all directors holding DIN", penalty: "₹5,000 late fee + DIN deactivation", formNo: "DIR-3 KYC", section: "Rule 12A", completed: false },
  { id: "msme1", title: "MSME-1 (Half-yearly – H1)", dueDate: "2026-10-31", category: "roc", applicable: "Company (outstanding to MSMEs)", description: "File details of outstanding payments to MSME suppliers for Apr-Sep", penalty: "₹20,000 + ₹1,000/day", formNo: "MSME-1", section: "Section 405", completed: false },
  { id: "msme2", title: "MSME-1 (Half-yearly – H2)", dueDate: "2027-04-30", category: "roc", applicable: "Company (outstanding to MSMEs)", description: "File details of outstanding payments to MSME suppliers for Oct-Mar", penalty: "₹20,000 + ₹1,000/day", formNo: "MSME-1", section: "Section 405", completed: false },
  { id: "llp-form8", title: "LLP Form 8 (Statement of Account)", dueDate: "2026-10-30", category: "roc", applicable: "LLP", description: "Statement of accounts & solvency within 30 days from 6 months of FY end", penalty: "₹100/day", formNo: "Form 8", completed: false },
  { id: "llp-form11", title: "LLP Form 11 (Annual Return)", dueDate: "2027-05-30", category: "roc", applicable: "LLP", description: "Annual return for LLP within 60 days of FY end", penalty: "₹100/day", formNo: "Form 11", completed: false },
  { id: "llp-form-a", title: "DIR-3 KYC (LLP Designated Partners)", dueDate: "2026-09-30", category: "roc", applicable: "LLP Designated Partners", description: "Annual KYC for designated partners of LLP", penalty: "₹5,000 late fee", formNo: "DIR-3 KYC", completed: false },

  // ============ Audit ============
  { id: "tax-audit", title: "Tax Audit Report (Form 3CA/3CB-3CD)", dueDate: "2027-09-30", category: "audit", applicable: "Audit applicable (Sec 44AB)", description: "Get tax audit completed and report uploaded on IT portal", penalty: "0.5% of turnover, max ₹1.5 Lakh u/s 271B", formNo: "3CA/3CB-3CD", section: "Section 44AB", completed: false },
  { id: "tp-report", title: "Transfer Pricing Report (Form 3CEB)", dueDate: "2027-11-30", category: "audit", applicable: "International/specified domestic transactions", description: "Transfer pricing audit and report for entities with international transactions >₹1Cr", penalty: "₹1,00,000 per failure u/s 271BA", formNo: "Form 3CEB", section: "Section 92E", completed: false },
  { id: "tp-cert", title: "Transfer Pricing Certificate", dueDate: "2027-10-31", category: "audit", applicable: "TP applicable entities", description: "Obtain and furnish certificate from CA for TP report", penalty: "₹1,00,000 u/s 271BA", section: "Section 92E", completed: false },
];

const categoryLabels: Record<string, string> = {
  "income-tax": "Income Tax",
  "gst": "GST",
  "roc": "ROC / MCA",
  "tds-tcs": "TDS / TCS",
  "audit": "Audit",
};

const categoryColors: Record<string, string> = {
  "income-tax": "bg-primary/10 text-primary border-primary/20",
  "gst": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "roc": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "tds-tcs": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "audit": "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const ComplianceCalendar = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { toast } = useToast();
  const [entityType, setEntityType] = useState("company");
  const [isGSTRegistered, setIsGSTRegistered] = useState(true);
  const [isAuditApplicable, setIsAuditApplicable] = useState(true);
  const [isComposition, setIsComposition] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2026, 3, 1)); // April 2026
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("compliance_completed_2026");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem("compliance_completed_2026", JSON.stringify([...completedIds]));
  }, [completedIds]);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Check for upcoming deadlines and send notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkDeadlines = () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      allEvents.forEach((event) => {
        if (completedIds.has(event.id)) return;
        const due = new Date(event.dueDate);
        const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0 && daysLeft <= 7) {
          const notifKey = `notif_${event.id}_${event.dueDate}`;
          const alreadySent = localStorage.getItem(notifKey);
          if (!alreadySent) {
            new Notification(`⏰ ${event.title}`, {
              body: `Due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} (${new Date(event.dueDate).toLocaleDateString("en-IN")}). ${event.penalty}`,
              icon: "/favicon.ico",
            });
            localStorage.setItem(notifKey, "sent");
          }
        }
      });
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 6 * 60 * 60 * 1000); // every 6 hrs
    return () => clearInterval(interval);
  }, [notificationsEnabled, completedIds]);

  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({ title: "🔔 Notifications Enabled", description: "You'll get alerts for deadlines within 7 days." });
        new Notification("Compliance Calendar", { body: "You'll now receive reminders for upcoming deadlines!", icon: "/favicon.ico" });
      } else {
        toast({ title: "Notifications Blocked", description: "Please allow notifications in your browser settings.", variant: "destructive" });
      }
    }
  };

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      if (e.category === "gst" && !isGSTRegistered) return false;
      if (e.category === "gst" && e.applicable === "Composition Dealers" && !isComposition) return false;
      if (e.category === "gst" && e.applicable === "Regular GST (Monthly)" && isComposition) return false;
      if (e.category === "roc" && entityType === "individual") return false;
      if (e.category === "audit" && !isAuditApplicable) return false;
      if (e.applicable === "Company" && entityType !== "company") return false;
      if (e.applicable === "Company (XBRL applicable)" && entityType !== "company") return false;
      if (e.applicable === "Company (outstanding to MSMEs)" && entityType !== "company") return false;
      if (e.applicable === "LLP" && entityType !== "llp") return false;
      if (e.applicable === "LLP Designated Partners" && entityType !== "llp") return false;
      if (e.applicable === "Employers" && entityType === "individual") return false;

      // Month filter
      if (selectedMonth !== "all") {
        const eventMonth = new Date(e.dueDate).getMonth();
        const eventYear = new Date(e.dueDate).getFullYear();
        const [filterYear, filterMonth] = selectedMonth.split("-").map(Number);
        if (eventMonth !== filterMonth || eventYear !== filterYear) return false;
      }
      return true;
    });
  }, [entityType, isGSTRegistered, isAuditApplicable, isComposition, selectedMonth]);

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number; upcoming: number }> = {};
    filteredEvents.forEach((e) => {
      if (!counts[e.category]) counts[e.category] = { total: 0, completed: 0, upcoming: 0 };
      counts[e.category].total++;
      if (completedIds.has(e.id)) counts[e.category].completed++;
      const days = getDaysUntil(e.dueDate);
      if (days >= 0 && days <= 7 && !completedIds.has(e.id)) counts[e.category].upcoming++;
    });
    return counts;
  }, [filteredEvents, completedIds]);

  const urgentCount = filteredEvents.filter((e) => !completedIds.has(e.id) && getDaysUntil(e.dueDate) >= 0 && getDaysUntil(e.dueDate) <= 7).length;
  const overdueCount = filteredEvents.filter((e) => !completedIds.has(e.id) && getDaysUntil(e.dueDate) < 0).length;

  const months = [
    { value: "all", label: "All Months" },
    { value: "2026-3", label: "April 2026" }, { value: "2026-4", label: "May 2026" },
    { value: "2026-5", label: "June 2026" }, { value: "2026-6", label: "July 2026" },
    { value: "2026-7", label: "August 2026" }, { value: "2026-8", label: "September 2026" },
    { value: "2026-9", label: "October 2026" }, { value: "2026-10", label: "November 2026" },
    { value: "2026-11", label: "December 2026" }, { value: "2027-0", label: "January 2027" },
    { value: "2027-1", label: "February 2027" }, { value: "2027-2", label: "March 2027" },
    // Extended for ITR/audit dates beyond March
    { value: "2027-3", label: "April 2027" }, { value: "2027-4", label: "May 2027" },
    { value: "2027-5", label: "June 2027" }, { value: "2027-6", label: "July 2027" },
    { value: "2027-7", label: "August 2027" }, { value: "2027-8", label: "September 2027" },
    { value: "2027-9", label: "October 2027" }, { value: "2027-10", label: "November 2027" },
    { value: "2027-11", label: "December 2027" },
    { value: "2028-2", label: "March 2028" },
  ];

  const renderEventCard = (event: ComplianceEvent) => {
    const days = getDaysUntil(event.dueDate);
    const isCompleted = completedIds.has(event.id);
    const isOverdue = days < 0 && !isCompleted;
    const isUrgent = days >= 0 && days <= 7 && !isCompleted;

    return (
      <Card
        key={event.id}
        className={`cursor-pointer transition-all hover:shadow-md ${isCompleted ? "opacity-50" : ""} ${isOverdue ? "border-destructive/50 bg-destructive/5" : isUrgent ? "border-amber-500/50 bg-amber-500/5" : ""}`}
        onClick={() => toggleComplete(event.id)}
      >
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-3">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            ) : isOverdue ? (
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            ) : (
              <Clock className={`h-5 w-5 mt-0.5 shrink-0 ${isUrgent ? "text-amber-500" : "text-muted-foreground"}`} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className={`font-medium text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                  {event.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryColors[event.category]}`}>
                    {categoryLabels[event.category]}
                  </Badge>
                  {event.formNo && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {event.formNo}
                    </Badge>
                  )}
                  <span className={`text-xs font-semibold whitespace-nowrap ${isCompleted ? "text-green-500" : isOverdue ? "text-destructive" : isUrgent ? "text-amber-500" : "text-muted-foreground"}`}>
                    {isCompleted ? "✓ Done" : isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today!" : `${days}d left`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                <span className="font-medium">
                  📅 {new Date(event.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span>👤 {event.applicable}</span>
                {event.section && <span>📖 {event.section}</span>}
                <span className="text-amber-600">⚠️ {event.penalty}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = Array(firstDay).fill(null);
    
    for (let d = 1; d <= daysInMonth; d++) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  }, [calendarMonth]);

  const eventsForCalendarDay = useCallback((day: number) => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(e => e.dueDate === dateStr);
  }, [calendarMonth, filteredEvents]);

  const calendarMonthLabel = calendarMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const navigateCalendarMonth = (dir: number) => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const exportICS = () => {
    const sorted = [...filteredEvents].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ABC Pro//Compliance Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Compliance Calendar FY 2026-27',
    ];

    sorted.forEach(event => {
      const dueDate = new Date(event.dueDate);
      const dtStart = `${dueDate.getFullYear()}${String(dueDate.getMonth() + 1).padStart(2, '0')}${String(dueDate.getDate()).padStart(2, '0')}`;
      // Reminder 7 days before
      const uid = `${event.id}@abcpro-compliance`;
      lines.push('BEGIN:VEVENT');
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtStart}`);
      lines.push(`SUMMARY:${event.title}`);
      lines.push(`DESCRIPTION:${event.description}\\nApplicable: ${event.applicable}\\nPenalty: ${event.penalty}${event.section ? '\\nSection: ' + event.section : ''}${event.formNo ? '\\nForm: ' + event.formNo : ''}`);
      lines.push(`CATEGORIES:${categoryLabels[event.category]}`);
      lines.push(`UID:${uid}`);
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-P7D');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${event.title} is due in 7 days`);
      lines.push('END:VALARM');
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-P1D');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${event.title} is due tomorrow!`);
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    const content = lines.join('\r\n');
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Compliance_Calendar_FY2026-27.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "📅 ICS Exported", description: `${sorted.length} deadlines exported. Import into Google Calendar, Outlook, or Apple Calendar.` });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Calendar', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`FY 2026-27 • Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 28, { align: 'center' });

    doc.setTextColor(0, 0, 0);

    // Filters summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Filters Applied:', 14, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Entity: ${entityType.toUpperCase()} | GST: ${isGSTRegistered ? 'Yes' : 'No'} | Audit: ${isAuditApplicable ? 'Yes' : 'No'} | Composition: ${isComposition ? 'Yes' : 'No'}`, 14, 52);

    // Table
    const sorted = [...filteredEvents].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const tableData = sorted.map(e => [
      new Date(e.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      e.title,
      categoryLabels[e.category],
      e.formNo || '-',
      completedIds.has(e.id) ? '✓ Done' : getDaysUntil(e.dueDate) < 0 ? 'Overdue' : 'Pending',
    ]);

    autoTable(doc, {
      startY: 58,
      head: [['Due Date', 'Deadline', 'Category', 'Form', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [212, 175, 55], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 70 },
        2: { cellWidth: 28 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === '✓ Done') data.cell.styles.textColor = [46, 125, 50];
          else if (data.cell.raw === 'Overdue') data.cell.styles.textColor = [220, 38, 38];
        }
      },
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('This is a computer-generated report. No signature required.', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Generated by ABC - AI Legal & Tax Co-pilot', pageWidth / 2, footerY + 5, { align: 'center' });

    doc.save(`Compliance_Calendar_FY2026-27_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "📄 PDF Exported", description: `${sorted.length} deadlines exported successfully.` });
  };

  const renderCalendarView = () => {
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === calendarMonth.getFullYear() && today.getMonth() === calendarMonth.getMonth();

    return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigateCalendarMonth(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{calendarMonthLabel}</h3>
          {!isCurrentMonth && (
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={jumpToToday}>
              <CalendarDays className="h-3.5 w-3.5" /> Today
            </Button>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigateCalendarMonth(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="bg-muted px-1 py-2 text-center text-xs font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
        {calendarDays.flat().map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="bg-card min-h-[90px]" />;
          const dayEvents = eventsForCalendarDay(day);
          const today = new Date();
          const isToday = today.getFullYear() === calendarMonth.getFullYear() && today.getMonth() === calendarMonth.getMonth() && today.getDate() === day;
          
          return (
            <div
              key={`day-${day}`}
              className={`bg-card min-h-[90px] p-1 ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
            >
              <span className={`text-xs font-medium block mb-0.5 ${isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center mx-auto" : "text-foreground"}`}>
                {day}
              </span>
              <div className="space-y-0.5 overflow-y-auto max-h-[70px]">
                {dayEvents.slice(0, 3).map(ev => {
                  const isCompleted = completedIds.has(ev.id);
                  return (
                    <Popover key={ev.id}>
                      <PopoverTrigger asChild>
                        <button
                          className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate border ${
                            isCompleted
                              ? "bg-muted/50 text-muted-foreground line-through border-muted"
                              : categoryColors[ev.category]
                          }`}
                        >
                          {ev.title.length > 20 ? ev.title.slice(0, 20) + "…" : ev.title}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" side="right">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`text-[10px] ${categoryColors[ev.category]}`}>
                              {categoryLabels[ev.category]}
                            </Badge>
                            {ev.formNo && <Badge variant="secondary" className="text-[10px]">{ev.formNo}</Badge>}
                          </div>
                          <p className="font-medium text-sm">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{ev.description}</p>
                          <div className="text-[11px] text-muted-foreground space-y-0.5">
                            <p>📅 {new Date(ev.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                            <p>👤 {ev.applicable}</p>
                            {ev.section && <p>📖 {ev.section}</p>}
                            <p className="text-amber-600">⚠️ {ev.penalty}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={isCompleted ? "outline" : "default"}
                            className="w-full text-xs"
                            onClick={() => toggleComplete(ev.id)}
                          >
                            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => goBack()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-7 w-7 text-primary" />
                Compliance Calendar
              </h1>
              <p className="text-muted-foreground text-sm">FY 2026-27 (1 Apr 2026 – 31 Mar 2027) • All statutory deadlines</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none gap-1.5"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" /> List
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                className="rounded-none gap-1.5"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="h-4 w-4" /> Calendar
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportICS}
              className="gap-2"
            >
              <CalendarPlus className="h-4 w-4" /> Export .ics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button
              variant={notificationsEnabled ? "secondary" : "default"}
              size="sm"
              onClick={enableNotifications}
              className="gap-2"
            >
              {notificationsEnabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              {notificationsEnabled ? "Notifications On" : "Enable Alerts"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {
              if (!window.confirm("Reset all completed status?")) return;
              localStorage.removeItem('compliance_completed_2026');
              setCompletedIds(new Set());
              toast({ title: "Data Reset", description: "All completion status has been cleared." });
            }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {(urgentCount > 0 || overdueCount > 0) && (
          <div className={`mb-4 p-3 rounded-lg border flex items-center gap-3 ${overdueCount > 0 ? "bg-destructive/10 border-destructive/30" : "bg-amber-500/10 border-amber-500/30"}`}>
            <AlertTriangle className={`h-5 w-5 shrink-0 ${overdueCount > 0 ? "text-destructive" : "text-amber-500"}`} />
            <div className="text-sm">
              {overdueCount > 0 && <span className="text-destructive font-semibold">{overdueCount} overdue deadline{overdueCount > 1 ? "s" : ""}! </span>}
              {urgentCount > 0 && <span className="text-amber-600 font-semibold">{urgentCount} deadline{urgentCount > 1 ? "s" : ""} due within 7 days.</span>}
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label className="text-xs">Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual / HUF</SelectItem>
                    <SelectItem value="firm">Partnership Firm</SelectItem>
                    <SelectItem value="llp">LLP</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isGSTRegistered} onCheckedChange={setIsGSTRegistered} id="gst-toggle" />
                <Label htmlFor="gst-toggle" className="text-xs">GST Registered</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isAuditApplicable} onCheckedChange={setIsAuditApplicable} id="audit-toggle" />
                <Label htmlFor="audit-toggle" className="text-xs">Audit Applicable</Label>
              </div>
              {isGSTRegistered && (
                <div className="flex items-center gap-2">
                  <Switch checked={isComposition} onCheckedChange={setIsComposition} id="comp-toggle" />
                  <Label htmlFor="comp-toggle" className="text-xs">Composition Scheme</Label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {Object.entries(categoryCounts).map(([cat, counts]) => (
            <Card key={cat} className={`${counts.upcoming > 0 ? "ring-1 ring-amber-500/50" : ""}`}>
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[11px] text-muted-foreground font-medium">{categoryLabels[cat]}</p>
                <p className="text-xl font-bold">{counts.completed}/{counts.total}</p>
                <div className="flex justify-center gap-1 mt-1">
                  {counts.completed === counts.total ? (
                    <Badge className="text-[10px] bg-green-500/20 text-green-600 border-green-500/30">✓ All Done</Badge>
                  ) : counts.upcoming > 0 ? (
                    <Badge className="text-[10px] bg-amber-500/20 text-amber-600 border-amber-500/30">{counts.upcoming} urgent</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View: List or Calendar */}
        {viewMode === "list" ? (
          <Tabs defaultValue="all">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-xs">All ({filteredEvents.length})</TabsTrigger>
              {Object.entries(categoryCounts).map(([cat, counts]) => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {categoryLabels[cat]} ({counts.total})
                </TabsTrigger>
              ))}
            </TabsList>

            {["all", ...Object.keys(categoryCounts)].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-2">
                {filteredEvents
                  .filter((e) => tab === "all" || e.category === tab)
                  .sort((a, b) => {
                    const aComp = completedIds.has(a.id) ? 1 : 0;
                    const bComp = completedIds.has(b.id) ? 1 : 0;
                    if (aComp !== bComp) return aComp - bComp;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                  })
                  .map(renderEventCard)}
                {filteredEvents.filter((e) => tab === "all" || e.category === tab).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No deadlines found for this filter combination.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          renderCalendarView()
        )}

        {/* Legend */}
        <Card className="mt-6">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">LEGEND</p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Completed</span>
              <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Overdue</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-500" /> Due within 7 days</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> Upcoming</span>
              <span>Click any deadline to mark it as complete/incomplete</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceCalendar;

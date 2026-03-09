import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { useAutoPopulate } from "@/hooks/useAutoPopulate";
import AutoPopulateBadge from "@/components/AutoPopulateBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, CheckCircle, Circle, AlertTriangle, Download, ChevronRight, User, Building, Briefcase, Globe, Link2, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTaxData } from "@/hooks/useTaxData";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  category: string;
}

const itrForms = [
  { form: "ITR-1 (Sahaj)", eligibility: "Salaried individuals with income up to ₹50L from salary, one house property, other sources & agricultural income up to ₹5,000", icon: User, color: "text-green-500" },
  { form: "ITR-2", eligibility: "Individuals/HUFs with income from salary, house property, capital gains, other sources (NO business income)", icon: User, color: "text-blue-500" },
  { form: "ITR-3", eligibility: "Individuals/HUFs with income from business or profession (including partnership firms)", icon: Briefcase, color: "text-amber-500" },
  { form: "ITR-4 (Sugam)", eligibility: "Individuals/HUFs/Firms with presumptive income u/s 44AD, 44ADA, 44AE (turnover up to ₹2Cr/₹75L)", icon: Building, color: "text-purple-500" },
  { form: "ITR-5", eligibility: "Partnership firms, LLPs, AOPs, BOIs, Artificial Juridical Persons", icon: Building, color: "text-orange-500" },
  { form: "ITR-6", eligibility: "Companies other than those claiming exemption u/s 11 (charitable/religious)", icon: Building, color: "text-red-500" },
  { form: "ITR-7", eligibility: "Trusts, political parties, institutions, colleges u/s 139(4A/4B/4C/4D/4E/4F)", icon: Globe, color: "text-teal-500" },
];

const ITRFilingAssistant = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { toast } = useToast();
  const taxData = useTaxData();
  const [assessmentYear, setAssessmentYear] = useState("2026-27");
  const [step, setStep] = useState(1);
  const [autoDetected, setAutoDetected] = useState(false);
  const [userPan, setUserPan] = useState("");

  const { populatedFields, resetField } = useAutoPopulate([
    { key: "pan", setter: setUserPan, defaultValue: "" },
  ]);

  // Wizard answers
  const [residencyStatus, setResidencyStatus] = useState("resident");
  const [hasSalary, setHasSalary] = useState(true);
  const [hasBusinessIncome, setHasBusinessIncome] = useState(false);
  const [hasCapitalGains, setHasCapitalGains] = useState(false);
  const [hasForeignIncome, setHasForeignIncome] = useState(false);
  const [hasMoreThanOneHP, setHasMoreThanOneHP] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [isPartnershipFirm, setIsPartnershipFirm] = useState(false);
  const [incomeAbove50L, setIncomeAbove50L] = useState(false);
  const [presumptiveIncome, setPresumptiveIncome] = useState(false);

  const autoDetectFromData = () => {
    setHasSalary(taxData.salary.hasData);
    setHasBusinessIncome(taxData.business.hasData);
    setHasCapitalGains(taxData.capitalGains.hasData);
    setPresumptiveIncome(taxData.business.isPresumptive);
    setIncomeAbove50L(taxData.grossTotal > 5000000);
    setAutoDetected(true);
    toast({ 
      title: "Income data auto-detected", 
      description: `Found ${[
        taxData.salary.hasData && 'Salary',
        taxData.capitalGains.hasData && 'Capital Gains',
        taxData.business.hasData && 'Business',
        taxData.houseProperty.hasData && 'House Property',
      ].filter(Boolean).join(', ') || 'no'} income sources.`
    });
  };

  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");

  const getRecommendedITR = (): string => {
    if (isCompany) return "ITR-6";
    if (isPartnershipFirm) return "ITR-5";
    if (hasBusinessIncome && presumptiveIncome) return "ITR-4 (Sugam)";
    if (hasBusinessIncome) return "ITR-3";
    if (hasCapitalGains || hasForeignIncome || hasMoreThanOneHP || incomeAbove50L) return "ITR-2";
    if (hasSalary && !hasBusinessIncome && !hasCapitalGains && !hasForeignIncome && !incomeAbove50L) return "ITR-1 (Sahaj)";
    return "ITR-2";
  };

  const recommended = getRecommendedITR();

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "pan", label: "PAN Card", description: "Valid PAN linked with Aadhaar", completed: false, category: "Identity" },
    { id: "aadhaar", label: "Aadhaar Card", description: "Linked with PAN for e-verification", completed: false, category: "Identity" },
    { id: "form16", label: "Form 16", description: "TDS certificate from employer", completed: false, category: "Income" },
    { id: "form16a", label: "Form 16A (if applicable)", description: "TDS on non-salary income", completed: false, category: "Income" },
    { id: "form26as", label: "Form 26AS / AIS", description: "Annual Information Statement", completed: false, category: "Income" },
    { id: "bankstatement", label: "Bank Statements", description: "All savings/current account statements", completed: false, category: "Income" },
    { id: "interest_cert", label: "Interest Certificates", description: "FD/RD/Savings interest certificates", completed: false, category: "Income" },
    { id: "80c_proof", label: "Section 80C Proofs", description: "PPF, ELSS, LIC, EPF statements", completed: false, category: "Deductions" },
    { id: "80d_proof", label: "Health Insurance Receipts (80D)", description: "Mediclaim premium receipts", completed: false, category: "Deductions" },
    { id: "hra_receipts", label: "HRA Rent Receipts", description: "Monthly rent receipts with landlord PAN (if rent > ₹1L)", completed: false, category: "Deductions" },
    { id: "home_loan", label: "Home Loan Statement (if applicable)", description: "Interest & principal breakup certificate", completed: false, category: "Deductions" },
    { id: "capital_gains", label: "Capital Gains Statement", description: "Broker P&L / mutual fund redemption details", completed: false, category: "Capital Gains" },
    { id: "foreign_assets", label: "Foreign Asset Details (if applicable)", description: "Schedule FA for foreign bank accounts, properties, investments", completed: false, category: "Foreign" },
    { id: "advance_tax", label: "Advance Tax Challans", description: "Self-assessment & advance tax payment receipts", completed: false, category: "Tax Payments" },
    { id: "prev_itr", label: "Previous Year ITR", description: "For carry-forward losses reference", completed: false, category: "Others" },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  const categories = [...new Set(checklist.map(c => c.category))];

  const deadlines = [
    { event: "ITR Filing (No audit)", date: "31st July 2026", status: "upcoming" },
    { event: "ITR Filing (Audit cases)", date: "31st October 2026", status: "upcoming" },
    { event: "Belated/Revised ITR", date: "31st December 2026", status: "upcoming" },
    { event: "Updated ITR (ITR-U)", date: "31st March 2028", status: "upcoming" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => goBack()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">ITR Filing Assistant</h1>
            <p className="text-muted-foreground text-sm">Choose the right ITR form & prepare your filing checklist</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <Button variant={step === s ? "default" : step > s ? "secondary" : "outline"} size="sm" onClick={() => setStep(s)}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </Button>
              <span className="text-sm text-muted-foreground hidden md:inline">
                {s === 1 ? "ITR Form Finder" : s === 2 ? "Filing Checklist" : "Deadlines & Tips"}
              </span>
              {s < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Income Summary from other tools */}
            {(taxData.salary.hasData || taxData.capitalGains.hasData || taxData.business.hasData || taxData.houseProperty.hasData) && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      Income Summary (from your data)
                    </CardTitle>
                    {!autoDetected && (
                      <Button size="sm" variant="outline" className="gap-2" onClick={autoDetectFromData}>
                        <Link2 className="h-4 w-4" />
                        Auto-fill Wizard
                      </Button>
                    )}
                    {autoDetected && (
                      <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Auto-detected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Salary", value: taxData.salary.total, has: taxData.salary.hasData },
                      { label: "House Property", value: taxData.houseProperty.total, has: taxData.houseProperty.hasData },
                      { label: "Business", value: taxData.business.total, has: taxData.business.hasData },
                      { label: "Capital Gains", value: taxData.capitalGains.total, has: taxData.capitalGains.hasData },
                      { label: "Deductions", value: taxData.deductions.total, has: taxData.deductions.hasData },
                    ].map(item => (
                      <div key={item.label} className={`p-3 rounded-lg border text-center ${item.has ? 'bg-background' : 'bg-muted/30'}`}>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={`text-sm font-bold ${item.has ? 'text-primary' : 'text-muted-foreground'}`}>
                          {item.has ? formatCurrency(item.value) : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Gross Total Income</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(taxData.grossTotal)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>ITR Form Selection Wizard</CardTitle>
                <CardDescription>Answer a few questions to find the right ITR form for AY {assessmentYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Assessment Year</Label>
                    <Select value={assessmentYear} onValueChange={setAssessmentYear}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-25">AY 2024-25</SelectItem>
                        <SelectItem value="2025-26">AY 2025-26</SelectItem>
                        <SelectItem value="2026-27">AY 2026-27</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Residency Status</Label>
                    <Select value={residencyStatus} onValueChange={setResidencyStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resident">Resident</SelectItem>
                        <SelectItem value="rnor">Resident but Not Ordinarily Resident (RNOR)</SelectItem>
                        <SelectItem value="nri">Non-Resident (NRI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Salary Income?", value: hasSalary, setter: setHasSalary },
                    { label: "Business/Professional Income?", value: hasBusinessIncome, setter: setHasBusinessIncome },
                    { label: "Capital Gains?", value: hasCapitalGains, setter: setHasCapitalGains },
                    { label: "Foreign Income/Assets?", value: hasForeignIncome, setter: setHasForeignIncome },
                    { label: "More than one House Property?", value: hasMoreThanOneHP, setter: setHasMoreThanOneHP },
                    { label: "Total Income > ₹50 Lakhs?", value: incomeAbove50L, setter: setIncomeAbove50L },
                    { label: "Company?", value: isCompany, setter: setIsCompany },
                    { label: "Partnership Firm / LLP?", value: isPartnershipFirm, setter: setIsPartnershipFirm },
                    { label: "Presumptive Taxation (44AD/44ADA)?", value: presumptiveIncome, setter: setPresumptiveIncome },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border">
                      <Label className="text-sm">{item.label}</Label>
                      <Switch checked={item.value} onCheckedChange={item.setter} />
                    </div>
                  ))}
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended ITR Form</p>
                        <p className="text-xl font-bold text-primary">{recommended}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>All ITR Forms Reference</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {itrForms.map(f => (
                  <div key={f.form} className={`p-4 rounded-lg border ${recommended === f.form ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <f.icon className={`h-5 w-5 mt-0.5 ${f.color}`} />
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {f.form}
                          {recommended === f.form && <Badge className="bg-primary">Recommended</Badge>}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{f.eligibility}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next: Filing Checklist <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pre-Filing Checklist</span>
                  <Badge variant="outline">{completedCount}/{checklist.length} completed</Badge>
                </CardTitle>
                <Progress value={progress} className="mt-2" />
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={categories}>
                  {categories.map(cat => (
                    <AccordionItem key={cat} value={cat}>
                      <AccordionTrigger className="text-sm font-semibold">{cat}</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {checklist.filter(c => c.category === cat).map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => toggleChecklist(item.id)}>
                            {item.completed ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />}
                            <div>
                              <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
              <Button onClick={() => setStep(3)}>Next: Deadlines <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Filing Deadlines (AY {assessmentYear})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {deadlines.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{d.event}</p>
                      <p className="text-sm text-muted-foreground">{d.date}</p>
                    </div>
                    <Badge variant="secondary">{d.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Filing Tips</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Always verify Form 26AS / AIS before filing – reconcile TDS credits",
                  "Link PAN with Aadhaar before filing to avoid processing delays",
                  "Disclose all bank accounts including dormant ones in the ITR",
                  "Report foreign assets in Schedule FA even if no income is earned",
                  "Claim carry-forward losses only if previous year ITR was filed on time",
                  "Use e-verification (Aadhaar OTP) within 30 days of filing",
                  "Keep all proofs for 6 years from end of assessment year",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ITRFilingAssistant;

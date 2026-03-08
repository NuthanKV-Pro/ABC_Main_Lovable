import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Clock, Shield, Search, Info, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface TaxNotice {
  section: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reason: string[];
  responseDeadline: string;
  howToRespond: string[];
  documents: string[];
  consequences: string;
  template: string;
}

const notices: TaxNotice[] = [
  {
    section: "139(9)",
    title: "Defective Return Notice",
    severity: "low",
    description: "Your ITR has been found defective due to incomplete/incorrect information",
    reason: ["Missing schedules (CG, OS, etc.)", "Mismatch between income declared and Form 26AS/AIS", "Incorrect tax computation", "Missing audit report"],
    responseDeadline: "15 days from receipt (extendable)",
    howToRespond: ["Login to income tax portal", "Go to e-File → Response to Outstanding Demand", "File revised/corrected return online", "Attach corrected schedules"],
    documents: ["Original ITR filed", "Form 26AS/AIS", "Corrected computation"],
    consequences: "If not responded within 15 days, return treated as invalid (never filed)",
    template: `To,\nThe Assessing Officer,\n[Ward/Circle details]\n\nSub: Response to Notice u/s 139(9) – Defective Return – AY [____]\n\nRef: Notice No. [____] dated [____]\n\nDear Sir/Madam,\n\nWith reference to the above notice, I hereby submit the corrected/revised return rectifying the defects pointed out:\n\n1. [Defect 1] – Corrected by [action taken]\n2. [Defect 2] – Corrected by [action taken]\n\nI request you to kindly accept the corrected return and process the same.\n\nThanking you,\n[Your Name]\n[PAN]\n[Date]`
  },
  {
    section: "143(1)",
    title: "Intimation – Processing of Return",
    severity: "low",
    description: "Automated intimation after CPC processes your return – may show refund, demand, or nil",
    reason: ["Automated processing by CPC Bengaluru", "Adjustments made for arithmetic errors, incorrect claims, TDS mismatch"],
    responseDeadline: "30 days if demand raised (for rectification u/s 154)",
    howToRespond: ["Check if adjustments are correct", "If demand: Pay online or file rectification u/s 154", "If refund reduced: File rectification with correct details"],
    documents: ["Original ITR", "Form 26AS", "TDS certificates", "Proof of deductions claimed"],
    consequences: "If demand not paid/rectified, interest u/s 220(2) at 1% per month",
    template: `To,\nCPC Bengaluru / The Assessing Officer\n\nSub: Rectification Request u/s 154 against Intimation u/s 143(1) – AY [____]\n\nRef: Intimation dated [____], DIN: [____]\n\nDear Sir/Madam,\n\nI have received the intimation u/s 143(1) showing a demand of ₹[____]. I submit that the demand is incorrect due to:\n\n1. [Reason – e.g., TDS credit not given for ₹____ as per Form 26AS]\n2. [Reason]\n\nI request rectification u/s 154 and processing of the correct refund/nil demand.\n\nEnclosed: [List documents]\n\nThanking you,\n[Your Name]\n[PAN]`
  },
  {
    section: "143(2)",
    title: "Scrutiny Assessment Notice",
    severity: "high",
    description: "Your return has been selected for detailed scrutiny by the Assessing Officer",
    reason: ["High-value transactions", "Income mismatch with AIR/SFT data", "Random selection / CASS (Computer Aided Scrutiny Selection)", "Large refund claims", "Significant change in income pattern"],
    responseDeadline: "As specified in notice (usually 15-30 days)",
    howToRespond: ["Engage a CA/Tax Lawyer immediately", "Gather all supporting documents", "Attend hearings (physical/virtual) as scheduled", "Submit written submissions with evidence"],
    documents: ["All ITR schedules", "Bank statements", "Investment proofs", "Capital gains computation", "Business books (if applicable)", "Valuation reports"],
    consequences: "AO can make additions to income → higher tax + penalty u/s 270A (50-200%)",
    template: `To,\nThe Assessing Officer,\n[Ward/Circle]\n\nSub: Response to Notice u/s 143(2) – Scrutiny Assessment – AY [____]\n\nRef: Notice dated [____]\n\nRespected Sir/Madam,\n\nIn response to the above notice, I submit the following:\n\n1. Income as declared in ITR: ₹[____]\n2. Details of queries raised:\n   a) [Query 1]: [Response with supporting evidence]\n   b) [Query 2]: [Response with supporting evidence]\n\nAll supporting documents are enclosed herewith.\n\nI request for completion of assessment without any adverse additions.\n\nThanking you,\n[Your Name]\n[PAN]`
  },
  {
    section: "148 / 148A",
    title: "Income Escaping Assessment (Reassessment)",
    severity: "critical",
    description: "AO believes income has escaped assessment in a previous year – reopening of old case",
    reason: ["Information from investigation wing", "Undisclosed bank deposits", "Property transactions not reported", "Foreign assets/income not disclosed", "Info from SFT/AIR mismatch"],
    responseDeadline: "As specified – minimum 7 to 30 days for 148A response",
    howToRespond: ["File objections to 148A notice within time", "Challenge if beyond time limit (3 years normally, 10 years if ₹50L+ escaped)", "Engage experienced tax lawyer", "File revised return if reopening is valid"],
    documents: ["Original ITR for that year", "Bank statements for that year", "All transaction records", "Legal opinions if challenging"],
    consequences: "Income additions + 50-200% penalty + prosecution in serious cases",
    template: `To,\nThe Assessing Officer,\n[Ward/Circle]\n\nSub: Reply to Notice u/s 148A(b) – AY [____]\n\nRef: Notice No. [____] dated [____]\n\nDear Sir/Madam,\n\nI have received the above notice proposing to reopen assessment for AY [____]. I submit my objections as follows:\n\n1. The information relied upon is factually incorrect because [____]\n2. The income alleged to have escaped assessment was duly disclosed in [____]\n3. The notice is time-barred as per section 149 because [____]\n\nI request that the proposed reassessment proceedings be dropped.\n\nEnclosed: [Supporting documents]\n\n[Your Name]\n[PAN]\n[Date]`
  },
  {
    section: "245",
    title: "Set-off of Refund Against Demand",
    severity: "medium",
    description: "Department proposes to adjust your refund against outstanding tax demand",
    reason: ["Pending demand from previous years", "143(1) demand not resolved", "Mismatch in TDS credits"],
    responseDeadline: "30 days from receipt",
    howToRespond: ["If demand is valid: Accept adjustment", "If demand is disputed: File response objecting to set-off", "File rectification u/s 154 for incorrect demand first"],
    documents: ["Demand notice", "Rectification request", "Proof of tax paid"],
    consequences: "Refund will be adjusted if no response within 30 days",
    template: `To,\nThe Assessing Officer\n\nSub: Objection to proposed set-off u/s 245 – AY [____]\n\nRef: Notice dated [____]\n\nI object to the proposed set-off of my refund of ₹[____] against the demand of ₹[____] for AY [____] because:\n\n1. The demand is incorrect and rectification u/s 154 has been filed\n2. [Other reasons]\n\nI request that the refund be processed without adjustment.\n\n[Your Name]\n[PAN]`
  },
  {
    section: "156",
    title: "Notice of Demand",
    severity: "high",
    description: "Formal demand for payment of tax, interest, penalty or any sum payable under the Act",
    reason: ["Assessment completed with additions", "Penalty levied", "Interest computed"],
    responseDeadline: "30 days from receipt",
    howToRespond: ["Pay if demand is correct", "File appeal u/s 246A to CIT(A) if you disagree", "Apply for stay of demand if filing appeal", "File rectification u/s 154 for errors"],
    documents: ["Assessment order", "Demand notice", "Computation of income", "Proof of taxes paid"],
    consequences: "Interest at 1% per month on unpaid demand; Recovery proceedings",
    template: `To,\nThe Assessing Officer\n\nSub: Response to Demand Notice u/s 156 – AY [____]\n\nRef: Demand Notice dated [____]\n\nI am in receipt of the demand notice raising a demand of ₹[____].\n\n[Option A]: I have paid the demand via challan No. [____] dated [____].\n[Option B]: I disagree with the demand and am filing appeal u/s 246A. I request stay of demand pending appeal.\n\n[Your Name]\n[PAN]`
  },
  {
    section: "131(1A)",
    title: "Survey Notice",
    severity: "medium",
    description: "Income tax survey at business premises to verify books, cash, stock",
    reason: ["Suspected underreporting", "Cash-intensive business", "Information from third parties"],
    responseDeadline: "Cooperate during survey",
    howToRespond: ["Allow access to business premises", "Provide books of accounts as requested", "Provide statement on oath if asked", "Engage CA immediately"],
    documents: ["Books of accounts", "Bank statements", "Stock register", "Cash book"],
    consequences: "Findings used in assessment; Non-cooperation leads to penalty",
    template: ""
  },
];

const TaxNoticeAssistant = () => {
  const navigate = useNavigate();
  const [selectedNotice, setSelectedNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotices = notices.filter(n =>
    n.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "medium": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "high": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      case "critical": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "";
    }
  };

  const activeNotice = selectedNotice ? notices.find(n => n.section === selectedNotice) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tax Notice Assistant</h1>
            <p className="text-muted-foreground text-sm">Understand IT notices, get response templates & deadline tracking</p>
          </div>
        </div>

        {!activeNotice ? (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search by section (e.g., 143, 148) or keyword..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>

            {/* Notice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotices.map(notice => (
                <Card key={notice.section} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedNotice(notice.section)}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono">Sec {notice.section}</Badge>
                          <Badge className={getSeverityColor(notice.severity)}>{notice.severity.toUpperCase()}</Badge>
                        </div>
                        <p className="font-semibold mt-2">{notice.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{notice.description}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Response: {notice.responseDeadline}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Reference */}
            <Card className="mt-6">
              <CardHeader><CardTitle className="text-lg">What to Do When You Receive a Tax Notice</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Don't panic – Most notices are routine (143(1), 139(9))",
                  "Check the section number first – It tells you the nature and severity",
                  "Note the response deadline – Missing it can have serious consequences",
                  "Verify the notice is genuine – Check on incometax.gov.in under 'e-Proceedings'",
                  "Never ignore a notice – Even if you think it's wrong, respond within time",
                  "For high-severity notices (143(2), 148) – Engage a qualified CA/Tax Lawyer immediately",
                  "Keep copies of all responses and acknowledgments",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Button variant="outline" className="mb-6" onClick={() => setSelectedNotice(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to all notices
            </Button>

            <div className="space-y-6">
              {/* Header */}
              <Card className={`${activeNotice.severity === 'critical' ? 'border-destructive/40' : activeNotice.severity === 'high' ? 'border-orange-500/40' : 'border-border'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="font-mono text-lg px-3 py-1">Section {activeNotice.section}</Badge>
                    <Badge className={getSeverityColor(activeNotice.severity)}>{activeNotice.severity.toUpperCase()}</Badge>
                  </div>
                  <h2 className="text-xl font-bold">{activeNotice.title}</h2>
                  <p className="text-muted-foreground mt-2">{activeNotice.description}</p>
                  <div className="flex items-center gap-2 mt-3"><Clock className="h-4 w-4 text-amber-500" /><span className="text-sm font-medium text-amber-500">Response deadline: {activeNotice.responseDeadline}</span></div>
                </CardContent>
              </Card>

              {/* Why You Received */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Why You Received This Notice</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {activeNotice.reason.map((r, i) => (
                    <div key={i} className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><p className="text-sm">{r}</p></div>
                  ))}
                </CardContent>
              </Card>

              {/* How to Respond */}
              <Card>
                <CardHeader><CardTitle className="text-lg">How to Respond</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {activeNotice.howToRespond.map((step, i) => (
                    <div key={i} className="flex items-start gap-2"><span className="text-sm font-bold text-primary min-w-[24px]">{i + 1}.</span><p className="text-sm">{step}</p></div>
                  ))}
                </CardContent>
              </Card>

              {/* Documents Needed */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Documents Required</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {activeNotice.documents.map((doc, i) => (
                    <div key={i} className="flex items-start gap-2"><FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" /><p className="text-sm">{doc}</p></div>
                  ))}
                </CardContent>
              </Card>

              {/* Consequences */}
              <Card className="border-destructive/20">
                <CardHeader><CardTitle className="text-lg text-destructive">Consequences of Non-Response</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm">{activeNotice.consequences}</p>
                </CardContent>
              </Card>

              {/* Response Template */}
              {activeNotice.template && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Response Template</CardTitle>
                    <CardDescription>Customize this template for your situation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea className="font-mono text-sm" rows={15} defaultValue={activeNotice.template} />
                    <p className="text-xs text-muted-foreground mt-3">⚠ This is a basic template. For complex cases (scrutiny, reassessment), always consult a CA/Tax Lawyer.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaxNoticeAssistant;

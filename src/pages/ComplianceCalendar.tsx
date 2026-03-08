import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, CheckCircle, Clock, AlertTriangle, Building, FileText, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComplianceEvent {
  id: string;
  title: string;
  dueDate: string;
  category: 'income-tax' | 'gst' | 'roc' | 'tds' | 'audit';
  applicable: string;
  description: string;
  penalty: string;
  completed: boolean;
}

const ComplianceCalendar = () => {
  const navigate = useNavigate();
  const [fy, setFY] = useState("2025-26");
  const [entityType, setEntityType] = useState("company");
  const [isGSTRegistered, setIsGSTRegistered] = useState(true);
  const [isAuditApplicable, setIsAuditApplicable] = useState(true);

  const [events, setEvents] = useState<ComplianceEvent[]>([
    // Income Tax
    { id: "at1", title: "Advance Tax – 1st Installment (15%)", dueDate: "2025-06-15", category: "income-tax", applicable: "All", description: "Pay 15% of estimated tax liability", penalty: "Interest u/s 234C", completed: false },
    { id: "at2", title: "Advance Tax – 2nd Installment (45%)", dueDate: "2025-09-15", category: "income-tax", applicable: "All", description: "Pay 45% cumulative of estimated tax", penalty: "Interest u/s 234C", completed: false },
    { id: "at3", title: "Advance Tax – 3rd Installment (75%)", dueDate: "2025-12-15", category: "income-tax", applicable: "All", description: "Pay 75% cumulative of estimated tax", penalty: "Interest u/s 234C", completed: false },
    { id: "at4", title: "Advance Tax – 4th Installment (100%)", dueDate: "2026-03-15", category: "income-tax", applicable: "All", description: "Pay 100% of estimated tax", penalty: "Interest u/s 234B & 234C", completed: false },
    { id: "itr1", title: "ITR Filing (Non-audit)", dueDate: "2026-07-31", category: "income-tax", applicable: "Individual/HUF", description: "Due date for filing ITR without audit", penalty: "₹5,000 late fee u/s 234F", completed: false },
    { id: "itr2", title: "ITR Filing (Audit cases)", dueDate: "2026-10-31", category: "income-tax", applicable: "Company/Audit", description: "Due date for audit cases", penalty: "₹5,000 late fee + interest", completed: false },
    { id: "itr3", title: "Belated/Revised ITR", dueDate: "2026-12-31", category: "income-tax", applicable: "All", description: "Last date for belated or revised return", penalty: "₹10,000 late fee if income > ₹5L", completed: false },

    // TDS
    { id: "tds-q1", title: "TDS Return – Q1 (Apr-Jun)", dueDate: "2025-07-31", category: "tds", applicable: "Deductors", description: "File Form 24Q/26Q/27Q for Q1", penalty: "₹200/day late fee u/s 234E", completed: false },
    { id: "tds-q2", title: "TDS Return – Q2 (Jul-Sep)", dueDate: "2025-10-31", category: "tds", applicable: "Deductors", description: "File TDS return for Q2", penalty: "₹200/day late fee", completed: false },
    { id: "tds-q3", title: "TDS Return – Q3 (Oct-Dec)", dueDate: "2026-01-31", category: "tds", applicable: "Deductors", description: "File TDS return for Q3", penalty: "₹200/day late fee", completed: false },
    { id: "tds-q4", title: "TDS Return – Q4 (Jan-Mar)", dueDate: "2026-05-31", category: "tds", applicable: "Deductors", description: "File TDS return for Q4", penalty: "₹200/day late fee", completed: false },

    // GST
    { id: "gstr1-apr", title: "GSTR-1 (April)", dueDate: "2025-05-11", category: "gst", applicable: "GST Registered", description: "Outward supply details", penalty: "₹50/day (₹20 NIL)", completed: false },
    { id: "gstr3b-apr", title: "GSTR-3B (April)", dueDate: "2025-05-20", category: "gst", applicable: "GST Registered", description: "Monthly summary return with tax payment", penalty: "₹50/day + 18% interest", completed: false },
    { id: "gstr9", title: "GSTR-9 Annual Return", dueDate: "2025-12-31", category: "gst", applicable: "GST Registered (>₹2Cr)", description: "Annual return for FY 2024-25", penalty: "₹200/day max ₹0.5% of turnover", completed: false },

    // ROC
    { id: "aoc4", title: "AOC-4 (Financial Statements)", dueDate: "2025-11-29", category: "roc", applicable: "Company", description: "Filing of financial statements with MCA", penalty: "₹100/day additional fee", completed: false },
    { id: "mgt7", title: "MGT-7 (Annual Return)", dueDate: "2025-12-28", category: "roc", applicable: "Company", description: "Annual return with MCA", penalty: "₹100/day additional fee", completed: false },
    { id: "adt1", title: "ADT-1 (Auditor Appointment)", dueDate: "2025-10-14", category: "roc", applicable: "Company", description: "Intimation of auditor appointment to ROC within 15 days of AGM", penalty: "₹300/day", completed: false },
    { id: "agm", title: "Annual General Meeting", dueDate: "2025-09-30", category: "roc", applicable: "Company", description: "Hold AGM within 6 months from FY end", penalty: "₹1L on company + ₹5,000 on officers", completed: false },
    { id: "dir3kyc", title: "DIR-3 KYC (Directors)", dueDate: "2025-09-30", category: "roc", applicable: "All Directors", description: "Annual KYC for all directors", penalty: "₹5,000 late fee", completed: false },
    { id: "llp-form8", title: "LLP Form 8 (Statement of Account)", dueDate: "2025-10-30", category: "roc", applicable: "LLP", description: "Statement of accounts & solvency", penalty: "₹100/day", completed: false },
    { id: "llp-form11", title: "LLP Form 11 (Annual Return)", dueDate: "2026-05-30", category: "roc", applicable: "LLP", description: "Annual return for LLP", penalty: "₹100/day", completed: false },

    // Audit
    { id: "tax-audit", title: "Tax Audit Report (3CA/3CB-3CD)", dueDate: "2026-09-30", category: "audit", applicable: "Audit applicable", description: "Get tax audit completed and report filed", penalty: "0.5% of turnover max ₹1.5L", completed: false },
    { id: "tp-report", title: "Transfer Pricing Report (3CEB)", dueDate: "2026-11-30", category: "audit", applicable: "International transactions >₹1Cr", description: "Transfer pricing audit report", penalty: "₹1L per failure", completed: false },
  ]);

  const toggleComplete = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (e.category === "gst" && !isGSTRegistered) return false;
      if (e.category === "roc" && entityType === "individual") return false;
      if (e.category === "audit" && !isAuditApplicable) return false;
      if (e.applicable === "Company" && entityType !== "company") return false;
      if (e.applicable === "LLP" && entityType !== "llp") return false;
      return true;
    });
  }, [events, entityType, isGSTRegistered, isAuditApplicable]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    filteredEvents.forEach(e => {
      if (!counts[e.category]) counts[e.category] = { total: 0, completed: 0 };
      counts[e.category].total++;
      if (e.completed) counts[e.category].completed++;
    });
    return counts;
  }, [filteredEvents]);

  const getStatusColor = (dueDate: string, completed: boolean) => {
    if (completed) return "text-green-500";
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "text-destructive";
    if (days < 30) return "text-amber-500";
    return "text-muted-foreground";
  };

  const getDaysLabel = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today!";
    return `${days}d remaining`;
  };

  const categoryIcons: Record<string, any> = { "income-tax": FileText, "gst": Receipt, "roc": Building, "tds": FileText, "audit": FileText };
  const categoryLabels: Record<string, string> = { "income-tax": "Income Tax", "gst": "GST", "roc": "ROC / MCA", "tds": "TDS", "audit": "Audit" };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Compliance Calendar</h1>
            <p className="text-muted-foreground text-sm">Track ITR, TDS, GST, ROC & audit deadlines with penalty info</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="firm">Partnership Firm</SelectItem>
                    <SelectItem value="llp">LLP</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={isGSTRegistered} onCheckedChange={setIsGSTRegistered} /><Label className="text-sm">GST Registered</Label></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={isAuditApplicable} onCheckedChange={setIsAuditApplicable} /><Label className="text-sm">Audit Applicable</Label></div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(categoryCounts).map(([cat, counts]) => (
            <Card key={cat}>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">{categoryLabels[cat]}</p>
                <p className="text-lg font-bold">{counts.completed}/{counts.total}</p>
                <Badge variant={counts.completed === counts.total ? "default" : "secondary"} className="text-xs">{counts.completed === counts.total ? "✓ Done" : "Pending"}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Events by Category */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.keys(categoryCounts).map(cat => (
              <TabsTrigger key={cat} value={cat}>{categoryLabels[cat]}</TabsTrigger>
            ))}
          </TabsList>

          {["all", ...Object.keys(categoryCounts)].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {filteredEvents
                .filter(e => tab === "all" || e.category === tab)
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map(event => {
                  const statusColor = getStatusColor(event.dueDate, event.completed);
                  return (
                    <Card key={event.id} className={`cursor-pointer transition-colors hover:bg-muted/50 ${event.completed ? 'opacity-60' : ''}`} onClick={() => toggleComplete(event.id)}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          {event.completed ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> : <Clock className={`h-5 w-5 mt-0.5 shrink-0 ${statusColor}`} />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className={`font-medium ${event.completed ? 'line-through' : ''}`}>{event.title}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{categoryLabels[event.category]}</Badge>
                                <span className={`text-sm font-semibold ${statusColor}`}>{event.completed ? "Done" : getDaysLabel(event.dueDate)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Due: {new Date(event.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                              <span>For: {event.applicable}</span>
                              <span className="text-amber-500">Penalty: {event.penalty}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ComplianceCalendar;

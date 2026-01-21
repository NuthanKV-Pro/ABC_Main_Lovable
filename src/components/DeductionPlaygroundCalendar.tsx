import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, AlertTriangle, CheckCircle, Clock, FileText, CreditCard, Building2, Receipt, CalendarCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaxDeadline {
  id: string;
  title: string;
  date: string;
  type: "advance_tax" | "itr_filing" | "tds" | "investment_proof" | "other";
  description: string;
  priority: "high" | "medium" | "low";
  completed?: boolean;
  actionRequired?: string;
}

interface DeductionPlaygroundCalendarProps {
  financialYear: string;
}

const DeductionPlaygroundCalendar = ({ financialYear }: DeductionPlaygroundCalendarProps) => {
  const { toast } = useToast();
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Generate deadlines based on financial year
  const deadlines = useMemo((): TaxDeadline[] => {
    const fy = financialYear.split('-')[0];
    const ayYear = parseInt(fy) + 1;
    
    return [
      // Advance Tax Deadlines
      {
        id: "at_q1",
        title: "Advance Tax - Q1 (15%)",
        date: `${fy}-06-15`,
        type: "advance_tax",
        description: "Pay 15% of estimated annual tax liability",
        priority: "high",
        actionRequired: "Calculate estimated tax and pay via Challan 280"
      },
      {
        id: "at_q2",
        title: "Advance Tax - Q2 (45%)",
        date: `${fy}-09-15`,
        type: "advance_tax",
        description: "Pay 45% cumulative of estimated annual tax liability",
        priority: "high",
        actionRequired: "Review Q1-Q2 income and pay additional advance tax"
      },
      {
        id: "at_q3",
        title: "Advance Tax - Q3 (75%)",
        date: `${fy}-12-15`,
        type: "advance_tax",
        description: "Pay 75% cumulative of estimated annual tax liability",
        priority: "high",
        actionRequired: "Include bonus/perks received and pay advance tax"
      },
      {
        id: "at_q4",
        title: "Advance Tax - Q4 (100%)",
        date: `${ayYear}-03-15`,
        type: "advance_tax",
        description: "Pay 100% of estimated tax liability for the year",
        priority: "high",
        actionRequired: "Final calculation including all income sources"
      },
      // Investment Proof Deadlines
      {
        id: "inv_proof",
        title: "Investment Proof Submission",
        date: `${ayYear}-01-31`,
        type: "investment_proof",
        description: "Submit investment proofs to employer for TDS calculation",
        priority: "high",
        actionRequired: "Collect all 80C, 80D, HRA receipts and submit to HR"
      },
      {
        id: "80c_deadline",
        title: "Last Date for 80C Investments",
        date: `${ayYear}-03-31`,
        type: "investment_proof",
        description: "Complete all tax-saving investments before FY end",
        priority: "high",
        actionRequired: "Invest in PPF, ELSS, LIC, NPS to maximize 80C benefits"
      },
      {
        id: "nps_80ccd1b",
        title: "NPS Contribution for 80CCD(1B)",
        date: `${ayYear}-03-31`,
        type: "investment_proof",
        description: "Additional ₹50,000 NPS contribution deadline",
        priority: "medium",
        actionRequired: "Make NPS Tier-I contribution for extra ₹50K deduction"
      },
      {
        id: "health_insurance",
        title: "Health Insurance Premium (80D)",
        date: `${ayYear}-03-31`,
        type: "investment_proof",
        description: "Pay health insurance premium for self and parents",
        priority: "medium",
        actionRequired: "Renew or buy health insurance policies"
      },
      // TDS Deadlines
      {
        id: "tds_q1",
        title: "TDS Return - Q1 (Apr-Jun)",
        date: `${fy}-07-31`,
        type: "tds",
        description: "File TDS return for Q1 if you're a deductor",
        priority: "medium",
        actionRequired: "File Form 24Q/26Q/27Q as applicable"
      },
      {
        id: "tds_q2",
        title: "TDS Return - Q2 (Jul-Sep)",
        date: `${fy}-10-31`,
        type: "tds",
        description: "File TDS return for Q2 if you're a deductor",
        priority: "medium",
        actionRequired: "File Form 24Q/26Q/27Q as applicable"
      },
      {
        id: "tds_q3",
        title: "TDS Return - Q3 (Oct-Dec)",
        date: `${ayYear}-01-31`,
        type: "tds",
        description: "File TDS return for Q3 if you're a deductor",
        priority: "medium",
        actionRequired: "File Form 24Q/26Q/27Q as applicable"
      },
      {
        id: "tds_q4",
        title: "TDS Return - Q4 (Jan-Mar)",
        date: `${ayYear}-05-31`,
        type: "tds",
        description: "File TDS return for Q4 if you're a deductor",
        priority: "medium",
        actionRequired: "File Form 24Q/26Q/27Q as applicable"
      },
      // ITR Filing Deadlines
      {
        id: "itr_individual",
        title: "ITR Filing (No Audit)",
        date: `${ayYear}-07-31`,
        type: "itr_filing",
        description: `File ITR for AY ${ayYear}-${ayYear + 1 - 2000} (individuals not requiring audit)`,
        priority: "high",
        actionRequired: "Collect Form 16, bank statements, and file ITR online"
      },
      {
        id: "itr_audit",
        title: "ITR Filing (Audit Cases)",
        date: `${ayYear}-10-31`,
        type: "itr_filing",
        description: `File ITR for AY ${ayYear}-${ayYear + 1 - 2000} (requires audit)`,
        priority: "high",
        actionRequired: "Complete audit and file ITR with audit report"
      },
      {
        id: "itr_belated",
        title: "Belated/Revised Return",
        date: `${ayYear}-12-31`,
        type: "itr_filing",
        description: `Last date for belated or revised return for AY ${ayYear}-${ayYear + 1 - 2000}`,
        priority: "medium",
        actionRequired: "File belated return with late fee if missed original deadline"
      },
      // Other Important Dates
      {
        id: "form16_issue",
        title: "Form 16 Issuance by Employer",
        date: `${ayYear}-06-15`,
        type: "other",
        description: "Employer should issue Form 16 by this date",
        priority: "low",
        actionRequired: "Follow up with HR if not received"
      },
      {
        id: "ais_check",
        title: "Verify AIS/TIS Statement",
        date: `${ayYear}-05-15`,
        type: "other",
        description: "Review Annual Information Statement for discrepancies",
        priority: "medium",
        actionRequired: "Login to income tax portal and verify all transactions"
      }
    ];
  }, [financialYear]);

  const getDaysUntil = (dateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateStr);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (deadline: TaxDeadline) => {
    if (completedItems[deadline.id]) {
      return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
    }
    
    const days = getDaysUntil(deadline.date);
    
    if (days < 0) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
    } else if (days <= 7) {
      return <Badge variant="destructive"><Clock className="w-3 h-3 mr-1" />{days} days left</Badge>;
    } else if (days <= 30) {
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"><Clock className="w-3 h-3 mr-1" />{days} days left</Badge>;
    } else if (days <= 90) {
      return <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />{days} days left</Badge>;
    } else {
      return <Badge variant="outline" className="text-muted-foreground"><Calendar className="w-3 h-3 mr-1" />Upcoming</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "advance_tax": return <CreditCard className="w-4 h-4" />;
      case "itr_filing": return <FileText className="w-4 h-4" />;
      case "tds": return <Receipt className="w-4 h-4" />;
      case "investment_proof": return <Building2 className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "advance_tax": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "itr_filing": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "tds": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "investment_proof": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const markComplete = (id: string) => {
    setCompletedItems(prev => ({ ...prev, [id]: true }));
    toast({
      title: "Marked Complete!",
      description: "Great job staying on top of your tax obligations.",
    });
  };

  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({
          title: "Notifications Enabled",
          description: "You'll receive reminders for upcoming tax deadlines.",
        });
        new Notification("Tax Calendar Reminders Enabled", {
          body: "You'll now receive timely reminders for tax deadlines.",
          icon: "/favicon.ico"
        });
      }
    }
  };

  // Filter and sort deadlines
  const upcomingDeadlines = deadlines
    .filter(d => !completedItems[d.id] && getDaysUntil(d.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const overdueDeadlines = deadlines.filter(d => !completedItems[d.id] && getDaysUntil(d.date) < 0);

  const completedDeadlines = deadlines.filter(d => completedItems[d.id]);

  // Group by type for quick view
  const groupedByType = useMemo(() => {
    const groups: Record<string, TaxDeadline[]> = {
      advance_tax: [],
      investment_proof: [],
      itr_filing: [],
      tds: [],
      other: []
    };
    
    upcomingDeadlines.forEach(d => {
      groups[d.type]?.push(d);
    });
    
    return groups;
  }, [upcomingDeadlines]);

  return (
    <Card className="border-2 border-indigo-200 dark:border-indigo-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <CalendarCheck className="w-5 h-5" />
            Tax Calendar & Reminders
            <Badge variant="outline" className="ml-2">FY {financialYear}</Badge>
          </CardTitle>
          <CardDescription>
            Key deadlines for advance tax, ITR filing, and investment proof submission
          </CardDescription>
        </div>
        {!notificationsEnabled && (
          <Button variant="outline" size="sm" onClick={enableNotifications}>
            <Bell className="w-4 h-4 mr-2" />
            Enable Reminders
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(groupedByType).map(([type, items]) => (
            <div 
              key={type} 
              className={`p-3 rounded-lg ${getTypeColor(type)} text-center`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {getTypeIcon(type)}
                <span className="font-bold text-lg">{items.length}</span>
              </div>
              <div className="text-xs capitalize">
                {type.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        {/* Overdue Section */}
        {overdueDeadlines.length > 0 && (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
            <h4 className="font-semibold text-destructive flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Overdue Deadlines ({overdueDeadlines.length})
            </h4>
            <div className="space-y-2">
              {overdueDeadlines.map(deadline => (
                <div key={deadline.id} className="flex items-center justify-between p-2 bg-background rounded">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(deadline.type)}
                    <span className="font-medium">{deadline.title}</span>
                    <span className="text-xs text-muted-foreground">
                      (Due: {new Date(deadline.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => markComplete(deadline.id)}>
                    Mark Done
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Deadlines ({upcomingDeadlines.length})
          </h4>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {upcomingDeadlines.map(deadline => (
              <div 
                key={deadline.id} 
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className={getTypeColor(deadline.type)}>
                        {getTypeIcon(deadline.type)}
                        <span className="ml-1 capitalize">{deadline.type.replace('_', ' ')}</span>
                      </Badge>
                      {getStatusBadge(deadline)}
                    </div>
                    <h5 className="font-medium">{deadline.title}</h5>
                    <p className="text-sm text-muted-foreground">{deadline.description}</p>
                    {deadline.actionRequired && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        <strong>Action:</strong> {deadline.actionRequired}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(deadline.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="shrink-0"
                    onClick={() => markComplete(deadline.id)}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Section */}
        {completedDeadlines.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed ({completedDeadlines.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {completedDeadlines.map(deadline => (
                <Badge key={deadline.id} variant="secondary" className="bg-green-100 dark:bg-green-900">
                  {deadline.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeductionPlaygroundCalendar;

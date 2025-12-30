import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface TaxEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "itr" | "advance-tax" | "tds" | "tcs" | "other";
  applicableTo: string[];
  percentage?: string;
}

const taxCalendarEvents: TaxEvent[] = [
  // ITR Filing Deadlines
  {
    id: "itr-individual",
    title: "ITR Filing - Individuals (Non-Audit)",
    date: "July 31",
    description: "Due date for filing ITR for individuals, HUF, AOP, BOI (not requiring audit)",
    category: "itr",
    applicableTo: ["Individual", "HUF", "AOP", "BOI"]
  },
  {
    id: "itr-audit",
    title: "ITR Filing - Audit Cases",
    date: "October 31",
    description: "Due date for taxpayers requiring tax audit under section 44AB",
    category: "itr",
    applicableTo: ["Business", "Profession", "Audit Required"]
  },
  {
    id: "itr-tp",
    title: "ITR Filing - Transfer Pricing",
    date: "November 30",
    description: "Due date for taxpayers with international/specified domestic transactions",
    category: "itr",
    applicableTo: ["Transfer Pricing Applicable"]
  },
  {
    id: "itr-revised",
    title: "Revised/Belated ITR",
    date: "December 31",
    description: "Last date to file revised or belated return for previous AY",
    category: "itr",
    applicableTo: ["All Assessees"]
  },
  {
    id: "itr-updated",
    title: "Updated ITR (ITR-U)",
    date: "March 31 (within 2 years)",
    description: "File updated return within 2 years from end of relevant AY",
    category: "itr",
    applicableTo: ["All Assessees"]
  },

  // Advance Tax Deadlines
  {
    id: "adv-tax-q1",
    title: "Advance Tax - 1st Installment",
    date: "June 15",
    description: "15% of total advance tax liability",
    category: "advance-tax",
    applicableTo: ["All Assessees"],
    percentage: "15%"
  },
  {
    id: "adv-tax-q2",
    title: "Advance Tax - 2nd Installment",
    date: "September 15",
    description: "45% of total advance tax liability (cumulative)",
    category: "advance-tax",
    applicableTo: ["All Assessees"],
    percentage: "45%"
  },
  {
    id: "adv-tax-q3",
    title: "Advance Tax - 3rd Installment",
    date: "December 15",
    description: "75% of total advance tax liability (cumulative)",
    category: "advance-tax",
    applicableTo: ["All Assessees"],
    percentage: "75%"
  },
  {
    id: "adv-tax-q4",
    title: "Advance Tax - 4th Installment",
    date: "March 15",
    description: "100% of total advance tax liability",
    category: "advance-tax",
    applicableTo: ["All Assessees"],
    percentage: "100%"
  },
  {
    id: "adv-tax-44ad",
    title: "Advance Tax - Presumptive (44AD/44ADA)",
    date: "March 15",
    description: "Single installment for presumptive taxation",
    category: "advance-tax",
    applicableTo: ["44AD", "44ADA"],
    percentage: "100%"
  },

  // TDS Payment Deadlines
  {
    id: "tds-gov",
    title: "TDS Payment - Government",
    date: "Same day",
    description: "TDS deducted by government must be deposited on same day",
    category: "tds",
    applicableTo: ["Government Deductors"]
  },
  {
    id: "tds-others",
    title: "TDS Payment - Others",
    date: "7th of next month",
    description: "TDS deducted in a month to be deposited by 7th of following month",
    category: "tds",
    applicableTo: ["All Deductors"]
  },
  {
    id: "tds-march",
    title: "TDS Payment - March",
    date: "April 30",
    description: "TDS deducted in March to be deposited by April 30",
    category: "tds",
    applicableTo: ["All Deductors"]
  },
  {
    id: "tds-q1-return",
    title: "TDS Return - Q1 (Apr-Jun)",
    date: "July 31",
    description: "Quarterly TDS return for April to June",
    category: "tds",
    applicableTo: ["All Deductors"]
  },
  {
    id: "tds-q2-return",
    title: "TDS Return - Q2 (Jul-Sep)",
    date: "October 31",
    description: "Quarterly TDS return for July to September",
    category: "tds",
    applicableTo: ["All Deductors"]
  },
  {
    id: "tds-q3-return",
    title: "TDS Return - Q3 (Oct-Dec)",
    date: "January 31",
    description: "Quarterly TDS return for October to December",
    category: "tds",
    applicableTo: ["All Deductors"]
  },
  {
    id: "tds-q4-return",
    title: "TDS Return - Q4 (Jan-Mar)",
    date: "May 31",
    description: "Quarterly TDS return for January to March",
    category: "tds",
    applicableTo: ["All Deductors"]
  },

  // TCS Deadlines
  {
    id: "tcs-payment",
    title: "TCS Payment",
    date: "7th of next month",
    description: "TCS collected in a month to be deposited by 7th of following month",
    category: "tcs",
    applicableTo: ["TCS Collectors"]
  },
  {
    id: "tcs-q1-return",
    title: "TCS Return - Q1 (Apr-Jun)",
    date: "July 15",
    description: "Quarterly TCS return for April to June",
    category: "tcs",
    applicableTo: ["TCS Collectors"]
  },
  {
    id: "tcs-q2-return",
    title: "TCS Return - Q2 (Jul-Sep)",
    date: "October 15",
    description: "Quarterly TCS return for July to September",
    category: "tcs",
    applicableTo: ["TCS Collectors"]
  },
  {
    id: "tcs-q3-return",
    title: "TCS Return - Q3 (Oct-Dec)",
    date: "January 15",
    description: "Quarterly TCS return for October to December",
    category: "tcs",
    applicableTo: ["TCS Collectors"]
  },
  {
    id: "tcs-q4-return",
    title: "TCS Return - Q4 (Jan-Mar)",
    date: "May 15",
    description: "Quarterly TCS return for January to March",
    category: "tcs",
    applicableTo: ["TCS Collectors"]
  },

  // Other Important Dates
  {
    id: "form-16",
    title: "Form 16 Issue",
    date: "June 15",
    description: "Employers must issue Form 16 to employees",
    category: "other",
    applicableTo: ["Employers"]
  },
  {
    id: "form-16a",
    title: "Form 16A Issue",
    date: "15 days from TDS Return filing",
    description: "Issue of TDS certificate for non-salary deductions",
    category: "other",
    applicableTo: ["All Deductors"]
  },
  {
    id: "tax-audit",
    title: "Tax Audit Report",
    date: "September 30",
    description: "Due date for filing tax audit report under section 44AB",
    category: "other",
    applicableTo: ["Audit Required"]
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "itr": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
    case "advance-tax": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30";
    case "tds": return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30";
    case "tcs": return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30";
    case "other": return "bg-muted text-muted-foreground border-border";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "itr": return "ITR Filing";
    case "advance-tax": return "Advance Tax";
    case "tds": return "TDS";
    case "tcs": return "TCS";
    case "other": return "Other";
    default: return category;
  }
};

export default function IncomeTaxCalendar() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredEvents = selectedCategory === "all" 
    ? taxCalendarEvents 
    : taxCalendarEvents.filter(e => e.category === selectedCategory);

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const month = event.date.split(" ")[0];
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {} as Record<string, TaxEvent[]>);

  const monthOrder = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December", 
                      "Same", "15"];

  const sortedMonths = Object.keys(groupedEvents).sort((a, b) => {
    const aIndex = monthOrder.findIndex(m => a.startsWith(m));
    const bIndex = monthOrder.findIndex(m => b.startsWith(m));
    return aIndex - bIndex;
  });

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Income Tax Calendar</CardTitle>
            <CardDescription>Important due dates for ITR, Advance Tax, TDS, and TCS</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="itr">ITR</TabsTrigger>
            <TabsTrigger value="advance-tax">Advance Tax</TabsTrigger>
            <TabsTrigger value="tds">TDS</TabsTrigger>
            <TabsTrigger value="tcs">TCS</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-6">
            {sortedMonths.map(month => (
              <div key={month}>
                <h3 className="text-lg font-semibold mb-3 text-primary">{month}</h3>
                <div className="space-y-3">
                  {groupedEvents[month].map(event => (
                    <div 
                      key={event.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-shrink-0 w-20 text-center">
                        <div className="text-sm font-medium text-muted-foreground">{event.date}</div>
                        {event.percentage && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {event.percentage}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{event.title}</h4>
                          <Badge variant="outline" className={getCategoryColor(event.category)}>
                            {getCategoryLabel(event.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {event.applicableTo.map(type => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center p-3 rounded-lg bg-blue-500/10">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {taxCalendarEvents.filter(e => e.category === "itr").length}
            </div>
            <div className="text-sm text-muted-foreground">ITR Deadlines</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {taxCalendarEvents.filter(e => e.category === "advance-tax").length}
            </div>
            <div className="text-sm text-muted-foreground">Advance Tax Dates</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/10">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {taxCalendarEvents.filter(e => e.category === "tds").length}
            </div>
            <div className="text-sm text-muted-foreground">TDS Dates</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-500/10">
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {taxCalendarEvents.filter(e => e.category === "tcs").length}
            </div>
            <div className="text-sm text-muted-foreground">TCS Dates</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

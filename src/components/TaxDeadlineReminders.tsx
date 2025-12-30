import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Deadline {
  id: string;
  title: string;
  date: string;
  type: "advance_tax" | "itr_filing" | "tds" | "other";
  description: string;
  priority: "high" | "medium" | "low";
  completed?: boolean;
}

const defaultDeadlines: Deadline[] = [
  {
    id: "1",
    title: "Advance Tax - Q3 (75%)",
    date: "2024-12-15",
    type: "advance_tax",
    description: "Pay 75% of estimated tax liability for FY 2024-25",
    priority: "high"
  },
  {
    id: "2",
    title: "Advance Tax - Q4 (100%)",
    date: "2025-03-15",
    type: "advance_tax",
    description: "Pay remaining 25% of estimated tax liability for FY 2024-25",
    priority: "high"
  },
  {
    id: "3",
    title: "ITR Filing - Non-Audit Cases",
    date: "2025-07-31",
    type: "itr_filing",
    description: "Last date to file ITR for individuals not requiring audit",
    priority: "high"
  },
  {
    id: "4",
    title: "ITR Filing - Audit Cases",
    date: "2025-10-31",
    type: "itr_filing",
    description: "Last date to file ITR for cases requiring audit",
    priority: "medium"
  },
  {
    id: "5",
    title: "Belated/Revised Return",
    date: "2025-12-31",
    type: "itr_filing",
    description: "Last date to file belated or revised return for AY 2025-26",
    priority: "medium"
  },
  {
    id: "6",
    title: "Advance Tax - Q1 (15%)",
    date: "2025-06-15",
    type: "advance_tax",
    description: "Pay 15% of estimated tax liability for FY 2025-26",
    priority: "high"
  },
  {
    id: "7",
    title: "Advance Tax - Q2 (45%)",
    date: "2025-09-15",
    type: "advance_tax",
    description: "Pay 45% cumulative of estimated tax liability for FY 2025-26",
    priority: "high"
  },
  {
    id: "8",
    title: "TDS Return - Q3",
    date: "2025-01-31",
    type: "tds",
    description: "File TDS return for Q3 (Oct-Dec 2024)",
    priority: "medium"
  },
  {
    id: "9",
    title: "TDS Return - Q4",
    date: "2025-05-31",
    type: "tds",
    description: "File TDS return for Q4 (Jan-Mar 2025)",
    priority: "medium"
  }
];

const TaxDeadlineReminders = () => {
  const { toast } = useToast();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Load deadlines from localStorage or use defaults
    const saved = localStorage.getItem('tax_deadlines');
    if (saved) {
      setDeadlines(JSON.parse(saved));
    } else {
      setDeadlines(defaultDeadlines);
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tax_deadlines', JSON.stringify(deadlines));
  }, [deadlines]);

  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({
          title: "Notifications Enabled",
          description: "You'll receive reminders for upcoming tax deadlines.",
        });
        
        // Schedule a test notification
        new Notification("Tax Deadline Reminders Enabled", {
          body: "You'll now receive timely reminders for tax deadlines.",
          icon: "/favicon.ico"
        });
      }
    }
  };

  const markComplete = (id: string) => {
    setDeadlines(prev => 
      prev.map(d => d.id === id ? { ...d, completed: true } : d)
    );
    toast({
      title: "Deadline Marked Complete",
      description: "Great job staying on top of your tax obligations!",
    });
  };

  const getDaysUntil = (dateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateStr);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (deadline: Deadline) => {
    if (deadline.completed) {
      return <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
    }
    
    const days = getDaysUntil(deadline.date);
    
    if (days < 0) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
    } else if (days <= 7) {
      return <Badge variant="destructive"><Clock className="w-3 h-3 mr-1" />{days} days left</Badge>;
    } else if (days <= 30) {
      return <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" />{days} days left</Badge>;
    } else {
      return <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />{days} days left</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "advance_tax": return "bg-primary/10 text-primary";
      case "itr_filing": return "bg-blue-100 text-blue-700";
      case "tds": return "bg-purple-100 text-purple-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const upcomingDeadlines = deadlines
    .filter(d => !d.completed && getDaysUntil(d.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const overdueDeadlines = deadlines.filter(d => !d.completed && getDaysUntil(d.date) < 0);

  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Tax Deadline Reminders
          </CardTitle>
        </div>
        {!notificationsEnabled && (
          <Button variant="outline" size="sm" onClick={enableNotifications}>
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueDeadlines.length > 0 && (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
            <h4 className="font-semibold text-destructive flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Overdue Deadlines ({overdueDeadlines.length})
            </h4>
            <div className="space-y-2">
              {overdueDeadlines.map(deadline => (
                <div key={deadline.id} className="flex items-center justify-between text-sm">
                  <span>{deadline.title}</span>
                  <Button size="sm" variant="outline" onClick={() => markComplete(deadline.id)}>
                    Mark Done
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground">Upcoming Deadlines</h4>
          {upcomingDeadlines.map(deadline => (
            <div 
              key={deadline.id} 
              className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={getTypeColor(deadline.type)}>
                    {deadline.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {getStatusBadge(deadline)}
                </div>
                <h5 className="font-medium">{deadline.title}</h5>
                <p className="text-sm text-muted-foreground">{deadline.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Due: {new Date(deadline.date).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              {!deadline.completed && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="ml-2"
                  onClick={() => markComplete(deadline.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxDeadlineReminders;

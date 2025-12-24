import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Bell, CalendarDays, AlertTriangle } from "lucide-react";

interface Reminder {
  id: string;
  date: Date;
  title: string;
  section: string;
  description: string;
  priority: "high" | "medium" | "low";
}

const defaultReminders: Reminder[] = [
  { id: "1", date: new Date(2025, 2, 31), title: "PPF Investment Deadline", section: "80C", description: "Last date to invest in PPF for FY 2024-25", priority: "high" },
  { id: "2", date: new Date(2025, 2, 31), title: "ELSS Investment Deadline", section: "80C", description: "Last date to invest in ELSS for FY 2024-25", priority: "high" },
  { id: "3", date: new Date(2025, 2, 31), title: "Health Insurance Premium", section: "80D", description: "Pay health insurance premium before end of FY", priority: "high" },
  { id: "4", date: new Date(2025, 2, 31), title: "NPS Contribution", section: "80CCD", description: "Additional ₹50,000 deduction under 80CCD(1B)", priority: "medium" },
  { id: "5", date: new Date(2025, 5, 15), title: "Advance Tax - Q1", section: "Tax Payment", description: "First installment of advance tax (15%)", priority: "high" },
  { id: "6", date: new Date(2025, 8, 15), title: "Advance Tax - Q2", section: "Tax Payment", description: "Second installment of advance tax (45%)", priority: "high" },
  { id: "7", date: new Date(2025, 11, 15), title: "Advance Tax - Q3", section: "Tax Payment", description: "Third installment of advance tax (75%)", priority: "high" },
  { id: "8", date: new Date(2026, 2, 15), title: "Advance Tax - Q4", section: "Tax Payment", description: "Fourth installment of advance tax (100%)", priority: "high" },
  { id: "9", date: new Date(2025, 6, 31), title: "ITR Filing Deadline", section: "Compliance", description: "Last date to file ITR without late fee", priority: "high" },
  { id: "10", date: new Date(2025, 2, 31), title: "Life Insurance Premium", section: "80C", description: "Pay LIC premium for 80C deduction", priority: "medium" },
  { id: "11", date: new Date(2025, 2, 31), title: "Education Loan Interest", section: "80E", description: "Claim education loan interest deduction", priority: "low" },
  { id: "12", date: new Date(2025, 2, 31), title: "Donation to Charity", section: "80G", description: "Make eligible donations for 80G deduction", priority: "low" },
];

const TaxPlanningCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reminders] = useState<Reminder[]>(defaultReminders);

  const getRemindersForDate = (date: Date) => {
    return reminders.filter(
      r => r.date.toDateString() === date.toDateString()
    );
  };

  const upcomingReminders = reminders
    .filter(r => r.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-primary text-primary-foreground";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted";
    }
  };

  const hasReminder = (date: Date) => {
    return reminders.some(r => r.date.toDateString() === date.toDateString());
  };

  return (
    <Card className="border-2 mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <CardTitle>Tax Planning Calendar</CardTitle>
        </div>
        <CardDescription>Investment deadlines and tax payment reminders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                reminder: (date) => hasReminder(date)
              }}
              modifiersStyles={{
                reminder: { backgroundColor: 'hsl(var(--primary) / 0.2)', fontWeight: 'bold' }
              }}
            />
          </div>

          {/* Upcoming Reminders */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div 
                  key={reminder.id}
                  className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-sm">{reminder.title}</h4>
                    <Badge className={`text-xs ${getPriorityColor(reminder.priority)}`}>
                      {reminder.section}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{reminder.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    {reminder.priority === "high" && (
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                    )}
                    <span className={reminder.priority === "high" ? "text-destructive font-medium" : "text-muted-foreground"}>
                      {reminder.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Date Reminders */}
        {selectedDate && getRemindersForDate(selectedDate).length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-semibold mb-2">
              Reminders for {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h4>
            <ul className="space-y-2">
              {getRemindersForDate(selectedDate).map((reminder) => (
                <li key={reminder.id} className="flex items-center gap-2">
                  <Badge className={getPriorityColor(reminder.priority)}>{reminder.section}</Badge>
                  <span className="text-sm">{reminder.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxPlanningCalendar;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GraduationCap, TrendingUp, AlertTriangle } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import ExportButton from "@/components/ExportButton";
import { ExportConfig } from "@/utils/unifiedExport";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const COURSE_PRESETS: Record<string, { india: number; abroad: number; years: number }> = {
  "Engineering (B.Tech)": { india: 400000, abroad: 2500000, years: 4 },
  "Medical (MBBS)": { india: 800000, abroad: 4000000, years: 5 },
  "MBA": { india: 1000000, abroad: 5000000, years: 2 },
  "Arts/Science (UG)": { india: 100000, abroad: 1500000, years: 3 },
  "Masters (MS/MA)": { india: 200000, abroad: 3000000, years: 2 },
  "Custom": { india: 0, abroad: 0, years: 4 },
};

const SAVINGS_VEHICLES = [
  { name: "SSY (Sukanya Samriddhi)", rate: 8.2, taxFree: true, lock: "21 years (girl child)" },
  { name: "PPF", rate: 7.1, taxFree: true, lock: "15 years" },
  { name: "Equity Mutual Funds", rate: 12, taxFree: false, lock: "None (3yr LTCG)" },
  { name: "FD (Bank)", rate: 7, taxFree: false, lock: "5 years (tax saver)" },
  { name: "Education Loan", rate: 8.5, taxFree: false, lock: "Sec 80E interest deduction" },
];

const EducationCostPlanner = () => {
  const goBack = useGoBack();
  const [isAbroad, setIsAbroad] = useState(false);
  const [courseType, setCourseType] = useState("Engineering (B.Tech)");
  const [annualCost, setAnnualCost] = useState(400000);
  const [duration, setDuration] = useState(4);
  const [yearsToStart, setYearsToStart] = useState(10);
  const [inflationRate, setInflationRate] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(0);

  // When course changes, update defaults
  const handleCourseChange = (course: string) => {
    setCourseType(course);
    const preset = COURSE_PRESETS[course];
    if (preset && course !== "Custom") {
      setAnnualCost(isAbroad ? preset.abroad : preset.india);
      setDuration(preset.years);
    }
  };

  const handleToggle = (abroad: boolean) => {
    setIsAbroad(abroad);
    setInflationRate(abroad ? 4 : 6);
    const preset = COURSE_PRESETS[courseType];
    if (preset && courseType !== "Custom") setAnnualCost(abroad ? preset.abroad : preset.india);
  };

  // Future cost
  const futureCostPerYear = annualCost * Math.pow(1 + inflationRate / 100, yearsToStart);
  const totalFutureCost = futureCostPerYear * duration;

  // Savings projections
  const vehicleProjections = SAVINGS_VEHICLES.map(v => {
    const monthlyRate = v.rate / 100 / 12;
    const months = yearsToStart * 12;
    // Required monthly SIP to reach target
    const target = totalFutureCost - currentSavings * Math.pow(1 + v.rate / 100, yearsToStart);
    const requiredSIP = target > 0 && monthlyRate > 0
      ? target * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1)
      : 0;
    // Corpus from ₹10,000/mo
    const sampleCorpus = 10000 * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate + currentSavings * Math.pow(1 + v.rate / 100, yearsToStart);
    return { ...v, requiredSIP: Math.max(0, Math.round(requiredSIP)), sampleCorpus: Math.round(sampleCorpus) };
  });

  const gap = totalFutureCost - currentSavings * Math.pow(1 + 0.10, yearsToStart);

  const getExportConfig = (): ExportConfig => ({
    title: "Education Cost Planner Report", fileNamePrefix: "education-cost-plan",
    sections: [
      { title: "Plan Details", keyValues: [["Course", courseType], ["Location", isAbroad ? "Abroad" : "India"], ["Annual Cost (Today)", fmt(annualCost)], ["Duration", `${duration} years`], ["Years to Start", String(yearsToStart)], ["Inflation", `${inflationRate}%`]] },
      { title: "Future Cost", keyValues: [["Per Year (Future)", fmt(futureCostPerYear)], ["Total Future Cost", fmt(totalFutureCost)]] },
      { title: "Savings Vehicles", table: { head: ["Vehicle", "Rate", "Required SIP"], body: vehicleProjections.map(v => [v.name, `${v.rate}%`, fmt(v.requiredSIP)]) } },
    ]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" /> Education Cost Planner</h1>
              <p className="text-sm text-muted-foreground">Project future education costs & compare savings options</p>
            </div>
          </div>
          <ExportButton getConfig={getExportConfig} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-lg">Plan Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Study Abroad?</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">India</span>
                  <Switch checked={isAbroad} onCheckedChange={handleToggle} />
                  <span className="text-sm text-muted-foreground">Abroad</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Course Type</Label>
                <Select value={courseType} onValueChange={handleCourseChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.keys(COURSE_PRESETS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2"><Label>Annual Cost Today (₹)</Label><Input type="number" value={annualCost || ""} onChange={e => setAnnualCost(parseFloat(e.target.value) || 0)} /></div>
              <div className="space-y-2"><Label>Course Duration (years)</Label><Input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)} /></div>
              <div className="space-y-2"><Label>Years Until Course Starts</Label><Input type="number" value={yearsToStart} onChange={e => setYearsToStart(parseInt(e.target.value) || 1)} /></div>
              <div className="space-y-2"><Label>Education Inflation (%)</Label><Input type="number" value={inflationRate} onChange={e => setInflationRate(parseFloat(e.target.value) || 0)} /></div>
              <div className="space-y-2"><Label>Current Savings for Education (₹)</Label><Input type="number" value={currentSavings || ""} onChange={e => setCurrentSavings(parseFloat(e.target.value) || 0)} /></div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Cost Today (Total)</p><p className="text-lg font-bold">{fmt(annualCost * duration)}</p></CardContent></Card>
              <Card className="border-primary/30 bg-primary/5"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Future Cost (Total)</p><p className="text-xl font-bold text-primary">{fmt(totalFutureCost)}</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Per Year (Future)</p><p className="text-lg font-bold">{fmt(futureCostPerYear)}</p></CardContent></Card>
            </div>

            {gap > 0 && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="py-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Funding Gap: {fmt(gap)}</p>
                    <p className="text-sm text-muted-foreground">You need {fmt(gap)} more than your projected savings (at 10% growth)</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Savings Vehicle Comparison</CardTitle>
                <CardDescription>Required monthly SIP to reach {fmt(totalFutureCost)} in {yearsToStart} years</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Required SIP/mo</TableHead>
                      <TableHead className="text-right">₹10K/mo Corpus</TableHead>
                      <TableHead>Tax-Free?</TableHead>
                      <TableHead>Lock-in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicleProjections.map(v => (
                      <TableRow key={v.name}>
                        <TableCell className="font-medium">{v.name}</TableCell>
                        <TableCell className="text-right">{v.rate}%</TableCell>
                        <TableCell className="text-right font-bold text-primary">{fmt(v.requiredSIP)}</TableCell>
                        <TableCell className="text-right">{fmt(v.sampleCorpus)}</TableCell>
                        <TableCell>{v.taxFree ? <Badge variant="outline" className="border-primary/30 text-primary">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{v.lock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationCostPlanner;

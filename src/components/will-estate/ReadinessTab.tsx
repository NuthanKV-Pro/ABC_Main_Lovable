import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Shield } from "lucide-react";
import type { WillData } from "./types";

interface Props {
  data: WillData;
}

interface CheckItem {
  label: string;
  category: string;
  check: (d: WillData) => boolean;
  weight: number;
  tip: string;
}

const checks: CheckItem[] = [
  { label: "Testator name provided", category: "Personal", check: d => !!d.testatorName.trim(), weight: 10, tip: "Enter your full legal name in the Personal Info tab" },
  { label: "Age specified", category: "Personal", check: d => !!d.testatorAge.trim(), weight: 5, tip: "Provide your current age" },
  { label: "Address provided", category: "Personal", check: d => !!d.address.trim(), weight: 5, tip: "Enter your residential address for legal records" },
  { label: "At least 1 beneficiary named", category: "Beneficiaries", check: d => d.beneficiaries.some(b => b.name.trim()), weight: 15, tip: "Name at least one beneficiary in the Beneficiaries tab" },
  { label: "Share allocation equals 100%", category: "Beneficiaries", check: d => d.beneficiaries.reduce((s, b) => s + b.share, 0) === 100, weight: 15, tip: "Adjust beneficiary shares to total exactly 100%" },
  { label: "Guardian appointed (if minor beneficiaries)", category: "Beneficiaries", check: d => !d.beneficiaries.some(b => b.isMinor) || !!d.guardianName.trim(), weight: 10, tip: "Appoint a guardian for minor beneficiaries" },
  { label: "At least 1 asset listed", category: "Assets", check: d => d.assets.some(a => a.description.trim()), weight: 10, tip: "Add at least one asset with a description" },
  { label: "All assets assigned to beneficiaries", category: "Assets", check: d => d.assets.length > 0 && d.assets.every(a => a.assignedTo.trim()), weight: 10, tip: "Assign each asset to a specific beneficiary" },
  { label: "Executor appointed", category: "Execution", check: d => !!d.executorName.trim(), weight: 10, tip: "Name an executor who will carry out the will" },
  { label: "Two witnesses added", category: "Execution", check: d => d.witnesses.filter(w => w.name.trim()).length >= 2, weight: 10, tip: "Add at least 2 witnesses (who are not beneficiaries)" },
];

const ReadinessTab = ({ data }: Props) => {
  const results = checks.map(c => ({ ...c, passed: c.check(data) }));
  const score = results.reduce((s, r) => s + (r.passed ? r.weight : 0), 0);
  const categories = [...new Set(checks.map(c => c.category))];

  const getScoreColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-destructive";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Ready for Review";
    if (score >= 50) return "Needs Attention";
    return "Incomplete";
  };

  const getProgressColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Score card */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-full ${score >= 80 ? 'bg-green-500/10' : score >= 50 ? 'bg-amber-500/10' : 'bg-destructive/10'}`}>
              <Shield className={`h-10 w-10 ${getScoreColor()}`} />
            </div>
            <div>
              <p className={`text-5xl font-bold ${getScoreColor()}`}>{score}%</p>
              <p className="text-lg font-medium mt-1">{getScoreLabel()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {results.filter(r => r.passed).length} of {results.length} checks passed
              </p>
            </div>
            <div className="w-full max-w-md">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${getProgressColor()}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed checklist by category */}
      {categories.map(cat => {
        const items = results.filter(r => r.category === cat);
        const catPassed = items.filter(r => r.passed).length;
        return (
          <Card key={cat}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                {cat}
                <Badge variant={catPassed === items.length ? "default" : "outline"}>
                  {catPassed}/{items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${item.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/50'}`}>
                  {item.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${item.passed ? '' : 'text-muted-foreground'}`}>{item.label}</p>
                    {!item.passed && <p className="text-xs text-muted-foreground mt-0.5">{item.tip}</p>}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{item.weight}pts</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ReadinessTab;

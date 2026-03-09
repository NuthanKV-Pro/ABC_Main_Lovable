import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { WillData } from "./types";

interface Props {
  data: WillData;
}

const PreviewTab = ({ data }: Props) => {
  const [copied, setCopied] = useState(false);
  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");
  const totalEstateValue = data.assets.reduce((s, a) => s + a.estimatedValue, 0);

  const generateWillText = () => {
    const lines: string[] = [];
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("                    LAST WILL AND TESTAMENT");
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("");
    lines.push(`I, ${data.testatorName || "[TESTATOR NAME]"}, aged ${data.testatorAge || "[AGE]"} years,`);
    lines.push(`resident of ${data.address || "[ADDRESS]"},`);
    lines.push("being of sound mind, memory and understanding, do hereby");
    lines.push("declare this to be my Last Will and Testament, revoking");
    lines.push("all previous wills and codicils made by me.");
    lines.push("");

    lines.push("───────────────────────────────────────────────────────");
    lines.push("ARTICLE I — DECLARATIONS");
    lines.push("───────────────────────────────────────────────────────");
    lines.push("1. I make this Will voluntarily and without any coercion.");
    lines.push("2. I am above 18 years of age and of sound disposing mind.");
    lines.push(`3. This Will is governed by ${data.religion === 'hindu' ? 'Hindu Succession Act, 1956' : data.religion === 'muslim' ? 'Muslim Personal Law (Shariat)' : 'Indian Succession Act, 1925'}.`);
    lines.push("");

    lines.push("───────────────────────────────────────────────────────");
    lines.push("ARTICLE II — BENEFICIARIES");
    lines.push("───────────────────────────────────────────────────────");
    data.beneficiaries.forEach((b, i) => {
      lines.push(`${i + 1}. ${b.name || "[NAME]"}`);
      lines.push(`   Relationship: ${b.relationship} | Share: ${b.share}%${b.isMinor ? " (Minor)" : ""}`);
    });
    lines.push("");

    lines.push("───────────────────────────────────────────────────────");
    lines.push("ARTICLE III — ASSETS & DISTRIBUTION");
    lines.push("───────────────────────────────────────────────────────");
    lines.push(`Total Estate Value: ${formatCurrency(totalEstateValue)}`);
    lines.push("");
    data.assets.forEach((a, i) => {
      lines.push(`${i + 1}. ${a.type}: ${a.description || "[DESCRIPTION]"}`);
      lines.push(`   Estimated Value: ${formatCurrency(a.estimatedValue)}`);
      lines.push(`   Bequeathed to: ${a.assignedTo || "[BENEFICIARY]"}`);
    });
    lines.push("");

    lines.push("───────────────────────────────────────────────────────");
    lines.push("ARTICLE IV — EXECUTOR");
    lines.push("───────────────────────────────────────────────────────");
    lines.push(`I appoint ${data.executorName || "[EXECUTOR NAME]"}${data.executorAddress ? `, residing at ${data.executorAddress}` : ""}`);
    lines.push("as the sole Executor of this Will with full powers to");
    lines.push("manage, distribute and administer my estate.");
    lines.push("");

    if (data.guardianName) {
      lines.push("───────────────────────────────────────────────────────");
      lines.push("ARTICLE V — GUARDIAN");
      lines.push("───────────────────────────────────────────────────────");
      lines.push(`I appoint ${data.guardianName} as the Guardian of my`);
      lines.push("minor children until they attain the age of majority.");
      lines.push("");
    }

    if (data.funeralWishes) {
      lines.push("───────────────────────────────────────────────────────");
      lines.push("FUNERAL / LAST RITES WISHES");
      lines.push("───────────────────────────────────────────────────────");
      lines.push(data.funeralWishes);
      lines.push("");
    }

    if (data.charitableDonations) {
      lines.push("───────────────────────────────────────────────────────");
      lines.push("CHARITABLE DONATIONS");
      lines.push("───────────────────────────────────────────────────────");
      lines.push(data.charitableDonations);
      lines.push("");
    }

    if (data.specialInstructions) {
      lines.push("───────────────────────────────────────────────────────");
      lines.push("SPECIAL INSTRUCTIONS");
      lines.push("───────────────────────────────────────────────────────");
      lines.push(data.specialInstructions);
      lines.push("");
    }

    if (data.codicils.length > 0) {
      lines.push("───────────────────────────────────────────────────────");
      lines.push("CODICILS (AMENDMENTS)");
      lines.push("───────────────────────────────────────────────────────");
      data.codicils.forEach((c, i) => {
        lines.push(`${i + 1}. Date: ${c.date} — ${c.description || "[DESCRIPTION]"}`);
      });
      lines.push("");
    }

    lines.push("═══════════════════════════════════════════════════════");
    lines.push("SIGNATURES");
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("");
    lines.push("Testator: ________________________    Date: ___________");
    lines.push(`          ${data.testatorName || "[NAME]"}`);
    lines.push("");
    data.witnesses.forEach((w, i) => {
      lines.push(`Witness ${i + 1}: _______________________    Date: ___________`);
      lines.push(`           ${w.name || "[NAME]"}${w.address ? ` | ${w.address}` : ""}`);
      lines.push("");
    });
    if (data.witnesses.length < 2) {
      for (let i = data.witnesses.length; i < 2; i++) {
        lines.push(`Witness ${i + 1}: _______________________    Date: ___________`);
        lines.push(`           [WITNESS ${i + 1} NAME & ADDRESS]`);
        lines.push("");
      }
    }

    lines.push("───────────────────────────────────────────────────────");
    lines.push("NOTE: This Will must be signed by the Testator in the");
    lines.push("simultaneous presence of TWO witnesses who are NOT");
    lines.push("beneficiaries. Registration is optional but recommended.");
    lines.push("───────────────────────────────────────────────────────");

    return lines.join("\n");
  };

  const willText = generateWillText();

  const handleCopy = () => {
    navigator.clipboard.writeText(willText);
    setCopied(true);
    toast.success("Will text copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Will Draft Preview
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? <CheckCircle className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Review your complete will draft below</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-6 rounded-lg font-mono leading-relaxed max-h-[600px] overflow-y-auto border">
            {willText}
          </pre>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm text-amber-600 dark:text-amber-400">Important Legal Disclaimer</h4>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
              This is a basic template for educational purposes only. For a legally binding will, please consult a qualified lawyer.
              Registration at a Sub-Registrar's office is optional under Indian law but strongly recommended to prevent disputes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;

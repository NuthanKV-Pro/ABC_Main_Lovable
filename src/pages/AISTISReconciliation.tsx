import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

interface Entry {
  id: string;
  source: "Form 26AS" | "AIS" | "TIS";
  type: string;
  amount: number;
  tds: number;
}

const AISTISReconciliation = () => {
  const goBack = useGoBack();
  const [entries, setEntries] = useState<Entry[]>([
    { id: "1", source: "Form 26AS", type: "Salary", amount: 1200000, tds: 120000 },
    { id: "2", source: "AIS", type: "Salary", amount: 1200000, tds: 120000 },
    { id: "3", source: "Form 26AS", type: "Interest", amount: 50000, tds: 5000 },
    { id: "4", source: "AIS", type: "Interest", amount: 52000, tds: 5200 },
  ]);
  const [newEntry, setNewEntry] = useState({ source: "Form 26AS" as const, type: "", amount: "", tds: "" });

  const addEntry = () => {
    if (newEntry.type && newEntry.amount) {
      setEntries([...entries, {
        id: Date.now().toString(),
        source: newEntry.source,
        type: newEntry.type,
        amount: parseFloat(newEntry.amount) || 0,
        tds: parseFloat(newEntry.tds) || 0
      }]);
      setNewEntry({ source: "Form 26AS", type: "", amount: "", tds: "" });
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const getDiscrepancies = () => {
    const grouped: Record<string, { form26AS: Entry | null; ais: Entry | null; tis: Entry | null }> = {};
    entries.forEach(e => {
      if (!grouped[e.type]) grouped[e.type] = { form26AS: null, ais: null, tis: null };
      if (e.source === "Form 26AS") grouped[e.type].form26AS = e;
      else if (e.source === "AIS") grouped[e.type].ais = e;
      else grouped[e.type].tis = e;
    });

    return Object.entries(grouped).map(([type, data]) => {
      const amounts = [data.form26AS?.amount, data.ais?.amount, data.tis?.amount].filter(Boolean);
      const hasDiscrepancy = amounts.length > 1 && !amounts.every(a => a === amounts[0]);
      return { type, ...data, hasDiscrepancy };
    });
  };

  const discrepancies = getDiscrepancies();
  const hasIssues = discrepancies.some(d => d.hasDiscrepancy);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">AIS/TIS Reconciliation Tool</CardTitle>
              <CardDescription>Match Form 26AS with AIS/TIS data and identify discrepancies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Source</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newEntry.source}
                    onChange={(e) => setNewEntry({ ...newEntry, source: e.target.value as any })}
                  >
                    <option value="Form 26AS">Form 26AS</option>
                    <option value="AIS">AIS</option>
                    <option value="TIS">TIS</option>
                  </select>
                </div>
                <div>
                  <Label>Income Type</Label>
                  <Input
                    placeholder="Salary, Interest, etc."
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>TDS (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newEntry.tds}
                    onChange={(e) => setNewEntry({ ...newEntry, tds: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addEntry} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 p-4 rounded-lg border">
            {hasIssues ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-amber-600 font-medium">Discrepancies found! Review highlighted items below.</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">All entries match across sources.</span>
              </>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Income Type</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead className="text-right">TDS (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const disc = discrepancies.find(d => d.type === entry.type);
                return (
                  <TableRow key={entry.id} className={disc?.hasDiscrepancy ? "bg-amber-500/10" : ""}>
                    <TableCell>
                      <Badge variant="outline">{entry.source}</Badge>
                    </TableCell>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell className="text-right font-mono">₹{entry.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">₹{entry.tds.toLocaleString()}</TableCell>
                    <TableCell>
                      {disc?.hasDiscrepancy ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> Mismatch
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" /> Match
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">How to Use</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Download Form 26AS, AIS, and TIS from the Income Tax Portal</li>
                <li>• Add entries from each source to compare amounts</li>
                <li>• Tool automatically flags mismatches for review</li>
                <li>• Address discrepancies before filing ITR to avoid notices</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISTISReconciliation;

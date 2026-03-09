import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Beneficiary } from "./types";
import { RELATIONSHIPS } from "./types";

interface Props {
  beneficiaries: Beneficiary[];
  onChange: (beneficiaries: Beneficiary[]) => void;
}

const BeneficiariesTab = ({ beneficiaries, onChange }: Props) => {
  const totalShare = beneficiaries.reduce((sum, b) => sum + b.share, 0);
  const isValid = totalShare === 100;

  const add = () => onChange([...beneficiaries, { id: Date.now().toString(), name: "", relationship: "Other", share: 0, isMinor: false }]);
  const remove = (id: string) => onChange(beneficiaries.filter(b => b.id !== id));
  const update = (id: string, field: keyof Beneficiary, value: any) => onChange(beneficiaries.map(b => b.id === id ? { ...b, [field]: value } : b));

  return (
    <div className="space-y-6">
      {/* Share allocation summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isValid ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}>
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {isValid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
              <span className="text-sm text-muted-foreground">Total Allocation</span>
            </div>
            <p className={`text-3xl font-bold ${isValid ? 'text-green-500' : 'text-destructive'}`}>{totalShare}%</p>
            {!isValid && <p className="text-xs text-destructive mt-1">Must equal exactly 100%</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
            <p className="text-3xl font-bold text-foreground">{beneficiaries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground">Minor Beneficiaries</p>
            <p className="text-3xl font-bold text-foreground">{beneficiaries.filter(b => b.isMinor).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Beneficiaries</span>
            <Button size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add Beneficiary</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead className="text-right">Share %</TableHead>
                  <TableHead className="text-center">Minor?</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.map(b => (
                  <TableRow key={b.id}>
                    <TableCell><Input value={b.name} onChange={e => update(b.id, "name", e.target.value)} placeholder="Full legal name" /></TableCell>
                    <TableCell>
                      <Select value={b.relationship} onValueChange={v => update(b.id, "relationship", v)}>
                        <SelectTrigger className="min-w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" className="w-20" value={b.share} onChange={e => update(b.id, "share", Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={b.isMinor} onCheckedChange={v => update(b.id, "isMinor", v)} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {beneficiaries.some(b => b.isMinor) && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Minor beneficiaries require a guardian. Ensure a guardian is appointed in the Personal Info tab.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BeneficiariesTab;

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Witness, Codicil } from "./types";

interface Props {
  witnesses: Witness[];
  codicils: Codicil[];
  onWitnessChange: (w: Witness[]) => void;
  onCodicilChange: (c: Codicil[]) => void;
}

const WitnessCodicilTab = ({ witnesses, codicils, onWitnessChange, onCodicilChange }: Props) => {
  const addWitness = () => onWitnessChange([...witnesses, { id: Date.now().toString(), name: "", address: "", relation: "" }]);
  const removeWitness = (id: string) => onWitnessChange(witnesses.filter(w => w.id !== id));
  const updateWitness = (id: string, field: keyof Witness, value: string) => onWitnessChange(witnesses.map(w => w.id === id ? { ...w, [field]: value } : w));

  const addCodicil = () => onCodicilChange([...codicils, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], description: "" }]);
  const removeCodicil = (id: string) => onCodicilChange(codicils.filter(c => c.id !== id));
  const updateCodicil = (id: string, field: keyof Codicil, value: string) => onCodicilChange(codicils.map(c => c.id === id ? { ...c, [field]: value } : c));

  const validWitnesses = witnesses.filter(w => w.name.trim());

  return (
    <div className="space-y-6">
      {/* Witnesses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Witnesses
              <Badge variant={validWitnesses.length >= 2 ? "default" : "destructive"} className="text-xs">
                {validWitnesses.length}/2 required
              </Badge>
            </span>
            <Button size="sm" variant="outline" onClick={addWitness}><Plus className="h-4 w-4 mr-1" /> Add Witness</Button>
          </CardTitle>
          <CardDescription>At least 2 witnesses required. Witnesses must NOT be beneficiaries of the will.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {witnesses.map((w, i) => (
            <div key={w.id} className="p-4 rounded-lg border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Witness {i + 1}</Badge>
                <Button variant="ghost" size="icon" onClick={() => removeWitness(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><Label className="text-xs">Full Name</Label><Input value={w.name} onChange={e => updateWitness(w.id, "name", e.target.value)} placeholder="Legal name" /></div>
                <div><Label className="text-xs">Address</Label><Input value={w.address} onChange={e => updateWitness(w.id, "address", e.target.value)} placeholder="Residential address" /></div>
                <div><Label className="text-xs">Relation to Testator</Label><Input value={w.relation} onChange={e => updateWitness(w.id, "relation", e.target.value)} placeholder="Friend, Colleague, etc." /></div>
              </div>
            </div>
          ))}
          {witnesses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No witnesses added. A valid will requires at least 2 witnesses.</p>
            </div>
          )}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              Witnesses must be present simultaneously when the testator signs. They should be of sound mind, 18+ years, and NOT beneficiaries.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Codicils */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Codicils (Amendments)
              {codicils.length > 0 && <Badge variant="secondary" className="text-xs">{codicils.length}</Badge>}
            </span>
            <Button size="sm" variant="outline" onClick={addCodicil}><Plus className="h-4 w-4 mr-1" /> Add Codicil</Button>
          </CardTitle>
          <CardDescription>A codicil is an amendment or addition to an existing will. Use codicils for minor changes instead of rewriting the entire will.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {codicils.map((c, i) => (
            <div key={c.id} className="p-4 rounded-lg border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Codicil {i + 1}</Badge>
                <Button variant="ghost" size="icon" onClick={() => removeCodicil(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div><Label className="text-xs">Date</Label><Input type="date" value={c.date} onChange={e => updateCodicil(c.id, "date", e.target.value)} /></div>
                <div className="md:col-span-3"><Label className="text-xs">Amendment Description</Label><Textarea value={c.description} onChange={e => updateCodicil(c.id, "description", e.target.value)} placeholder="Describe the change to the original will..." rows={2} /></div>
              </div>
            </div>
          ))}
          {codicils.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No codicils added. Add amendments if you need to modify your existing will.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WitnessCodicilTab;

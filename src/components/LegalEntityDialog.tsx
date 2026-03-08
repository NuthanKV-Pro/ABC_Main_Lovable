import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { LegalEntity } from "@/hooks/useUserProfile";

const ENTITY_TYPES = [
  "Proprietorship",
  "Partnership",
  "LLP",
  "Pvt Ltd",
  "Public Ltd",
  "Trust",
  "AOP/BOI",
  "HUF",
];

interface LegalEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity?: LegalEntity | null;
  onSave: (data: Omit<LegalEntity, "id">) => void;
}

const EMPTY_FORM = {
  name: "",
  type: "",
  pan: "",
  gstns: [""],
  registeredAddress: "",
  businessAddress: "",
  natureOfBusiness: "",
  dateOfIncorporation: "",
};

const LegalEntityDialog = ({ open, onOpenChange, entity, onSave }: LegalEntityDialogProps) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (entity) {
      setForm({
        name: entity.name,
        type: entity.type,
        pan: entity.pan,
        gstns: entity.gstns.length ? entity.gstns : [""],
        registeredAddress: entity.registeredAddress,
        businessAddress: entity.businessAddress,
        natureOfBusiness: entity.natureOfBusiness,
        dateOfIncorporation: entity.dateOfIncorporation,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [entity, open]);

  const handleSubmit = () => {
    onSave({ ...form, gstns: form.gstns.filter(g => g.trim()) });
    onOpenChange(false);
  };

  const updateGstn = (index: number, value: string) => {
    setForm(prev => {
      const gstns = [...prev.gstns];
      gstns[index] = value.toUpperCase();
      return { ...prev, gstns };
    });
  };

  const addGstn = () => setForm(prev => ({ ...prev, gstns: [...prev.gstns, ""] }));

  const removeGstn = (index: number) => {
    setForm(prev => ({ ...prev, gstns: prev.gstns.filter((_, i) => i !== index) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entity ? "Edit Legal Entity" : "Add Legal Entity"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entity Name</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Entity name" />
            </div>
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>PAN</Label>
              <Input value={form.pan} onChange={e => setForm(p => ({ ...p, pan: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" maxLength={10} />
            </div>
            <div className="space-y-2">
              <Label>Nature of Business</Label>
              <Input value={form.natureOfBusiness} onChange={e => setForm(p => ({ ...p, natureOfBusiness: e.target.value }))} placeholder="e.g. IT Services" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date of Incorporation</Label>
            <Input type="date" value={form.dateOfIncorporation} onChange={e => setForm(p => ({ ...p, dateOfIncorporation: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Registered Address</Label>
            <Input value={form.registeredAddress} onChange={e => setForm(p => ({ ...p, registeredAddress: e.target.value }))} placeholder="Registered address" />
          </div>
          <div className="space-y-2">
            <Label>Business Address</Label>
            <Input value={form.businessAddress} onChange={e => setForm(p => ({ ...p, businessAddress: e.target.value }))} placeholder="Business address" />
          </div>
          <div className="space-y-2">
            <Label>GSTN(s)</Label>
            {form.gstns.map((gstn, i) => (
              <div key={i} className="flex gap-2">
                <Input value={gstn} onChange={e => updateGstn(i, e.target.value)} placeholder="22ABCDE1234F1Z5" maxLength={15} />
                {form.gstns.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeGstn(i)} className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addGstn} className="gap-1">
              <Plus className="h-3 w-3" /> Add GSTN
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name || !form.type}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LegalEntityDialog;

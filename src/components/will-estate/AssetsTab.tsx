import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Home, Landmark, Smartphone, Briefcase, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Asset } from "./types";
import { ASSET_TYPES } from "./types";

interface Props {
  assets: Asset[];
  onChange: (assets: Asset[]) => void;
}

const categoryIcons: Record<string, any> = {
  immovable: Home,
  financial: Landmark,
  movable: Gem,
  digital: Smartphone,
  other: Briefcase,
};

const categoryLabels: Record<string, string> = {
  immovable: "Immovable Property",
  financial: "Financial Assets",
  movable: "Movable Property",
  digital: "Digital Assets",
  other: "Other Assets",
};

const categoryColors: Record<string, string> = {
  immovable: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  financial: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  movable: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  digital: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  other: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

const AssetsTab = ({ assets, onChange }: Props) => {
  const totalValue = assets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");

  const add = (category: Asset["category"]) => {
    const firstType = Object.entries(ASSET_TYPES).find(([, v]) => v.category === category)?.[0] || "";
    onChange([...assets, { id: Date.now().toString(), type: firstType, category, description: "", estimatedValue: 0, assignedTo: "", accountNumber: "", location: "" }]);
  };
  const remove = (id: string) => onChange(assets.filter(a => a.id !== id));
  const update = (id: string, field: keyof Asset, value: any) => onChange(assets.map(a => a.id === id ? { ...a, [field]: value } : a));

  const grouped = (["immovable", "financial", "movable", "digital", "other"] as Asset["category"][]).map(cat => ({
    category: cat,
    items: assets.filter(a => a.category === cat),
    total: assets.filter(a => a.category === cat).reduce((s, a) => s + a.estimatedValue, 0),
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="col-span-2 md:col-span-3 lg:col-span-1 bg-primary/5 border-primary/20">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">Total Estate</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        {grouped.map(g => {
          const Icon = categoryIcons[g.category];
          return (
            <Card key={g.category} className={`border ${categoryColors[g.category].split(' ').pop()}`}>
              <CardContent className="pt-3 text-center">
                <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground truncate">{categoryLabels[g.category]}</p>
                <p className="text-sm font-semibold">{formatCurrency(g.total)}</p>
                <Badge variant="outline" className="text-[10px] mt-1">{g.items.length} items</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grouped asset sections */}
      {grouped.map(g => {
        const Icon = categoryIcons[g.category];
        const typesForCategory = Object.entries(ASSET_TYPES).filter(([, v]) => v.category === g.category);

        return (
          <Card key={g.category}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-md ${categoryColors[g.category].split(' ').slice(0, 1).join(' ')}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {categoryLabels[g.category]}
                  <Badge variant="secondary" className="text-xs">{g.items.length}</Badge>
                </span>
                <Button size="sm" variant="outline" onClick={() => add(g.category)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </CardTitle>
              {g.category === "digital" && (
                <CardDescription>Include crypto wallets, domain names, social media accounts, and digital intellectual property</CardDescription>
              )}
            </CardHeader>
            {g.items.length > 0 && (
              <CardContent className="space-y-3">
                {g.items.map(a => (
                  <div key={a.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select value={a.type} onValueChange={v => { update(a.id, "type", v); update(a.id, "category", ASSET_TYPES[v]?.category || a.category); }}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{typesForCategory.map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Description</Label>
                      <Input value={a.description} onChange={e => update(a.id, "description", e.target.value)} placeholder="Details / account info" className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Value (₹)</Label>
                      <Input type="number" value={a.estimatedValue || ""} onChange={e => update(a.id, "estimatedValue", Number(e.target.value))} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Assigned To</Label>
                      <Input value={a.assignedTo} onChange={e => update(a.id, "assignedTo", e.target.value)} placeholder="Beneficiary" className="text-sm" />
                    </div>
                    <div className="flex items-end">
                      <Button variant="ghost" size="icon" onClick={() => remove(a.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default AssetsTab;

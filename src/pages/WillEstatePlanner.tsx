import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Plus, Trash2, Users, Home, Landmark, Info, CheckCircle, AlertTriangle, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  share: number;
}

interface Asset {
  id: string;
  type: string;
  description: string;
  estimatedValue: number;
  assignedTo: string;
}

const WillEstatePlanner = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [testatorName, setTestatorName] = useState("");
  const [testatorAge, setTestatorAge] = useState("");
  const [religion, setReligion] = useState("hindu");

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: "1", name: "", relationship: "Spouse", share: 50 },
    { id: "2", name: "", relationship: "Son", share: 25 },
    { id: "3", name: "", relationship: "Daughter", share: 25 },
  ]);

  const [assets, setAssets] = useState<Asset[]>([
    { id: "1", type: "Immovable Property", description: "", estimatedValue: 0, assignedTo: "" },
  ]);

  const [executorName, setExecutorName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const addBeneficiary = () => setBeneficiaries(prev => [...prev, { id: Date.now().toString(), name: "", relationship: "Other", share: 0 }]);
  const removeBeneficiary = (id: string) => setBeneficiaries(prev => prev.filter(b => b.id !== id));
  const updateBeneficiary = (id: string, field: keyof Beneficiary, value: any) => setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));

  const addAsset = () => setAssets(prev => [...prev, { id: Date.now().toString(), type: "Movable Property", description: "", estimatedValue: 0, assignedTo: "" }]);
  const removeAsset = (id: string) => setAssets(prev => prev.filter(a => a.id !== id));
  const updateAsset = (id: string, field: keyof Asset, value: any) => setAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));

  const totalShare = beneficiaries.reduce((sum, b) => sum + b.share, 0);
  const totalEstateValue = assets.reduce((sum, a) => sum + a.estimatedValue, 0);
  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");

  const successionLaws = [
    { religion: "Hindu / Sikh / Jain / Buddhist", law: "Hindu Succession Act, 1956 (as amended 2005)", key: "Daughters have equal coparcenary rights. Class I heirs: Mother, Widow, Sons, Daughters equally." },
    { religion: "Muslim", law: "Muslim Personal Law (Shariat)", key: "Will limited to 1/3rd of estate. Fixed shares for heirs (Faraid). Wife gets 1/8th (with children) or 1/4th (without)." },
    { religion: "Christian", law: "Indian Succession Act, 1925", key: "1/3rd to widow, remaining divided among children equally. No distinction between sons and daughters." },
    { religion: "Parsi", law: "Indian Succession Act, 1925 (Parsi rules)", key: "Widow and children share equally. If no children, widow gets half." },
  ];

  const generateWillPreview = () => {
    return `LAST WILL AND TESTAMENT

I, ${testatorName || "[Testator Name]"}, aged ${testatorAge || "[Age]"} years, resident of [Address], being of sound mind and memory, do hereby declare this to be my Last Will and Testament, revoking all previous wills and codicils.

ARTICLE I - BENEFICIARIES
${beneficiaries.map((b, i) => `${i + 1}. ${b.name || "[Name]"} (${b.relationship}) — ${b.share}% share`).join("\n")}

ARTICLE II - ASSETS & DISTRIBUTION
${assets.map((a, i) => `${i + 1}. ${a.type}: ${a.description || "[Description]"} (Est. Value: ${formatCurrency(a.estimatedValue)}) → ${a.assignedTo || "[Beneficiary]"}`).join("\n")}

ARTICLE III - EXECUTOR
I appoint ${executorName || "[Executor Name]"} as the Executor of this Will.

${guardianName ? `ARTICLE IV - GUARDIAN\nI appoint ${guardianName} as Guardian of my minor children.` : ""}

${specialInstructions ? `SPECIAL INSTRUCTIONS:\n${specialInstructions}` : ""}

SIGNATURES:

Testator: ___________________  Date: ___________
Witness 1: __________________  Date: ___________
Witness 2: __________________  Date: ___________

(This will must be signed in the presence of two witnesses who are NOT beneficiaries)`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => goBack()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Will & Estate Planner</h1>
            <p className="text-muted-foreground text-sm">Draft a basic will & understand Indian succession laws</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Testator Info */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Testator Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Full Name</Label><Input value={testatorName} onChange={e => setTestatorName(e.target.value)} placeholder="Your full legal name" /></div>
                <div><Label>Age</Label><Input value={testatorAge} onChange={e => setTestatorAge(e.target.value)} placeholder="Age" /></div>
                <div>
                  <Label>Religion (for succession law)</Label>
                  <Select value={religion} onValueChange={setReligion}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hindu">Hindu / Sikh / Jain / Buddhist</SelectItem>
                      <SelectItem value="muslim">Muslim</SelectItem>
                      <SelectItem value="christian">Christian</SelectItem>
                      <SelectItem value="parsi">Parsi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Executor Name</Label><Input value={executorName} onChange={e => setExecutorName(e.target.value)} placeholder="Person to execute the will" /></div>
                <div><Label>Guardian (for minor children)</Label><Input value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="Optional" /></div>
              </div>
            </CardContent>
          </Card>

          {/* Estate Summary */}
          <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20"><CardContent className="pt-4 text-center"><p className="text-sm text-muted-foreground">Total Estate Value</p><p className="text-2xl font-bold text-primary">{formatCurrency(totalEstateValue)}</p></CardContent></Card>
            <Card className={totalShare === 100 ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20"}>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Share Allocation</p>
                <p className={`text-2xl font-bold ${totalShare === 100 ? 'text-green-500' : 'text-destructive'}`}>{totalShare}%</p>
                {totalShare !== 100 && <p className="text-xs text-destructive mt-1">Must equal 100%</p>}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Beneficiaries */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between"><span><Users className="inline h-5 w-5 mr-2" />Beneficiaries</span>
              <Button size="sm" onClick={addBeneficiary}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Relationship</TableHead><TableHead className="text-right">Share %</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {beneficiaries.map(b => (
                  <TableRow key={b.id}>
                    <TableCell><Input value={b.name} onChange={e => updateBeneficiary(b.id, "name", e.target.value)} placeholder="Full name" /></TableCell>
                    <TableCell>
                      <Select value={b.relationship} onValueChange={v => updateBeneficiary(b.id, "relationship", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grandchild", "Other"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input type="number" className="w-20" value={b.share} onChange={e => updateBeneficiary(b.id, "share", Number(e.target.value))} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => removeBeneficiary(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assets */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between"><span><Home className="inline h-5 w-5 mr-2" />Assets</span>
              <Button size="sm" onClick={addAsset}><Plus className="h-4 w-4 mr-1" /> Add Asset</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Value (₹)</TableHead><TableHead>Assigned To</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {assets.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Select value={a.type} onValueChange={v => updateAsset(a.id, "type", v)}>
                        <SelectTrigger className="min-w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Immovable Property", "Bank Account", "Fixed Deposit", "Mutual Funds", "Shares/Stocks", "Gold/Jewellery", "Insurance Policy", "Business Interest", "Vehicle", "Intellectual Property", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input value={a.description} onChange={e => updateAsset(a.id, "description", e.target.value)} placeholder="Details" /></TableCell>
                    <TableCell><Input type="number" className="w-28" value={a.estimatedValue || ""} onChange={e => updateAsset(a.id, "estimatedValue", Number(e.target.value))} /></TableCell>
                    <TableCell><Input value={a.assignedTo} onChange={e => updateAsset(a.id, "assignedTo", e.target.value)} placeholder="Beneficiary name" /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => removeAsset(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">Special Instructions</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="Any specific wishes, charitable donations, or conditions..." rows={4} />
          </CardContent>
        </Card>

        {/* Will Preview */}
        <Card className="mt-6">
          <CardHeader><CardTitle>Will Draft Preview</CardTitle><CardDescription>Review and customize before consulting a lawyer</CardDescription></CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-6 rounded-lg font-mono leading-relaxed">{generateWillPreview()}</pre>
            <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-500">This is a basic template for educational purposes. Please consult a qualified lawyer for legally binding wills. Registration of will is optional but recommended.</p>
            </div>
          </CardContent>
        </Card>

        {/* Succession Laws */}
        <Card className="mt-6">
          <CardHeader><CardTitle><Landmark className="inline h-5 w-5 mr-2" />Indian Succession Laws</CardTitle></CardHeader>
          <CardContent>
            <Accordion type="multiple">
              {successionLaws.map((law, i) => (
                <AccordionItem key={i} value={String(i)}>
                  <AccordionTrigger className="text-sm">{law.religion} — {law.law}</AccordionTrigger>
                  <AccordionContent><p className="text-sm text-muted-foreground">{law.key}</p></AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WillEstatePlanner;

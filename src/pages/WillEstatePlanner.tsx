import { useState } from "react";
import { useGoBack } from "@/hooks/useGoBack";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Users, Briefcase, Scale, Shield, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PersonalInfoTab from "@/components/will-estate/PersonalInfoTab";
import BeneficiariesTab from "@/components/will-estate/BeneficiariesTab";
import AssetsTab from "@/components/will-estate/AssetsTab";
import LegalTaxTab from "@/components/will-estate/LegalTaxTab";
import ReadinessTab from "@/components/will-estate/ReadinessTab";
import WitnessCodicilTab from "@/components/will-estate/WitnessCodicilTab";
import PreviewTab from "@/components/will-estate/PreviewTab";
import type { WillData } from "@/components/will-estate/types";

const WillEstatePlanner = () => {
  const goBack = useGoBack();

  const [data, setData] = useState<WillData>({
    testatorName: "",
    testatorAge: "",
    religion: "hindu",
    address: "",
    beneficiaries: [
      { id: "1", name: "", relationship: "Spouse", share: 50, isMinor: false },
      { id: "2", name: "", relationship: "Son", share: 25, isMinor: false },
      { id: "3", name: "", relationship: "Daughter", share: 25, isMinor: false },
    ],
    assets: [
      { id: "1", type: "Residential Property", category: "immovable", description: "", estimatedValue: 0, assignedTo: "" },
    ],
    executorName: "",
    executorAddress: "",
    guardianName: "",
    witnesses: [
      { id: "1", name: "", address: "", relation: "" },
      { id: "2", name: "", address: "", relation: "" },
    ],
    codicils: [],
    specialInstructions: "",
    funeralWishes: "",
    charitableDonations: "",
  });

  const update = (updates: Partial<WillData>) => setData(prev => ({ ...prev, ...updates }));
  const totalEstateValue = data.assets.reduce((s, a) => s + a.estimatedValue, 0);
  const totalShare = data.beneficiaries.reduce((s, b) => s + b.share, 0);

  // Quick readiness score for header
  const quickChecks = [
    !!data.testatorName, !!data.testatorAge, 
    data.beneficiaries.some(b => b.name.trim()), totalShare === 100,
    data.assets.some(a => a.description.trim()), !!data.executorName,
    data.witnesses.filter(w => w.name.trim()).length >= 2,
  ];
  const readiness = Math.round((quickChecks.filter(Boolean).length / quickChecks.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => goBack()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Will & Estate Planner</h1>
              <p className="text-muted-foreground text-sm">
                Draft your will, manage digital assets & understand Indian succession laws
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Badge variant={readiness >= 80 ? "default" : readiness >= 50 ? "secondary" : "outline"} className="text-sm px-3 py-1">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              {readiness}% Ready
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 h-auto">
            <TabsTrigger value="personal" className="flex items-center gap-1.5 text-xs md:text-sm py-2.5">
              <User className="h-4 w-4" /> <span className="hidden md:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="flex items-center gap-1.5 text-xs md:text-sm py-2.5">
              <Users className="h-4 w-4" /> <span className="hidden md:inline">Beneficiaries</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-1.5 text-xs md:text-sm py-2.5">
              <Briefcase className="h-4 w-4" /> <span className="hidden md:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="witnesses" className="flex items-center gap-1.5 text-xs md:text-sm py-2.5">
              <Eye className="h-4 w-4" /> <span className="hidden md:inline">Witnesses</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-1.5 text-xs md:text-sm py-2.5">
              <Scale className="h-4 w-4" /> <span className="hidden md:inline">Legal & Tax</span>
            </TabsTrigger>
            <TabsTrigger value="readiness" className="flex items-center gap-1.5 text-xs md:text-sm py-2.5">
              <Shield className="h-4 w-4" /> <span className="hidden md:inline">Readiness</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1.5 text-xs md:text-sm py-2.5">
              <FileText className="h-4 w-4" /> <span className="hidden md:inline">Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal"><PersonalInfoTab data={data} onChange={update} /></TabsContent>
          <TabsContent value="beneficiaries"><BeneficiariesTab beneficiaries={data.beneficiaries} onChange={b => update({ beneficiaries: b })} /></TabsContent>
          <TabsContent value="assets"><AssetsTab assets={data.assets} onChange={a => update({ assets: a })} /></TabsContent>
          <TabsContent value="witnesses"><WitnessCodicilTab witnesses={data.witnesses} codicils={data.codicils} onWitnessChange={w => update({ witnesses: w })} onCodicilChange={c => update({ codicils: c })} /></TabsContent>
          <TabsContent value="legal"><LegalTaxTab religion={data.religion} totalEstateValue={totalEstateValue} /></TabsContent>
          <TabsContent value="readiness"><ReadinessTab data={data} /></TabsContent>
          <TabsContent value="preview"><PreviewTab data={data} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WillEstatePlanner;

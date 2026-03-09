import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Landmark, Scale, IndianRupee, FileText, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Props {
  religion: string;
  totalEstateValue: number;
}

const LegalTaxTab = ({ religion, totalEstateValue }: Props) => {
  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");

  const successionLaws = [
    { id: "hindu", religion: "Hindu / Sikh / Jain / Buddhist", law: "Hindu Succession Act, 1956 (amended 2005)", points: [
      "Daughters have equal coparcenary rights (2005 amendment)",
      "Class I heirs: Mother, Widow, Sons, Daughters share equally",
      "Self-acquired property can be willed freely",
      "Ancestral property — limited testamentary power for coparcenary share",
      "Hindu Undivided Family (HUF) property has special rules",
    ]},
    { id: "muslim", religion: "Muslim", law: "Muslim Personal Law (Shariat)", points: [
      "Will (Wasiyat) limited to 1/3rd of estate for non-heirs",
      "Fixed shares (Faraid) for legal heirs cannot be overridden",
      "Wife gets 1/8th (with children) or 1/4th (without children)",
      "Husband gets 1/4th (with children) or 1/2 (without children)",
      "Shia and Sunni succession differ in details",
    ]},
    { id: "christian", religion: "Christian", law: "Indian Succession Act, 1925", points: [
      "1/3rd to widow, 2/3rd divided among children equally",
      "No distinction between sons and daughters",
      "If no children, widow gets half, rest to kindred",
      "Full testamentary freedom — entire estate can be willed",
    ]},
    { id: "parsi", religion: "Parsi", law: "Indian Succession Act, 1925 (Parsi special rules)", points: [
      "Widow and children share equally",
      "If no children, widow gets half",
      "Parents share if no lineal descendants",
      "Full testamentary freedom available",
    ]},
  ];

  const taxImplications = [
    { title: "No Inheritance Tax in India", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", description: "India abolished estate duty in 1985. There is currently no inheritance or estate tax. Property received via will/inheritance is not taxable as income." },
    { title: "Capital Gains on Sale of Inherited Property", icon: IndianRupee, color: "text-amber-500", bg: "bg-amber-500/10", description: "When inherited property is sold, capital gains tax applies. Cost of acquisition = cost to previous owner. Holding period includes original owner's period. LTCG exemption available under Section 54/54F if reinvested." },
    { title: "Stamp Duty on Property Transfer", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", description: "Stamp duty varies by state (typically 1-8%). Transfer via registered will may attract nominal stamp duty. Some states exempt will-based transfers. Mutation charges apply separately." },
    { title: "Income from Inherited Assets", icon: IndianRupee, color: "text-purple-500", bg: "bg-purple-500/10", description: "Rental income from inherited property is taxable. Interest/dividends from inherited investments are taxable. Clubbing provisions don't apply to inherited income." },
    { title: "Will Registration", icon: Scale, color: "text-cyan-500", bg: "bg-cyan-500/10", description: "Registration is optional but strongly recommended. Registered wills are harder to challenge. Registration fee is nominal (₹50-500 depending on state). Can be registered at any Sub-Registrar's office." },
  ];

  return (
    <div className="space-y-6">
      {/* Tax Implications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <IndianRupee className="h-5 w-5 text-primary" /> Tax Implications on Inheritance
          </CardTitle>
          <CardDescription>Understanding tax obligations for estates in India</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxImplications.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={`p-4 rounded-lg border ${item.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${item.color}`} />
                  <div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {totalEstateValue > 0 && (
            <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Your Estate: {formatCurrency(totalEstateValue)}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    No inheritance tax applies. However, if beneficiaries sell inherited assets, capital gains tax will apply based on holding period and asset type.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Succession Laws */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Landmark className="h-5 w-5 text-primary" /> Indian Succession Laws
          </CardTitle>
          <CardDescription>
            Applicable law based on your religion: <Badge variant="secondary">{religion}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={[religion === "hindu" ? "hindu" : religion === "muslim" ? "muslim" : religion === "christian" ? "christian" : "parsi"]}>
            {successionLaws.map(law => (
              <AccordionItem key={law.id} value={law.id}>
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    {law.id === religion && <Badge className="bg-primary text-primary-foreground text-[10px]">Your Law</Badge>}
                    {law.religion} — {law.law}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {law.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Legal Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5 text-primary" /> Legal Requirements for a Valid Will
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { text: "Testator must be of sound mind", required: true },
              { text: "Testator must be 18+ years of age", required: true },
              { text: "Will must be signed by testator", required: true },
              { text: "Two witnesses must sign (not beneficiaries)", required: true },
              { text: "Will should be dated", required: true },
              { text: "Registration at Sub-Registrar office", required: false },
              { text: "Notarization by notary public", required: false },
              { text: "Video recording of signing", required: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                {item.required ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm">{item.text}</span>
                <Badge variant={item.required ? "default" : "outline"} className="ml-auto text-[10px]">
                  {item.required ? "Mandatory" : "Recommended"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalTaxTab;

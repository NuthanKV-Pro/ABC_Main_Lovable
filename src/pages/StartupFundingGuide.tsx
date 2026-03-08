import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Rocket, ExternalLink, Search, Landmark, Users, Building2, Zap } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

interface FundingEntry {
  name: string;
  description: string;
  stage?: string;
  sector?: string;
  ticketSize?: string;
  website: string;
  keyPeople?: { name: string; linkedin: string }[];
  type?: string;
}

const GOVT_SCHEMES: FundingEntry[] = [
  { name: "Startup India Seed Fund", description: "Up to ₹50L for validation, prototype & market entry. DPIIT registered startups.", stage: "Seed", sector: "Agnostic", ticketSize: "₹25L–₹50L", website: "https://seedfund.startupindia.gov.in", type: "Central" },
  { name: "MUDRA Loan (PMMY)", description: "Collateral-free loans up to ₹10L for micro enterprises. Shishu/Kishore/Tarun tiers.", stage: "Pre-Seed", sector: "MSME", ticketSize: "₹50K–₹10L", website: "https://www.mudra.org.in", type: "Central" },
  { name: "Stand-Up India", description: "Loans ₹10L–₹1Cr for SC/ST/Women entrepreneurs in manufacturing, services, or trading.", stage: "Seed", sector: "Manufacturing/Services", ticketSize: "₹10L–₹1Cr", website: "https://www.standupmitra.in", type: "Central" },
  { name: "SIDBI Fund of Funds", description: "₹10,000 Cr corpus investing through SEBI-registered AIFs for startups.", stage: "Series A+", sector: "Agnostic", ticketSize: "Via AIFs", website: "https://www.sidbi.in", type: "Central" },
  { name: "MSME Champions Scheme", description: "Soft loans, subsidies for MSMEs affected by COVID & for new ventures.", stage: "Early", sector: "MSME", ticketSize: "Up to ₹50L", website: "https://champions.gov.in", type: "Central" },
  { name: "Atal Innovation Mission (AIM)", description: "Atal Incubation Centers, Tinkering Labs, and grants for innovative startups.", stage: "Ideation/Seed", sector: "Deep Tech/Innovation", ticketSize: "₹10Cr to incubators", website: "https://aim.gov.in", type: "Central" },
  { name: "BioNEST (DBT)", description: "Bio-incubators and grants for biotech, healthcare, agri-biotech startups.", stage: "Seed/Early", sector: "Biotech/Healthcare", ticketSize: "₹50L–₹1Cr", website: "https://birac.nic.in", type: "Central" },
  { name: "Maharashtra State Innovation (MSInS)", description: "Grants, incubation support for Maharashtra-based startups.", stage: "Seed", sector: "Agnostic", ticketSize: "Up to ₹15L", website: "https://msins.in", type: "Maharashtra" },
  { name: "Karnataka Elevate", description: "Interest-free loans up to ₹50L for Karnataka startups.", stage: "Seed/Early", sector: "Agnostic", ticketSize: "Up to ₹50L", website: "https://startup.karnataka.gov.in", type: "Karnataka" },
  { name: "T-Hub (Telangana)", description: "India's largest incubator, mentorship + funding connect.", stage: "Seed/Growth", sector: "Tech", ticketSize: "Varies", website: "https://t-hub.co", type: "Telangana" },
  { name: "Kerala KSUM", description: "Grants, incubation, and seed funding for Kerala startups.", stage: "Seed", sector: "Agnostic", ticketSize: "Up to ₹25L", website: "https://startupmission.kerala.gov.in", type: "Kerala" },
  { name: "Gujarat iCreate", description: "International Centre for Entrepreneurship & Technology. Incubation, mentorship, seed funding.", stage: "Seed/Early", sector: "Tech, Manufacturing", ticketSize: "Up to ₹30L", website: "https://icreate.org.in", type: "Gujarat" },
  { name: "Gujarat Startup Policy", description: "Sustenance allowance ₹20K/month for 2 years, seed support up to ₹30L, patent assistance.", stage: "Pre-Seed to Seed", sector: "Agnostic", ticketSize: "₹20K/mo + ₹30L", website: "https://startup.gujarat.gov.in", type: "Gujarat" },
  { name: "Tamil Nadu TANSEED", description: "Tamil Nadu Startup Seed Grant Fund. Up to ₹10L for early-stage Tamil Nadu startups.", stage: "Seed", sector: "Agnostic", ticketSize: "Up to ₹10L", website: "https://startuptn.in", type: "Tamil Nadu" },
  { name: "StartupTN (Tamil Nadu)", description: "Incubation, mentorship, co-working spaces, and TICEL Bio Park support.", stage: "Ideation to Growth", sector: "Tech, Biotech, Manufacturing", ticketSize: "Varies", website: "https://startuptn.in", type: "Tamil Nadu" },
  { name: "UP Startup Policy", description: "Incubation fund ₹20Cr, seed fund for UP-based startups, stamp duty reimbursement.", stage: "Pre-Seed to Seed", sector: "Agnostic", ticketSize: "Up to ₹20L", website: "https://startup.up.gov.in", type: "Uttar Pradesh" },
  { name: "UP Electronics Corporation (UPLC)", description: "IT/ITES startup support with subsidies, incubation in Lucknow & Noida.", stage: "Seed/Early", sector: "IT/ITES", ticketSize: "Varies", website: "https://uplc.in", type: "Uttar Pradesh" },
  { name: "Rajasthan iStart", description: "Sustenance allowance ₹20K/month, seed funding up to ₹25L, marketing assistance.", stage: "Pre-Seed to Seed", sector: "Agnostic", ticketSize: "₹20K/mo + ₹25L", website: "https://istart.rajasthan.gov.in", type: "Rajasthan" },
  { name: "Rajasthan BHAMASHAH Techno Fund", description: "Technology fund for Rajasthan startups with grants and equity support.", stage: "Seed/Early", sector: "Tech", ticketSize: "Up to ₹25L", website: "https://istart.rajasthan.gov.in", type: "Rajasthan" },
];

const VCS: FundingEntry[] = [
  { name: "Peak XV Partners (fka Sequoia India)", description: "India's largest VC. Backs Razorpay, Zomato, BYJU'S, Meesho.", stage: "Seed to Growth", sector: "Consumer, SaaS, Fintech", ticketSize: "$0.5M–$100M+", website: "https://www.peakxv.com", keyPeople: [{ name: "Rajan Anandan", linkedin: "https://www.linkedin.com/in/rajananandan/" }, { name: "Shailendra Singh", linkedin: "https://www.linkedin.com/in/shailendrasingh/" }] },
  { name: "Accel", description: "Early-stage focus. Portfolio: Flipkart, Swiggy, BrowserStack, Freshworks.", stage: "Seed to Series B", sector: "SaaS, Consumer, Fintech", ticketSize: "$0.5M–$50M", website: "https://www.accel.com", keyPeople: [{ name: "Prashanth Prakash", linkedin: "https://www.linkedin.com/in/prashanthprakash/" }, { name: "Anand Daniel", linkedin: "https://www.linkedin.com/in/ananddaniel/" }] },
  { name: "Blume Ventures", description: "Seed-stage leader. Portfolio: Unacademy, Slice, Carbon Clean, Purplle.", stage: "Pre-Seed to Series A", sector: "Agnostic", ticketSize: "$0.1M–$5M", website: "https://blume.vc", keyPeople: [{ name: "Karthik Reddy", linkedin: "https://www.linkedin.com/in/karthikreddy/" }, { name: "Sanjay Nath", linkedin: "https://www.linkedin.com/in/sanjaynath/" }] },
  { name: "Matrix Partners India (Z47)", description: "Early-stage. Backed Razorpay, Ola, Dailyhunt, Quikr.", stage: "Seed to Series B", sector: "Consumer, SaaS, Healthcare", ticketSize: "$1M–$20M", website: "https://www.z47.com", keyPeople: [{ name: "Avnish Bajaj", linkedin: "https://www.linkedin.com/in/avnishbajaj/" }, { name: "Vikram Vaidyanathan", linkedin: "https://www.linkedin.com/in/vikramvaidyanathan/" }] },
  { name: "Kalaari Capital", description: "Early-stage. Portfolio: Myntra, Urban Ladder, CureFit, Dream11.", stage: "Seed to Series A", sector: "Consumer Tech, D2C, Healthtech", ticketSize: "$0.5M–$10M", website: "https://www.kalaari.com", keyPeople: [{ name: "Vani Kola", linkedin: "https://www.linkedin.com/in/vanikola/" }] },
  { name: "Nexus Venture Partners", description: "India-US VC. Backed Delhivery, Unacademy, Postman, Druva.", stage: "Seed to Series B", sector: "Enterprise, Deep Tech, Health", ticketSize: "$1M–$30M", website: "https://nexusvp.com", keyPeople: [{ name: "Pratik Poddar", linkedin: "https://www.linkedin.com/in/pratikpoddar/" }] },
  { name: "Lightspeed India", description: "Growth-stage. Backed Byju's, Oyo, Udaan, ShareChat.", stage: "Series A+", sector: "Consumer, SaaS", ticketSize: "$5M–$100M+", website: "https://lsvp.com", keyPeople: [{ name: "Dev Khare", linkedin: "https://www.linkedin.com/in/devkhare/" }] },
  { name: "Elevation Capital", description: "fka SAIF Partners. Portfolio: Paytm, Meesho, Urban Company, ShareChat.", stage: "Seed to Growth", sector: "Consumer, Fintech, B2B", ticketSize: "$1M–$50M", website: "https://www.elevationcapital.com", keyPeople: [{ name: "Ravi Adusumalli", linkedin: "https://www.linkedin.com/in/raviadusumalli/" }] },
  { name: "Tiger Global", description: "US-based global investor. Major India bets: Flipkart, Ola, Razorpay.", stage: "Series A to Late", sector: "Tech, Consumer", ticketSize: "$10M–$200M+", website: "https://www.tigerglobal.com", keyPeople: [{ name: "Scott Shleifer", linkedin: "https://www.linkedin.com/in/scottshleifer/" }] },
  { name: "3one4 Capital", description: "Bangalore-based. Backed Licious, Darwinbox, Open Financial.", stage: "Seed to Series B", sector: "SaaS, Consumer, Fintech", ticketSize: "$0.5M–$15M", website: "https://3one4.com", keyPeople: [{ name: "Pranav Pai", linkedin: "https://www.linkedin.com/in/pranavpai/" }, { name: "Siddarth Pai", linkedin: "https://www.linkedin.com/in/siddarthpai/" }] },
  { name: "Chiratae Ventures", description: "fka IDG Ventures India. Portfolio: Myntra, Lenskart, Firstcry, PolicyBazaar.", stage: "Seed to Series B", sector: "Consumer, SaaS, Healthcare", ticketSize: "$1M–$20M", website: "https://www.chiratae.com", keyPeople: [{ name: "Sudhir Sethi", linkedin: "https://www.linkedin.com/in/sudhirsethi/" }, { name: "TC Meenakshisundaram", linkedin: "https://www.linkedin.com/in/tcmeenakshisundaram/" }] },
  { name: "India Quotient", description: "Early-stage fund backing Bharat-first startups. Portfolio: ShareChat, Sugar Cosmetics, Doubtnut.", stage: "Pre-Seed to Series A", sector: "Consumer, Vernacular, D2C", ticketSize: "$0.1M–$3M", website: "https://www.indiaquotient.in", keyPeople: [{ name: "Anand Lunia", linkedin: "https://www.linkedin.com/in/anandlunia/" }, { name: "Madhukar Sinha", linkedin: "https://www.linkedin.com/in/madhukarsinha/" }] },
  { name: "Stellaris Venture Partners", description: "Early-stage. Portfolio: Mamaearth, Observe.AI, Mygate, Navi.", stage: "Seed to Series A", sector: "Consumer, SaaS, Fintech", ticketSize: "$0.5M–$8M", website: "https://www.stellarisventures.com", keyPeople: [{ name: "Alok Goyal", linkedin: "https://www.linkedin.com/in/alokgoyal/" }, { name: "Rahul Chowdhri", linkedin: "https://www.linkedin.com/in/rahulchowdhri/" }] },
];

const ANGELS: FundingEntry[] = [
  { name: "Indian Angel Network (IAN)", description: "India's first & largest angel network. 500+ angels. Funded 200+ startups.", stage: "Pre-Seed to Seed", sector: "Agnostic", ticketSize: "₹25L–₹5Cr", website: "https://www.indianangelnetwork.com", keyPeople: [{ name: "Padmaja Ruparel", linkedin: "https://www.linkedin.com/in/padmajaruparel/" }, { name: "Saurabh Srivastava", linkedin: "https://www.linkedin.com/in/saurabh-srivastava/" }] },
  { name: "Mumbai Angels", description: "Network of experienced CXOs and entrepreneurs investing in early-stage startups.", stage: "Pre-Seed to Seed", sector: "Agnostic", ticketSize: "₹25L–₹3Cr", website: "https://www.mumbaiangels.com", keyPeople: [{ name: "Nandini Mansinghka", linkedin: "https://www.linkedin.com/in/nandinimansinghka/" }] },
  { name: "LetsVenture", description: "Platform connecting startups with 5000+ angels and micro-VCs.", stage: "Pre-Seed to Seed", sector: "Agnostic", ticketSize: "₹10L–₹5Cr", website: "https://www.letsventure.com", keyPeople: [{ name: "Shanti Mohan", linkedin: "https://www.linkedin.com/in/shantimohan/" }] },
  { name: "AngelList India", description: "Syndicates and rolling funds for Indian startups.", stage: "Pre-Seed to Series A", sector: "Tech", ticketSize: "₹25L–₹10Cr", website: "https://www.angellist.in", keyPeople: [{ name: "Utsav Somani", linkedin: "https://www.linkedin.com/in/utsavsomani/" }] },
  { name: "Venture Catalysts (9Unicorns)", description: "Integrated incubator + accelerator. Large seed fund backing 400+ startups.", stage: "Pre-Seed to Seed", sector: "Consumer, D2C, Tech", ticketSize: "₹25L–₹2Cr", website: "https://www.venturecatalysts.in", keyPeople: [{ name: "Apoorva Ranjan Sharma", linkedin: "https://www.linkedin.com/in/apoorvaranjansharma/" }, { name: "Anuj Golecha", linkedin: "https://www.linkedin.com/in/anujgolecha/" }] },
  { name: "Titan Capital", description: "Personal fund of Flipkart founders. 200+ investments.", stage: "Seed", sector: "Tech, Consumer, SaaS", ticketSize: "₹50L–₹3Cr", website: "https://www.titancapital.vc", keyPeople: [{ name: "Sachin Bansal", linkedin: "https://www.linkedin.com/in/sachinbansal/" }, { name: "Binny Bansal", linkedin: "https://www.linkedin.com/in/binnybansal/" }] },
  { name: "Calcutta Angels", description: "Eastern India's premier angel network. Active since 2014, investing in early-stage startups.", stage: "Pre-Seed to Seed", sector: "Agnostic", ticketSize: "₹25L–₹2Cr", website: "https://www.calcuttaangels.com", keyPeople: [{ name: "Sanjiv Saran", linkedin: "https://www.linkedin.com/in/sanjivsaran/" }] },
  { name: "Hyderabad Angels", description: "One of India's most active angel groups. 100+ angels funding tech and pharma startups.", stage: "Pre-Seed to Seed", sector: "Tech, Healthcare, Pharma", ticketSize: "₹25L–₹3Cr", website: "https://www.hyderabadangels.in", keyPeople: [{ name: "Vijay Kancharla", linkedin: "https://www.linkedin.com/in/vijaykancharla/" }] },
  { name: "Chennai Angels", description: "South India angel network backing startups in SaaS, healthcare, and manufacturing.", stage: "Pre-Seed to Seed", sector: "SaaS, Healthcare, Manufacturing", ticketSize: "₹25L–₹2Cr", website: "https://www.chennaiangels.com", keyPeople: [{ name: "Sriram Subramanya", linkedin: "https://www.linkedin.com/in/sriramsubramanya/" }] },
];

const ALL_STAGES = ["Pre-Seed", "Seed", "Series A", "Series A+", "Growth", "All"];
const ALL_SECTORS = ["Agnostic", "SaaS", "Consumer", "Fintech", "Healthcare", "Deep Tech", "D2C", "MSME", "All"];

const StartupFundingGuide = () => {
  const goBack = useGoBack();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("All");

  const filterEntries = (entries: FundingEntry[]) => {
    return entries.filter(e => {
      const matchSearch = search === "" || e.name.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
      const matchStage = stageFilter === "All" || (e.stage || "").toLowerCase().includes(stageFilter.toLowerCase());
      const matchSector = sectorFilter === "All" || (e.sector || "").toLowerCase().includes(sectorFilter.toLowerCase());
      return matchSearch && matchStage && matchSector;
    });
  };

  const filteredGovt = useMemo(() => filterEntries(GOVT_SCHEMES), [search, stageFilter, sectorFilter]);
  const filteredVCs = useMemo(() => filterEntries(VCS), [search, stageFilter, sectorFilter]);
  const filteredAngels = useMemo(() => filterEntries(ANGELS), [search, stageFilter, sectorFilter]);
  const filteredAccelerators = useMemo(() => filterEntries(ACCELERATORS), [search, stageFilter, sectorFilter]);

  const renderCard = (entry: FundingEntry) => (
    <Card key={entry.name} className="hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{entry.name}</CardTitle>
            <CardDescription className="mt-1">{entry.description}</CardDescription>
          </div>
          <a href={entry.website} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {entry.stage && <Badge variant="outline" className="text-xs">{entry.stage}</Badge>}
          {entry.sector && <Badge variant="secondary" className="text-xs">{entry.sector}</Badge>}
          {entry.ticketSize && <Badge variant="outline" className="text-xs border-primary/30 text-primary">{entry.ticketSize}</Badge>}
          {entry.type && <Badge variant="outline" className="text-xs">{entry.type}</Badge>}
        </div>
        {entry.keyPeople && entry.keyPeople.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {entry.keyPeople.map(p => (
              <a key={p.name} href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Users className="h-3 w-3" /> {p.name}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Rocket className="h-6 w-6 text-primary" /> Indian Startup Funding Guide</h1>
            <p className="text-sm text-muted-foreground">Govt schemes, VCs, angel networks — all in one place</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search funds, schemes, VCs..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>{ALL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Sector" /></SelectTrigger>
              <SelectContent>{ALL_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Tabs defaultValue="govt" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="govt" className="flex items-center gap-1"><Landmark className="h-4 w-4" /> Govt ({filteredGovt.length})</TabsTrigger>
            <TabsTrigger value="vcs" className="flex items-center gap-1"><Building2 className="h-4 w-4" /> VCs ({filteredVCs.length})</TabsTrigger>
            <TabsTrigger value="angels" className="flex items-center gap-1"><Users className="h-4 w-4" /> Angels ({filteredAngels.length})</TabsTrigger>
            <TabsTrigger value="accelerators" className="flex items-center gap-1"><Zap className="h-4 w-4" /> Accelerators ({filteredAccelerators.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="govt">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGovt.length > 0 ? filteredGovt.map(renderCard) : <p className="text-muted-foreground text-center col-span-2 py-8">No matching schemes found.</p>}
            </div>
          </TabsContent>

          <TabsContent value="vcs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVCs.length > 0 ? filteredVCs.map(renderCard) : <p className="text-muted-foreground text-center col-span-2 py-8">No matching VCs found.</p>}
            </div>
          </TabsContent>

          <TabsContent value="angels">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAngels.length > 0 ? filteredAngels.map(renderCard) : <p className="text-muted-foreground text-center col-span-2 py-8">No matching angel networks found.</p>}
            </div>
          </TabsContent>

          <TabsContent value="accelerators">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAccelerators.length > 0 ? filteredAccelerators.map(renderCard) : <p className="text-muted-foreground text-center col-span-2 py-8">No matching accelerators found.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StartupFundingGuide;

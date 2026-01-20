import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale, Search, BookOpen, FileText, Gavel, Filter, ChevronDown, ExternalLink, Clock, Tag, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CaseLaw {
  id: string;
  title: string;
  citation: string;
  court: string;
  date: string;
  category: string;
  summary: string;
  keyPrinciples: string[];
  relevantSections: string[];
  verdict: "favor_taxpayer" | "favor_revenue" | "partial" | "remanded";
}

const sampleCaseLaws: CaseLaw[] = [
  {
    id: "1",
    title: "CIT vs. Vodafone India Services Pvt. Ltd.",
    citation: "[2024] 158 taxmann.com 456 (SC)",
    court: "Supreme Court of India",
    date: "2024-01-15",
    category: "Transfer Pricing",
    summary: "The Supreme Court held that the arm's length principle must be applied considering the economic substance of transactions rather than mere legal form. The court emphasized the importance of functional analysis in determining comparables.",
    keyPrinciples: [
      "Economic substance over legal form",
      "Functional analysis is paramount in TP cases",
      "Comparability requires similar risk profiles"
    ],
    relevantSections: ["Section 92", "Section 92C", "Section 92CA"],
    verdict: "favor_taxpayer"
  },
  {
    id: "2",
    title: "PCIT vs. Maruti Suzuki India Ltd.",
    citation: "[2023] 150 taxmann.com 289 (Del)",
    court: "Delhi High Court",
    date: "2023-11-20",
    category: "Depreciation",
    summary: "The court ruled that additional depreciation under Section 32(1)(iia) is available on all plant and machinery acquired and installed after the specified date, regardless of whether the assessee is engaged in manufacturing or production.",
    keyPrinciples: [
      "Liberal interpretation of beneficial provisions",
      "Additional depreciation eligibility criteria",
      "Manufacturing vs. production distinction"
    ],
    relevantSections: ["Section 32(1)(iia)", "Section 32"],
    verdict: "favor_taxpayer"
  },
  {
    id: "3",
    title: "ACIT vs. Infosys Technologies Ltd.",
    citation: "[2023] 145 taxmann.com 123 (Bang)",
    court: "Bangalore ITAT",
    date: "2023-08-10",
    category: "Software Expenses",
    summary: "The Tribunal held that expenditure on software licenses for business operations constitutes revenue expenditure and not capital expenditure, as the software does not provide enduring benefit beyond the license period.",
    keyPrinciples: [
      "Revenue vs. capital expenditure distinction",
      "Enduring benefit test for capitalization",
      "Treatment of software license costs"
    ],
    relevantSections: ["Section 37(1)", "Section 32"],
    verdict: "favor_taxpayer"
  },
  {
    id: "4",
    title: "DCIT vs. Reliance Industries Ltd.",
    citation: "[2024] 160 taxmann.com 789 (Mum)",
    court: "Mumbai ITAT",
    date: "2024-02-28",
    category: "Capital Gains",
    summary: "The Tribunal examined the treatment of slump sale transactions and held that the consideration received must be bifurcated between assets and liabilities for computing capital gains under Section 50B.",
    keyPrinciples: [
      "Slump sale computation methodology",
      "Net worth calculation for Section 50B",
      "Treatment of contingent liabilities"
    ],
    relevantSections: ["Section 50B", "Section 45", "Section 2(42C)"],
    verdict: "partial"
  },
  {
    id: "5",
    title: "CIT vs. Samsung India Electronics Pvt. Ltd.",
    citation: "[2023] 148 taxmann.com 567 (Del)",
    court: "Delhi High Court",
    date: "2023-09-15",
    category: "Advertisement & Marketing",
    summary: "The court addressed AMP (Advertising, Marketing, and Promotion) expenses in transfer pricing context, holding that routine AMP expenditure cannot be presumed to create marketing intangibles for the foreign AE.",
    keyPrinciples: [
      "AMP expenses treatment in TP",
      "Bright Line Test applicability",
      "Marketing intangibles ownership"
    ],
    relevantSections: ["Section 92", "Section 92B", "Section 37(1)"],
    verdict: "favor_taxpayer"
  },
  {
    id: "6",
    title: "Principal CIT vs. NRA Iron & Steel Pvt. Ltd.",
    citation: "[2019] 103 taxmann.com 48 (SC)",
    court: "Supreme Court of India",
    date: "2019-03-05",
    category: "Cash Credits",
    summary: "The Supreme Court laid down the law regarding burden of proof in unexplained cash credit cases under Section 68, holding that merely furnishing PAN and bank statements is insufficient if creditworthiness and genuineness are not established.",
    keyPrinciples: [
      "Three-fold burden under Section 68",
      "Identity, creditworthiness, and genuineness",
      "Shifting burden of proof"
    ],
    relevantSections: ["Section 68", "Section 69"],
    verdict: "favor_revenue"
  },
  {
    id: "7",
    title: "ITAT Delhi vs. Google India Pvt. Ltd.",
    citation: "[2023] 152 taxmann.com 890 (Del)",
    court: "Delhi ITAT",
    date: "2023-12-05",
    category: "Royalty & FTS",
    summary: "The Tribunal examined whether payments for cloud computing services constitute royalty under the Income Tax Act and DTAA, holding that standard cloud services without any transfer of IP do not constitute royalty.",
    keyPrinciples: [
      "Cloud services vs. royalty distinction",
      "Equipment use vs. service provision",
      "DTAA interpretation principles"
    ],
    relevantSections: ["Section 9(1)(vi)", "Section 9(1)(vii)", "Article 12 of DTAA"],
    verdict: "favor_taxpayer"
  },
  {
    id: "8",
    title: "PCIT vs. Flipkart India Pvt. Ltd.",
    citation: "[2024] 159 taxmann.com 234 (Kar)",
    court: "Karnataka High Court",
    date: "2024-01-22",
    category: "E-commerce",
    summary: "The court examined the business model of e-commerce marketplace operators and held that commission income earned by marketplace operators is not liable for TDS under Section 194H as it is not commission in the traditional sense.",
    keyPrinciples: [
      "E-commerce business model analysis",
      "Commission vs. discount distinction",
      "TDS applicability on marketplace earnings"
    ],
    relevantSections: ["Section 194H", "Section 194O", "Section 40(a)(ia)"],
    verdict: "favor_taxpayer"
  }
];

const legalCategories = [
  "All Categories",
  "Transfer Pricing",
  "Depreciation",
  "Software Expenses",
  "Capital Gains",
  "Advertisement & Marketing",
  "Cash Credits",
  "Royalty & FTS",
  "E-commerce",
  "International Taxation",
  "GST",
  "Corporate Law"
];

const courts = [
  "All Courts",
  "Supreme Court of India",
  "Delhi High Court",
  "Mumbai High Court",
  "Karnataka High Court",
  "Madras High Court",
  "Calcutta High Court",
  "Delhi ITAT",
  "Mumbai ITAT",
  "Bangalore ITAT",
  "Chennai ITAT"
];

const LegalInterpretations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCourt, setSelectedCourt] = useState("All Courts");
  const [selectedVerdict, setSelectedVerdict] = useState("all");
  const [analysisQuery, setAnalysisQuery] = useState("");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredCases = sampleCaseLaws.filter(caseItem => {
    const matchesSearch = searchQuery === "" || 
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.relevantSections.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All Categories" || caseItem.category === selectedCategory;
    const matchesCourt = selectedCourt === "All Courts" || caseItem.court === selectedCourt;
    const matchesVerdict = selectedVerdict === "all" || caseItem.verdict === selectedVerdict;

    return matchesSearch && matchesCategory && matchesCourt && matchesVerdict;
  });

  const getVerdictBadge = (verdict: CaseLaw["verdict"]) => {
    switch (verdict) {
      case "favor_taxpayer":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">In Favor of Taxpayer</Badge>;
      case "favor_revenue":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">In Favor of Revenue</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Partial Relief</Badge>;
      case "remanded":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Remanded</Badge>;
    }
  };

  const handleAnalysis = () => {
    if (!analysisQuery.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in production, this would call an AI API)
    setTimeout(() => {
      const analysis = generateLegalAnalysis(analysisQuery);
      setAnalysisResult(analysis);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateLegalAnalysis = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("depreciation") || lowerQuery.includes("32")) {
      return `**Legal Analysis: Depreciation Claims**

**Applicable Provisions:**
- Section 32 of the Income Tax Act, 1961
- Rule 5 of the Income Tax Rules

**Key Judicial Precedents:**

1. **CIT vs. ICICI Bank Ltd. [2020] SC** - Established that depreciation is mandatory and not optional for computing taxable income.

2. **PCIT vs. Maruti Suzuki India Ltd. [2023]** - Additional depreciation under Section 32(1)(iia) is available on all new plant and machinery.

**Analysis:**
The law on depreciation has evolved significantly through judicial interpretations. The Supreme Court in multiple rulings has emphasized that:

• Depreciation represents the diminution in the value of assets and must be allowed as a deduction.
• The concept of "block of assets" introduced by the 1988 amendment simplifies depreciation computation.
• Additional depreciation at 20% is available for new manufacturing plant and machinery.

**Recommendations:**
1. Maintain proper records of asset acquisition and installation dates
2. Ensure assets are classified in correct depreciation blocks
3. Claim additional depreciation in the year of installation itself
4. Document the business use of assets to support depreciation claims`;
    }
    
    if (lowerQuery.includes("transfer pricing") || lowerQuery.includes("92")) {
      return `**Legal Analysis: Transfer Pricing Provisions**

**Applicable Provisions:**
- Sections 92 to 92F of the Income Tax Act, 1961
- Transfer Pricing Rules 10A to 10E

**Key Judicial Precedents:**

1. **CIT vs. Vodafone India [2024] SC** - Arm's length principle requires economic substance analysis.

2. **Sony Ericsson Mobile [2015] Delhi HC** - Aggregation of transactions is permissible when functionally interwoven.

**Analysis:**
Transfer pricing provisions aim to ensure that international transactions between associated enterprises are conducted at arm's length prices. Key considerations include:

• **Comparability Analysis**: Selection of comparable companies must consider functional, asset, and risk profiles.
• **Most Appropriate Method**: The method providing the most reliable measure of arm's length price should be selected.
• **Documentation**: Contemporaneous documentation is crucial for defending transfer pricing positions.

**Recommendations:**
1. Prepare robust transfer pricing documentation annually
2. Conduct thorough functional analysis of transactions
3. Use multiple year data for comparability analysis
4. Consider Advance Pricing Agreements for certainty`;
    }
    
    if (lowerQuery.includes("capital gain") || lowerQuery.includes("45") || lowerQuery.includes("property")) {
      return `**Legal Analysis: Capital Gains Taxation**

**Applicable Provisions:**
- Section 45 to 55A of the Income Tax Act, 1961
- Sections 54, 54EC, 54F for exemptions

**Key Judicial Precedents:**

1. **CIT vs. Balbir Singh Maini [2017] SC** - JDA without actual transfer doesn't trigger capital gains.

2. **Sanjeev Lal vs. CIT [2014] SC** - Date of agreement determines the holding period, not registration.

**Analysis:**
Capital gains taxation in India distinguishes between short-term and long-term gains based on the holding period:

• **Immovable Property**: Holding period of 24 months for LTCG
• **Listed Securities**: 12 months for LTCG with special tax rates
• **Indexation Benefit**: Available for long-term capital assets (except listed securities)

**Key Exemptions:**
- Section 54: Reinvestment in residential property
- Section 54EC: Investment in specified bonds
- Section 54F: Reinvestment from non-residential property sale

**Recommendations:**
1. Plan property transactions considering holding periods
2. Utilize exemption provisions through timely reinvestment
3. Maintain documentation of cost of acquisition and improvements
4. Consider advance tax implications of capital gains`;
    }
    
    // Default analysis
    return `**Legal Analysis: ${query}**

**General Framework:**
The Indian tax and corporate law framework is governed by multiple statutes including the Income Tax Act, 1961, Companies Act, 2013, and various rules and regulations.

**Key Considerations:**

1. **Statutory Provisions**: Identify the specific sections and rules applicable to your query.

2. **Judicial Precedents**: Case laws from the Supreme Court, High Courts, and Tribunals provide interpretive guidance.

3. **Circulars & Notifications**: CBDT circulars and notifications clarify departmental positions.

**Analysis Approach:**
For a detailed analysis, please consider:

• The specific facts and circumstances of your case
• Applicable statutory provisions and their legislative history
• Relevant judicial precedents from similar fact patterns
• Recent amendments or circulars that may impact interpretation

**Recommendations:**
1. Consult with a qualified legal professional for case-specific advice
2. Maintain comprehensive documentation
3. Consider advance rulings for significant transactions
4. Stay updated on recent judicial developments

*Note: This is an AI-generated analysis for educational purposes. Please consult a qualified legal professional for specific advice.*`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Legal Interpretations</h1>
          </div>
          <p className="text-muted-foreground">Search case laws, analyze legal provisions, and understand judicial precedents</p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Case Search
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Legal Analysis
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Key Sections
            </TabsTrigger>
          </TabsList>

          {/* Case Law Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Search Case Laws
                </CardTitle>
                <CardDescription>
                  Search through landmark judgments and tribunal decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Query</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by case name, citation, section, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-auto">
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {legalCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full md:w-auto">
                    <Label>Court</Label>
                    <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courts.map(court => (
                          <SelectItem key={court} value={court}>{court}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full md:w-auto">
                    <Label>Verdict</Label>
                    <Select value={selectedVerdict} onValueChange={setSelectedVerdict}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Verdicts</SelectItem>
                        <SelectItem value="favor_taxpayer">Favor Taxpayer</SelectItem>
                        <SelectItem value="favor_revenue">Favor Revenue</SelectItem>
                        <SelectItem value="partial">Partial Relief</SelectItem>
                        <SelectItem value="remanded">Remanded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Found {filteredCases.length} case(s)
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredCases.map(caseItem => (
                <Card key={caseItem.id} className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{caseItem.title}</h3>
                        <p className="text-sm text-primary font-mono">{caseItem.citation}</p>
                      </div>
                      {getVerdictBadge(caseItem.verdict)}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {caseItem.court}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(caseItem.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {caseItem.category}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-4">{caseItem.summary}</p>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="details" className="border-border/50">
                        <AccordionTrigger className="text-sm hover:no-underline">
                          View Key Principles & Sections
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Key Principles:</h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {caseItem.keyPrinciples.map((principle, idx) => (
                                <li key={idx}>{principle}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Relevant Sections:</h4>
                            <div className="flex flex-wrap gap-2">
                              {caseItem.relevantSections.map((section, idx) => (
                                <Badge key={idx} variant="secondary">{section}</Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}

              {filteredCases.length === 0 && (
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-12 text-center">
                    <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No cases found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Legal Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  AI-Powered Legal Analysis
                </CardTitle>
                <CardDescription>
                  Get instant analysis on tax and legal provisions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="analysis-query">Enter your legal query</Label>
                  <Textarea
                    id="analysis-query"
                    placeholder="E.g., 'What are the provisions for depreciation on software?' or 'Explain transfer pricing compliance requirements'..."
                    value={analysisQuery}
                    onChange={(e) => setAnalysisQuery(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <Button 
                  onClick={handleAnalysis} 
                  disabled={isAnalyzing || !analysisQuery.trim()}
                  className="w-full md:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Query
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {analysisResult && (
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Analysis Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="prose prose-invert max-w-none">
                      {analysisResult.split('\n').map((line, idx) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h3 key={idx} className="text-lg font-bold text-foreground mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                        }
                        if (line.startsWith('•')) {
                          return <p key={idx} className="text-muted-foreground ml-4">{line}</p>;
                        }
                        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
                          return <p key={idx} className="text-muted-foreground ml-4 my-1">{line}</p>;
                        }
                        if (line.trim() === '') {
                          return <br key={idx} />;
                        }
                        return <p key={idx} className="text-muted-foreground">{line}</p>;
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Popular Legal Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "Depreciation under Section 32",
                    "Transfer Pricing Documentation",
                    "Capital Gains Exemptions",
                    "TDS Provisions",
                    "Business Expenditure u/s 37",
                    "Penalty Provisions",
                    "Assessment Procedures",
                    "Appeal Filing Process",
                    "Advance Ruling Mechanism"
                  ].map((topic, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="justify-start h-auto py-3 text-left"
                      onClick={() => {
                        setAnalysisQuery(topic);
                        handleAnalysis();
                      }}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Key Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Key Legal Sections Reference
                </CardTitle>
                <CardDescription>
                  Quick reference to important sections of the Income Tax Act
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="income-heads">
                    <AccordionTrigger>Heads of Income (Sections 14-59)</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p><strong>Section 15-17:</strong> Income from Salaries - Covers salary, perquisites, profits in lieu of salary</p>
                      <p><strong>Section 22-27:</strong> Income from House Property - Annual value, deductions for interest and repairs</p>
                      <p><strong>Section 28-44:</strong> Profits and Gains of Business or Profession - Business income computation</p>
                      <p><strong>Section 45-55:</strong> Capital Gains - Computation of capital gains on asset transfers</p>
                      <p><strong>Section 56-59:</strong> Income from Other Sources - Dividend, interest, gifts, etc.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="deductions">
                    <AccordionTrigger>Deductions (Sections 80C-80U)</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p><strong>Section 80C:</strong> Deduction up to ₹1.5 lakhs for investments in PPF, ELSS, LIC, etc.</p>
                      <p><strong>Section 80D:</strong> Deduction for health insurance premium</p>
                      <p><strong>Section 80E:</strong> Deduction for interest on education loan</p>
                      <p><strong>Section 80G:</strong> Deduction for donations to charitable institutions</p>
                      <p><strong>Section 80TTA/80TTB:</strong> Deduction for savings account interest</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="transfer-pricing">
                    <AccordionTrigger>Transfer Pricing (Sections 92-92F)</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p><strong>Section 92:</strong> Computation of income from international transactions at arm's length price</p>
                      <p><strong>Section 92A:</strong> Definition of Associated Enterprise</p>
                      <p><strong>Section 92B:</strong> Meaning of International Transaction</p>
                      <p><strong>Section 92C:</strong> Computation of Arm's Length Price</p>
                      <p><strong>Section 92CA:</strong> Reference to Transfer Pricing Officer</p>
                      <p><strong>Section 92D:</strong> Documentation requirements</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tds">
                    <AccordionTrigger>TDS Provisions (Sections 192-206)</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p><strong>Section 192:</strong> TDS on Salary</p>
                      <p><strong>Section 194A:</strong> TDS on Interest other than securities</p>
                      <p><strong>Section 194C:</strong> TDS on Contractors</p>
                      <p><strong>Section 194H:</strong> TDS on Commission</p>
                      <p><strong>Section 194J:</strong> TDS on Professional Fees</p>
                      <p><strong>Section 195:</strong> TDS on payments to Non-Residents</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="penalties">
                    <AccordionTrigger>Penalties & Prosecution (Sections 270A-280)</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-muted-foreground">
                      <p><strong>Section 270A:</strong> Penalty for under-reporting and misreporting of income</p>
                      <p><strong>Section 271:</strong> Failure to furnish returns, comply with notices, etc.</p>
                      <p><strong>Section 271B:</strong> Penalty for failure to get accounts audited</p>
                      <p><strong>Section 271C:</strong> Penalty for failure to deduct TDS</p>
                      <p><strong>Section 276C:</strong> Prosecution for willful tax evasion</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>External Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Income Tax India", url: "https://incometaxindia.gov.in", desc: "Official IT Department Portal" },
                    { name: "Indian Kanoon", url: "https://indiankanoon.org", desc: "Free Case Law Search" },
                    { name: "Taxmann", url: "https://www.taxmann.com", desc: "Tax & Corporate Law Database" },
                    { name: "ITAT Online", url: "https://www.itat.gov.in", desc: "Income Tax Appellate Tribunal" }
                  ].map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.desc}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LegalInterpretations;

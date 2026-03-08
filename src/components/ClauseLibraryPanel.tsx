import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, Check, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { clauseDatabase, importanceBadge, type Clause } from "@/lib/clauseDatabase";

interface ClauseLibraryPanelProps {
  onImportClause: (clause: Clause) => void;
  importedClauseIds: Set<string>;
}

const ClauseLibraryPanel = ({ onImportClause, importedClauseIds }: ClauseLibraryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContractType, setSelectedContractType] = useState<string>("All");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const contractTypes = useMemo(() => {
    const types = new Set<string>();
    clauseDatabase.forEach(cat => cat.contractTypes.forEach(t => types.add(t)));
    return ["All", ...Array.from(types).sort()];
  }, []);

  const filteredCategories = useMemo(() => {
    return clauseDatabase.map(category => {
      const filteredClauses = category.clauses.filter(clause => {
        const matchesSearch = !searchQuery ||
          clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clause.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clause.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = selectedContractType === "All" ||
          category.contractTypes.includes(selectedContractType);
        return matchesSearch && matchesType;
      });
      return { ...category, clauses: filteredClauses };
    }).filter(cat => cat.clauses.length > 0);
  }, [searchQuery, selectedContractType]);

  const totalClauses = filteredCategories.reduce((sum, cat) => sum + cat.clauses.length, 0);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleClause = (id: string) => {
    setExpandedClauses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyClause = (clause: Clause) => {
    navigator.clipboard.writeText(clause.fullText);
    setCopiedId(clause.id);
    toast({ title: "Copied!", description: `"${clause.title}" copied to clipboard.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clauses by name, keyword, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {contractTypes.map(type => (
              <Button
                key={type}
                variant={selectedContractType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedContractType(type)}
                className="text-xs"
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {totalClauses} clause{totalClauses !== 1 ? "s" : ""} across {filteredCategories.length} categor{filteredCategories.length !== 1 ? "ies" : "y"}
            </p>
            {importedClauseIds.size > 0 && (
              <Badge variant="secondary" className="text-xs">
                {importedClauseIds.size} imported
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clause Categories */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {filteredCategories.map(category => {
          const Icon = category.icon;
          const isExpanded = expandedCategories[category.id] !== false;

          return (
            <Card key={category.id} className="border-border/50 overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{category.name}</CardTitle>
                          <p className="text-[10px] text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {category.clauses.length}
                        </Badge>
                        {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-2 px-3 pb-3">
                    {category.clauses.map(clause => {
                      const isClauseExpanded = expandedClauses[clause.id];
                      const imp = importanceBadge[clause.importance];
                      const isImported = importedClauseIds.has(clause.id);

                      return (
                        <div key={clause.id} className="border border-border/50 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleClause(clause.id)}
                            className="w-full text-left p-2.5 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-xs">{clause.title}</h3>
                                  <Badge variant="outline" className={`text-[9px] px-1 py-0 ${imp.className}`}>
                                    {imp.label}
                                  </Badge>
                                  {isImported && (
                                    <Badge variant="default" className="text-[9px] px-1 py-0 bg-green-500/20 text-green-400 border-green-500/30">
                                      Imported
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{clause.description}</p>
                              </div>
                              {isClauseExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {clause.tags.slice(0, 4).map(tag => (
                                <span key={tag} className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </button>

                          {isClauseExpanded && (
                            <div className="border-t border-border/50 p-2.5 bg-muted/10">
                              <div className="flex justify-end gap-2 mb-2">
                                <Button
                                  variant={isImported ? "secondary" : "default"}
                                  size="sm"
                                  onClick={() => {
                                    if (!isImported) {
                                      onImportClause(clause);
                                      toast({ title: "Clause Imported!", description: `"${clause.title}" added to your contract.` });
                                    }
                                  }}
                                  disabled={isImported}
                                  className="text-xs gap-1.5 h-7"
                                >
                                  <Plus className="h-3 w-3" />
                                  {isImported ? "Already Imported" : "Import to Contract"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyClause(clause)}
                                  className="text-xs gap-1.5 h-7"
                                >
                                  {copiedId === clause.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  {copiedId === clause.id ? "Copied" : "Copy"}
                                </Button>
                              </div>
                              <pre className="whitespace-pre-wrap text-[10px] leading-relaxed text-foreground/90 font-sans max-h-48 overflow-y-auto">
                                {clause.fullText}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="p-6 text-center">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No clauses found.</p>
            <Button variant="link" size="sm" onClick={() => { setSearchQuery(""); setSelectedContractType("All"); }}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClauseLibraryPanel;

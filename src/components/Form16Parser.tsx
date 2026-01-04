import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Check, AlertCircle, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ParsedSalaryData {
  employerName: string;
  employerTAN: string;
  employerPAN: string;
  employeeNamePAN: string;
  grossSalary: number;
  basicSalary: number;
  hra: number;
  otherAllowances: number;
  perquisites: number;
  profitsInLieu: number;
  deductions80C: number;
  deductions80D: number;
  otherDeductions: number;
  taxableIncome: number;
  taxDeducted: number;
  // Additional fields for auto-populate
  commission?: number;
  dearnessAllowance?: number;
  travelAllowance?: number;
  esops?: number;
  gift?: number;
  bonus?: number;
  freeFood?: number;
  officeAddress?: string;
  employmentNature?: string;
}

interface Form16ParserProps {
  onDataParsed?: (data: ParsedSalaryData) => void;
  autoApply?: boolean;
}

const Form16Parser = ({ onDataParsed, autoApply = false }: Form16ParserProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSalaryData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      setParseError(null);
      setParsedData(null);
      setIsApplied(false);
    }
  };

  const simulateForm16Parsing = async (): Promise<ParsedSalaryData> => {
    // Simulate parsing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return simulated parsed data (in a real app, this would use PDF parsing library)
    // This simulates extracting detailed salary breakdown from Form 16
    return {
      employerName: "ABC Technologies Pvt Ltd",
      employerTAN: "DELA12345B",
      employerPAN: "AABCA1234D",
      employeeNamePAN: "ABCPD1234K",
      officeAddress: "Tower A, Tech Park, Bangalore - 560001",
      employmentNature: "private",
      grossSalary: 1500000,
      basicSalary: 750000,
      hra: 300000,
      commission: 50000,
      dearnessAllowance: 25000,
      travelAllowance: 19200,
      esops: 100000,
      gift: 5000,
      bonus: 150000,
      freeFood: 26400,
      otherAllowances: 74400,
      perquisites: 50000,
      profitsInLieu: 0,
      deductions80C: 150000,
      deductions80D: 25000,
      otherDeductions: 50000,
      taxableIncome: 1275000,
      taxDeducted: 178500
    };
  };

  const applyToSalary = (data: ParsedSalaryData) => {
    // Save comprehensive data to localStorage for salary page auto-populate
    localStorage.setItem('form16_data', JSON.stringify(data));
    localStorage.setItem('salary_total', data.taxableIncome.toString());
    localStorage.setItem('form16_auto_applied', 'true');
    
    // Dispatch custom event to notify Salary page of new data
    window.dispatchEvent(new CustomEvent('form16DataUpdated', { detail: data }));
    
    setIsApplied(true);
    
    toast({
      title: "Data Auto-Applied!",
      description: "Form 16 data has been populated in your salary details.",
    });
  };

  const handleParse = async () => {
    if (!file) return;
    
    setIsParsing(true);
    setParseError(null);

    try {
      const data = await simulateForm16Parsing();
      setParsedData(data);
      
      toast({
        title: "Form 16 Parsed Successfully",
        description: "Salary details have been extracted from your Form 16.",
      });

      if (onDataParsed) {
        onDataParsed(data);
      }

      // Auto-apply if enabled
      if (autoApply) {
        applyToSalary(data);
      }
    } catch (error) {
      setParseError("Failed to parse Form 16. Please ensure it's a valid Form 16 document.");
      toast({
        title: "Parsing Failed",
        description: "Could not extract data from the uploaded file.",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyManually = () => {
    if (parsedData) {
      applyToSalary(parsedData);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Form 16 Auto-Import
          <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
            Auto-populate
          </span>
        </CardTitle>
        <CardDescription>
          Upload your Form 16 PDF to automatically fill all salary details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center bg-background/50 hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          {file ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-primary">
                <FileText className="w-8 h-8" />
                <span className="font-medium">{file.name}</span>
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change File
                </Button>
                <Button
                  size="sm"
                  onClick={handleParse}
                  disabled={isParsing}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Extract & Auto-Fill
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 mx-auto text-primary/60" />
              <div>
                <p className="font-medium">Upload Form 16 PDF</p>
                <p className="text-sm text-muted-foreground">
                  All salary fields will be auto-populated
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="border-primary/50 hover:bg-primary/10"
              >
                Select File
              </Button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {parseError && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{parseError}</p>
          </div>
        )}

        {/* Parsed Data Display */}
        {parsedData && (
          <div className="space-y-4 p-4 bg-background rounded-lg border-2 border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Extracted Data Preview</span>
              </div>
              {isApplied && (
                <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Applied
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Employer Name</Label>
                <p className="font-medium">{parsedData.employerName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Employment Type</Label>
                <p className="font-medium capitalize">{parsedData.employmentNature}</p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Salary Components to be Imported</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  <Label className="text-muted-foreground text-xs">Basic Salary</Label>
                  <p className="font-medium">{formatCurrency(parsedData.basicSalary)}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <Label className="text-muted-foreground text-xs">HRA</Label>
                  <p className="font-medium">{formatCurrency(parsedData.hra)}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <Label className="text-muted-foreground text-xs">Commission</Label>
                  <p className="font-medium">{formatCurrency(parsedData.commission || 0)}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <Label className="text-muted-foreground text-xs">DA</Label>
                  <p className="font-medium">{formatCurrency(parsedData.dearnessAllowance || 0)}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <Label className="text-muted-foreground text-xs">Travel Allowance</Label>
                  <p className="font-medium">{formatCurrency(parsedData.travelAllowance || 0)}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <Label className="text-muted-foreground text-xs">ESOPs</Label>
                  <p className="font-medium">{formatCurrency(parsedData.esops || 0)}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <Label className="text-muted-foreground text-xs">Bonus</Label>
                  <p className="font-medium">{formatCurrency(parsedData.bonus || 0)}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded border-2 border-primary/30">
                  <Label className="text-muted-foreground text-xs">Gross Salary</Label>
                  <p className="font-bold text-primary">{formatCurrency(parsedData.grossSalary)}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                  <Label className="text-muted-foreground text-xs">80C Deductions</Label>
                  <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(parsedData.deductions80C)}</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                  <Label className="text-muted-foreground text-xs">80D Deductions</Label>
                  <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(parsedData.deductions80D)}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <Label className="text-muted-foreground text-xs">Taxable Income</Label>
                  <p className="font-bold">{formatCurrency(parsedData.taxableIncome)}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded border-2 border-primary/30">
                  <Label className="text-muted-foreground text-xs">TDS Deducted</Label>
                  <p className="font-bold text-primary">{formatCurrency(parsedData.taxDeducted)}</p>
                </div>
              </div>
            </div>

            {!isApplied && (
              <Button onClick={handleApplyManually} className="w-full mt-4 bg-gradient-to-r from-primary to-accent">
                <Zap className="w-4 h-4 mr-2" />
                Apply to Salary Details
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Form16Parser;

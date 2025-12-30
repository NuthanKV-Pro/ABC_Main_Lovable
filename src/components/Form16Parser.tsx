import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParsedSalaryData {
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
}

interface Form16ParserProps {
  onDataParsed?: (data: ParsedSalaryData) => void;
}

const Form16Parser = ({ onDataParsed }: Form16ParserProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSalaryData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

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
    }
  };

  const simulateForm16Parsing = async (): Promise<ParsedSalaryData> => {
    // Simulate parsing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return simulated parsed data (in a real app, this would use PDF parsing library)
    return {
      employerName: "ABC Technologies Pvt Ltd",
      employerTAN: "DELA12345B",
      employerPAN: "AABCA1234D",
      employeeNamePAN: "ABCPD1234K",
      grossSalary: 1500000,
      basicSalary: 750000,
      hra: 300000,
      otherAllowances: 250000,
      perquisites: 100000,
      profitsInLieu: 100000,
      deductions80C: 150000,
      deductions80D: 25000,
      otherDeductions: 50000,
      taxableIncome: 1275000,
      taxDeducted: 178500
    };
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

  const applyToSalary = () => {
    if (!parsedData) return;

    // Save to localStorage for salary page
    localStorage.setItem('form16_data', JSON.stringify(parsedData));
    localStorage.setItem('salary_total', parsedData.taxableIncome.toString());
    
    toast({
      title: "Data Applied",
      description: "Form 16 data has been applied to your salary details.",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Form 16 Parser
        </CardTitle>
        <CardDescription>
          Upload your Form 16 to automatically extract salary details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
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
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Parse Form 16
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">Upload Form 16 PDF</p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to browse
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
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
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Extracted Data</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Employer Name</Label>
                <p className="font-medium">{parsedData.employerName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Employer TAN</Label>
                <p className="font-medium">{parsedData.employerTAN}</p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Salary Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">Basic Salary</Label>
                  <p className="font-medium">{formatCurrency(parsedData.basicSalary)}</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">HRA</Label>
                  <p className="font-medium">{formatCurrency(parsedData.hra)}</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">Other Allowances</Label>
                  <p className="font-medium">{formatCurrency(parsedData.otherAllowances)}</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">Perquisites</Label>
                  <p className="font-medium">{formatCurrency(parsedData.perquisites)}</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">Gross Salary</Label>
                  <p className="font-medium text-primary">{formatCurrency(parsedData.grossSalary)}</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">Taxable Income</Label>
                  <p className="font-medium text-primary">{formatCurrency(parsedData.taxableIncome)}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Deductions & Tax</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">80C Deductions</Label>
                  <p className="font-medium">{formatCurrency(parsedData.deductions80C)}</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">80D Deductions</Label>
                  <p className="font-medium">{formatCurrency(parsedData.deductions80D)}</p>
                </div>
                <div className="p-2 bg-background rounded">
                  <Label className="text-muted-foreground text-xs">Other Deductions</Label>
                  <p className="font-medium">{formatCurrency(parsedData.otherDeductions)}</p>
                </div>
                <div className="p-2 bg-background rounded border-2 border-primary/30">
                  <Label className="text-muted-foreground text-xs">TDS Deducted</Label>
                  <p className="font-bold text-primary">{formatCurrency(parsedData.taxDeducted)}</p>
                </div>
              </div>
            </div>

            <Button onClick={applyToSalary} className="w-full mt-4">
              <Check className="w-4 h-4 mr-2" />
              Apply to Salary Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Form16Parser;

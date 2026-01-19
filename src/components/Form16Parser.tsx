import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Check, AlertCircle, Loader2, Zap, Files, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  parseDocument, 
  parseMultipleSalarySlips, 
  ExtractedForm16Data,
  ExtractedSalarySlipData 
} from "@/utils/pdfParser";

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
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSalaryData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [documentType, setDocumentType] = useState<'form16' | 'salarySlip' | 'unknown' | null>(null);
  const [salarySlips, setSalarySlips] = useState<ExtractedSalarySlipData[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const fileArray = Array.from(selectedFiles);
      
      // Validate all files are PDFs
      const invalidFiles = fileArray.filter(f => f.type !== 'application/pdf');
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF files only.",
          variant: "destructive"
        });
        return;
      }
      
      setFiles(fileArray);
      setParseError(null);
      setParsedData(null);
      setIsApplied(false);
      setDocumentType(null);
      setSalarySlips([]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setParsedData(null);
      setDocumentType(null);
      setSalarySlips([]);
    }
  };

  const convertToSalaryData = (data: ExtractedForm16Data): ParsedSalaryData => {
    return {
      employerName: data.employerName,
      employerTAN: data.employerTAN,
      employerPAN: data.employerPAN,
      employeeNamePAN: data.employeeNamePAN,
      grossSalary: data.grossSalary,
      basicSalary: data.basicSalary,
      hra: data.hra,
      otherAllowances: data.otherAllowances,
      perquisites: data.perquisites,
      profitsInLieu: data.profitsInLieu,
      deductions80C: data.deductions80C,
      deductions80D: data.deductions80D,
      otherDeductions: data.otherDeductions,
      taxableIncome: data.taxableIncome,
      taxDeducted: data.taxDeducted,
      commission: data.commission,
      dearnessAllowance: data.dearnessAllowance,
      travelAllowance: data.travelAllowance,
      esops: data.esops,
      gift: data.gift,
      bonus: data.bonus,
      freeFood: data.freeFood,
      officeAddress: data.officeAddress,
      employmentNature: data.employmentNature,
    };
  };

  const applyToSalary = (data: ParsedSalaryData) => {
    localStorage.setItem('form16_data', JSON.stringify(data));
    localStorage.setItem('salary_total', data.taxableIncome.toString());
    localStorage.setItem('form16_auto_applied', 'true');
    
    window.dispatchEvent(new CustomEvent('form16DataUpdated', { detail: data }));
    
    setIsApplied(true);
    
    toast({
      title: "Data Auto-Applied!",
      description: "Extracted data has been populated in your salary details.",
    });
  };

  const handleParse = async () => {
    if (files.length === 0) return;
    
    setIsParsing(true);
    setParseError(null);

    try {
      if (files.length === 1) {
        // Single file - could be Form 16 or salary slip
        const result = await parseDocument(files[0]);
        
        if (result.type === 'unknown' || !result.form16Data) {
          setParseError("Could not detect document type. Please ensure it's a valid Form 16 or Salary Slip.");
          toast({
            title: "Detection Failed",
            description: "Could not identify the document type.",
            variant: "destructive"
          });
          return;
        }

        setDocumentType(result.type);
        const salaryData = convertToSalaryData(result.form16Data);
        setParsedData(salaryData);

        if (result.type === 'salarySlip') {
          setSalarySlips([result.data as ExtractedSalarySlipData]);
        }

        toast({
          title: `${result.type === 'form16' ? 'Form 16' : 'Salary Slip'} Parsed Successfully`,
          description: "Data has been extracted from your document.",
        });

        if (onDataParsed) {
          onDataParsed(salaryData);
        }

        if (autoApply) {
          applyToSalary(salaryData);
        }
      } else {
        // Multiple files - treat as salary slips
        const result = await parseMultipleSalarySlips(files);
        
        setDocumentType('salarySlip');
        setSalarySlips(result.slips);
        const salaryData = convertToSalaryData(result.aggregatedForm16Data);
        setParsedData(salaryData);

        toast({
          title: `${files.length} Salary Slips Parsed`,
          description: "Data has been aggregated from all slips.",
        });

        if (onDataParsed) {
          onDataParsed(salaryData);
        }

        if (autoApply) {
          applyToSalary(salaryData);
        }
      }
    } catch (error) {
      console.error('PDF parsing error:', error);
      setParseError("Failed to parse document. Please ensure it's a valid PDF with readable text.");
      toast({
        title: "Parsing Failed",
        description: "Could not extract data from the uploaded file(s).",
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
          Smart Document Parser
          <Badge variant="secondary" className="ml-2">
            AI Powered
          </Badge>
        </CardTitle>
        <CardDescription>
          Upload Form 16 or Salary Slip(s) - data will be automatically extracted and filled
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
          <input
            ref={multiFileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          
          {files.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-primary mb-4">
                <Files className="w-6 h-6" />
                <span className="font-medium">{files.length} file(s) selected</span>
              </div>
              
              {/* File list */}
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add Single File
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => multiFileInputRef.current?.click()}
                >
                  Add Multiple Slips
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
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-primary/60" />
              <div>
                <p className="font-medium">Upload Form 16 or Salary Slip(s)</p>
                <p className="text-sm text-muted-foreground">
                  PDF files with readable text • Auto-detects document type
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Form 16
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => multiFileInputRef.current?.click()}
                  className="border-accent/50 hover:bg-accent/10"
                >
                  <Files className="w-4 h-4 mr-2" />
                  Upload Salary Slips
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Document Type Badge */}
        {documentType && (
          <div className="flex items-center gap-2">
            <Badge variant={documentType === 'form16' ? 'default' : 'secondary'}>
              {documentType === 'form16' ? 'Form 16 Detected' : `${salarySlips.length} Salary Slip(s) Detected`}
            </Badge>
            {salarySlips.length > 1 && (
              <span className="text-sm text-muted-foreground">
                (Values aggregated for annual computation)
              </span>
            )}
          </div>
        )}

        {/* Error Display */}
        {parseError && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-destructive font-medium">{parseError}</p>
              <p className="text-xs text-destructive/80 mt-1">
                Tip: Ensure the PDF contains selectable text, not just scanned images.
              </p>
            </div>
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
                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0">
                  <Check className="w-3 h-3 mr-1" /> Applied
                </Badge>
              )}
            </div>

            {parsedData.employerName && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Employer Name</Label>
                  <p className="font-medium">{parsedData.employerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Employment Type</Label>
                  <p className="font-medium capitalize">{parsedData.employmentNature || 'Private'}</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Salary Components Extracted</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                {parsedData.basicSalary > 0 && (
                  <div className="p-2 bg-muted/50 rounded">
                    <Label className="text-muted-foreground text-xs">Basic Salary</Label>
                    <p className="font-medium">{formatCurrency(parsedData.basicSalary)}</p>
                  </div>
                )}
                {parsedData.hra > 0 && (
                  <div className="p-2 bg-muted/50 rounded">
                    <Label className="text-muted-foreground text-xs">HRA</Label>
                    <p className="font-medium">{formatCurrency(parsedData.hra)}</p>
                  </div>
                )}
                {(parsedData.commission || 0) > 0 && (
                  <div className="p-2 bg-muted/50 rounded">
                    <Label className="text-muted-foreground text-xs">Commission</Label>
                    <p className="font-medium">{formatCurrency(parsedData.commission || 0)}</p>
                  </div>
                )}
                {(parsedData.dearnessAllowance || 0) > 0 && (
                  <div className="p-2 bg-muted/50 rounded">
                    <Label className="text-muted-foreground text-xs">DA</Label>
                    <p className="font-medium">{formatCurrency(parsedData.dearnessAllowance || 0)}</p>
                  </div>
                )}
                {(parsedData.travelAllowance || 0) > 0 && (
                  <div className="p-2 bg-muted/50 rounded">
                    <Label className="text-muted-foreground text-xs">Travel Allowance</Label>
                    <p className="font-medium">{formatCurrency(parsedData.travelAllowance || 0)}</p>
                  </div>
                )}
                {(parsedData.esops || 0) > 0 && (
                  <div className="p-2 bg-muted/50 rounded">
                    <Label className="text-muted-foreground text-xs">ESOPs</Label>
                    <p className="font-medium">{formatCurrency(parsedData.esops || 0)}</p>
                  </div>
                )}
                {(parsedData.bonus || 0) > 0 && (
                  <div className="p-2 bg-muted/50 rounded">
                    <Label className="text-muted-foreground text-xs">Bonus</Label>
                    <p className="font-medium">{formatCurrency(parsedData.bonus || 0)}</p>
                  </div>
                )}
                {parsedData.otherAllowances > 0 && (
                  <div className="p-2 bg-muted/50 rounded">
                    <Label className="text-muted-foreground text-xs">Other Allowances</Label>
                    <p className="font-medium">{formatCurrency(parsedData.otherAllowances)}</p>
                  </div>
                )}
                <div className="p-2 bg-muted/50 rounded border-2 border-primary/30">
                  <Label className="text-muted-foreground text-xs">Gross Salary</Label>
                  <p className="font-bold text-primary">{formatCurrency(parsedData.grossSalary)}</p>
                </div>
              </div>
            </div>

            {(parsedData.deductions80C > 0 || parsedData.deductions80D > 0 || parsedData.taxDeducted > 0) && (
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {parsedData.deductions80C > 0 && (
                    <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                      <Label className="text-muted-foreground text-xs">80C Deductions</Label>
                      <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(parsedData.deductions80C)}</p>
                    </div>
                  )}
                  {parsedData.deductions80D > 0 && (
                    <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                      <Label className="text-muted-foreground text-xs">80D Deductions</Label>
                      <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(parsedData.deductions80D)}</p>
                    </div>
                  )}
                  {parsedData.taxableIncome > 0 && (
                    <div className="p-2 bg-muted/50 rounded">
                      <Label className="text-muted-foreground text-xs">Taxable Income</Label>
                      <p className="font-bold">{formatCurrency(parsedData.taxableIncome)}</p>
                    </div>
                  )}
                  {parsedData.taxDeducted > 0 && (
                    <div className="p-2 bg-primary/10 rounded border-2 border-primary/30">
                      <Label className="text-muted-foreground text-xs">TDS Deducted</Label>
                      <p className="font-bold text-primary">{formatCurrency(parsedData.taxDeducted)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isApplied && (
              <Button onClick={handleApplyManually} className="w-full mt-4 bg-gradient-to-r from-primary to-accent">
                <Zap className="w-4 h-4 mr-2" />
                Apply to Salary Details
              </Button>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p className="font-medium mb-1">Supported Documents:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li><strong>Form 16:</strong> Annual salary statement from employer</li>
            <li><strong>Salary Slips:</strong> Monthly pay slips (upload multiple for annual computation)</li>
          </ul>
          <p className="mt-2 text-muted-foreground/80">
            Note: PDFs must contain selectable text. Scanned documents may not extract properly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Form16Parser;

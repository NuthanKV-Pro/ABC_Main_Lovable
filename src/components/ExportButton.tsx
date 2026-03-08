import { useState } from "react";
import { Download, FileText, FileSpreadsheet, File, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportConfig, exportToPDF, exportToExcel, exportToWord } from "@/utils/unifiedExport";
import { toast } from "sonner";

interface ExportButtonProps {
  /** Function that returns the export config at the time of export */
  getConfig: () => ExportConfig;
  /** Which formats to offer. Defaults to all three. */
  formats?: ("pdf" | "excel" | "word")[];
  /** Button variant */
  variant?: "default" | "outline" | "secondary" | "ghost";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Custom label */
  label?: string;
  /** Additional class names */
  className?: string;
}

const ExportButton = ({
  getConfig,
  formats = ["pdf", "excel", "word"],
  variant = "default",
  size = "default",
  label = "Export",
  className = "",
}: ExportButtonProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: "pdf" | "excel" | "word") => {
    setExporting(true);
    try {
      const config = getConfig();
      switch (format) {
        case "pdf":
          exportToPDF(config);
          break;
        case "excel":
          exportToExcel(config);
          break;
        case "word":
          exportToWord(config);
          break;
      }
      toast.success(`${format.toUpperCase()} exported successfully!`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Single format → simple button
  if (formats.length === 1) {
    const fmt = formats[0];
    const Icon = fmt === "pdf" ? FileText : fmt === "excel" ? FileSpreadsheet : File;
    return (
      <Button
        variant={variant}
        size={size}
        className={`gap-2 ${className}`}
        onClick={() => handleExport(fmt)}
        disabled={exporting}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label} {fmt.toUpperCase()}</span>
      </Button>
    );
  }

  // Multiple formats → dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`} disabled={exporting}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {formats.includes("pdf") && (
          <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4 text-red-500" />
            Export as PDF
          </DropdownMenuItem>
        )}
        {formats.includes("excel") && (
          <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            Export as Excel
          </DropdownMenuItem>
        )}
        {formats.includes("word") && (
          <DropdownMenuItem onClick={() => handleExport("word")} className="gap-2 cursor-pointer">
            <File className="h-4 w-4 text-blue-600" />
            Export as Word
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;

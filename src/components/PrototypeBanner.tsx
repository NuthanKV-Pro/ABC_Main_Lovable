import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "prototype_banner_dismissed";

export default function PrototypeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-amber-950/90 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-primary mb-1">Prototype Notice</p>
              <p className="text-muted-foreground">
                This is a <span className="text-foreground font-medium">demonstration prototype</span> of ABC - AI Legal & Tax Co-pilot. 
                All data you enter is stored <span className="text-foreground font-medium">locally in your browser</span> and 
                is not sent to any server. Please do not enter real sensitive financial information. 
                For production use, secure cloud storage will be implemented.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10 flex-shrink-0"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

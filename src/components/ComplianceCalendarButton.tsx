import { useNavigate, useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ComplianceCalendarButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on landing page or compliance calendar itself
  if (location.pathname === "/" || location.pathname === "/compliance-calendar") return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={() => navigate("/compliance-calendar")}
          >
            <Calendar className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Compliance Calendar</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ComplianceCalendarButton;

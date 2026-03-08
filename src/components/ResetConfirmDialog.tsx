import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ResetConfirmDialogProps {
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

const ResetConfirmDialog = ({ onConfirm, trigger }: ResetConfirmDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      {trigger ?? (
        <Button variant="ghost" size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Reset all data?</AlertDialogTitle>
        <AlertDialogDescription>
          This will clear all saved data in this tool. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Reset
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ResetConfirmDialog;

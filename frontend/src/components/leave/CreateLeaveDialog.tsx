import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { LeaveRequestForm } from './LeaveRequestForm';

interface CreateLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeaveDialog({
  open,
  onOpenChange,
}: CreateLeaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request New Leave</DialogTitle>
          <DialogDescription>
            Submit a new leave request by filling out the form below. Your request will be reviewed by HR.
          </DialogDescription>
        </DialogHeader>
        <LeaveRequestForm
          mode="create"
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

import type { LeaveRequest } from '../../types/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { LeaveRequestForm } from './LeaveRequestForm';

interface EditLeaveDialogProps {
  leave: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeaveDialog({
  leave,
  open,
  onOpenChange,
}: EditLeaveDialogProps) {
  if (!leave) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Leave Request</DialogTitle>
          <DialogDescription>
            Update your leave request details below. Only pending requests can
            be edited.
          </DialogDescription>
        </DialogHeader>
        <LeaveRequestForm
          mode="edit"
          initialValues={leave}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

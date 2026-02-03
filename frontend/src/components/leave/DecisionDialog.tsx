import { useState } from 'react';
import type { LeaveRequest } from '@/types/models';
import { formatDate } from '@/utils/date.utils';
import { LEAVE_TYPE_LABELS } from '@/constants/leave.constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface DecisionDialogProps {
  leave: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecide: (leaveId: string, decision: 'APPROVED' | 'REJECTED', note?: string) => void;
  isLoading?: boolean;
}

export function DecisionDialog({
  leave,
  open,
  onOpenChange,
  onDecide,
  isLoading,
}: DecisionDialogProps) {
  const [note, setNote] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const handleSubmit = (selectedDecision: 'APPROVED' | 'REJECTED') => {
    if (!leave) return;
    onDecide(leave.id, selectedDecision, note || undefined);
  };

  const handleClose = () => {
    setNote('');
    setDecision(null);
    onOpenChange(false);
  };

  if (!leave) return null;

  const user = leave.user;
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Leave Request</DialogTitle>
          <DialogDescription>
            Make a decision on this leave request from {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Leave Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Employee</Label>
              <p className="font-medium">{userName}</p>
              {user && <p className="text-sm text-muted-foreground">{user.email}</p>}
            </div>
            <div>
              <Label className="text-muted-foreground">Leave Type</Label>
              <p className="font-medium">{LEAVE_TYPE_LABELS[leave.type]}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Start Date</Label>
              <p className="font-medium">{formatDate(leave.startDate)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">End Date</Label>
              <p className="font-medium">{formatDate(leave.endDate)}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Reason</Label>
            <p className="mt-1 text-sm">{leave.reason}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge variant="default">{leave.status}</Badge>
            </div>
          </div>

          {/* Decision Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Decision Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about your decision..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {note.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleSubmit('REJECTED')}
            disabled={isLoading}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={() => handleSubmit('APPROVED')}
            disabled={isLoading}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

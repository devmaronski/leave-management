import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cancelLeaveRequest } from '../../api/leave.api';
import type { LeaveRequest } from '../../types/models';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface CancelLeaveDialogProps {
  leave: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelLeaveDialog({
  leave,
  open,
  onOpenChange,
}: CancelLeaveDialogProps) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', 'mine'] });
      toast.success('Leave request cancelled successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to cancel leave request';
      toast.error(message);
    },
  });

  const handleConfirm = () => {
    if (leave) {
      cancelMutation.mutate(leave.id);
    }
  };

  if (!leave) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Leave Request</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this leave request? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Leave Type:</span>{' '}
              {leave.type}
            </div>
            <div>
              <span className="font-medium">Dates:</span>{' '}
              {new Date(leave.startDate).toLocaleDateString()} -{' '}
              {new Date(leave.endDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Reason:</span> {leave.reason}
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelMutation.isPending}>
            Keep Request
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={cancelMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Request'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

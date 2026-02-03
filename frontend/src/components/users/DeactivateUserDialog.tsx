import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deactivateUser } from '../../api/users.api';
import type { User } from '../../types/models';
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

interface DeactivateUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeactivateUserDialog({
  user,
  open,
  onOpenChange,
}: DeactivateUserDialogProps) {
  const queryClient = useQueryClient();

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to deactivate user';
      toast.error(message);
    },
  });

  const handleConfirm = () => {
    if (user) {
      deactivateMutation.mutate(user.id);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate this user? They will no longer be able to access the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Name:</span>{' '}
              {user.firstName} {user.lastName}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {user.role}
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deactivateMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deactivateMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

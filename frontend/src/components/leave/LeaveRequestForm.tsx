import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  leaveRequestSchema,
  type LeaveRequestFormData,
} from '../../schemas/leave.schema';
import {
  createLeaveRequest,
  updateLeaveRequest,
  type CreateLeaveDto,
  type UpdateLeaveDto,
} from '../../api/leave.api';
import type { LeaveRequest } from '../../types/models';
import { LEAVE_TYPE_LABELS } from '@/constants/leave.constants';
import { toDateInputValue } from '@/utils/date.utils';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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

interface LeaveRequestFormProps {
  mode: 'create' | 'edit';
  initialValues?: LeaveRequest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LeaveRequestForm({
  mode,
  initialValues,
  onSuccess,
  onCancel,
}: LeaveRequestFormProps) {
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: initialValues
      ? {
          type: initialValues.type,
          startDate: toDateInputValue(initialValues.startDate),
          endDate: toDateInputValue(initialValues.endDate),
          reason: initialValues.reason,
        }
      : {
          type: undefined,
          startDate: '',
          endDate: '',
          reason: '',
        },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateLeaveDto) => createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', 'mine'] });
      toast.success('Leave request submitted successfully');
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to submit leave request';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLeaveDto) =>
      updateLeaveRequest(initialValues!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', 'mine'] });
      toast.success('Leave request updated successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to update leave request';
      toast.error(message);
    },
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    const dto = {
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
    };

    if (mode === 'create') {
      createMutation.mutate(dto);
    } else {
      updateMutation.mutate(dto);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Check if form has any values (is dirty)
  const isFormDirty = () => {
    const values = form.getValues();
    return !!(values.type || values.startDate || values.endDate || values.reason);
  };

  const handleCancelClick = () => {
    if (isFormDirty()) {
      setShowCancelDialog(true);
    } else {
      onCancel?.();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    form.reset();
    onCancel?.();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-left w-full">Leave Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-left w-full">Start Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => {
              const startDate = form.watch('startDate');
              const minEndDate = startDate || new Date().toISOString().split('T')[0];
              
              return (
                <FormItem>
                  <FormLabel className="block text-left w-full">End Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      min={minEndDate}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-left w-full">Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide a reason for your leave request..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelClick}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading
              ? 'Submitting...'
              : mode === 'create'
                ? 'Submit Request'
                : 'Update Request'}
          </Button>
        </div>
      </form>
    </Form>

    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes in the form. Are you sure you want to cancel? All changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Editing</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmCancel}>
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

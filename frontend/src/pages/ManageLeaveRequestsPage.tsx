import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGuard } from '@/routes/RoleGuard';
import { getAllLeaveRequests, decideLeaveRequest, type LeaveFilterDto, type DecideLeaveDto } from '@/api/leave.api';
import { AdminLeaveRequestsTable } from '@/components/leave/AdminLeaveRequestsTable';
import { DecisionDialog } from '@/components/leave/DecisionDialog';
import type { LeaveRequest, LeaveStatus } from '@/types/models';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function ManageLeaveRequestsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | undefined>(undefined);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);

  const filters: LeaveFilterDto = {
    page,
    limit: 10,
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['allLeaveRequests', filters],
    queryFn: () => getAllLeaveRequests(filters),
  });

  const decideMutation = useMutation({
    mutationFn: ({ leaveId, decision, note }: { leaveId: string; decision: 'APPROVED' | 'REJECTED'; note?: string }) =>
      decideLeaveRequest(leaveId, { decision, note } as DecideLeaveDto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allLeaveRequests'] });
      toast.success(
        `Leave request ${variables.decision.toLowerCase()} successfully`
      );
      setIsDecisionDialogOpen(false);
      setSelectedLeave(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to process decision'
      );
    },
  });

  const handleReview = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setIsDecisionDialogOpen(true);
  };

  const handleDecide = (leaveId: string, decision: 'APPROVED' | 'REJECTED', note?: string) => {
    decideMutation.mutate({ leaveId, decision, note });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? undefined : (value as LeaveStatus));
    setPage(1); // Reset to first page when filter changes
  };

  return (
    <RoleGuard allowedRoles={['HR', 'ADMIN']}>
      <div className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold">Manage Leave Requests</CardTitle>
            <p className="text-muted-foreground text-sm sm:text-base">
              Review and approve/reject employee leave requests
            </p>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
              <div className="w-full sm:w-48">
                <Label htmlFor="status-filter" className="block text-left">Filter by Status</Label>
                <Select
                  value={statusFilter || 'all'}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data && (
                <div className="text-sm text-muted-foreground">
                  Showing {data.data.length} of {data.meta.total} requests
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">
                  Failed to load leave requests. Please try again.
                </p>
              </div>
            )}

            {/* Table */}
            <AdminLeaveRequestsTable
              data={data?.data}
              isLoading={isLoading}
              pagination={
                data?.meta
                  ? {
                      currentPage: data.meta.page,
                      totalPages: data.meta.totalPages,
                      totalItems: data.meta.total,
                    }
                  : undefined
              }
              onPageChange={handlePageChange}
              onReview={handleReview}
            />
          </CardContent>
        </Card>

        {/* Decision Dialog */}
        <DecisionDialog
          leave={selectedLeave}
          open={isDecisionDialogOpen}
          onOpenChange={setIsDecisionDialogOpen}
          onDecide={handleDecide}
          isLoading={decideMutation.isPending}
        />
      </div>
    </RoleGuard>
  );
}

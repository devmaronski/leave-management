import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyLeaveRequests, type LeaveFilterDto } from '../api/leave.api';
import { DEFAULT_PAGE_SIZE } from '@/constants/leave.constants';
import type { LeaveRequest } from '../types/models';
import { LeaveRequestsTable } from '../components/leave/LeaveRequestsTable';
import { CancelLeaveDialog } from '../components/leave/CancelLeaveDialog';
import { EditLeaveDialog } from '../components/leave/EditLeaveDialog';
import { CreateLeaveDialog } from '../components/leave/CreateLeaveDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

export function MyLeaveRequestsPage() {
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [leaveToEdit, setLeaveToEdit] = useState<LeaveRequest | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [leaveToCancel, setLeaveToCancel] = useState<LeaveRequest | null>(null);

  const filters: LeaveFilterDto = useMemo(() => ({
    page,
    limit: DEFAULT_PAGE_SIZE,
  }), [page]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leaveRequests', 'mine', filters],
    queryFn: () => getMyLeaveRequests(filters),
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load leave requests</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleEditClick = (leave: LeaveRequest) => {
    setLeaveToEdit(leave);
    setEditDialogOpen(true);
  };

  const handleCancelClick = (leave: LeaveRequest) => {
    setLeaveToCancel(leave);
    setCancelDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Leave Requests</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your leave requests and track their status
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Request New Leave
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-left">Your Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestsTable
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
            onPageChange={setPage}
            onEdit={handleEditClick}
            onCancel={handleCancelClick}
          />
        </CardContent>
      </Card>

      <CreateLeaveDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditLeaveDialog
        leave={leaveToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <CancelLeaveDialog
        leave={leaveToCancel}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      />
    </div>
  );
}

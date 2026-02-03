import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyLeaveRequests, type LeaveFilterDto } from '../api/leave.api';
import type { LeaveRequest } from '../types/models';
import { LeaveRequestForm } from '../components/leave/LeaveRequestForm';
import { LeaveRequestsTable } from '../components/leave/LeaveRequestsTable';
import { CancelLeaveDialog } from '../components/leave/CancelLeaveDialog';
import { EditLeaveDialog } from '../components/leave/EditLeaveDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function MyLeaveRequestsPage() {
  const [page, setPage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [leaveToEdit, setLeaveToEdit] = useState<LeaveRequest | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [leaveToCancel, setLeaveToCancel] = useState<LeaveRequest | null>(null);

  const filters: LeaveFilterDto = {
    page,
    limit: 10,
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['leaveRequests', 'mine', filters],
    queryFn: () => getMyLeaveRequests(filters),
  });

  const handleEditClick = (leave: LeaveRequest) => {
    setLeaveToEdit(leave);
    setEditDialogOpen(true);
  };

  const handleCancelClick = (leave: LeaveRequest) => {
    setLeaveToCancel(leave);
    setCancelDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Leave Requests</h1>
        <p className="text-muted-foreground">
          Manage your leave requests and track their status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request New Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestForm
            mode="create"
            onSuccess={() => {
              refetch();
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Leave History</CardTitle>
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

import { format } from 'date-fns';
import type { LeaveRequest } from '../../types/models';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LeaveRequestsTableProps {
  data?: LeaveRequest[];
  isLoading?: boolean;
  onEdit?: (leave: LeaveRequest) => void;
  onCancel?: (leave: LeaveRequest) => void;
}

const STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'default',
  APPROVED: 'secondary',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  VL: 'Vacation Leave',
  SL: 'Sick Leave',
  EL: 'Emergency Leave',
  UNPAID: 'Unpaid Leave',
};

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

function truncateText(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function LeaveRequestsTable({
  data,
  isLoading,
  onEdit,
  onCancel,
}: LeaveRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No leave requests found. Create your first request above!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leave Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((leave) => {
            const isPending = leave.status === 'PENDING';
            return (
              <TableRow key={leave.id}>
                <TableCell className="font-medium">
                  {LEAVE_TYPE_LABELS[leave.type] || leave.type}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {truncateText(leave.reason, 60)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[leave.status]}>
                    {leave.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isPending && (
                    <div className="flex gap-2 justify-end">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(leave)}
                        >
                          Edit
                        </Button>
                      )}
                      {onCancel && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onCancel(leave)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

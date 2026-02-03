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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface LeaveRequestsTableProps {
  data?: LeaveRequest[];
  isLoading?: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
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
  pagination,
  onPageChange,
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

  const renderPagination = () => {
    if (!pagination || !onPageChange || pagination.totalPages <= 1) {
      return null;
    }

    const { currentPage, totalPages } = pagination;
    const pages: (number | 'ellipsis')[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return (
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>

            {pages.map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && onPageChange(currentPage + 1)
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div>
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
      {renderPagination()}
    </div>
  );
}

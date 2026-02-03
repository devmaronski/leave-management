import type { LeaveRequest } from '../../types/models';
import {
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_VARIANTS,
} from '@/constants/leave.constants';
import { formatDate } from '@/utils/date.utils';
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
      <div className="rounded-md border overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px] text-left">Leave Type</TableHead>
            <TableHead className="w-[260px] text-left">Dates</TableHead>
            <TableHead className="text-left">Reason</TableHead>
            <TableHead className="w-[120px] text-left">Status</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((leave) => {
            const isPending = leave.status === 'PENDING';
            return (
              <TableRow key={leave.id}>
                <TableCell className="font-medium w-[140px] text-left">
                  {LEAVE_TYPE_LABELS[leave.type] || leave.type}
                </TableCell>
                <TableCell className="w-[260px] text-left">
                  <div className="text-sm whitespace-nowrap">
                    {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  <div className="max-w-xs">
                    {truncateText(leave.reason, 60)}
                  </div>
                </TableCell>
                <TableCell className="w-[120px] text-left">
                  <Badge variant={LEAVE_STATUS_VARIANTS[leave.status]}>
                    {leave.status}
                  </Badge>
                </TableCell>
                <TableCell className="w-[150px] text-right">
                  {isPending && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(leave)}
                          className="w-full sm:w-auto"
                        >
                          Edit
                        </Button>
                      )}
                      {onCancel && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onCancel(leave)}
                          className="w-full sm:w-auto"
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

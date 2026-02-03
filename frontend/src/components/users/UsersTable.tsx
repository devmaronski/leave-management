import type { User } from '../../types/models';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { RoleBadge } from '../common/RoleBadge';
import { ActiveBadge } from '../common/ActiveBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onDeactivate: (user: User) => void;
}

export function UsersTable({
  users,
  isLoading,
  onDeactivate,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No users found. Create a new user to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-left">Role</TableHead>
            <TableHead className="text-left">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-left">{user.email}</TableCell>
              <TableCell className="text-left">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell className="text-left">
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="text-left">
                <ActiveBadge isActive={user.isActive} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeactivate(user)}
                  disabled={!user.isActive}
                >
                  Deactivate
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

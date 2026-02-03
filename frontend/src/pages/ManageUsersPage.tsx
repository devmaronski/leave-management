import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/users.api';
import type { User, UserFilterDto } from '../types/models';
import { CreateUserDialog } from '../components/users/CreateUserDialog';
import { DeactivateUserDialog } from '../components/users/DeactivateUserDialog';
import { UsersTable } from '../components/users/UsersTable';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';

export function ManageUsersPage() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'EMPLOYEE' | 'HR' | 'ADMIN' | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

  const filters: UserFilterDto = {
    page,
    limit: 10,
    ...(roleFilter && { role: roleFilter }),
    ...(isActiveFilter !== undefined && { isActive: isActiveFilter }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
  });

  const handleDeactivateClick = (user: User) => {
    setUserToDeactivate(user);
    setDeactivateDialogOpen(true);
  };

  const handleClearFilters = () => {
    setRoleFilter(undefined);
    setIsActiveFilter(undefined);
    setPage(1);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Manage Users</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Create and manage user accounts
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="block text-left">Role</Label>
              <Select
                value={roleFilter || 'all'}
                onValueChange={(value) =>
                  setRoleFilter(value === 'all' ? undefined : value as 'EMPLOYEE' | 'HR' | 'ADMIN')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="block text-left">Status</Label>
              <Select
                value={
                  isActiveFilter === undefined
                    ? 'all'
                    : isActiveFilter
                    ? 'active'
                    : 'inactive'
                }
                onValueChange={(value) =>
                  setIsActiveFilter(
                    value === 'all' ? undefined : value === 'active'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={data?.data || []}
            isLoading={isLoading}
            onDeactivate={handleDeactivateClick}
          />

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex-1 sm:flex-initial"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="flex-1 sm:flex-initial"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <DeactivateUserDialog
        user={userToDeactivate}
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
      />
    </div>
  );
}

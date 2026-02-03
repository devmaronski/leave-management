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
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
          <p className="text-muted-foreground">
            Create and manage user accounts
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
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
              <Label>Role</Label>
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
              <Label>Status</Label>
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
              <Button variant="outline" onClick={handleClearFilters}>
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
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.meta.totalPages}
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

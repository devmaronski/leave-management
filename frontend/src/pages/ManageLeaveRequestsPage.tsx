import { RoleGuard } from '@/routes/RoleGuard';

export function ManageLeaveRequestsPage() {
  return (
    <RoleGuard allowedRoles={['HR', 'ADMIN']}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Manage Leave Requests</h1>
        <p className="text-muted-foreground">
          HR/Admin leave management - to be implemented in Phase D
        </p>
      </div>
    </RoleGuard>
  );
}

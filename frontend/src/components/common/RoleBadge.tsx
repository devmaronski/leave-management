import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: 'EMPLOYEE' | 'HR' | 'ADMIN';
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ADMIN: 'destructive',
    HR: 'default',
    EMPLOYEE: 'secondary',
  };

  return <Badge variant={variants[role]}>{role}</Badge>;
};

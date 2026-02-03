import { Badge } from '@/components/ui/badge';

interface ActiveBadgeProps {
  isActive: boolean;
}

export const ActiveBadge = ({ isActive }: ActiveBadgeProps) => {
  return (
    <Badge variant={isActive ? 'default' : 'outline'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};

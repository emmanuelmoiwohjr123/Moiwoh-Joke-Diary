import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RoleBasedProps {
  children: ReactNode;
  ownerOnly?: boolean;
  adminOnly?: boolean;
  ownerId?: string;
}

export const RoleBasedRender = ({ children, ownerOnly, adminOnly, ownerId }: RoleBasedProps) => {
  const { user } = useAuth();

  if (!user) return null;

  if (adminOnly && !user.is_admin) return null;

  if (ownerOnly && ownerId && user.user_id !== ownerId && !user.is_admin) return null;

  return <>{children}</>;
};

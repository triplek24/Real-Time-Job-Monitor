import { useAppSelector } from '@/store/hooks';

export const useAuth = () => {
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

  const hasRole = (...roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canCreateJob = () => hasRole('ADMIN', 'OPERATOR');
  const canManageJobs = () => hasRole('ADMIN', 'OPERATOR');
  const canManageUsers = () => hasRole('ADMIN');

  return {
    user,
    token,
    isAuthenticated,
    hasRole,
    canCreateJob,
    canManageJobs,
    canManageUsers,
  };
};
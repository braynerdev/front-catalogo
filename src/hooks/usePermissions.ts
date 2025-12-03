import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (): boolean => {
    return !!user;
  };

  const hasAnyPermission = (): boolean => {
    return !!user;
  };

  const hasAllPermissions = (): boolean => {
    return !!user;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

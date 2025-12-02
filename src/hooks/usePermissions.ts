import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (requiredPermissions: string[]): boolean => {
    if (!user) return false;
    
    // Se não houver permissões requeridas, permite acesso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Aqui você pode implementar a lógica de verificação de permissões
    // baseado nas roles do usuário que vêm do token JWT
    // Por enquanto, retorna true se o usuário estiver autenticado
    return true;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    
    // Implementar lógica para verificar se o usuário tem pelo menos uma das permissões
    return permissions.length > 0;
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    
    // Implementar lógica para verificar se o usuário tem todas as permissões
    return permissions.length > 0;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

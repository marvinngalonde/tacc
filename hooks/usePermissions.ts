import { useAuthStore } from '@/store/auth-store';
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission } from '@/lib/permissions';

export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const role = user?.role || 'MEMBER';

    return {
        // Check single permission
        can: (permission: Permission) => hasPermission(role, permission),

        // Check multiple permissions (any)
        canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),

        // Check multiple permissions (all)
        canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),

        // Role checks
        isAdmin: role === 'ADMIN',
        isManager: role === 'MANAGER',
        isMember: role === 'MEMBER',

        // Current role
        role,
    };
}

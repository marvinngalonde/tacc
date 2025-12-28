import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/lib/permissions';

interface CanProps {
    permission: Permission;
    children: ReactNode;
    fallback?: ReactNode;
}

// Component to conditionally render based on permission
export function Can({ permission, children, fallback = null }: CanProps) {
    const { can } = usePermissions();

    return can(permission) ? <>{children}</> : <>{fallback}</>;
}

interface CanAnyProps {
    permissions: Permission[];
    children: ReactNode;
    fallback?: ReactNode;
}

// Component to conditionally render if user has any of the permissions
export function CanAny({ permissions, children, fallback = null }: CanAnyProps) {
    const { canAny } = usePermissions();

    return canAny(permissions) ? <>{children}</> : <>{fallback}</>;
}

interface CanAllProps {
    permissions: Permission[];
    children: ReactNode;
    fallback?: ReactNode;
}

// Component to conditionally render if user has all permissions
export function CanAll({ permissions, children, fallback = null }: CanAllProps) {
    const { canAll } = usePermissions();

    return canAll(permissions) ? <>{children}</> : <>{fallback}</>;
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasPermission, Permission } from '@/lib/permissions';

// Get current user from request (simplified - in production use proper auth)
async function getCurrentUser(request: NextRequest) {
    // TODO: Implement proper authentication
    // For now, get first user from database
    const users = await prisma.user.findMany({ take: 1 });
    return users[0] || null;
}

// Middleware to check permissions
export async function requirePermission(
    request: NextRequest,
    permission: Permission
): Promise<NextResponse | null> {
    try {
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!hasPermission(user.role, permission)) {
            return NextResponse.json(
                { error: 'Forbidden - Insufficient permissions' },
                { status: 403 }
            );
        }

        return null; // Permission granted
    } catch (error) {
        console.error('Permission check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Middleware to check multiple permissions (any)
export async function requireAnyPermission(
    request: NextRequest,
    permissions: Permission[]
): Promise<NextResponse | null> {
    try {
        const user = await getCurrentUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const hasAny = permissions.some(permission =>
            hasPermission(user.role, permission)
        );

        if (!hasAny) {
            return NextResponse.json(
                { error: 'Forbidden - Insufficient permissions' },
                { status: 403 }
            );
        }

        return null; // Permission granted
    } catch (error) {
        console.error('Permission check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

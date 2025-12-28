// Permission definitions
export const PERMISSIONS = {
    // Projects
    PROJECT_VIEW: 'project:view',
    PROJECT_CREATE: 'project:create',
    PROJECT_EDIT: 'project:edit',
    PROJECT_DELETE: 'project:delete',

    // Tasks
    TASK_VIEW: 'task:view',
    TASK_CREATE: 'task:create',
    TASK_EDIT: 'task:edit',
    TASK_DELETE: 'task:delete',

    // Teams
    TEAM_VIEW: 'team:view',
    TEAM_CREATE: 'team:create',
    TEAM_EDIT: 'team:edit',
    TEAM_DELETE: 'team:delete',

    // Resources
    RESOURCE_VIEW: 'resource:view',
    RESOURCE_CREATE: 'resource:create',
    RESOURCE_EDIT: 'resource:edit',
    RESOURCE_DELETE: 'resource:delete',

    // Documents
    DOCUMENT_VIEW: 'document:view',
    DOCUMENT_CREATE: 'document:create',
    DOCUMENT_EDIT: 'document:edit',
    DOCUMENT_DELETE: 'document:delete',

    // Users
    USER_VIEW: 'user:view',
    USER_CREATE: 'user:create',
    USER_EDIT: 'user:edit',
    USER_DELETE: 'user:delete',

    // Reports
    REPORT_VIEW: 'report:view',
    REPORT_EXPORT: 'report:export',

    // Settings
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_EDIT: 'settings:edit',
    SYSTEM_SETTINGS: 'system:settings',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    ADMIN: Object.values(PERMISSIONS), // Admin has all permissions

    MANAGER: [
        // Projects
        PERMISSIONS.PROJECT_VIEW,
        PERMISSIONS.PROJECT_CREATE,
        PERMISSIONS.PROJECT_EDIT,

        // Tasks
        PERMISSIONS.TASK_VIEW,
        PERMISSIONS.TASK_CREATE,
        PERMISSIONS.TASK_EDIT,
        PERMISSIONS.TASK_DELETE,

        // Teams
        PERMISSIONS.TEAM_VIEW,
        PERMISSIONS.TEAM_CREATE,
        PERMISSIONS.TEAM_EDIT,

        // Resources
        PERMISSIONS.RESOURCE_VIEW,
        PERMISSIONS.RESOURCE_CREATE,
        PERMISSIONS.RESOURCE_EDIT,

        // Documents
        PERMISSIONS.DOCUMENT_VIEW,
        PERMISSIONS.DOCUMENT_CREATE,
        PERMISSIONS.DOCUMENT_EDIT,

        // Users
        PERMISSIONS.USER_VIEW,

        // Reports
        PERMISSIONS.REPORT_VIEW,
        PERMISSIONS.REPORT_EXPORT,

        // Settings
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.SETTINGS_EDIT,
    ],

    MEMBER: [
        // Projects
        PERMISSIONS.PROJECT_VIEW,

        // Tasks
        PERMISSIONS.TASK_VIEW,
        PERMISSIONS.TASK_CREATE,
        PERMISSIONS.TASK_EDIT, // Can edit own tasks

        // Teams
        PERMISSIONS.TEAM_VIEW,

        // Resources
        PERMISSIONS.RESOURCE_VIEW,

        // Documents
        PERMISSIONS.DOCUMENT_VIEW,
        PERMISSIONS.DOCUMENT_CREATE,

        // Reports
        PERMISSIONS.REPORT_VIEW,

        // Settings
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.SETTINGS_EDIT, // Can edit own settings
    ],
};

// Check if a role has a specific permission
export function hasPermission(role: string, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role.toUpperCase()];
    return permissions ? permissions.includes(permission) : false;
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission));
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: string): Permission[] {
    return ROLE_PERMISSIONS[role.toUpperCase()] || [];
}

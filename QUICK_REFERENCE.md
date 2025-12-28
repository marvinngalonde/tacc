# TACC PMS - Quick Reference Guide

## 🔐 Permissions

### Check Permissions in Components
```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';

const { can, canAny, isAdmin } = usePermissions();

if (can(PERMISSIONS.PROJECT_CREATE)) {
  // Show create button
}
```

### Protect UI Elements
```tsx
import { Can } from '@/components/auth/Can';

<Can permission={PERMISSIONS.PROJECT_DELETE}>
  <button>Delete</button>
</Can>
```

### Protect API Routes
```tsx
import { requirePermission } from '@/lib/auth-middleware';
import { PERMISSIONS } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  const error = await requirePermission(request, PERMISSIONS.PROJECT_CREATE);
  if (error) return error;
  // Your code
}
```

## 📝 Form Validation

```tsx
import { projectSchema } from '@/lib/validations/project';

const result = projectSchema.safeParse(formData);

if (!result.success) {
  result.error.errors.forEach(err => {
    toast.error(`${err.path}: ${err.message}`);
  });
  return;
}

// Use result.data (type-safe!)
```

## 🔔 Notifications

```tsx
import toast from 'react-hot-toast';

toast.success('Operation successful!');
toast.error('Something went wrong');
toast.loading('Processing...');
```

## ⏳ Loading States

```tsx
import { SkeletonTable, LoadingSpinner, EmptyState } from '@/components/ui';

// While loading
{isLoading && <SkeletonTable rows={5} />}

// Inline spinner
<LoadingSpinner size="md" />

// Empty state
{data.length === 0 && (
  <EmptyState
    icon={Inbox}
    title="No items"
    description="Create your first item"
    action={{ label: "Create", onClick: handleCreate }}
  />
)}
```

## 🛡️ Error Handling

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## 🔑 Available Permissions

### Projects
- `PROJECT_VIEW`, `PROJECT_CREATE`, `PROJECT_EDIT`, `PROJECT_DELETE`

### Tasks
- `TASK_VIEW`, `TASK_CREATE`, `TASK_EDIT`, `TASK_DELETE`

### Teams
- `TEAM_VIEW`, `TEAM_CREATE`, `TEAM_EDIT`, `TEAM_DELETE`

### Resources
- `RESOURCE_VIEW`, `RESOURCE_CREATE`, `RESOURCE_EDIT`, `RESOURCE_DELETE`

### Documents
- `DOCUMENT_VIEW`, `DOCUMENT_CREATE`, `DOCUMENT_EDIT`, `DOCUMENT_DELETE`

### Users
- `USER_VIEW`, `USER_CREATE`, `USER_EDIT`, `USER_DELETE`

### Reports
- `REPORT_VIEW`, `REPORT_EXPORT`

### Settings
- `SETTINGS_VIEW`, `SETTINGS_EDIT`, `SYSTEM_SETTINGS`

## 👥 Role Permissions

### ADMIN
- All permissions

### MANAGER
- All project, task, team, resource, document operations
- View users
- View and export reports
- Edit own settings

### MEMBER
- View projects, tasks, teams, resources, documents
- Create and edit own tasks
- Create documents
- View reports
- Edit own settings

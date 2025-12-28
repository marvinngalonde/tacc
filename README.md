# TACC Project Management System

A modern, full-featured project management system built with Next.js, TypeScript, Prisma, and PostgreSQL.

## ✨ Features

### Core Functionality
- **Project Management** - Create, track, and manage projects
- **Task Management** - Assign tasks, set priorities, track progress
- **Team Collaboration** - Organize teams and manage members
- **Resource Management** - Track materials, equipment, and tools
- **Document Management** - Upload and organize project documents
- **User Management** - Role-based access control (RBAC)
- **Real-time Dashboard** - Live statistics and insights
- **Reports** - Comprehensive project and task analytics

### Security & UX
- 🔐 **Role-Based Access Control** - ADMIN, MANAGER, MEMBER roles with 40+ permissions
- 🔔 **Toast Notifications** - Real-time feedback on all operations
- ✅ **Form Validation** - Type-safe validation with Zod
- 🔑 **Password Reset** - Forgot/reset password functionality
- ⏳ **Loading States** - Professional skeleton loaders and spinners
- 📊 **Live Data** - Real-time dashboard statistics
- 🛡️ **Error Handling** - Graceful error boundaries

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd TACC

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
TACC/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── dashboard/      # Dashboard data
│   │   ├── projects/       # Project CRUD
│   │   ├── tasks/          # Task CRUD
│   │   └── ...
│   ├── dashboard/          # Dashboard pages
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── teams/
│   │   └── ...
│   ├── forgot-password/    # Password reset pages
│   └── reset-password/
├── components/              # React components
│   ├── auth/               # Permission guards
│   ├── ui/                 # UI components
│   └── error-boundary.tsx
├── hooks/                   # Custom React hooks
│   └── usePermissions.ts
├── lib/                     # Utilities
│   ├── permissions.ts      # Permission definitions
│   ├── auth-middleware.ts  # API middleware
│   └── validations/        # Zod schemas
├── prisma/                  # Database
│   └── schema.prisma
└── store/                   # State management
```

## 🔐 Permissions System

### Roles
- **ADMIN** - Full access to all features
- **MANAGER** - Can manage projects, tasks, teams, resources
- **MEMBER** - View access + can create/edit own tasks

### Usage

```tsx
// In components
import { Can } from '@/components/auth/Can';
import { PERMISSIONS } from '@/lib/permissions';

<Can permission={PERMISSIONS.PROJECT_DELETE}>
  <button>Delete Project</button>
</Can>

// In API routes
import { requirePermission } from '@/lib/auth-middleware';

const error = await requirePermission(request, PERMISSIONS.PROJECT_CREATE);
if (error) return error;
```

## 📝 Form Validation

All forms use Zod for type-safe validation:

```tsx
import { projectSchema } from '@/lib/validations/project';

const result = projectSchema.safeParse(formData);
if (!result.success) {
  // Handle errors
}
```

## 🔔 Notifications

Toast notifications are integrated throughout:

```tsx
import toast from 'react-hot-toast';

toast.success('Operation successful!');
toast.error('Something went wrong');
```

## 📊 Dashboard

The dashboard provides real-time insights:
- Active projects count
- Critical tasks
- Upcoming deadlines (7-day window)
- Budget tracking
- Recent activities

## 🗄️ Database Schema

Key models:
- **User** - System users with roles
- **Project** - Projects with budget, dates, location
- **Task** - Tasks with priority, status, assignments
- **Team** - Teams with members
- **Resource** - Materials, equipment, tools
- **Document** - Project documents
- **Activity** - Activity log
- **UserSettings** - User preferences

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Validation**: Zod
- **Notifications**: react-hot-toast
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Quick deployment steps
- [Quick Reference](./QUICK_REFERENCE.md) - Developer quick reference
- [Phase 1 Complete](./PHASE_1_COMPLETE.md) - Implementation details

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Required environment variables:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret"
```

## 📈 Roadmap

### Phase 1: Critical Foundations ✅ (Complete)
- [x] Notification system
- [x] Real-time dashboard
- [x] RBAC system
- [x] Form validation
- [x] Password reset
- [x] Loading/empty states
- [x] Settings backend

### Phase 2: Collaboration (Planned)
- [ ] Comments system
- [ ] @mentions
- [ ] Real-time updates
- [ ] Activity feeds
- [ ] Task dependencies
- [ ] Approval workflows

### Phase 3: Advanced Features (Planned)
- [ ] File uploads
- [ ] Advanced search
- [ ] Bulk operations
- [ ] Export/import
- [ ] Email notifications
- [ ] Calendar view

### Phase 4: Financial Management (Planned)
- [ ] Invoicing
- [ ] Expense tracking
- [ ] Budget forecasting
- [ ] Financial reports

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All open-source contributors

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the quick reference guide

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**

**Status**: Production Ready ✅

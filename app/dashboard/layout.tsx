'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Wrench,
    BarChart3,
    FileText,
    Settings,
    Menu,
    Calendar,
    Bell,
} from 'lucide-react';

const navigation = [
    {
        group: 'Main',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        group: 'Management',
        items: [
            { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
            { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
            { name: 'Teams', href: '/dashboard/teams', icon: Users },
            { name: 'Resources', href: '/dashboard/resources', icon: Wrench },
        ],
    },
    {
        group: 'Reports',
        items: [
            { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
            { name: 'Documents', href: '/dashboard/documents', icon: FileText },
        ],
    },
    {
        group: 'System',
        items: [
            { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ],
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div
                className={`bg-blue-900 text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Logo */}
                <div className="p-4 flex items-center justify-start border-b border-blue-800 h-16">
                    {!isCollapsed ? (
                        <Image
                            src="/tacc-logo.png"
                            alt="TACC Logo"
                            width={120}
                            height={33}
                            className="brightness-0 invert"
                        />
                    ) : (
                        <Image
                            src="/tacc-logo.png"
                            alt="TACC"
                            width={40}
                            height={40}
                            className="brightness-0 invert"
                        />
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-4 overflow-y-auto sidebar-scroll">
                    {navigation.map((section) => (
                        <div key={section.group}>
                            {!isCollapsed && (
                                <h3 className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider mb-2 px-3">
                                    {section.group}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${isActive
                                                ? 'bg-blue-800 text-white'
                                                : 'text-blue-100 hover:bg-blue-800/50'
                                                }`}
                                            title={isCollapsed ? item.name : undefined}
                                        >
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            {!isCollapsed && <span>{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="p-3 border-t border-blue-800">
                    {!isCollapsed ? (
                        <>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-9 h-9 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-semibold">
                                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-[10px] text-blue-300 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full px-3 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg text-xs transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full p-2 bg-blue-800 hover:bg-blue-700 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <span className="text-lg">🚪</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Fixed Header */}
                <header className="bg-white shadow-sm h-16 flex-shrink-0">
                    <div className="flex items-center justify-between px-6 h-full">
                        <div className="flex items-center gap-4">
                            {/* Hamburger Menu */}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>

                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                                <Calendar className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden">
                                <img
                                    src={
                                        user?.avatar ||
                                        `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=3b82f6&color=fff`
                                    }
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}

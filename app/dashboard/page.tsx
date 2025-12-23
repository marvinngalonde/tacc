'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardData {
    summary: {
        totalProjects: number;
        activeProjects: number;
        criticalTasks: number;
        upcomingDeadlines: number;
        totalBudget: number;
        totalSpent: number;
        budgetPercentage: number;
    };
    recentActivities: Array<{
        id: string;
        type: string;
        description: string;
        createdAt: string;
        user: {
            firstName: string | null;
            lastName: string | null;
        };
    }>;
}

export default function DashboardPage() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);
    const router = useRouter();

    useEffect(() => {
        // Only redirect after hydration is complete
        if (hasHydrated && !isAuthenticated) {
            router.push('/');
        }
    }, [hasHydrated, isAuthenticated, router]);

    const { data, isLoading } = useQuery<DashboardData>({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await fetch('/api/dashboard');
            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            return response.json();
        },
        enabled: isAuthenticated,
    });

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    const summary = data?.summary;
    const activities = data?.recentActivities || [];

    return (
        <div className="space-y-6">
            {/* Top Row - Map and Weather */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Widget */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Project Locations</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm bg-gray-100 rounded">Map</button>
                            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Satellite</button>
                        </div>
                    </div>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"></div>
                        <div className="relative z-10 text-center">
                            <div className="text-4xl mb-2">🗺️</div>
                            <p className="text-gray-600 text-sm">Map integration coming soon</p>
                            <p className="text-xs text-gray-500 mt-1">Will show project locations in Santorin, CA</p>
                        </div>
                    </div>
                </div>

                {/* Weather Widget */}
                <div className="bg-blue-500 text-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-medium opacity-90">Current Location</h3>
                            <p className="text-lg font-semibold">Westlake, CA</p>
                        </div>
                        <button className="text-white/80 hover:text-white">⋮</button>
                    </div>

                    <div className="flex items-center justify-center my-6">
                        <div className="text-6xl">☁️</div>
                    </div>

                    <div className="text-center mb-6">
                        <div className="text-5xl font-bold">17°</div>
                        <div className="text-sm opacity-75">50°F / -27%</div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="opacity-75">Weather</span>
                            <span>Tue</span>
                            <span>33°F</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="opacity-75"></span>
                            <span>Wed ☀️</span>
                            <span>37°F</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="opacity-75"></span>
                            <span>Thu ☀️</span>
                            <span>37°F</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="opacity-75"></span>
                            <span>Fri ☁️</span>
                            <span>39°F</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Active Projects */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Summary</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{summary?.activeProjects || 0}</div>
                    <p className="text-sm text-gray-600 mb-3">Active Projects</p>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        ✓ Active
                    </span>
                </div>

                {/* Critical Tasks */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2"></h3>
                    <div className="text-4xl font-bold text-red-600 mb-2">{summary?.criticalTasks || 0}</div>
                    <p className="text-sm text-gray-600 mb-3">Critical Tasks</p>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ Urgent
                    </span>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2"></h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{summary?.upcomingDeadlines || 0}</div>
                    <p className="text-sm text-gray-600 mb-3">Upcoming Deadlines</p>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        ✓ Active
                    </span>
                </div>

                {/* Budget Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2"></h3>
                    <div className="text-4xl font-bold text-green-600 mb-2">${(summary?.totalSpent || 0) / 1000}k</div>
                    <p className="text-sm text-gray-600 mb-3">Budget Status</p>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Use {summary?.budgetPercentage || 0}%
                        </span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.min(summary?.budgetPercentage || 0, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Activity and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {activities.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="flex gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-semibold">
                                        {activity.user.firstName?.[0] || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">{activity.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Progress Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Project Progress vs. Planned</h2>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[20, 40, 60, 55, 70, 80, 75, 85].map((height, index) => (
                            <div key={index} className="flex-1 flex flex-col justify-end gap-1">
                                <div
                                    className="bg-blue-200 rounded-t"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div
                                    className="bg-green-500 rounded-t"
                                    style={{ height: `${Math.min(height + 10, 100)}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-200 rounded"></div>
                            <span className="text-sm text-gray-600">Project</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-sm text-gray-600">Planned</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
            {/* Top Row - Project Overview and Weather */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Overview Widget */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Active Projects Overview</h2>
                            <p className="text-sm text-gray-500 mt-1">Track progress across all ongoing projects</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                View All
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Project 1 */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Downtown Office Complex</h3>
                                    <p className="text-xs text-gray-500 mt-1">Due: Dec 31, 2024</p>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">On Track</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-gray-900">75%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Project 2 */}
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-transparent rounded-lg border border-amber-100 hover:border-amber-200 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Residential Tower Phase 2</h3>
                                    <p className="text-xs text-gray-500 mt-1">Due: Jan 15, 2025</p>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">At Risk</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-gray-900">45%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Project 3 */}
                        <div className="p-4 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Highway Bridge Renovation</h3>
                                    <p className="text-xs text-gray-500 mt-1">Due: Feb 28, 2025</p>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Ahead</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-gray-900">92%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>
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
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Projects</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">{summary?.activeProjects || 0}</div>
                            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                                <span>↑</span>
                                <span>12%</span>
                                <span className="text-gray-500 text-xs ml-1">vs last month</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ On Track
                    </span>
                </div>

                {/* Critical Tasks */}
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Critical Tasks</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">{summary?.criticalTasks || 0}</div>
                            <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                                <span>↑</span>
                                <span>3</span>
                                <span className="text-gray-500 text-xs ml-1">need attention</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ Urgent
                    </span>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming Deadlines</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">{summary?.upcomingDeadlines || 0}</div>
                            <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                                <span>📅</span>
                                <span className="text-gray-500 text-xs">next 7 days</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        📌 Scheduled
                    </span>
                </div>

                {/* Budget Status */}
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Spent</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-1">${(summary?.totalSpent || 0) / 1000}k</div>
                            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                                <span>↓</span>
                                <span>5%</span>
                                <span className="text-gray-500 text-xs ml-1">under budget</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(summary?.budgetPercentage || 0, 100)}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{summary?.budgetPercentage || 0}%</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Activity and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {activities.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                    <span className="text-white font-semibold text-sm">
                                        {activity.user.firstName?.[0] || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Progress Chart */}
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Progress vs. Planned</h2>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[20, 40, 60, 55, 70, 80, 75, 85].map((height, index) => (
                            <div key={index} className="flex-1 flex flex-col justify-end gap-1 group">
                                <div
                                    className="bg-gradient-to-t from-blue-400 to-blue-500 rounded-t hover:from-blue-500 hover:to-blue-600 transition-all duration-200"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div
                                    className="bg-gradient-to-t from-green-400 to-green-500 rounded-t hover:from-green-500 hover:to-green-600 transition-all duration-200"
                                    style={{ height: `${Math.min(height + 10, 100)}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded shadow-sm"></div>
                            <span className="text-sm text-gray-600 font-medium">Project</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded shadow-sm"></div>
                            <span className="text-sm text-gray-600 font-medium">Planned</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

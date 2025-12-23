import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Get dashboard summary data
        const [
            totalProjects,
            activeProjects,
            criticalTasks,
            upcomingDeadlines,
            recentActivities,
        ] = await Promise.all([
            // Total projects
            prisma.project.count(),

            // Active projects
            prisma.project.count({
                where: { status: 'active' },
            }),

            // Critical tasks
            prisma.task.count({
                where: {
                    priority: 'critical',
                    status: { not: 'completed' },
                },
            }),

            // Upcoming deadlines (next 7 days)
            prisma.task.count({
                where: {
                    dueDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                    status: { not: 'completed' },
                },
            }),

            // Recent activities
            prisma.activity.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            }),
        ]);

        // Get budget status
        const projects = await prisma.project.findMany({
            where: { status: 'active' },
            select: {
                budget: true,
                spent: true,
            },
        });

        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
        const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return NextResponse.json({
            summary: {
                totalProjects,
                activeProjects,
                criticalTasks,
                upcomingDeadlines,
                totalBudget,
                totalSpent,
                budgetPercentage: Math.round(budgetPercentage),
            },
            recentActivities,
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}

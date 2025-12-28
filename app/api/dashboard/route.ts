import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Calculate active projects
        const activeProjects = await prisma.project.count({
            where: { status: 'IN_PROGRESS' }
        });

        // Calculate critical tasks (high priority, not completed)
        const criticalTasks = await prisma.task.count({
            where: {
                priority: 'HIGH',
                status: { not: 'COMPLETED' }
            }
        });

        // Calculate upcoming deadlines (tasks due in next 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const upcomingDeadlines = await prisma.task.count({
            where: {
                dueDate: {
                    gte: new Date(),
                    lte: sevenDaysFromNow
                },
                status: { not: 'COMPLETED' }
            }
        });

        // Calculate budget status
        const projects = await prisma.project.findMany({
            where: { status: 'IN_PROGRESS' },
            select: { budget: true, spent: true }
        });

        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
        const budgetPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        // Get recent activities
        const activities = await prisma.activity.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            }
        });

        // Get project data
        const allProjects = await prisma.project.findMany({
            select: {
                id: true,
                name: true,
                status: true
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            stats: {
                activeProjects,
                criticalTasks,
                upcomingDeadlines,
                budgetStatus: {
                    percentage: budgetPercentage,
                    spent: totalSpent,
                    total: totalBudget
                }
            },
            activities,
            projects: allProjects
        });
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}

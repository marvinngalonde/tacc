import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-middleware';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

        // Build where clause
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        // Build orderBy clause
        const orderBy: any = {};
        if (sortBy === 'startDate') {
            orderBy.startDate = sortOrder;
        } else if (sortBy === 'endDate') {
            orderBy.endDate = sortOrder;
        } else if (sortBy === 'budget') {
            orderBy.budget = sortOrder;
        } else {
            orderBy.createdAt = sortOrder;
        }

        const projects = await prisma.project.findMany({
            where,
            orderBy,
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        // Calculate progress for each project
        const projectsWithProgress = projects.map((project: any) => {
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter(
                (task: any) => task.status === 'COMPLETED'
            ).length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
                id: project.id,
                name: project.name,
                description: project.description,
                status: project.status,
                startDate: project.startDate,
                endDate: project.endDate,
                budget: project.budget,
                spent: project.spent,
                location: project.location,
                latitude: project.latitude,
                longitude: project.longitude,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                creator: project.creator,
                taskCount: totalTasks,
                memberCount: project.members.length,
                progress,
                members: project.members.map((m: any) => m.user),
            };
        });

        return NextResponse.json(projectsWithProgress);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

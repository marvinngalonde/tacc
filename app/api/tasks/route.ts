import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const projectId = searchParams.get('projectId');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'dueDate';
        const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

        // Build where clause
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (priority && priority !== 'all') {
            where.priority = priority;
        }

        if (projectId) {
            where.projectId = projectId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Build orderBy clause
        const orderBy: any = {};
        if (sortBy === 'dueDate') {
            orderBy.dueDate = sortOrder;
        } else if (sortBy === 'priority') {
            orderBy.priority = sortOrder;
        } else if (sortBy === 'status') {
            orderBy.status = sortOrder;
        } else {
            orderBy.createdAt = sortOrder;
        }

        const tasks = await prisma.task.findMany({
            where,
            orderBy,
            include: {
                assignee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}

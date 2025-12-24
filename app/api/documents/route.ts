import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        // Build where clause
        const where: any = {};

        if (projectId && projectId !== 'all') {
            where.projectId = projectId;
        }

        if (type && type !== 'all') {
            where.type = type;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const documents = await prisma.document.findMany({
            where,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, type, description, url, size, projectId, uploadedById } = body;

        const document = await prisma.document.create({
            data: {
                name,
                type,
                description,
                url,
                size: size ? parseInt(size) : null,
                projectId,
                uploadedById,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json(
            { error: 'Failed to create document' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const document = await prisma.document.findUnique({
            where: { id },
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

        if (!document) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, type, description, url, size, projectId } = body;

        const document = await prisma.document.update({
            where: { id },
            data: {
                name,
                type,
                description,
                url,
                size: size ? parseInt(size) : null,
                projectId,
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
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: 'Failed to update document' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.document.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 }
        );
    }
}

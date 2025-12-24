import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(resource);
    } catch (error) {
        console.error('Error fetching resource:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resource' },
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
        const { name, type, description, quantity, available, cost } = body;

        const resource = await prisma.resource.update({
            where: { id },
            data: {
                name,
                type,
                description,
                quantity: parseInt(quantity),
                available: parseInt(available),
                cost: cost ? parseFloat(cost) : null,
            },
        });

        return NextResponse.json(resource);
    } catch (error) {
        console.error('Error updating resource:', error);
        return NextResponse.json(
            { error: 'Failed to update resource' },
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

        await prisma.resource.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting resource:', error);
        return NextResponse.json(
            { error: 'Failed to delete resource' },
            { status: 500 }
        );
    }
}

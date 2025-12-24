import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'name';
        const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

        // Build where clause
        const where: any = {};

        if (type && type !== 'all') {
            where.type = type;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Build orderBy clause
        const orderBy: any = {};
        if (sortBy === 'name') {
            orderBy.name = sortOrder;
        } else if (sortBy === 'quantity') {
            orderBy.quantity = sortOrder;
        } else if (sortBy === 'available') {
            orderBy.available = sortOrder;
        } else {
            orderBy.createdAt = sortOrder;
        }

        const resources = await prisma.resource.findMany({
            where,
            orderBy,
        });

        return NextResponse.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resources' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, type, description, quantity, available, cost } = body;

        const resource = await prisma.resource.create({
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
        console.error('Error creating resource:', error);
        return NextResponse.json(
            { error: 'Failed to create resource' },
            { status: 500 }
        );
    }
}

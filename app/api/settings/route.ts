import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
    try {
        // TODO: Get actual user from session/auth
        // For now, get the first user
        const users = await prisma.user.findMany({ take: 1 });
        const userId = users[0]?.id;

        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get or create settings
        let settings = await prisma.userSettings.findUnique({
            where: { userId }
        });

        // If no settings exist, create default ones
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PUT /api/settings - Update all settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // TODO: Get actual user from session/auth
        const users = await prisma.user.findMany({ take: 1 });
        const userId = users[0]?.id;

        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const settings = await prisma.userSettings.upsert({
            where: { userId },
            update: body,
            create: {
                userId,
                ...body
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}

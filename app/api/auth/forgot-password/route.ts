import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/auth/forgot-password - Generate reset token
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: 'If an account exists with that email, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // Store reset token (you'll need to add PasswordResetToken model to Prisma)
        // For now, we'll just return success
        // TODO: Create PasswordResetToken in database
        // TODO: Send email with reset link

        console.log(`Password reset token for ${email}: ${token}`);
        console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`);

        return NextResponse.json({
            message: 'If an account exists with that email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Failed to process password reset request' },
            { status: 500 }
        );
    }
}

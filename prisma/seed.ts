import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@admin.com' },
        update: {},
        create: {
            email: 'admin@admin.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
        },
    });

    console.log('✅ Created admin user:', admin.email);

    // Create sample projects
    const project1 = await prisma.project.create({
        data: {
            name: 'Downtown Office Complex',
            description: 'Modern office building construction in downtown area',
            status: 'active',
            budget: 5000000,
            spent: 2500000,
            startDate: new Date('2024-01-15'),
            endDate: new Date('2025-06-30'),
            location: 'Santorin, CA',
            latitude: 35.1983,
            longitude: -119.1817,
            creatorId: admin.id,
        },
    });

    const project2 = await prisma.project.create({
        data: {
            name: 'Residential Tower',
            description: '25-story residential building',
            status: 'active',
            budget: 8000000,
            spent: 4000000,
            startDate: new Date('2024-03-01'),
            endDate: new Date('2025-12-31'),
            location: 'Santorin, CA',
            latitude: 35.2827,
            longitude: -119.2945,
            creatorId: admin.id,
        },
    });

    console.log('✅ Created sample projects');

    // Create sample tasks
    await prisma.task.createMany({
        data: [
            {
                title: 'Foundation inspection',
                description: 'Complete foundation inspection before proceeding',
                status: 'in-progress',
                priority: 'critical',
                dueDate: new Date('2024-12-30'),
                projectId: project1.id,
                assigneeId: admin.id,
            },
            {
                title: 'Electrical wiring',
                description: 'Install electrical systems on floors 1-5',
                status: 'todo',
                priority: 'high',
                dueDate: new Date('2025-01-15'),
                projectId: project1.id,
                assigneeId: admin.id,
            },
            {
                title: 'HVAC installation',
                description: 'Install HVAC systems',
                status: 'in-progress',
                priority: 'critical',
                dueDate: new Date('2024-12-28'),
                projectId: project2.id,
                assigneeId: admin.id,
            },
        ],
    });

    console.log('✅ Created sample tasks');

    // Create sample activities
    await prisma.activity.createMany({
        data: [
            {
                type: 'project_created',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesit project indamorent occapa.',
                userId: admin.id,
                projectId: project1.id,
                createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000), // 13 hours ago
            },
            {
                type: 'task_updated',
                description: 'Montus looftnord etitdolar sit amet, consectetur adipiscing elit. Mising mum a tempor.',
                userId: admin.id,
                projectId: project1.id,
                createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago
            },
            {
                type: 'comment_added',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                userId: admin.id,
                projectId: project2.id,
                createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
            },
        ],
    });

    console.log('✅ Created sample activities');

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

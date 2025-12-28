import { z } from 'zod';

// Project validation schema
export const projectSchema = z.object({
    name: z.string()
        .min(3, 'Project name must be at least 3 characters')
        .max(100, 'Project name must be less than 100 characters'),

    description: z.string().optional(),

    status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'], {
        errorMap: () => ({ message: 'Please select a valid status' })
    }),

    startDate: z.string()
        .refine(date => !isNaN(Date.parse(date)), {
            message: 'Invalid start date format'
        }),

    endDate: z.string()
        .refine(date => !isNaN(Date.parse(date)), {
            message: 'Invalid end date format'
        }),

    budget: z.number()
        .min(0, 'Budget must be a positive number')
        .optional(),

    location: z.string().optional(),

    latitude: z.number()
        .min(-90, 'Latitude must be between -90 and 90')
        .max(90, 'Latitude must be between -90 and 90')
        .optional(),

    longitude: z.number()
        .min(-180, 'Longitude must be between -180 and 180')
        .max(180, 'Longitude must be between -180 and 180')
        .optional(),
}).refine(data => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
}, {
    message: 'End date must be after start date',
    path: ['endDate']
});

export type ProjectFormData = z.infer<typeof projectSchema>;

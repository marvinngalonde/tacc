import { z } from 'zod';

// Resource validation schema
export const resourceSchema = z.object({
    name: z.string()
        .min(2, 'Resource name must be at least 2 characters')
        .max(100, 'Resource name must be less than 100 characters'),

    type: z.enum(['MATERIAL', 'EQUIPMENT', 'TOOL', 'VEHICLE'], {
        errorMap: () => ({ message: 'Please select a valid resource type' })
    }),

    description: z.string().optional(),

    quantity: z.number()
        .int('Quantity must be a whole number')
        .min(0, 'Quantity cannot be negative'),

    available: z.number()
        .int('Available quantity must be a whole number')
        .min(0, 'Available quantity cannot be negative'),

    cost: z.number()
        .min(0, 'Cost must be a positive number')
        .optional()
        .nullable(),
}).refine(data => data.available <= data.quantity, {
    message: 'Available quantity cannot exceed total quantity',
    path: ['available']
});

export type ResourceFormData = z.infer<typeof resourceSchema>;

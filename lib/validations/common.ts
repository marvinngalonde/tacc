import { z } from 'zod';

// Team validation schema
export const teamSchema = z.object({
    name: z.string()
        .min(3, 'Team name must be at least 3 characters')
        .max(100, 'Team name must be less than 100 characters'),

    description: z.string().optional(),

    projectId: z.string()
        .min(1, 'Please select a project'),

    memberIds: z.array(z.string())
        .min(1, 'Team must have at least one member'),
});

export type TeamFormData = z.infer<typeof teamSchema>;

// Document validation schema
export const documentSchema = z.object({
    name: z.string()
        .min(3, 'Document name must be at least 3 characters')
        .max(200, 'Document name must be less than 200 characters'),

    type: z.string()
        .min(1, 'Please specify document type'),

    description: z.string().optional(),

    url: z.string()
        .url('Please enter a valid URL'),

    projectId: z.string()
        .min(1, 'Please select a project'),

    size: z.number()
        .min(0, 'File size must be positive')
        .optional()
        .nullable(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

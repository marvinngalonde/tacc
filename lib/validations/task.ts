import { z } from 'zod';

// Task validation schema
export const taskSchema = z.object({
    title: z.string()
        .min(3, 'Task title must be at least 3 characters')
        .max(200, 'Task title must be less than 200 characters'),

    description: z.string().optional(),

    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'], {
        errorMap: () => ({ message: 'Please select a valid status' })
    }),

    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
        errorMap: () => ({ message: 'Please select a valid priority' })
    }),

    startDate: z.string()
        .refine(date => !date || !isNaN(Date.parse(date)), {
            message: 'Invalid start date format'
        })
        .optional()
        .nullable(),

    dueDate: z.string()
        .refine(date => !date || !isNaN(Date.parse(date)), {
            message: 'Invalid due date format'
        })
        .optional()
        .nullable(),

    projectId: z.string()
        .min(1, 'Please select a project'),

    assigneeId: z.string().optional().nullable(),
}).refine(data => {
    if (!data.startDate || !data.dueDate) return true;
    const start = new Date(data.startDate);
    const due = new Date(data.dueDate);
    return due >= start;
}, {
    message: 'Due date must be on or after start date',
    path: ['dueDate']
});

export type TaskFormData = z.infer<typeof taskSchema>;

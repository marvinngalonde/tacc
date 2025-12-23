'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    startDate: string | null;
    dueDate: string | null;
    assignee: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        avatar: string | null;
    } | null;
    project: {
        id: string;
        name: string;
    };
}

export default function TasksPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ['tasks', statusFilter, priorityFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (priorityFilter !== 'all') params.append('priority', priorityFilter);

            const response = await fetch(`/api/tasks?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return response.json();
        },
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'blocked':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'in_progress':
                return 'In Progress';
            case 'pending':
                return 'Pending';
            case 'completed':
                return 'Completed';
            case 'blocked':
                return 'Blocked';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate Gantt chart position
    const getGanttPosition = (startDate: string | null, dueDate: string | null) => {
        if (!startDate || !dueDate) return null;

        const start = new Date(startDate);
        const end = new Date(dueDate);

        // Get the earliest and latest dates from all tasks
        const allDates = tasks.flatMap(t => [t.startDate, t.dueDate].filter(Boolean)).map(d => new Date(d!));
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

        const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
        const startOffset = (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

        return {
            left: `${(startOffset / totalDays) * 100}%`,
            width: `${(duration / totalDays) * 100}%`,
        };
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Gantt Chart</h1>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-3">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-700">Filters:</span>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="BLOCKED">Blocked</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Priority Filter */}
                    <div className="relative">
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Priority</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Gantt Chart Table */}
            <div className="bg-white rounded-lg shadow">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No tasks found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-48">
                                        Task ↑
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                                        Start Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                                        End Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-40">
                                        Assignee
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider flex-1">
                                        Timeline
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tasks.map((task) => {
                                    const ganttPos = getGanttPosition(task.startDate, task.dueDate);

                                    return (
                                        <tr key={task.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {task.title}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {task.startDate
                                                    ? new Date(task.startDate).toLocaleDateString('en-US', {
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        year: 'numeric',
                                                    })
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                                {task.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        year: 'numeric',
                                                    })
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {task.assignee ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                                            {task.assignee.avatar ? (
                                                                <img
                                                                    src={task.assignee.avatar}
                                                                    alt={`${task.assignee.firstName} ${task.assignee.lastName}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-semibold">
                                                                    {task.assignee.firstName?.[0]}
                                                                    {task.assignee.lastName?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-700">
                                                            {task.assignee.firstName} {task.assignee.lastName}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="relative h-8 flex items-center">
                                                    {ganttPos && (
                                                        <div
                                                            className="absolute h-6 rounded bg-blue-400"
                                                            style={{
                                                                left: ganttPos.left,
                                                                width: ganttPos.width,
                                                            }}
                                                        ></div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

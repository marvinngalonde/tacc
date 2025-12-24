'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { ChevronDown, MoreVertical, Eye, Edit, Trash2, X, Calendar, User, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    startDate: string | null;
    dueDate: string | null;
    createdAt: string;
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
    const router = useRouter();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [viewTask, setViewTask] = useState<Task | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ['tasks', statusFilter, priorityFilter, searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (priorityFilter !== 'all') params.append('priority', priorityFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await fetch(`/api/tasks?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return response.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setDeleteConfirm(null);
            setOpenMenuId(null);
        },
    });

    // Calculate timeline range and generate month headers
    const timelineData = useMemo(() => {
        const tasksWithDates = tasks.filter(t => t.startDate && t.dueDate);
        if (tasksWithDates.length === 0) return null;

        const allDates = tasksWithDates.flatMap(t => [new Date(t.startDate!), new Date(t.dueDate!)]);
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

        // Set to start of month for minDate and end of month for maxDate
        minDate.setDate(1);
        maxDate.setMonth(maxDate.getMonth() + 1);
        maxDate.setDate(0);

        // Generate months between min and max
        const months: { label: string; year: number; month: number; days: number }[] = [];
        const current = new Date(minDate);

        while (current <= maxDate) {
            const year = current.getFullYear();
            const month = current.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            months.push({
                label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                year,
                month,
                days: daysInMonth,
            });

            current.setMonth(current.getMonth() + 1);
        }

        const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

        return { minDate, maxDate, months, totalDays };
    }, [tasks]);

    // Calculate task position in Gantt chart
    const getTaskPosition = (task: Task) => {
        if (!task.startDate || !task.dueDate || !timelineData) return null;

        const start = new Date(task.startDate);
        const end = new Date(task.dueDate);
        const { minDate, totalDays } = timelineData;

        const startOffset = Math.ceil((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return {
            left: `${(startOffset / totalDays) * 100}%`,
            width: `${(duration / totalDays) * 100}%`,
        };
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'todo':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'review':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'in-progress':
                return 'In Progress';
            case 'todo':
                return 'To Do';
            case 'completed':
                return 'Completed';
            case 'review':
                return 'Review';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAction = (action: string, taskId: string) => {
        setOpenMenuId(null);

        if (action === 'view') {
            const task = tasks.find(t => t.id === taskId);
            if (task) setViewTask(task);
        } else if (action === 'edit') {
            router.push(`/dashboard/tasks/${taskId}/edit`);
        } else if (action === 'delete') {
            setDeleteConfirm(taskId);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Gantt Chart</h1>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-3">
                <div className="flex items-center justify-between gap-3">
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
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="completed">Completed</option>
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
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="w-64">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No tasks found</div>
                ) : (
                    <div className="flex">
                        {/* Left: Task List - Fixed 50% width */}
                        <div className="w-1/2 border-r border-gray-200 flex-shrink-0">
                            {/* Headers */}
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                                <div className="flex gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    <div className="w-[40%]">Task ↑</div>
                                    <div className="w-[25%]">Start Date</div>
                                    <div className="w-[25%]">End Date</div>
                                    <div className="w-[10%] text-center">Assignee</div>
                                </div>
                            </div>

                            {/* Task Rows */}
                            <div>
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="border-b border-gray-200 px-4 py-2 hover:bg-gray-50 h-12 flex items-center"
                                    >
                                        <div className="flex gap-2 w-full items-center">
                                            <div className="w-[40%] text-sm text-gray-900 truncate">
                                                {task.title}
                                            </div>
                                            <div className="w-[25%] text-xs text-gray-700">
                                                {task.startDate
                                                    ? new Date(task.startDate).toLocaleDateString('en-US', {
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        year: 'numeric',
                                                    })
                                                    : '-'}
                                            </div>
                                            <div className="w-[25%] text-xs text-gray-700">
                                                {task.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        year: 'numeric',
                                                    })
                                                    : '-'}
                                            </div>
                                            <div className="w-[10%] flex items-center justify-center">
                                                {task.assignee ? (
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
                                                ) : (
                                                    <div className="w-6 h-6"></div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Menu */}
                                        <div className="ml-2 relative flex-shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === task.id ? null : task.id);
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                id={`menu-button-${task.id}`}
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>

                                            {openMenuId === task.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenuId(null)}
                                                    ></div>
                                                    <div
                                                        className="fixed z-20 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                                                        style={{
                                                            top: `${document.getElementById(`menu-button-${task.id}`)?.getBoundingClientRect().bottom ?? 0}px`,
                                                            left: `${(document.getElementById(`menu-button-${task.id}`)?.getBoundingClientRect().right ?? 0) - 144}px`
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => handleAction('view', task.id)}
                                                            className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('edit', task.id)}
                                                            className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('delete', task.id)}
                                                            className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Timeline - Fixed 50% width with horizontal scroll */}
                        <div className="w-1/2 overflow-x-auto flex-shrink-0">
                            {timelineData && (
                                <div style={{ minWidth: `${timelineData.totalDays * 40}px` }}>
                                    {/* Month Headers */}
                                    <div className="bg-gray-50 border-b border-gray-200 flex">
                                        {timelineData.months.map((month, idx) => (
                                            <div
                                                key={idx}
                                                className="border-r border-gray-200 px-2 py-2 text-center flex-shrink-0"
                                                style={{ width: `${month.days * 40}px` }}
                                            >
                                                <div className="text-xs font-medium text-gray-700">{month.label}</div>
                                                {/* Day markers */}
                                                <div className="flex mt-1">
                                                    {Array.from({ length: month.days }).map((_, dayIdx) => (
                                                        <div
                                                            key={dayIdx}
                                                            className="text-center flex-shrink-0"
                                                            style={{ width: '40px' }}
                                                        >
                                                            <span className="text-[10px] text-gray-500">
                                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][
                                                                    new Date(month.year, month.month, dayIdx + 1).getDay()
                                                                ]}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Task Bars */}
                                    <div className="relative">
                                        {tasks.map((task) => {
                                            const position = getTaskPosition(task);
                                            return (
                                                <div
                                                    key={task.id}
                                                    className="border-b border-gray-200 h-12 relative"
                                                >
                                                    {position && (
                                                        <div
                                                            className="absolute top-1/2 -translate-y-1/2 h-6 rounded bg-blue-400 hover:bg-blue-500 cursor-pointer px-2 flex items-center"
                                                            style={{
                                                                left: position.left,
                                                                width: position.width,
                                                            }}
                                                            title={task.title}
                                                        >
                                                            <span className="text-xs text-white font-medium truncate">
                                                                {task.title}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* View Task Dialog */}
            {viewTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">{viewTask.title}</h2>
                            <button
                                onClick={() => setViewTask(null)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {viewTask.description && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                                    <p className="text-sm text-gray-600">{viewTask.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewTask.status)}`}>
                                        {getStatusLabel(viewTask.status)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Priority</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(viewTask.priority)}`}>
                                        {viewTask.priority.charAt(0).toUpperCase() + viewTask.priority.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Start Date
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {viewTask.startDate
                                            ? new Date(viewTask.startDate).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })
                                            : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Due Date
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {viewTask.dueDate
                                            ? new Date(viewTask.dueDate).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })
                                            : 'Not set'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Assignee
                                </h3>
                                {viewTask.assignee ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                            {viewTask.assignee.avatar ? (
                                                <img
                                                    src={viewTask.assignee.avatar}
                                                    alt={`${viewTask.assignee.firstName} ${viewTask.assignee.lastName}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-semibold">
                                                    {viewTask.assignee.firstName?.[0]}
                                                    {viewTask.assignee.lastName?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {viewTask.assignee.firstName} {viewTask.assignee.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">{viewTask.assignee.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Unassigned</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Project</h3>
                                <p className="text-sm text-gray-600">{viewTask.project.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setViewTask(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setViewTask(null);
                                    router.push(`/dashboard/tasks/${viewTask.id}/edit`);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Edit Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Are you sure you want to delete this task? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(deleteConfirm)}
                                    disabled={deleteMutation.isPending}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

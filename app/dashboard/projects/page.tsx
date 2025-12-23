'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, MoreVertical, ChevronDown, Eye, Edit, Trash2, X, Calendar, DollarSign, MapPin, Users, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    location: string | null;
    progress: number;
    creator: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
    };
    members: Array<{
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
    }>;
    taskCount?: number;
    memberCount?: number;
}

export default function ProjectsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [viewProject, setViewProject] = useState<Project | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ['projects', statusFilter, searchQuery, sortBy],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchQuery) params.append('search', searchQuery);
            if (sortBy) params.append('sortBy', sortBy);

            const response = await fetch(`/api/projects?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            return response.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete project');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setDeleteConfirm(null);
            setOpenMenuId(null);
        },
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'in_progress':
                return 'bg-green-100 text-green-800';
            case 'planning':
                return 'bg-blue-100 text-blue-800';
            case 'on_hold':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'in_progress':
                return 'In Progress';
            case 'planning':
                return 'Planning';
            case 'on_hold':
                return 'On Hold';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 75) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const handleAction = (action: string, projectId: string) => {
        setOpenMenuId(null);

        if (action === 'view') {
            const project = projects.find(p => p.id === projectId);
            if (project) setViewProject(project);
        } else if (action === 'edit') {
            router.push(`/dashboard/projects/${projectId}/edit`);
        } else if (action === 'delete') {
            setDeleteConfirm(projectId);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Projects List</h1>
            </div>

            {/* Filters and Search */}
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
                                <option value="all">All</option>
                                <option value="PLANNING">Planning</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Sort By Filter */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="createdAt">Recent</option>
                                <option value="startDate">Start Date</option>
                                <option value="endDate">End Date</option>
                                <option value="budget">Budget</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                        />
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-500 text-base">Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-base">No projects found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2 text-left">
                                        <input type="checkbox" className="rounded border-gray-300 w-4 h-4" />
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Project Name ↑
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        End Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Budget
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Team Lead
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                            <input type="checkbox" className="rounded border-gray-300 w-4 h-4" />
                                        </td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                            {project.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                    project.status
                                                )}`}
                                            >
                                                {getStatusLabel(project.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {new Date(project.startDate).toLocaleDateString('en-US', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {new Date(project.endDate).toLocaleDateString('en-US', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            ${project.budget.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                                    {project.creator.avatar ? (
                                                        <img
                                                            src={project.creator.avatar}
                                                            alt={`${project.creator.firstName} ${project.creator.lastName}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-blue-500 text-xs font-semibold">
                                                            {project.creator.firstName?.[0]}
                                                            {project.creator.lastName?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-700">
                                                    {project.creator.firstName} {project.creator.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px]">
                                                    <div
                                                        className={`h-full rounded-full ${getProgressColor(
                                                            project.progress
                                                        )}`}
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-600 w-8">
                                                    {project.progress}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === project.id ? null : project.id);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                    id={`menu-button-${project.id}`}
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>

                                            {/* Dropdown Menu - Fixed Position */}
                                            {openMenuId === project.id && (
                                                <>
                                                    {/* Backdrop to close menu */}
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenuId(null)}
                                                    ></div>

                                                    {/* Menu */}
                                                    <div
                                                        className="fixed z-20 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                                                        style={{
                                                            top: `${document.getElementById(`menu-button-${project.id}`)?.getBoundingClientRect().bottom ?? 0}px`,
                                                            left: `${(document.getElementById(`menu-button-${project.id}`)?.getBoundingClientRect().right ?? 0) - 144}px`
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => handleAction('view', project.id)}
                                                            className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('edit', project.id)}
                                                            className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('delete', project.id)}
                                                            className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Project Dialog */}
            {viewProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">{viewProject.name}</h2>
                            <button
                                onClick={() => setViewProject(null)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Description */}
                            {viewProject.description && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                                    <p className="text-sm text-gray-600">{viewProject.description}</p>
                                </div>
                            )}

                            {/* Status & Progress */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewProject.status)}`}>
                                        {getStatusLabel(viewProject.status)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Progress</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getProgressColor(viewProject.progress)}`}
                                                style={{ width: `${viewProject.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{viewProject.progress}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Start Date
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(viewProject.startDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        End Date
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(viewProject.endDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Budget
                                    </h3>
                                    <p className="text-sm text-gray-600">${viewProject.budget.toLocaleString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Spent
                                    </h3>
                                    <p className="text-sm text-gray-600">${viewProject.spent.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Location */}
                            {viewProject.location && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Location
                                    </h3>
                                    <p className="text-sm text-gray-600">{viewProject.location}</p>
                                </div>
                            )}

                            {/* Team */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Team Lead
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                        {viewProject.creator.avatar ? (
                                            <img
                                                src={viewProject.creator.avatar}
                                                alt={`${viewProject.creator.firstName} ${viewProject.creator.lastName}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-semibold">
                                                {viewProject.creator.firstName?.[0]}
                                                {viewProject.creator.lastName?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-700">
                                        {viewProject.creator.firstName} {viewProject.creator.lastName}
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" />
                                        Tasks
                                    </h3>
                                    <p className="text-2xl font-bold text-gray-900">{viewProject.taskCount || 0}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Team Members
                                    </h3>
                                    <p className="text-2xl font-bold text-gray-900">{viewProject.memberCount || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setViewProject(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setViewProject(null);
                                    router.push(`/dashboard/projects/${viewProject.id}/edit`);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Edit Project
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Are you sure you want to delete this project? This action cannot be undone and will also delete all associated tasks, documents, and team members.
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

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Users, Plus, Edit, Trash2, X, Search, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Team {
    id: string;
    name: string;
    description: string | null;
    projectId: string;
    project: {
        id: string;
        name: string;
    };
    members: {
        id: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    }[];
    createdAt: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function TeamsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState('all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editTeam, setEditTeam] = useState<Team | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Fetch teams
    const { data: teams = [], isLoading } = useQuery<Team[]>({
        queryKey: ['teams', projectFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (projectFilter !== 'all') params.append('projectId', projectFilter);

            const response = await fetch(`/ api / teams ? ${params.toString()} `);
            if (!response.ok) throw new Error('Failed to fetch teams');
            return response.json();
        },
    });

    // Fetch projects for filter
    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await fetch('/api/projects');
            if (!response.ok) throw new Error('Failed to fetch projects');
            return response.json();
        },
    });

    // Fetch users for team members
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        },
    });

    // Filter teams
    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Create team mutation
    const createMutation = useMutation({
        mutationFn: async (data: Partial<Team> & { memberIds?: string[] }) => {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create team');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setShowAddDialog(false);
            toast.success('Team created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create team');
        },
    });

    // Update team mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Team> & { memberIds?: string[] } }) => {
            const response = await fetch(`/ api / teams / ${id} `, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update team');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setEditTeam(null);
            toast.success('Team updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update team');
        },
    });

    // Delete team mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/ api / teams / ${id} `, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete team');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setDeleteConfirm(null);
            toast.success('Team deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete team');
        },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Teams</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage project teams and members</p>
                </div>
                <button
                    onClick={() => setShowAddDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Team
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Project Filter */}
                    <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Projects</option>
                        {projects.map((project: any) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">Total Teams</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{teams.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">Active Projects</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {new Set(teams.map(t => t.projectId)).size}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">Total Members</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {teams.reduce((sum, t) => sum + t.members.length, 0)}
                    </p>
                </div>
            </div>

            {/* Teams Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading teams...</div>
            ) : filteredTeams.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No teams found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeams.map((team) => (
                        <div
                            key={team.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 group relative"
                        >
                            {/* Action Buttons */}
                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditTeam(team)}
                                    className="p-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50 border border-gray-200"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(team.id)}
                                    className="p-1.5 bg-white rounded-md shadow-sm hover:bg-red-50 border border-gray-200"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>

                            {/* Team Icon */}
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mb-4">
                                <Users className="w-6 h-6" />
                            </div>

                            {/* Team Info */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{team.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{team.project.name}</p>
                            {team.description && (
                                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{team.description}</p>
                            )}

                            {/* Members */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                                        </span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {team.members.slice(0, 3).map((member) => (
                                            <div
                                                key={member.id}
                                                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                                title={`${member.user.firstName} ${member.user.lastName} `}
                                            >
                                                {member.user.firstName[0]}{member.user.lastName[0]}
                                            </div>
                                        ))}
                                        {team.members.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                                                +{team.members.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Team Dialog */}
            <TeamFormDialog
                team={editTeam || (showAddDialog ? {} as Team : null)}
                projects={projects}
                users={users}
                onClose={() => {
                    setShowAddDialog(false);
                    setEditTeam(null);
                }}
                onSubmit={(data) => {
                    if (editTeam) {
                        updateMutation.mutate({ id: editTeam.id, data });
                    } else {
                        createMutation.mutate(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Team</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete this team? This action cannot be undone.
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
            )}
        </div>
    );
}

// Team Form Dialog Component
function TeamFormDialog({
    team,
    projects,
    users,
    onClose,
    onSubmit,
    isLoading,
}: {
    team: Partial<Team> | null;
    projects: any[];
    users: User[];
    onClose: () => void;
    onSubmit: (data: Partial<Team> & { memberIds?: string[] }) => void;
    isLoading: boolean;
}) {
    const [formData, setFormData] = useState({
        name: team?.name || '',
        description: team?.description || '',
        projectId: team?.projectId || '',
        memberIds: team?.members?.map(m => m.user.id) || [],
    });

    if (!team) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const toggleMember = (userId: string) => {
        setFormData({
            ...formData,
            memberIds: formData.memberIds.includes(userId)
                ? formData.memberIds.filter(id => id !== userId)
                : [...formData.memberIds, userId],
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {team.id ? 'Edit Team' : 'Create New Team'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Team Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project *
                        </label>
                        <select
                            required
                            value={formData.projectId}
                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a project</option>
                            {projects.map((project: any) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Members
                        </label>
                        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                            {users.map((user) => (
                                <label
                                    key={user.id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.memberIds.includes(user.id)}
                                        onChange={() => toggleMember(user.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.memberIds.length} member{formData.memberIds.length !== 1 ? 's' : ''} selected
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : team.id ? 'Update Team' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Package, Truck, Wrench, HardHat, Plus, X, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Resource {
    id: string;
    name: string;
    type: string;
    description: string | null;
    quantity: number;
    available: number;
    cost: number | null;
    createdAt: string;
    updatedAt: string;
}

export default function ResourcesPage() {
    const queryClient = useQueryClient();
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [viewResource, setViewResource] = useState<Resource | null>(null);
    const [editResource, setEditResource] = useState<Resource | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data: resources = [], isLoading } = useQuery<Resource[]>({
        queryKey: ['resources', typeFilter, searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await fetch(`/api/resources?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch resources');
            return response.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: Partial<Resource>) => {
            const response = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create resource');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            setShowAddDialog(false);
            toast.success('Resource created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create resource');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Resource> }) => {
            const response = await fetch(`/api/resources/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update resource');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            setEditResource(null);
            toast.success('Resource updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update resource');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/resources/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete resource');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            setDeleteConfirm(null);
        },
    });

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'equipment':
                return <Wrench className="w-5 h-5" />;
            case 'vehicle':
                return <Truck className="w-5 h-5" />;
            case 'material':
                return <Package className="w-5 h-5" />;
            case 'safety':
                return <HardHat className="w-5 h-5" />;
            default:
                return <Package className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'equipment':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'vehicle':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'material':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'safety':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getAvailabilityStatus = (available: number, quantity: number) => {
        const percentage = (available / quantity) * 100;
        if (percentage === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50' };
        if (percentage < 30) return { label: 'Low Stock', color: 'text-orange-600 bg-orange-50' };
        if (percentage < 70) return { label: 'In Stock', color: 'text-yellow-600 bg-yellow-50' };
        return { label: 'Available', color: 'text-green-600 bg-green-50' };
    };

    const resourceTypes = ['all', 'equipment', 'vehicle', 'material', 'safety'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage equipment, materials, and vehicles</p>
                </div>
                <button
                    onClick={() => setShowAddDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Resource
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                    {/* Type Filter Tabs */}
                    <div className="flex items-center gap-2">
                        {resourceTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex-1 max-w-md ml-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Resources Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading resources...</div>
            ) : resources.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No resources found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {resources.map((resource) => {
                        const status = getAvailabilityStatus(resource.available, resource.quantity);

                        return (
                            <div
                                key={resource.id}
                                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 border border-gray-100 group relative"
                            >
                                {/* Action Buttons */}
                                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setViewResource(resource)}
                                        className="p-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50 border border-gray-200"
                                        title="View"
                                    >
                                        <Eye className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setEditResource(resource)}
                                        className="p-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50 border border-gray-200"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(resource.id)}
                                        className="p-1.5 bg-white rounded-md shadow-sm hover:bg-red-50 border border-gray-200"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>

                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                                        {getTypeIcon(resource.type)}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>

                                {/* Name & Description */}
                                <h3 className="text-base font-semibold text-gray-900 mb-1">{resource.name}</h3>
                                {resource.description && (
                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                                )}

                                {/* Type Badge */}
                                <div className="mb-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getTypeColor(resource.type)}`}>
                                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                    </span>
                                </div>

                                {/* Availability */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Available</span>
                                        <span className="font-semibold text-gray-900">
                                            {resource.available} / {resource.quantity}
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${resource.available === 0
                                                ? 'bg-red-500'
                                                : resource.available < resource.quantity * 0.3
                                                    ? 'bg-orange-500'
                                                    : 'bg-green-500'
                                                }`}
                                            style={{ width: `${(resource.available / resource.quantity) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Cost */}
                                {resource.cost && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Cost per unit</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                ${resource.cost.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Resource Dialog */}
            <ResourceFormDialog
                resource={editResource || (showAddDialog ? {} as Resource : null)}
                onClose={() => {
                    setShowAddDialog(false);
                    setEditResource(null);
                }}
                onSubmit={(data) => {
                    if (editResource) {
                        updateMutation.mutate({ id: editResource.id, data });
                    } else {
                        createMutation.mutate(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* View Resource Dialog */}
            {viewResource && (
                <ViewResourceDialog
                    resource={viewResource}
                    onClose={() => setViewResource(null)}
                    onEdit={() => {
                        setEditResource(viewResource);
                        setViewResource(null);
                    }}
                />
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
                                <h3 className="text-lg font-semibold text-gray-900">Delete Resource</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Are you sure you want to delete this resource? This action cannot be undone.
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

// Resource Form Dialog Component
function ResourceFormDialog({
    resource,
    onClose,
    onSubmit,
    isLoading,
}: {
    resource: Partial<Resource> | null;
    onClose: () => void;
    onSubmit: (data: Partial<Resource>) => void;
    isLoading: boolean;
}) {
    const [formData, setFormData] = useState({
        name: resource?.name || '',
        type: resource?.type || 'equipment',
        description: resource?.description || '',
        quantity: resource?.quantity?.toString() || '1',
        available: resource?.available?.toString() || '1',
        cost: resource?.cost?.toString() || '',
    });

    if (!resource) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert string fields to numbers before submitting
        const submitData: Partial<Resource> = {
            name: formData.name,
            type: formData.type,
            description: formData.description || null,
            quantity: parseInt(formData.quantity),
            available: parseInt(formData.available),
            cost: formData.cost ? parseFloat(formData.cost) : null,
        };
        onSubmit(submitData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {resource.id ? 'Edit Resource' : 'Add New Resource'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="equipment">Equipment</option>
                                <option value="vehicle">Vehicle</option>
                                <option value="material">Material</option>
                                <option value="safety">Safety</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Available *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                max={formData.quantity}
                                value={formData.available}
                                onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
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
                            {isLoading ? 'Saving...' : resource.id ? 'Update Resource' : 'Add Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// View Resource Dialog Component
function ViewResourceDialog({
    resource,
    onClose,
    onEdit,
}: {
    resource: Resource;
    onClose: () => void;
    onEdit: () => void;
}) {
    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'equipment':
                return <Wrench className="w-6 h-6" />;
            case 'vehicle':
                return <Truck className="w-6 h-6" />;
            case 'material':
                return <Package className="w-6 h-6" />;
            case 'safety':
                return <HardHat className="w-6 h-6" />;
            default:
                return <Package className="w-6 h-6" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{resource.name}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            {getTypeIcon(resource.type)}
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="text-base font-semibold text-gray-900 capitalize">{resource.type}</p>
                        </div>
                    </div>

                    {resource.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                            <p className="text-sm text-gray-600">{resource.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Quantity</h3>
                            <p className="text-2xl font-bold text-gray-900">{resource.quantity}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Available</h3>
                            <p className="text-2xl font-bold text-green-600">{resource.available}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Utilization</h3>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="h-3 rounded-full bg-blue-500"
                                style={{ width: `${((resource.quantity - resource.available) / resource.quantity) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {((resource.quantity - resource.available) / resource.quantity * 100).toFixed(1)}% in use
                        </p>
                    </div>

                    {resource.cost && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Cost per Unit</h3>
                            <p className="text-2xl font-bold text-gray-900">${resource.cost.toLocaleString()}</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                        Edit Resource
                    </button>
                </div>
            </div>
        </div>
    );
}

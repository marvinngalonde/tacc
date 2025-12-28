'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
    Search,
    Plus,
    FileText,
    File,
    Image,
    FileSpreadsheet,
    FileCode,
    X,
    Eye,
    Edit,
    Trash2,
    AlertCircle,
    Download,
    Grid3x3,
    List,
    Calendar,
    User,
    Folder,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Document {
    id: string;
    name: string;
    type: string;
    description: string | null;
    url: string;
    size: number | null;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    project: {
        id: string;
        name: string;
    };
    uploadedById: string;
    uploadedBy: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
}

export default function DocumentsPage() {
    const queryClient = useQueryClient();
    const [projectFilter, setProjectFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [viewDocument, setViewDocument] = useState<Document | null>(null);
    const [editDocument, setEditDocument] = useState<Document | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data: documents = [], isLoading } = useQuery<Document[]>({
        queryKey: ['documents', projectFilter, typeFilter, searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (projectFilter !== 'all') params.append('projectId', projectFilter);
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await fetch(`/api/documents?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch documents');
            return response.json();
        },
    });

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await fetch('/api/projects');
            if (!response.ok) throw new Error('Failed to fetch projects');
            return response.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: Partial<Document>) => {
            // Get the first user from database as uploader
            const usersResponse = await fetch('/api/users');
            const users = await usersResponse.json();
            const uploaderId = users[0]?.id || 'admin-user-id';

            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, uploadedById: uploaderId }),
            });
            if (!response.ok) throw new Error('Failed to create document');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setShowAddDialog(false);
            toast.success('Document uploaded successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to upload document');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Document> }) => {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update document');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setEditDocument(null);
            toast.success('Document updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update document');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete document');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setDeleteConfirm(null);
            toast.success('Document deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete document');
        },
    });

    const getFileIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
        if (lowerType.includes('doc')) return <FileText className="w-6 h-6 text-blue-500" />;
        if (lowerType.includes('xls') || lowerType.includes('sheet')) return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
        if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) return <Image className="w-6 h-6 text-purple-500" />;
        if (lowerType.includes('code') || lowerType.includes('dwg')) return <FileCode className="w-6 h-6 text-orange-500" />;
        return <File className="w-6 h-6 text-gray-500" />;
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage project files and documentation</p>
                </div>
                <button
                    onClick={() => setShowAddDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Upload Document
                </button>
            </div>

            {/* Filters & View Toggle */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-4">
                    {/* Project Filter */}
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-gray-500" />
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Projects</option>
                            {projects.map((project: any) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="pdf">PDF</option>
                        <option value="doc">Documents</option>
                        <option value="image">Images</option>
                        <option value="dwg">CAD Files</option>
                        <option value="spreadsheet">Spreadsheets</option>
                    </select>

                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                            title="Grid View"
                        >
                            <Grid3x3 className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                            title="List View"
                        >
                            <List className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Documents Display */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading documents...</div>
            ) : documents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No documents found</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border border-gray-100 group relative cursor-pointer"
                            onClick={() => setViewDocument(doc)}
                        >
                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditDocument(doc);
                                    }}
                                    className="p-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50 border border-gray-200"
                                    title="Edit"
                                >
                                    <Edit className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirm(doc.id);
                                    }}
                                    className="p-1.5 bg-white rounded-md shadow-sm hover:bg-red-50 border border-gray-200"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                </button>
                            </div>

                            {/* File Icon */}
                            <div className="flex items-center justify-center h-24 mb-3 bg-gray-50 rounded-lg">
                                {getFileIcon(doc.type)}
                            </div>

                            {/* File Info */}
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{doc.name}</h3>
                            <p className="text-xs text-gray-600 mb-2">{doc.project.name}</p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatFileSize(doc.size)}</span>
                                <span>{formatDate(doc.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Uploaded
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {documents.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(doc.type)}
                                            <span className="text-sm text-gray-900">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{doc.project.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{doc.type}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{formatFileSize(doc.size)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(doc.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setViewDocument(doc)}
                                                className="p-1.5 hover:bg-gray-100 rounded"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => setEditDocument(doc)}
                                                className="p-1.5 hover:bg-gray-100 rounded"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(doc.id)}
                                                className="p-1.5 hover:bg-red-50 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Document Dialog */}
            <DocumentFormDialog
                document={editDocument || (showAddDialog ? {} as Document : null)}
                projects={projects}
                onClose={() => {
                    setShowAddDialog(false);
                    setEditDocument(null);
                }}
                onSubmit={(data) => {
                    if (editDocument) {
                        updateMutation.mutate({ id: editDocument.id, data });
                    } else {
                        createMutation.mutate(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* View Document Dialog */}
            {viewDocument && (
                <ViewDocumentDialog
                    document={viewDocument}
                    onClose={() => setViewDocument(null)}
                    onEdit={() => {
                        setEditDocument(viewDocument);
                        setViewDocument(null);
                    }}
                    getFileIcon={getFileIcon}
                    formatFileSize={formatFileSize}
                    formatDate={formatDate}
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
                                <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Are you sure you want to delete this document? This action cannot be undone.
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

// Document Form Dialog Component
function DocumentFormDialog({
    document,
    projects,
    onClose,
    onSubmit,
    isLoading,
}: {
    document: Partial<Document> | null;
    projects: any[];
    onClose: () => void;
    onSubmit: (data: Partial<Document>) => void;
    isLoading: boolean;
}) {
    const [formData, setFormData] = useState<{
        name: string;
        type: string;
        description: string;
        url: string;
        size: string;
        projectId: string;
        file?: File;
    }>({
        name: document?.name || '',
        type: document?.type || 'pdf',
        description: document?.description || '',
        url: document?.url || '',
        size: document?.size?.toString() || '',
        projectId: document?.projectId || '',
    });

    if (!document) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.file) {
            // Upload file first
            const uploadFormData = new FormData();
            uploadFormData.append('file', formData.file);

            try {
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) throw new Error('File upload failed');

                const { url, size } = await uploadResponse.json();

                // Submit document with uploaded file URL
                const submitData: Partial<Document> = {
                    name: formData.name,
                    type: formData.type,
                    description: formData.description || null,
                    url,
                    size,
                    projectId: formData.projectId,
                };
                onSubmit(submitData);
            } catch (error) {
                console.error('Upload error:', error);
                alert('Failed to upload file');
            }
        } else {
            // No new file, just update metadata
            const submitData: Partial<Document> = {
                name: formData.name,
                type: formData.type,
                description: formData.description || null,
                url: formData.url,
                size: formData.size ? parseInt(formData.size) : null,
                projectId: formData.projectId,
            };
            onSubmit(submitData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {document.id ? 'Edit Document' : 'Upload Document'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Foundation_Plan_v3.pdf"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                            <select
                                required
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Project</option>
                                {projects.map((project: any) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pdf">PDF</option>
                                <option value="doc">Document</option>
                                <option value="image">Image</option>
                                <option value="dwg">CAD File</option>
                                <option value="spreadsheet">Spreadsheet</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {document.id ? 'Replace File (optional)' : 'Upload File *'}
                            </label>
                            <input
                                type="file"
                                required={!document.id}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setFormData({
                                            ...formData,
                                            url: file.name,
                                            file: file
                                        });
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.dwg"
                            />
                            {formData.url && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Selected: {formData.url}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brief description of the document..."
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
                            {isLoading ? 'Saving...' : document.id ? 'Update Document' : 'Upload Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// View Document Dialog Component
function ViewDocumentDialog({
    document,
    onClose,
    onEdit,
    getFileIcon,
    formatFileSize,
    formatDate,
}: {
    document: Document;
    onClose: () => void;
    onEdit: () => void;
    getFileIcon: (type: string) => React.ReactElement;
    formatFileSize: (bytes: number | null) => string;
    formatDate: (dateString: string) => string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{document.name}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">{getFileIcon(document.type)}</div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{document.type} File</p>
                        </div>
                        <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>
                    </div>

                    {document.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                            <p className="text-sm text-gray-600">{document.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Folder className="w-4 h-4" />
                                Project
                            </h3>
                            <p className="text-sm text-gray-900">{document.project.name}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">File Size</h3>
                            <p className="text-sm text-gray-900">{formatFileSize(document.size)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Uploaded By
                            </h3>
                            <p className="text-sm text-gray-900">
                                {document.uploadedBy.firstName} {document.uploadedBy.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{document.uploadedBy.email}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Upload Date
                            </h3>
                            <p className="text-sm text-gray-900">{formatDate(document.createdAt)}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">File URL</h3>
                        <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                        >
                            {document.url}
                        </a>
                    </div>
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
                        Edit Document
                    </button>
                </div>
            </div>
        </div>
    );
}

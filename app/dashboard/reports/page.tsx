'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart3,
    DollarSign,
    Users,
    AlertTriangle,
    FileText,
    TrendingUp,
    Calendar,
    CheckCircle2,
    Activity,
    X,
    Download
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    // Fetch projects data for reports
    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await fetch('/api/projects');
            if (!response.ok) throw new Error('Failed to fetch projects');
            return response.json();
        },
    });

    // Fetch tasks data for reports
    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return response.json();
        },
    });

    const reports: ReportCard[] = [
        {
            id: 'project-status',
            title: 'Project Status Report',
            description: 'Overview of project progress and health.',
            icon: <BarChart3 className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            id: 'budget-variance',
            title: 'Budget Variance Report',
            description: 'Compare actual costs against the budget.',
            icon: <DollarSign className="w-6 h-6" />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            id: 'resource-utilization',
            title: 'Resource Utilization Report',
            description: 'Track team and equipment allocation.',
            icon: <Users className="w-6 h-6" />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
        {
            id: 'safety-incident',
            title: 'Safety Incident Report',
            description: 'Log and analyze safety incidents.',
            icon: <AlertTriangle className="w-6 h-6" />,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
        },
        {
            id: 'project-timeline',
            title: 'Project Timeline Report',
            description: 'Track project milestones and deadlines.',
            icon: <Calendar className="w-6 h-6" />,
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
        },
        {
            id: 'completion-rate',
            title: 'Task Completion Report',
            description: 'Monitor task completion rates and productivity.',
            icon: <CheckCircle2 className="w-6 h-6" />,
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
        },
        {
            id: 'cost-analysis',
            title: 'Cost Analysis Report',
            description: 'Detailed breakdown of project expenses.',
            icon: <TrendingUp className="w-6 h-6" />,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
        {
            id: 'performance-metrics',
            title: 'Performance Metrics Report',
            description: 'Key performance indicators and metrics.',
            icon: <Activity className="w-6 h-6" />,
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
        {
            id: 'documentation',
            title: 'Documentation Report',
            description: 'Overview of project documentation status.',
            icon: <FileText className="w-6 h-6" />,
            iconBg: 'bg-cyan-100',
            iconColor: 'text-cyan-600',
        },
    ];

    const handleViewReport = (reportId: string) => {
        setSelectedReport(reportId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Generate and view comprehensive project reports
                </p>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-lg ${report.iconBg} ${report.iconColor} flex items-center justify-center mb-4`}>
                            {report.icon}
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {report.description}
                        </p>

                        {/* Action Button */}
                        <button
                            onClick={() => handleViewReport(report.id)}
                            className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                            View Report
                        </button>
                    </div>
                ))}
            </div>

            {/* Quick Stats Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Active Projects</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{projects.filter((p: any) => p.status === 'active').length}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Budget</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                            ${(projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) / 1000000).toFixed(1)}M
                        </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Total Tasks</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">{tasks.length}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">Completion Rate</p>
                        <p className="text-2xl font-bold text-orange-900 mt-1">
                            {tasks.length > 0 ? Math.round((tasks.filter((t: any) => t.status === 'completed').length / tasks.length) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Export to PDF
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Export to Excel
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Export to CSV
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Schedule Report
                    </button>
                </div>
            </div>

            {/* Report Modal */}
            {selectedReport && (
                <ReportModal
                    reportId={selectedReport}
                    projects={projects}
                    tasks={tasks}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </div>
    );
}

// Report Modal Component
function ReportModal({
    reportId,
    projects,
    tasks,
    onClose
}: {
    reportId: string;
    projects: any[];
    tasks: any[];
    onClose: () => void;
}) {
    const getReportContent = () => {
        switch (reportId) {
            case 'project-status':
                return <ProjectStatusReport projects={projects} />;
            case 'budget-variance':
                return <BudgetVarianceReport projects={projects} />;
            case 'resource-utilization':
                return <ResourceUtilizationReport tasks={tasks} />;
            case 'task-completion':
            case 'completion-rate':
                return <TaskCompletionReport tasks={tasks} />;
            case 'cost-analysis':
                return <CostAnalysisReport projects={projects} />;
            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-500">This report is under development</p>
                    </div>
                );
        }
    };

    const getReportTitle = () => {
        const titles: Record<string, string> = {
            'project-status': 'Project Status Report',
            'budget-variance': 'Budget Variance Report',
            'resource-utilization': 'Resource Utilization Report',
            'completion-rate': 'Task Completion Report',
            'cost-analysis': 'Cost Analysis Report',
        };
        return titles[reportId] || 'Report';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">{getReportTitle()}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Download Report"
                        >
                            <Download className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {getReportContent()}
                </div>
            </div>
        </div>
    );
}

// Project Status Report
function ProjectStatusReport({ projects }: { projects: any[] }) {
    const statusData = [
        { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#3b82f6' },
        { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#10b981' },
        { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#f59e0b' },
        { name: 'Cancelled', value: projects.filter(p => p.status === 'cancelled').length, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Project List</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {projects.map((project) => (
                            <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">{project.name}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${project.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                            project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Budget Variance Report
function BudgetVarianceReport({ projects }: { projects: any[] }) {
    const budgetData = projects.map(p => ({
        name: p.name.substring(0, 20),
        budget: p.budget || 0,
        spent: p.spent || 0,
        variance: (p.budget || 0) - (p.spent || 0),
    }));

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Budget vs Actual Spending</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                    <Bar dataKey="spent" fill="#10b981" name="Spent" />
                </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                        ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Total Spent</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                        ${projects.reduce((sum, p) => sum + (p.spent || 0), 0).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Remaining</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                        ${projects.reduce((sum, p) => sum + ((p.budget || 0) - (p.spent || 0)), 0).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Resource Utilization Report
function ResourceUtilizationReport({ tasks }: { tasks: any[] }) {
    const priorityData = [
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Task Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {priorityData.map((item) => (
                    <div key={item.name} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">{item.name} Priority Tasks</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Task Completion Report
function TaskCompletionReport({ tasks }: { tasks: any[] }) {
    const statusData = [
        { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
        { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: '#6b7280' },
    ];

    const completionRate = tasks.length > 0
        ? ((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center">
                    <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <p className="text-sm text-green-600 font-medium mb-2">Overall Completion Rate</p>
                        <p className="text-6xl font-bold text-green-900">{completionRate}%</p>
                        <p className="text-sm text-green-600 mt-2">{tasks.filter(t => t.status === 'completed').length} of {tasks.length} tasks completed</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Cost Analysis Report
function CostAnalysisReport({ projects }: { projects: any[] }) {
    const costData = projects.map(p => ({
        name: p.name.substring(0, 20),
        spent: p.spent || 0,
    })).sort((a, b) => b.spent - a.spent).slice(0, 10);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Top 10 Projects by Spending</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={costData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

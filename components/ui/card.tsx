// Enhanced Card Component with hover effects
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', hover = true, gradient = false, onClick }: CardProps) {
    const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200';
    const hoverStyles = hover ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : '';
    const gradientStyles = gradient ? 'bg-gradient-to-br from-white to-gray-50' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'blue' | 'green' | 'red' | 'purple' | 'amber';
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'blue' }: StatCardProps) {
    const colorStyles = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600',
        amber: 'from-amber-500 to-amber-600',
    };

    return (
        <Card hover className="p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    {trend && (
                        <div className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorStyles[color]} flex items-center justify-center text-white shadow-lg`}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}

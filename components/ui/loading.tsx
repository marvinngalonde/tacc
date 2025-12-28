import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
    );
}

interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" className="text-blue-600" />
                <p className="text-gray-900 font-medium">{message}</p>
            </div>
        </div>
    );
}

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
            <p className="text-gray-600">{message}</p>
        </div>
    );
}

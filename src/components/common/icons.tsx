// src/components/common/icons.tsx

import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
}

export const StarFilledIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="currentColor" 
        viewBox="0 0 24 24"
    >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export const StarOutlineIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
        />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
        />
    </svg>
);

export const EditImage: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z M15 8l1.5 1.5M16.5 9.5L19 12" 
        />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
        />
    </svg>
);

export const AIAnalysisIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
    </svg>
);

export const CancelIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
        />
    </svg>
);

export const ConfirmIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 13l4 4L19 7" 
        />
    </svg>
);

// IconButton component for consistent button styling
interface IconButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    title?: string;
    className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
    onClick, 
    icon, 
    title, 
    className = "p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
    }) => (
    <button
        onClick={onClick}
        className={className}
        title={title}
    >
        {icon}
    </button>
);
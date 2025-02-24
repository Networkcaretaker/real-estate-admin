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

export const PrintIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
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
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2" 
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

export const ViewProperty: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0M12 4.5c-4.5 0-8.5 3-11 7.5 2.5 4.5 6.5 7.5 11 7.5s8.5-3 11-7.5c-2.5-4.5-6.5-7.5-11-7.5z"
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

export const WebsiteIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
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
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
        />
    </svg>
);

export const PropertiesIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size }) => (
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
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
    </svg>
);

export const TableListIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size }) => (
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
        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" 
        />
    </svg>
);

// Table Views
export const TableDetailedIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <rect x="2" y="3" width="8" height="8" rx="1" strokeWidth={2} />
        <line x1="12" y1="6" x2="22" y2="6" strokeWidth={2} />
        <line x1="12" y1="10" x2="22" y2="10" strokeWidth={2} />
        <rect x="2" y="13" width="8" height="8" rx="1" strokeWidth={2} />
        <line x1="12" y1="16" x2="22" y2="16" strokeWidth={2} />
        <line x1="12" y1="20" x2="22" y2="20" strokeWidth={2} />
    </svg>
);
export const TableCardIcon: React.FC<IconProps> = ({ className = "w-4 h-4", size }) => (
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
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" 
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
    disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
    onClick, 
    icon, 
    title, 
    disabled = false,
    className = "p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
    }) => (
    <button
        onClick={onClick}
        className={className}
        title={title}
        disabled={disabled}
    >
        {icon}
    </button>
);
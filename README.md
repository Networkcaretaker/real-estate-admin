# Real Estate Admin Portal

## Overview
A modern React-based admin interface for managing real estate properties, focusing on seamless content management and image handling. This application serves as the control center for property data that flows from the CRM system through the backend API to the customer-facing website.

## Key Features
- **Property Management**: View, edit, and update property listings
- **Image Management**: Upload, organize, and optimize property images
- **AI-Powered Content**: Generate property descriptions and image captions using AI
- **Firebase Integration**: Real-time data synchronization
- **Responsive Design**: Full functionality across all device sizes

## Tech Stack
- React with TypeScript
- Firebase/Firestore
- React Router
- Google Gemini Vision AI
- Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Firebase project and credentials

### Installation
1. Clone the repository
```bash
git clone https://github.com/your-org/real-estate-admin.git
cd real-estate-admin
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
   - Copy `.env.example` to `.env.development` and `.env.production`
   - Fill in the required Firebase configuration values:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Project Structure
```
real-estate-admin/
├── src/
│   ├── assets/                # Static assets
│   ├── components/
│   │   ├── common/            # Reusable UI components
│   │   └── layout/            # Layout components
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Properties.tsx
│   │   ├── Property.tsx       # Property details page
│   │   └── Property_Images.tsx # Image management page
│   ├── services/
│   │   ├── firebase/          # Firebase service functions
│   │   └── api/               # API service functions
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   └── context/               # React context providers
├── public/                    # Public assets
├── .env.example               # Example environment variables
├── .env.development           # Development environment variables
├── .env.production            # Production environment variables
└── package.json               # Project dependencies and scripts
```

## Features

### Authentication
- Secure Firebase authentication
- Role-based access control
- Protected routes

### Property Management
- View all properties with filtering and sorting
- Edit property details and metadata
- Update property status

### Image Management
- Dedicated image management interface
- Drag-and-drop reordering
- Feature image selection
- AI-assisted image analysis

### AI Features
- Generate image titles and descriptions
- Multiple writing styles (professional, luxury, concise, etc.)
- AI-assisted property content generation
- Response history tracking

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Browser Support
- Chrome, Firefox, Safari, Edge (latest two versions)
- Responsive design for mobile and tablet devices

## Contributing
1. Create a feature branch from `develop`
2. Make your changes
3. Open a pull request to merge back to `develop`

## License
[Your License] - See LICENSE.md for details
# Overview

GayriCRM is a modern, mobile-compatible Progressive Web Application (PWA) designed specifically for real estate offices focusing on land and parcel management. The system provides comprehensive CRM functionality including user management, client management, property management, document handling, transaction tracking, reporting, and accounting modules. Built with a dashboard-centric approach, the application features a responsive design optimized for both desktop and mobile use.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side architecture is built with React and Vite, utilizing a modern component-based approach:

- **React Framework**: Uses Vite as the build tool for fast development and optimized production builds
- **UI Components**: Implements shadcn/ui component library with Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Charts**: Recharts for data visualization components
- **PWA Features**: Service worker implementation for offline capabilities and app-like experience

## Backend Architecture

The server-side follows a Node.js Express pattern with TypeScript:

- **Express.js Server**: RESTful API architecture with middleware-based request handling
- **Authentication**: Passport.js with local strategy for session-based authentication
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Route Protection**: Role-based access control with admin and consultant permissions
- **Request Logging**: Custom middleware for API request tracking and performance monitoring

## Data Storage Solutions

Database architecture uses PostgreSQL with Drizzle ORM:

- **Primary Database**: PostgreSQL via Neon serverless connection
- **Schema Design**: Seven main entities (users, clients, properties, transactions, documents, reports, accounting)
- **Relationships**: Foreign key relationships between entities (consultant assignments, property ownership, transaction participants)
- **Migration System**: Drizzle Kit for schema migrations and database versioning
- **Type Safety**: Drizzle-Zod integration for runtime validation matching database schema

## Authentication and Authorization

Multi-layered security implementation:

- **Session-Based Auth**: Express sessions with PostgreSQL storage for persistence
- **Password Security**: Scrypt-based password hashing with salt for secure storage
- **Role-Based Access**: Two-tier system with admin (full access) and consultant (restricted to own data)
- **Route Protection**: Middleware guards on both API endpoints and frontend routes
- **User Context**: React context for authentication state management across components

## API Structure

RESTful API design with consistent patterns:

- **Resource-Based Endpoints**: Standard CRUD operations for each entity (/api/clients, /api/properties, etc.)
- **Dashboard Analytics**: Specialized endpoints for aggregated statistics and metrics
- **Role-Specific Data**: Automatic filtering based on user permissions (consultants see only their data)
- **Error Handling**: Centralized error middleware with consistent response formatting
- **Request Validation**: Zod schema validation for all incoming data

# External Dependencies

## Database Services

- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database ORM**: Drizzle ORM for type-safe database interactions
- **Migration Tool**: Drizzle Kit for schema management and deployment

## UI and Styling Libraries

- **shadcn/ui**: Pre-built component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Low-level UI primitives for accessibility and customization
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools

- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Type safety across both frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

## Runtime Dependencies

- **TanStack Query**: Server state management and caching
- **Recharts**: Chart library for data visualization
- **React Hook Form**: Form state management with validation
- **Wouter**: Lightweight routing solution
- **bcryptjs**: Password hashing utility
- **date-fns**: Date manipulation and formatting

## PWA Technologies

- **Service Worker**: Custom implementation for offline functionality
- **Web App Manifest**: Configuration for installable web app experience
- **Cache Strategies**: Static and dynamic caching for performance optimization
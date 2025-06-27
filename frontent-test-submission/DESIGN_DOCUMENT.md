# URL Shortener Web App - Design Document

## Overview
A fully functional React-based URL shortener application with Material UI styling, client-side persistence, and comprehensive analytics tracking.

## Technology Choices

### Core Technologies
- **React 18.3.1**: Modern React with hooks for state management and lifecycle handling
- **TypeScript**: Type safety and better development experience
- **Material UI 5.15.1**: Professional, production-ready component library for consistent design
- **React Router DOM 6.20.1**: Client-side routing for SPA navigation and shortcode redirects
- **Vite**: Fast build tool and development server configured to run on port 3000

### Why These Technologies?
- **Material UI over Tailwind**: Requirement specified Material UI; provides comprehensive component system with built-in accessibility
- **localStorage over IndexedDB**: Simpler implementation for structured data storage requirements; sufficient for the application scope
- **React Router**: Essential for handling dynamic shortcode redirects (e.g., `/abc123` → original URL)
- **TypeScript**: Provides compile-time error checking and better IDE support for maintainable code

## Project Structure

```
src/
├── components/
│   ├── URLShortenerPage.tsx    # Main form for creating short URLs
│   ├── StatsPage.tsx           # Analytics dashboard
│   ├── RedirectHandler.tsx     # Handles shortcode redirects
│   └── Layout.tsx              # App navigation and layout
├── services/
│   └── localStorageService.ts  # Data persistence layer
├── utils/
│   ├── urlValidator.ts         # URL validation logic
│   ├── shortcode.ts            # Shortcode generation/validation
│   └── logger.ts               # Custom logging implementation
├── routes/
│   └── routes.tsx              # Application routing configuration
├── App.tsx                     # Root component with theme
└── main.tsx                    # Application entry point
```

## Component Responsibilities

### URLShortenerPage.tsx
- **Primary Function**: Form interface for creating 1-5 short URLs simultaneously
- **Key Features**:
  - Dynamic form fields with add/remove functionality
  - Real-time validation for URLs, shortcodes, and validity periods
  - Custom shortcode input with uniqueness checking
  - Validity period configuration (1 minute to 30 days)
  - Success feedback with copyable short URLs
- **State Management**: Local state for form inputs, validation errors, and created URLs
- **Data Flow**: Validates inputs → generates/validates shortcodes → saves to localStorage

### StatsPage.tsx
- **Primary Function**: Comprehensive analytics dashboard for all created URLs
- **Key Features**:
  - Summary cards (total URLs, clicks, active/expired counts)
  - Detailed table with sorting and status indicators
  - Click analytics with timestamps and user agent tracking
  - Data refresh and clear functionality
- **Data Source**: Reads from localStorage service
- **Analytics Calculated**: Total clicks, 24-hour click counts, expiration status

### RedirectHandler.tsx
- **Primary Function**: Processes shortcode redirects and tracks clicks
- **Key Features**:
  - URL lookup by shortcode
  - Expiration and activation status checking
  - Click tracking with user agent and referrer
  - User-friendly loading and error states
  - Automatic redirect after click recording
- **Error Handling**: Not found, expired, and deactivated URL scenarios

### Layout.tsx
- **Primary Function**: Application shell with navigation
- **Key Features**:
  - Responsive Material UI AppBar
  - Context-aware navigation (hidden on redirect pages)
  - Consistent branding and layout structure

## Data Models

### ShortURL Interface
```typescript
interface ShortURL {
  id: string;              // Unique identifier
  originalUrl: string;     // Target URL with protocol normalization
  shortcode: string;       // Alphanumeric identifier (3-20 chars)
  createdAt: Date;         // Creation timestamp
  expiresAt: Date;         // Calculated expiration time
  validityMinutes: number; // User-defined validity period
  clicks: ClickRecord[];   // Array of click events
  isActive: boolean;       // Manual activation status
}
```

### ClickRecord Interface
```typescript
interface ClickRecord {
  timestamp: Date;    // When the click occurred
  userAgent: string;  // Browser/device information
  referrer: string;   // Source page or "Direct"
  ip?: string;        // Future extension for IP tracking
  country?: string;   // Future extension for geo data
  city?: string;      // Future extension for geo data
}
```

## Logging Implementation

### Custom Logger Function
```typescript
async function Log(stack: string, level: string, package: string, message: string)
```

### Usage Throughout Application
- **Validation Events**: URL and shortcode validation results
- **Data Operations**: localStorage read/write operations
- **User Actions**: Form submissions, redirects, data clearing
- **Error Handling**: Catch blocks and validation failures
- **Navigation**: Route changes and page loads

### Log Categories
- `client` stack for frontend operations
- Levels: `info`, `warn`, `error`
- Package names: component/utility identifiers
- Structured messages for debugging and monitoring

## Key Features Implementation

### URL Shortening (1-5 URLs)
- Dynamic form with add/remove URL inputs
- Batch processing with individual validation
- Automatic shortcode generation or custom input
- Duplicate shortcode prevention across form and existing data

### Custom Shortcodes
- Alphanumeric validation (3-20 characters)
- Reserved word checking (api, admin, stats, etc.)
- Uniqueness validation against existing database
- Real-time feedback during input

### Validity Periods
- User-configurable (1 minute to 43,200 minutes/30 days)
- Default: 30 minutes when not specified
- Automatic expiration checking on redirect
- Visual indicators for expired URLs in stats

### Client-Side Routing
- React Router handles all navigation
- Dynamic routes for shortcodes (`/:shortcode`)
- Automatic redirection with click tracking
- 404 handling for invalid shortcodes

### Analytics & Statistics
- Real-time click counting
- User agent and referrer tracking
- 24-hour click summaries
- Creation and expiration timestamps
- Status indicators (active/expired/inactive)

## Assumptions & Constraints

### Data Persistence
- **localStorage**: Data persists until manually cleared or browser data reset
- **Session Independence**: Each browser/device maintains separate data
- **Storage Limits**: Browser localStorage typically 5-10MB (sufficient for thousands of URLs)

### URL Validation
- **Protocol Addition**: Automatically adds `https://` if missing
- **Localhost Blocking**: Prevents local development URLs for security
- **Basic Domain Validation**: Requires valid hostname with TLD

### Security Considerations
- **No Server-Side Validation**: All validation occurs client-side
- **No Authentication**: Public access to create URLs
- **Local Data Only**: No data transmission to external servers (except logging)

### Performance Assumptions
- **Data Size**: Optimized for hundreds to low thousands of URLs
- **Browser Support**: Modern browsers with ES2020+ support
- **Network Independence**: Full offline functionality except for logging

## Production Deployment Notes

### Build Configuration
- Vite configured for port 3000 development
- TypeScript compilation with strict mode
- Material UI optimization for production builds

### Browser Compatibility
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
- ES2020 features required
- localStorage API required

### Monitoring
- Custom logging endpoint configured
- Client-side error tracking
- User action analytics through logging system

This design provides a robust, user-friendly URL shortener with comprehensive analytics while maintaining simplicity and performance through client-side architecture.
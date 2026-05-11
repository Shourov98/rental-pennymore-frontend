# BeforeListed Frontend Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [User Roles & Flows](#user-roles--flows)
5. [Features](#features)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Routing](#routing)
9. [Environment Variables](#environment-variables)
10. [Setup & Installation](#setup--installation)
11. [Available Scripts](#available-scripts)

---

## Project Overview

BeforeListed is a pre-market rental platform that connects property owners/agents with potential renters before properties are listed on traditional rental channels. The frontend application provides separate portals for agents and renters with distinct dashboards, matching systems, and property management tools.

**Project Name:** `rental-pennymore-frontend`  
**Framework:** Next.js 14 (App Router)  
**Type:** Web Application (React)

---

## Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.10 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Redux Toolkit | 2.11.0 | State management |
| Redux Persist | 6.0.0 | State persistence |

### Additional Libraries

| Library | Purpose |
|---------|---------|
| `@reduxjs/toolkit/query` | RTK Query for API calls |
| `react-redux` | React bindings for Redux |
| `lucide-react` | Icon library |
| `@dnd-kit/core` | Drag and drop functionality |
| `react-leaflet` | OpenStreetMap integration |
| `leaflet` | Map library |
| `react-hook-form` | Form handling |
| `@stripe/react-stripe-js` | Payment integration |
| `embla-carousel-react` | Carousel component |

---

## Project Structure

```
rental-pennymore-frontend/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication routes
│   │   ├── signin/               # Login page
│   │   ├── signup/               # Registration (renter/agent)
│   │   ├── forgot-password/      # Password reset
│   │   ├── reset-password/       # Set new password
│   │   ├── otp-verify/          # OTP verification
│   │   └── ...
│   ├── (site)/                   # Public site pages
│   │   ├── page.tsx             # Landing page
│   │   ├── about/               # About page
│   │   ├── matches/             # Public matches
│   │   └── ...
│   ├── agent/                    # Agent dashboard routes
│   │   ├── dashboard/           # Agent dashboard
│   │   ├── matches/             # Agent matches
│   │   ├── profile/             # Agent profile
│   │   ├── archived-requests/   # Archived requests
│   │   └── ...
│   ├── renter/                   # Renter dashboard routes
│   │   ├── dashboard/           # Renter dashboard
│   │   ├── matches/             # Renter matches
│   │   ├── saved-requests/      # Saved requests
│   │   ├── profile/             # Renter profile
│   │   └── ...
│   ├── layout.tsx               # Root layout
│   ├── providers.tsx            # Redux provider wrapper
│   └── globals.css              # Global styles
├── components/                   # Reusable React components
│   ├── agent/                   # Agent-specific components
│   │   ├── AgentNavbar.tsx
│   │   ├── AgentSidebar.tsx
│   │   ├── ArchiveRequestDialog.tsx
│   │   └── UnarchiveRequestDialog.tsx
│   ├── navbar/                  # Navigation components
│   │   ├── Navbar.tsx
│   │   ├── ComplienceStrip.tsx
│   │   └── AdvertiseBar.tsx
│   ├── renter/                  # Renter-specific components
│   │   └── RenterSidebar.tsx
│   ├── modals/                  # Modal components
│   │   └── FilterModals.tsx
│   ├── partials/                # Partial components
│   │   ├── GoogleMap.tsx
│   │   └── OpenStreetMap.tsx
│   ├── RequestCard.tsx
│   ├── HeroSection.tsx
│   ├── Footer.tsx
│   └── ...
├── store/                       # Redux state management
│   ├── store.ts                 # Store configuration
│   ├── api.ts                   # RTK Query API definition
│   └── slices/                  # Redux slices
│       ├── authSlice.ts         # Authentication state
│       ├── preferenceSlice.ts  # User preferences
│       └── agentProfileSlice.ts # Agent profile state
├── data/                        # Static data files
│   ├── neighborhoods.manhattan-brooklyn.json
│   └── exact-neighborhoods.json
├── lib/                         # Utility functions
│   └── referralCode.ts
├── public/                      # Static assets
│   ├── images/
│   └── icons/
└── package.json
```

---

## User Roles & Flows

### 1. Agent Role

Agents represent property owners or real estate agencies. They can:

- **Create rental requests** - Post properties they're looking to rent for clients
- **Manage requests** - View, edit, archive, and unarchive rental requests
- **View matches** - See renters that match their property requirements
- **Manage profile** - Update profile information, brokerage details, license number
- **Refer renters** - Generate referral links to invite renters to the platform

### 2. Renter Role

Renters are individuals looking for rental properties. They can:

- **Create rental preferences** - Define their ideal property requirements
- **View matches** - See properties that match their preferences
- **Save requests** - Bookmark rental requests for later
- **Manage profile** - Update personal information, pet preferences

### Authentication Flow

1. **Login** (`/signin`) - Email/password authentication
2. **Registration** (`/signup`) - Choose between Renter or Agent
3. **Verification** - OTP verification for email confirmation
4. **Password Reset** - Forgot password flow with OTP

---

## Features

### Public Site
- Landing page with hero section
- About page with platform information
- Pre-market listings view
- Saved searches
- Terms & privacy policy pages

### Agent Portal
- **Dashboard** - Overview of active requests and matches
- **Requests Management** - Create, edit, archive/unarchive rental requests
- **Matches** - View matched renters with detailed profiles
- **Profile Management** - Edit agent profile, brokerage info
- **Referral System** - Generate and manage referral codes

### Renter Portal
- **Dashboard** - Overview of active preferences and matches
- **Preference Builder** - Define rental requirements with drag-and-drop
- **Matches** - Browse and save matching properties
- **Saved Requests** - View bookmarked rental requests
- **Notifications** - Receive match notifications

### Core Features
- Advanced filtering system (price, bedrooms, neighborhoods)
- Interactive maps (OpenStreetMap integration)
- Drag-and-drop preference prioritization
- Secure JWT-based authentication with refresh tokens
- Referral tracking system
- Monthly report section
- Responsive design for all devices

---

## State Management

### Redux Store Structure

The application uses Redux Toolkit with the following structure:

```
store/
├── store.ts          # Main store configuration
├── api.ts           # RTK Query API endpoints
└── slices/
    ├── authSlice.ts          # Authentication state
    ├── preferenceSlice.ts    # Renter preferences
    └── agentProfileSlice.ts  # Agent profile data
```

### Auth Slice

Manages authentication state for both Agent and Renter roles:

```typescript
interface AuthState {
  user: UserBase | null;
  renter: RenterProfile | null;
  agentProfile: AgentProfile | null;
  role: "Agent" | "Renter" | null;
  accessToken: string | null;
  refreshToken: string | null;
  mustChangePassword: boolean;
  sessionReady: boolean;
  status: "idle" | "loading" | "authenticated" | "error";
}
```

### Key Selectors

- `selectAuth` - Get entire auth state
- `selectUser` - Get current user
- `selectAccessToken` - Get JWT token
- `selectIsAuthed` - Check authentication status
- `selectRole` - Get user role (Agent/Renter)
- `selectAgentHasGrantAccess` - Check agent grant access

### API Slice (RTK Query)

The `api.ts` file defines all server API endpoints:

- `loginAgent` - Authenticate agent
- `registerRenter` - Register new renter
- `refreshToken` - Refresh JWT token
- `getProfile` - Get user profile

---

## API Integration

### Base URL Configuration

API base URL is configured via environment variable:
```
NEXT_PUBLIC_API_BASE_URL
```

### Authentication Headers

All API requests include the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Token Refresh Logic

1. On 401 response, attempt to refresh token via `/auth/refresh-token`
2. If refresh successful, retry original request
3. If refresh fails, dispatch logout action

### Email Blocked Handling

If API returns `EMAIL_BLOCKED` error code, automatically logs out user.

---

## Routing

### Route Groups

| Group | Path | Description |
|-------|------|-------------|
| Auth | `(auth)/` | Login, signup, password reset |
| Public | `(site)/` | Landing page, about, terms |
| Agent | `agent/` | Agent dashboard & features |
| Renter | `renter/` | Renter dashboard & features |

### Protected Routes

- `/agent/*` - Requires Agent role
- `/renter/*` - Requires Renter role
- Middleware handles role-based route protection

### Key Routes

```
/                          -> Landing page
/signin                    -> Login
/signup                    -> Registration (role selection)
/signup/renter             -> Renter registration
/signup/agent              -> Agent registration

/agent/dashboard           -> Agent dashboard
/agent/matches             -> Agent matches list
/agent/matches/[id]        -> Match details
/agent/archived-requests    -> Archived requests
/agent/profile             -> Agent profile
/agent/refer-link          -> Referral link generator

/renter/dashboard          -> Renter dashboard
/renter/matches            -> Renter matches list
/renter/matches/[id]       -> Match details
/renter/saved-requests     -> Saved requests
/renter/profile            -> Renter profile
/renter/notifications      -> Notifications
```

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api/v1

# Payment Processing (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Authentication (NextAuth)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Current Environment Variables

The project currently uses:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API endpoint
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe test key

---

## Setup & Installation

### Prerequisites

- Node.js 18.0.0 or later
- npm or pnpm (project uses pnpm@9.15.0)

### Installation Steps

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API credentials
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   Open http://localhost:3000 in your browser

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm dev:3030` | Start development server on port 3030 |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |

---

## Component Guidelines

### Naming Conventions

- **Page components**: `page.tsx` (Next.js convention)
- **UI components**: PascalCase (e.g., `RequestCard.tsx`)
- **Utility components**: camelCase where appropriate

### Component Categories

1. **Page Components** - Located in `app/` directory
2. **Shared Components** - Located in `components/` root
3. **Role-specific Components** - In `components/agent/` or `components/renter/`
4. **Modals** - In `components/modals/`
5. **Partial Components** - In `components/partials/`

### Redux Integration

Use custom hooks for Redux:
```typescript
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';

// Typed hooks
const useAppDispatch = useDispatch.withTypes<AppDispatch>();
const useAppSelector = useSelector.withTypes<RootState>();
```

---

## Data Files

### Neighborhood Data

Located in `data/` directory:
- `neighborhoods.manhattan-brooklyn.json` - NYC neighborhoods
- `exact-neighborhoods.json` - Precise neighborhood definitions

### Areas Configuration

Located in `components/`:
- `manhattanAreas.ts` - Manhattan neighborhood data
- `brooklynAreas.ts` - Brooklyn neighborhood data

---

## Additional Notes

### Payment Integration

The project uses Stripe for payment processing. Test keys are configured in `.env`.

### Maps Integration

OpenStreetMap is used for property location visualization via `react-leaflet`.

### Drag and Drop

Preference prioritization uses `@dnd-kit` for accessible drag-and-drop interfaces.

### Type Safety

The project uses strict TypeScript configuration. All components should be properly typed.

---

## License

MIT License - See LICENSE file for details.

---

## Support

For issues or questions, contact: contact@beforelisted.com
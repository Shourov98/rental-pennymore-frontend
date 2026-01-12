# BeforeListed - Pre-Market Rental Platform

<div align="center">
  <img src="public/Logo_2.svg" alt="BeforeListed Logo" width="200"/>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-13+-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
</div>

## Overview

BeforeListed is an innovative Pre-Market Rental Platform designed to revolutionize the property rental market. The platform serves as an exclusive marketplace where property owners and agents can list properties before they become available on traditional rental channels, while qualified renters gain early access to premium rental opportunities.

### Key Benefits

- **For Property Owners/Agents**:

  - Showcase properties to pre-qualified renters before public listing
  - Gauge market interest and optimize pricing strategies
  - Reduce vacancy periods through early tenant engagement

- **For Renters**:
  - Access to exclusive, pre-market rental opportunities
  - Early visibility into upcoming properties
  - Streamlined application and screening process

## 🚀 Features

- **Pre-Market Listings**: List and discover properties before they're available on traditional rental platforms
- **Agent Dashboard**: Comprehensive tools for property management, tenant screening, and communication
- **Renter Portal**: Intuitive interface for property search, virtual tours, and application submission
- **Advanced Matching**: Smart algorithms to connect renters with their ideal properties
- **Secure Authentication**: Robust user authentication and authorization system
- **Interactive Maps**: Integrated OpenStreetMap for property location visualization
- **Responsive Design**: Fully responsive UI that works across all devices

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.0+
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom theming
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with Redux Persist
- **UI Components**: Custom components built with [Radix UI](https://www.radix-ui.com/) primitives
- **Maps**: [React Leaflet](https://react-leaflet.js.org/) with [OpenStreetMap](https://www.openstreetmap.org/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/) for accessible drag-and-drop interfaces
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Icons**: [Lucide React](https://lucide.dev/) for consistent iconography

### Backend Architecture

- **API Layer**: Next.js API Routes for serverless functions
- **Authentication**: JWT-based authentication with secure HTTP-only cookies
- **Database**: (Implementation in progress)
- **Payment Processing**: Secure payment integration with Stripe
- **File Storage**: Cloud-based storage solution for media assets
- **Caching**: Optimized data fetching with SWR for improved performance

## 📁 Project Structure

```
frontend/
├── app/                          # App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── set-new-password/
│   ├── agent/                    # Agent-specific routes
│   │   ├── dashboard/
│   │   ├── matches/
│   │   └── profile/
│   ├── renter/                   # Renter-specific routes
│   └── (site)/                   # Public site routes
├── components/                   # Reusable components
│   ├── agent/                    # Agent-specific components
│   ├── modals/                   # Modal dialogs
│   ├── navbar/                   # Navigation components
│   ├── renter/                   # Renter-specific components
│   └── sidebar/                  # Sidebar components
├── data/                         # Static data and configurations
├── public/                       # Static assets
│   └── icons/                    # Application icons
├── store/                        # Redux store configuration
│   └── slices/                   # Redux slices
└── styles/                       # Global styles
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.0.0 or later
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) package manager
- [Stripe](https://stripe.com/) API keys (for payment processing)
- Mapbox access token (for enhanced OpenStreetMap features, optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/beforelisted.git
   cd beforelisted/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=your_api_url

   # Authentication
   NEXTAUTH_SECRET=generate_secure_random_string
   NEXTAUTH_URL=http://localhost:3000

   # Payment Processing
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key

   # Optional: Mapbox (for enhanced OpenStreetMap features)
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Follow the [Next.js best practices](https://nextjs.org/docs/best-practices)

## 🤝 Contributing

We welcome contributions from the community. To contribute to BeforeListed, please follow these guidelines:

1. **Fork** the repository and create your feature branch from `main`
2. **Commit** your changes with clear, descriptive commit messages
3. **Test** your changes thoroughly
4. **Lint** your code before submitting a pull request
5. **Document** any new features or significant changes
6. Submit a **Pull Request** with a clear description of your changes

Please ensure your code follows our coding standards and includes appropriate test coverage.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For inquiries, support, or partnership opportunities, please contact:

- **Email**: [contact@beforelisted.com](mailto:contact@beforelisted.com)
- **Website**: [https://beforelisted.com](https://beforelisted.com)
- **GitHub**: [@shourov98](https://github.com/shourov98)

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/shourov98" target="_blank">Mahbubul Hoque Shourov</a>
  <br>
  © 2024 BeforeListed. All rights reserved.
</div>

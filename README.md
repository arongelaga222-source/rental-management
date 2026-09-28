# Rental Management and Inventory Monitoring System

A web-based application for managing rental inventory, customers, transactions, and more.

## Features

- Customer management
- Inventory management (tables, chairs, canopies, etc.)
- Rental creation and tracking
- Payment processing
- Return management
- Availability checking to prevent overbooking
- Dashboard with key metrics
- Authentication and role-based access control (Admin/Staff)

## Technology Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Prisma ORM](https://www.prisma.io) with SQLite (development) / PostgreSQL (production)
- [Heroicons](https://heroicons.com) for icons

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm (or yarn/pnpm)
- SQLite (for development) or PostgreSQL (for production)

### Installation

1. Clone the repository (or copy the files)
2. Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL="file:./dev.db"
```

For production, change the URL to your PostgreSQL connection string, e.g.:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### Database Setup

1. Generate the Prisma client:

```bash
npx prisma generate
```

2. Run migrations to create the database tables:

```bash
npx prisma migrate dev --name init
```

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js pages and layout
- `components/` - Reusable React components (Sidebar, Topbar, etc.)
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Future Enhancements

- User authentication (login/logout, role-based access)
- Detailed customer and rental pages
- Inventory monitoring and alerts
- Payment processing integration
- Reports and export functionality
- Audit trail

## License

MIT
# CRM Enquiry Management System

A responsive CRM system for managing enquiries, built with Next.js, Tailwind CSS, and Supabase.

## Features

- Responsive design for mobile and desktop
- Two-user system (Amit and Prateek)
- Enquiry management with the following fields:
  - Date
  - Segment (Agri, Corporate, Others)
  - Customer Name (with auto-fetch)
  - Number
  - Location
  - Details of Requirement
  - Status (Lead, Enquiry, Quote, Won, Loss) with color coding
  - Remarks
  - Auto Reminder date

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd crmtracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Get your Supabase URL and anon key from the project settings
3. Create the database schema using the SQL in `supabase/schema.sql`
4. Update the `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app`: Next.js app router pages
- `src/components`: React components
- `src/lib`: Utility functions and API calls
- `src/types`: TypeScript type definitions
- `supabase`: Supabase configuration and schema

## Future Enhancements

- User authentication
- Advanced filtering and searching
- Reporting and analytics
- Email notifications for reminders
# GDCCRMAPP

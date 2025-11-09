# Campus Connect

A modern web application for connecting students on campus, built with React, TypeScript, Vite, and Supabase.

## Features

- **Dashboard**: Overview of projects, events, skills, and network
- **Projects**: Create and discover collaborative projects
- **Events**: Browse and add hackathons, workshops, and competitions
- **Profile**: Manage your profile, skills, and interests

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (Authentication, Database, Realtime)
- **Styling**: Tailwind CSS
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd campCon
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Importing Dummy Data

To import sample data for testing:

1. **Users**: Must be created through the app first (due to auth constraints)
   - See [IMPORT_DUMMY_DATA.md](./IMPORT_DUMMY_DATA.md) for detailed instructions
   - Or use the script: `node scripts/create-dummy-users.js` (requires Admin API key)

2. **Other Tables**: Can be imported via CSV in Supabase Dashboard
   - CSV files are in the `dummy_data/` folder
   - Update foreign keys to match your actual user IDs

See [IMPORT_DUMMY_DATA.md](./IMPORT_DUMMY_DATA.md) for complete instructions.

## Database Schema

The application uses the following Supabase tables:

- `users`: Public user profiles
- `projects`: Project listings
- `project_members`: User-project relationships
- `project_private_data`: Secure project data (e.g., repo links)
- `project_comments`: Comments on projects
- `project_join_requests`: Join requests for projects
- `events`: Campus events
- `event_attendees`: User-event relationships
- `event_comments`: Comments on events
- `feed_items`: Activity feed items

## Color Scheme

The application uses a modern color palette:
- **Black**: Primary text and backgrounds
- **White**: Content backgrounds
- **Silver**: Borders and secondary text
- **Navy Blue**: Accents, buttons, and active states

## Building for Production

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

## Deployment to Vercel

This project is configured for easy deployment on Vercel. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

The `vercel.json` file is already configured with the correct settings for Vite.

## Project Structure

```
src/
├── components/       # Reusable components (Sidebar, etc.)
├── contexts/         # React contexts (AuthContext)
├── lib/             # Utilities (Supabase client)
├── pages/           # Page components (Dashboard, Projects, Events, Profile)
├── App.tsx          # Main app component with routing
└── main.tsx          # Entry point
```

## Authentication

Authentication is handled through Supabase Auth. The `AuthContext` provides:
- `signUp()`: Creates a new user account and profile
- `signIn()`: Signs in an existing user
- `signOut()`: Signs out the current user
- `user`: Current user object
- `session`: Current session object

## License

MIT


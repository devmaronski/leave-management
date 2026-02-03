# Leave Management System - Frontend

React + TypeScript frontend for the Employee Leave Management System.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix + Tailwind)
- **Routing**: React Router 7
- **State Management**: React Query (server state) + Context API (auth state)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Component Docs**: Storybook 8

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:3000`

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env to set VITE_API_BASE_URL if backend runs on different port
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`

4. **Run Storybook** (component documentation)
   ```bash
   npm run storybook
   ```
   Storybook runs at `http://localhost:6006`

## Project Structure

```
src/
├── api/                 # Axios client and API endpoint functions
├── components/
│   ├── ui/             # shadcn/ui base components
│   ├── layout/         # Layout components (Navbar, Sidebar, etc.)
│   ├── common/         # Shared feature components
│   └── leave/          # Leave management components
├── contexts/           # React Context providers (auth)
├── hooks/              # Custom React hooks
├── pages/              # Route page components
├── routes/             # Route guards and protection
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Development Workflow

### Bootstrap Phase (Current - COMPLETE)
- ✅ Vite + React + TypeScript setup
- ✅ Tailwind CSS + shadcn/ui components
- ✅ React Router with protected route architecture
- ✅ TanStack Query provider
- ✅ Axios client with interceptor stubs
- ✅ AuthContext shell
- ✅ Storybook with baseline component stories
- ✅ Folder structure and path aliases

### Next Steps (Phases B-F)
- **Phase B**: Auth implementation (login, token management, useAuth hook)
- **Phase C**: Employee leave workflow (forms, tables, API integration)
- **Phase D**: HR/Admin workflow (approval/rejection)
- **Phase E**: Optional admin users UI
- **Phase F**: Polish + documentation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook static site

## Architecture Decisions

### Why React Query?
- Industry standard for server state management
- Built-in caching, refetching, and error handling
- Reduces boilerplate for API calls

### Why shadcn/ui?
- Copy-paste components (no package dependency lock-in)
- Built on Radix UI (accessible primitives)
- Tailwind-based (consistent with project styling)
- Easy customization

### Why Context API for Auth?
- Simple, lightweight state management for auth
- No need for heavy state library (Zustand/Redux) for single concern
- React Query handles all server state

### Token Storage Strategy
- **Current**: Placeholder (no implementation yet)
- **Planned**: localStorage (exam-friendly, acceptable tradeoff)
- **Production**: httpOnly cookies + refresh token rotation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

## Contributing

1. Create feature branch from `main`
2. Make small, logical commits
3. Run linting before commit: `npm run lint`
4. Document new components in Storybook
5. Update this README if adding new setup steps

## Intentionally Deferred

The following are NOT implemented in bootstrap phase:
- Business logic and API calls
- Authentication flow and token management
- Form validation implementations
- Feature pages (leave management, users)
- Layout components (navbar, sidebar)
- Error boundaries and loading states
- Integration with backend API

These will be implemented in subsequent phases per the project plan.

      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

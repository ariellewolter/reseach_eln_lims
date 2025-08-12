# Development Guide

## Prerequisites
- Node.js 18+ 
- pnpm 8+
- PostgreSQL 14+
- Git

## Project Structure
```
lets_do_it_again/
├── apps/                    # Frontend applications
│   ├── personal/           # Personal research notebook
│   └── lims/              # Laboratory Information Management System
├── packages/               # Shared packages
│   ├── ui/                # React components and layouts
│   ├── types/             # TypeScript type definitions
│   ├── theme/             # CSS styling and design system
│   └── utils/             # Utility functions
├── servers/                # Backend APIs
│   ├── personal-api/      # Personal app API
│   └── lims-api/          # LIMS API
└── docs/                  # Documentation
```

## Getting Started

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd lets_do_it_again
pnpm install
```

### 2. Database Setup
```bash
# Start PostgreSQL (adjust for your system)
brew services start postgresql

# Create databases
createdb research_notebook_personal
createdb research_notebook_lims

# Run migrations
cd servers/personal-api
pnpm prisma migrate dev

cd ../lims-api
pnpm prisma migrate dev
```

### 3. Environment Configuration
Create environment files for each service:

**Personal API** (`servers/personal-api/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/research_notebook_personal"
PORT=3001
```

**LIMS API** (`servers/lims-api/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/research_notebook_lims"
PORT=3002
```

**Personal App** (`apps/personal/.env.local`):
```env
VITE_API_URL="http://localhost:3001"
```

**LIMS App** (`apps/lims/.env.local`):
```env
VITE_API_URL="http://localhost:3002"
```

### 4. Start Development Servers
```bash
# Start all services in parallel
pnpm dev

# Or start individually:
pnpm run api:personal    # Personal API on port 3001
pnpm run api:lims        # LIMS API on port 3002
pnpm run web:personal    # Personal app on port 5173
pnpm run web:lims        # LIMS app on port 5174
```

## Development Workflow

### Frontend Development
- **Personal App**: `http://localhost:5173`
- **LIMS App**: `http://localhost:5174`
- Both apps use Vite with hot module replacement
- Shared components in `packages/ui`
- Type definitions in `packages/types`

### Backend Development
- **Personal API**: `http://localhost:3001`
- **LIMS API**: `http://localhost:3002`
- Prisma for database management
- RESTful API endpoints
- TypeScript with strict mode

### Database Development
```bash
# Generate Prisma client
cd servers/personal-api
pnpm prisma generate

# View database in Prisma Studio
pnpm prisma studio

# Create new migration
pnpm prisma migrate dev --name add_new_feature
```

## Code Quality

### TypeScript
- Strict mode enabled
- Shared types in `packages/types`
- Proper type exports from all packages

### Linting and Formatting
```bash
# Check types
pnpm run type-check

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Testing
```bash
# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage
```

## Package Management

### Adding Dependencies
```bash
# Add to specific app/package
pnpm add package-name --filter @apps/personal

# Add to all packages
pnpm add package-name -w

# Add dev dependency
pnpm add -D package-name --filter @apps/personal
```

### Workspace Commands
```bash
# Run command in all packages
pnpm run -r build

# Run command in specific package
pnpm run build --filter @apps/personal
```

## Building for Production

### Frontend Builds
```bash
# Build personal app
cd apps/personal
pnpm run build

# Build LIMS app
cd apps/lims
pnpm run build
```

### Backend Builds
```bash
# Build personal API
cd servers/personal-api
pnpm run build

# Build LIMS API
cd servers/lims-api
pnpm run build
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Check if another service is running on the port
   - Kill the process or change the port in config

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure databases exist

3. **Type Errors**
   - Run `pnpm run type-check` to see all errors
   - Check that shared types are properly exported
   - Verify TypeScript configuration

4. **Build Failures**
   - Clear node_modules: `pnpm clean`
   - Reinstall: `pnpm install`
   - Check for circular dependencies

### Debug Mode
```bash
# Enable debug logging
DEBUG=* pnpm dev

# Check specific service logs
pnpm run api:personal --inspect
```

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Use meaningful commit messages

### Git Workflow
1. Create feature branch from main
2. Make changes with proper commits
3. Run tests and type checks
4. Submit pull request
5. Code review and merge

### Documentation
- Update relevant docs when adding features
- Include examples in API documentation
- Document breaking changes clearly

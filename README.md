# Research Notebook - All-in-One Lab Management System

A comprehensive research notebook application that combines personal note-taking with laboratory information management (LIMS) capabilities.

## 🚀 Features

### Personal Research Notebook
- **Daily Notes**: Track experiments, observations, and insights
- **Protocols**: Store and organize lab procedures
- **Project Management**: Organize research projects and milestones
- **Chemical Inventory**: Track chemicals, CAS numbers, vendors, and quantities
- **Task Management**: Manage to-dos, ongoing work, and completed tasks

### LIMS (Laboratory Information Management System)
- **Lab Management**: Organize multiple laboratories and users
- **User Roles**: Support for students, technicians, PIs, and administrators
- **Equipment Tracking**: Monitor equipment status and maintenance schedules
- **Safety Compliance**: Track hazardous chemicals and safety protocols
- **Collaborative Features**: Share notes and data across lab members

### Core Features
- **Obsidian-style Cross-linking**: Link between notes, projects, and data
- **Notion-style Databases**: Flexible table and document management
- **PDF Integration**: Full-page PDF viewing with highlight linking
- **Modern UI**: Clean, responsive interface with dark theme
- **Real-time Sync**: Instant updates across all connected devices

## 🏗️ Architecture

```
lets_do_it_again/
├── apps/                    # Frontend applications
│   ├── personal/           # Personal research notebook (Port 5173)
│   └── lims/              # LIMS application (Port 5174)
├── packages/               # Shared packages
│   ├── ui/                # React components and layouts
│   ├── types/             # TypeScript type definitions
│   ├── theme/             # CSS styling and design system
│   └── utils/             # Utility functions
├── servers/                # Backend APIs
│   ├── personal-api/      # Personal app API (Port 3001)
│   └── lims-api/          # LIMS API (Port 3002)
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd lets_do_it_again

# Install dependencies
pnpm install

# Set up databases
createdb research_notebook_personal
createdb research_notebook_lims

# Run migrations
cd servers/personal-api && pnpm prisma migrate dev
cd ../lims-api && pnpm prisma migrate dev

# Start all services
pnpm dev
```

### Access Applications
- **Personal Notebook**: http://localhost:5173
- **LIMS**: http://localhost:5174
- **Personal API**: http://localhost:3001
- **LIMS API**: http://localhost:3002

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Development Guide](docs/DEVELOPMENT.md) - Setup and development workflow
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

## 🛠️ Development

### Available Scripts
```bash
# Development
pnpm dev                    # Start all services
pnpm run api:personal      # Start personal API only
pnpm run api:lims          # Start LIMS API only
pnpm run web:personal      # Start personal app only
pnpm run web:lims          # Start LIMS app only

# Building
pnpm run build             # Build all packages
pnpm run type-check        # TypeScript type checking
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, Prisma
- **Database**: PostgreSQL
- **Styling**: CSS Custom Properties, Dark Theme
- **Package Manager**: pnpm Workspaces

## 🔧 Configuration

### Environment Variables
Create `.env` files in each service directory:

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

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Basic note-taking and table management
- [x] Project and chemical tracking
- [x] Task management system
- [x] User and lab management (LIMS)
- [x] Responsive UI with dark theme

### Phase 2: Advanced Features 🚧
- [ ] PDF upload and annotation
- [ ] Cross-linking between documents
- [ ] Search and filtering
- [ ] Export functionality
- [ ] Real-time collaboration

### Phase 3: Enterprise Features 📋
- [ ] Advanced permissions and roles
- [ ] Audit logging
- [ ] Data backup and recovery
- [ ] API rate limiting
- [ ] Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the API documentation for technical details

---

**Built with ❤️ for the research community**

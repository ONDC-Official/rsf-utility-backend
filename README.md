# RSF Utility Backend

> **📚 Complete Documentation**: See the [main repository documentation](../docs/) for comprehensive guides.  
> **🏠 Main Repository**: [RSF Utility](../README.md) - Complete system overview and quick start

## Quick Overview

This is the backend service for RSF Utility - a Node.js/Express REST API server that handles ONDC network settlement and reconciliation operations.

**Technology Stack**: Node.js 18+ • Express.js • TypeScript • MongoDB • JWT Authentication

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Run tests
npm test
```

**Development Server**: http://localhost:3000  
**API Documentation**: http://localhost:3000/api-docs

---

## 📖 Documentation

| Topic | Link |
|-------|------|
| **System Architecture** | [../docs/01-architecture.md](../docs/01-architecture.md) |
| **API Documentation** | [../docs/04-apis.md](../docs/04-apis.md) |
| **Database Integration** | [../docs/05-data-models.md](../docs/05-data-models.md) |
| **Deployment Guide** | [../docs/06-deployment.md](../docs/06-deployment.md) |
| **Operations & Monitoring** | [../docs/07-operations-observability.md](../docs/07-operations-observability.md) |
| **Security Implementation** | [../docs/08-security.md](../docs/08-security.md) |
| **Troubleshooting** | [../docs/09-troubleshooting.md](../docs/09-troubleshooting.md) |
| **Contributing Guidelines** | [../docs/10-contributing.md](../docs/10-contributing.md) |

---

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start           # Start production server
npm test            # Run unit tests
npm run test:cov    # Run tests with coverage
npm run test:watch  # Run tests in watch mode
npm run lint        # Check code quality
```

### Environment Variables
See [Deployment Guide](../docs/06-deployment.md#environment-configuration) for complete environment configuration.

### Project Structure
```
src/
├── config/         # Configuration files
├── controller/     # Request handlers
├── db/            # Database models and configuration
├── middlewares/   # Express middlewares
├── repositories/  # Data access layer
├── routes/        # API routes
├── schema/        # Validation schemas
├── services/      # Business logic
├── test/          # Test suites
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── index.ts       # Application entry point
```

---

## 🏛️ Architecture

**Service Architecture**: Controller → Service → Repository → Database  
**Authentication**: JWT-based with client-ID validation  
**Database**: MongoDB with Mongoose ODM  
**Monitoring**: Prometheus metrics + Winston logging  

For detailed architecture information, see [System Architecture](../docs/01-architecture.md).

---

## 📡 API Endpoints

### External ONDC APIs (`/api/*`)
- `POST /api/on_confirm` - Order confirmation handling
- `POST /api/on_status` - Order status updates  
- `POST /api/on_update` - Order updates
- `POST /api/on_cancel` - Order cancellations
- `POST /api/settle` - Settlement requests
- `POST /api/on_settle` - Settlement callbacks
- `POST /api/recon` - Reconciliation requests
- `POST /api/on_recon` - Reconciliation responses

### Internal UI APIs (`/ui/*`)
- `POST /ui/auth/sign-token` - JWT authentication
- `GET /ui/orders/{userId}` - Order management
- `POST /ui/generate/{userId}/settlement` - Settlement generation
- `POST /ui/generate/{userId}/recon` - Reconciliation generation

For complete API documentation, see [API Documentation](../docs/04-apis.md).

---

## 🔗 Related Services

- **Frontend Repository**: [rsf-utility-frontend](https://github.com/ONDC-Official/rsf-utility-frontend)
- **Parent Repository**: [rsf-utility](https://github.com/ONDC-Official/rsf-utility)

---

## 📋 Key Features

- ✅ ONDC protocol compliance with schema validation
- ✅ Multi-party settlement calculation and processing
- ✅ Cross-participant reconciliation workflows
- ✅ JWT-based authentication and authorization
- ✅ Comprehensive audit logging and monitoring
- ✅ Health monitoring with Prometheus metrics
- ✅ Docker containerization support
- ✅ Comprehensive test suite with 80%+ coverage

---

## 🆘 Need Help?

- **Troubleshooting**: [../docs/09-troubleshooting.md](../docs/09-troubleshooting.md)
- **Contributing**: [../docs/10-contributing.md](../docs/10-contributing.md)
- **Issues**: Create issues in the [main repository](https://github.com/ONDC-Official/rsf-utility/issues)

---

*This repository is part of the RSF Utility microservice architecture. For complete project documentation, system overview, and setup instructions, please refer to the [main repository README](../README.md).*
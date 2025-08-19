# RSF Utility Backend - Understanding Document

**📖 Complete System Documentation:** See [../docs/](../docs/) for comprehensive system documentation including architecture, APIs, deployment, and operations.

**🏠 System Overview:** See [../UNDERSTANDING.md](../UNDERSTANDING.md) for complete system architecture and integration patterns.

This document provides **backend-specific technical implementation details**. For overall system understanding, workflows, and integration patterns, refer to the main repository documentation.

## Service Overview
**Repository:** `https://github.com/ONDC-Official/rsf-utility-backend`  
**Purpose:** RESTful API server for ONDC reconciliation and settlement operations  
**Technology:** Node.js + Express + TypeScript + MongoDB  
**Port:** 3000 (configurable via PORT environment variable)

## Entry Points

### Primary Entry Point
- **File:** `src/index.ts`
- **Function:** Application bootstrap and server startup
- **Process:**
  1. Environment validation via `validateEnv()`
  2. Server creation via `createServer()`
  3. MongoDB connection establishment
  4. HTTP server startup with graceful shutdown handlers

### Server Factory
- **File:** `src/server.ts`
- **Function:** Express application configuration and middleware setup
- **Returns:** Configured Express application instance

## Architecture & Components

### Dependency Injection Container
- **Location:** `src/di/container.ts`
- **Purpose:** Centralized service instantiation and dependency management
- **Pattern:** Constructor injection with manual wiring
- **Key Services:**
  - Repository layer instances
  - Service layer instances  
  - Controller instances
  - Cross-cutting concerns (logging, validation)

### Layer Architecture

#### 1. Controller Layer (`src/controller/`)
**Purpose:** HTTP request handling, input validation, response formatting
- `auth-controller.ts` - JWT token generation and validation
- `order-controller.ts` - Order management endpoints
- `settle-controller.ts` - Settlement processing endpoints
- `recon-controller.ts` - Reconciliation workflow endpoints
- `user-controller.ts` - Network participant configuration
- `generate-controller.ts` - Settlement/reconciliation generation
- `trigger-controller.ts` - Workflow automation triggers
- `payload-controller.ts` - ONDC payload processing
- `validation-controller.ts` - Schema validation middleware

#### 2. Service Layer (`src/services/`)
**Purpose:** Business logic implementation and orchestration
- `order-service.ts` - Order lifecycle management
- `settle-service.ts` - Settlement calculation and processing
- `recon-service.ts` - Reconciliation data management
- `user-service.ts` - User configuration and validation
- `auth-service.ts` - Authentication and authorization
- `rsf-orchestrator-service.ts` - Cross-service workflow coordination
- `tax-engine.ts` - Tax calculation engine
- `transaction-service.ts` - Financial transaction management

#### 3. Repository Layer (`src/repositories/`)
**Purpose:** Data access abstraction and MongoDB operations
- `order-repository.ts` - Order data persistence
- `settle-repository.ts` - Settlement data operations
- `recon-repository.ts` - Reconciliation data management
- `user-repository.ts` - User configuration storage
- `rsf-payload-repository.ts` - ONDC payload storage
- `transaction-repository.ts` - Transaction data persistence

#### 4. Database Layer (`src/db/`)
**Purpose:** Database connection and configuration management
- `index.ts` - MongoDB connection factory
- `config.ts` - Database configuration
- `models/` - Mongoose schema definitions

## Key Workflows

### 1. Startup Workflow
```typescript
// src/index.ts
1. validateEnv(process.env) - Environment validation
2. createServer() - Express app configuration
3. connectDB() - MongoDB connection
4. server.listen() - HTTP server startup
5. Graceful shutdown handlers registration
```

**Critical Environment Variables:**
- `NODE_ENV` - Application environment
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Authentication secret
- `CLIENT_ID` - ONDC client identifier

### 2. Request Handling Workflow
```typescript
// src/server.ts middleware stack
1. correlationIdMiddleware - Request tracking
2. cors() - Cross-origin resource sharing
3. express.json() - JSON body parsing (3MB limit)
4. requestLog - Incoming request logging
5. responseLog - Outgoing response logging
6. Route handlers (/api/* and /ui/*)
7. Global error handling middleware
```

**Route Structure:**
- `/api/*` - External ONDC network payload processing
- `/ui/*` - Internal UI operations and data management
- `/health` - Health check endpoint
- `/api-docs` - Swagger documentation

### 3. Data Processing Workflows

#### Order Management Flow
1. **Order Ingestion**
   - ONDC payload validation via Zod schemas
   - Order state transition tracking
   - Fulfillment status management
   - Due date calculation and tracking

2. **Settlement Preparation**
   - Multi-participant settlement calculation
   - Tax computation (TCS/TDS)
   - Payment reconciliation
   - Settlement file generation

3. **Reconciliation Process**
   - Cross-participant data comparison
   - Discrepancy identification
   - Recon request generation
   - Settlement finalization

#### File Processing
- **CSV Upload:** Bulk order/settlement data import
- **JSON Processing:** Configuration and payload handling
- **Schema Validation:** AJV and Zod-based validation
- **Error Handling:** Detailed validation error reporting

### 4. Shutdown Workflow
```typescript
// src/index.ts shutdown handlers
1. SIGTERM/SIGINT signal handling
2. HTTP server graceful shutdown
3. MongoDB connection closure
4. Process exit with appropriate code
```

## External Integrations

### Database Integration
- **MongoDB:** Primary data store for all business entities
- **Connection:** Mongoose ODM with connection pooling
- **Health Monitoring:** Automatic connection health checks
- **Schemas:** Strict typing with Mongoose schemas

### ONDC Network Integration
- **Settlement Agency API:** External settlement processing
- **Network Participant APIs:** Cross-participant communication
- **Payload Validation:** ONDC specification compliance
- **Webhook Endpoints:** Real-time network event processing

### Observability Stack
- **Prometheus:** Metrics collection and exposure
- **Grafana Loki:** Centralized logging (production)
- **Winston Logger:** Structured logging with correlation IDs
- **Health Monitoring:** Database and service health checks

### Authentication & Security
- **JWT Authentication:** Client-ID based token system
- **Rate Limiting:** API endpoint protection
- **CORS Configuration:** Cross-origin request handling
- **Input Validation:** Multi-layer validation (AJV, Zod)

## Configuration Management

### Environment Configuration
```typescript
// Key configuration files
- src/config/server-config.ts - Server settings
- src/config/auth-config.ts - Authentication settings
- src/config/registry-config.ts - ONDC registry settings
- src/db/config.ts - Database configuration
```

### Validation & Schemas
- **Runtime Validation:** `src/utils/validate-env.ts`
- **Request Schemas:** `src/schema/` directory with Zod definitions
- **API Documentation:** Auto-generated OpenAPI specs

## Testing Architecture

### Test Structure
- **Unit Tests:** Service and utility function testing
- **Integration Tests:** API endpoint and database testing
- **E2E Tests:** Multi-instance Docker testing
- **Performance Tests:** Load and stress testing
- **Security Tests:** Authentication and authorization testing

### Test Configuration
- **Jest:** Test runner with TypeScript support
- **Supertest:** HTTP endpoint testing
- **MongoDB Memory Server:** In-memory database for testing
- **Docker Compose:** Multi-instance testing environment

## Development Conventions

### Code Organization
- **Strict TypeScript:** Full type safety with strict mode
- **Dependency Injection:** Manual DI container pattern
- **Error Handling:** Standardized error response format
- **Logging:** Structured logging with metadata context

### API Design
- **RESTful Endpoints:** Resource-based URL structure
- **Consistent Responses:** Standardized success/error format
- **OpenAPI Documentation:** Auto-generated API specifications
- **Versioning:** Route-based API versioning support

### Database Patterns
- **Repository Pattern:** Data access abstraction
- **Transaction Management:** MongoDB transaction support
- **Schema Evolution:** Mongoose schema versioning
- **Connection Pooling:** Optimized database connections

## Production Considerations

### Deployment
- **Docker:** Containerized deployment with multi-stage builds
- **Environment Variables:** 12-factor app configuration
- **Health Checks:** Kubernetes-ready health endpoints
- **Graceful Shutdown:** Signal handling for zero-downtime deployments

### Monitoring & Observability
- **Metrics:** Business and technical metrics via Prometheus
- **Logging:** Structured JSON logs with correlation tracking
- **Alerting:** Health check and error rate monitoring
- **Tracing:** Request correlation across service boundaries

### Security
- **Authentication:** JWT-based client authentication
- **Authorization:** Role-based access control
- **Input Validation:** Multi-layer security validation
- **Rate Limiting:** DDoS and abuse protection

---
This document should be updated whenever significant changes are made to the backend architecture, workflows, or integrations.

**📔 Documentation Sync**: Changes to this document should be reflected in the [main repository UNDERSTANDING.md](../UNDERSTANDING.md) to maintain system-wide consistency.

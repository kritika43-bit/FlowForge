# FlowForge Backend API

A comprehensive RESTful API for manufacturing management built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **Manufacturing Orders Management** - Create, track, and manage production orders
- **Work Orders System** - Kanban-style work order tracking with status updates
- **Work Centers Management** - Equipment and resource utilization tracking
- **Inventory Management** - Stock tracking with movements and alerts
- **Bill of Materials (BOM)** - Component relationships and cost calculations
- **Comprehensive Reporting** - Production analytics, efficiency metrics, and cost analysis
- **Role-Based Authentication** - JWT-based auth with admin, manager, operator, and inventory roles
- **Real-time Activity Logging** - Complete audit trail of all system activities

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Development**: Nodemon

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies
```bash
cd FlowForge/backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/flowforge_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Optional: Database Connection Pool
DATABASE_CONNECTION_LIMIT=10
```

### 3. Database Setup

#### Option A: Quick Setup (Development)
```bash
# Generate Prisma client and create database schema
npm run setup:dev
```

#### Option B: Manual Setup
```bash
# Generate Prisma client
npm run db:generate

# Create and apply database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

#### Manufacturing Orders (`/api/manufacturing-orders`)
- `GET /` - List orders with filtering
- `GET /:id` - Get order details
- `POST /` - Create new order
- `PUT /:id` - Update order
- `DELETE /:id` - Cancel order
- `GET /stats` - Order statistics

#### Work Orders (`/api/work-orders`)
- `GET /` - List work orders
- `GET /kanban` - Kanban view data
- `GET /:id` - Get work order details
- `POST /` - Create work order
- `PUT /:id` - Update work order status
- `DELETE /:id` - Cancel work order
- `GET /stats` - Work order statistics

#### Work Centers (`/api/work-centers`)
- `GET /` - List work centers
- `GET /:id` - Get work center details
- `POST /` - Create work center
- `PUT /:id` - Update work center
- `DELETE /:id` - Delete work center
- `GET /stats` - Work center statistics

#### Stock Management (`/api/stock`)
- `GET /` - List stock items
- `GET /:id` - Get stock item details
- `POST /` - Create stock item
- `PUT /:id` - Update stock item
- `DELETE /:id` - Delete stock item
- `GET /movements` - Stock movements
- `POST /movements` - Create stock movement
- `GET /stats` - Stock statistics

#### Bill of Materials (`/api/bom`)
- `GET /` - List BOMs
- `GET /:id` - Get BOM details
- `POST /` - Create BOM
- `PUT /:id` - Update BOM
- `DELETE /:id` - Delete BOM
- `POST /calculate-requirements` - Calculate material requirements
- `GET /stats` - BOM statistics

#### Reports (`/api/reports`)
- `GET /dashboard` - Dashboard overview
- `GET /production-analytics` - Production analytics
- `GET /efficiency-metrics` - Efficiency metrics
- `GET /cost-analysis` - Cost analysis
- `GET /inventory-analysis` - Inventory analysis
- `POST /custom` - Custom report generation

### API Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All CRUD operations

### Manager
- Manufacturing orders management
- Work orders management
- Work centers management
- Reports access
- BOM management

### Operator
- Work order status updates
- Basic reporting access
- Stock item viewing

### Inventory
- Stock management
- Inventory movements
- Stock reporting

## 🗃️ Database Schema

### Key Entities
- **Users** - System users with role-based access
- **Products** - Items to be manufactured
- **ManufacturingOrders** - Production orders
- **WorkOrders** - Individual work tasks
- **WorkCenters** - Manufacturing equipment/stations
- **StockItems** - Inventory items
- **StockMovements** - Inventory transactions
- **BillOfMaterials** - Product component recipes
- **BOMItems** - Individual BOM components
- **UserActivity** - System activity audit log

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (destructive)

### Database Management
```bash
# View database in browser
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database (careful!)
npm run db:reset
```

### Sample Data
The seed script creates:
- Admin user (admin@flowforge.com / admin123)
- Sample products and BOMs
- Work centers
- Stock items
- Manufacturing orders

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/flowforge_prod"
JWT_SECRET="your-production-secret-key"
PORT=5000
FRONTEND_URL="https://your-frontend-domain.com"
```

### Database Migration for Production
```bash
npm run db:migrate:prod
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs encryption
- **Input Validation** - express-validator
- **SQL Injection Protection** - Prisma ORM

## 📝 API Testing

### Using curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flowforge.com","password":"admin123"}'

# Get manufacturing orders (with token)
curl -X GET http://localhost:5000/api/manufacturing-orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Postman Collection
Import the API endpoints into Postman for comprehensive testing.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **JWT Token Error**
   - Check JWT_SECRET is set
   - Verify token format
   - Check token expiration

3. **Permission Denied**
   - Verify user role
   - Check endpoint permissions
   - Ensure proper authentication

### Logs
Application logs are output to console in development mode. Use a logging service like Winston for production.

---

**FlowForge Backend API** - Powering efficient manufacturing management 🏭

# Product Requirements Document (PRD)

**Project Name:** Offline-First LAN-Based Point of Sale (POS) System  
**Version:** v2.0  
**Author:** POS Engineering Team  
**Date:** January 2026

---

## 1. Purpose & Vision

### Purpose
Define the functional, technical, and business requirements for an offline-first, LAN-based Point of Sale (POS) system designed for small to medium retail businesses.

### Vision Statement
To provide a reliable, fast, and secure multi-tenant POS system that works without internet connectivity, supports multiple terminals over a local network, and is monetized through a sustainable subscription model.

---

## 2. Problem Statement

Many retail businesses operate in environments with:
- Unreliable or expensive internet
- Limited technical expertise
- High costs of cloud-only POS systems

Existing solutions either:
- Depend entirely on the cloud
- Are expensive and inflexible
- Fail during internet outages
- Lack proper multi-tenant isolation

---

## 3. Goals & Objectives

### Business Goals
- Provide a dependable offline POS solution
- Generate recurring revenue via subscriptions
- Enable scalable multi-branch deployments
- Ensure complete tenant data isolation

### Product Goals
- Zero downtime during internet outages
- Fast transaction processing (<200ms locally)
- Easy LAN-based multi-terminal setup
- Secure local data storage with tenant isolation
- Branch-specific management dashboards

### Non-Goals
- No requirement for always-on internet
- No cloud-hosted transactional database
- No consumer e-commerce features (v1)

---

## 4. Target Users

### Primary Users
- **Cashiers** - Process sales transactions
- **Branch Managers** - Manage single branch operations
- **System Administrators** - Manage multi-branch operations

### Secondary Users
- **Business owners** - View analytics and reports
- **Support technicians** - System maintenance

---

## 5. Deployment Model

### Architecture Overview

**Local Server (On-Premise)**
- Runs PostgreSQL with Row-Level Security (RLS)
- Runs backend API (Node.js)
- Manages licenses
- Enforces tenant isolation

**Client Terminals**
- Electron desktop apps
- Connected via LAN
- Barcode scanner support

**Optional Cloud Services**
- License verification
- Updates distribution
- Analytics aggregation (future)

---

## 6. System Components

### 6.1 Backend
- Node.js / Express API server
- PostgreSQL database with RLS
- Drizzle ORM
- License validation service
- M-Pesa payment integration

### 6.2 Frontend
- Electron desktop app
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state management
- Barcode scanner integration

### 6.3 Database
- PostgreSQL (local server)
- Drizzle migrations
- Multi-tenant schema with RLS
- Automated backups

---

## 7. Core Functional Requirements

### 7.1 Authentication & Authorization

**User Login**
- JWT-based authentication
- Session management
- Password hashing (bcrypt)

**Role-Based Access Control (RBAC)**
- **System Admin** - Full system access, multi-branch management
- **Branch Manager** - Single branch management, reports, inventory
- **Cashier** - Sales transactions only

**Security**
- Tenant ID embedded in JWT
- Automatic tenant scoping on all queries
- Session timeout and refresh tokens

---

### 7.2 Sales Management

**Transaction Flow**
- Create sales
- Add/remove items with barcode scanning
- Apply discounts (percentage or fixed amount)
- Process payments
- Generate and print receipts

**Payment Types**
- **Cash** - Manual entry
- **M-Pesa** - STK Push and C2B integration
- **Card** - Future integration
- **Bank Transfer** - Future integration

**M-Pesa Integration**
- STK Push payment initiation
- C2B payment acceptance
- Real-time callback handling
- Transaction verification and reconciliation
- Sandbox and production environment support
- Automatic payment status updates
- Failed payment retry logic

---

### 7.3 Inventory Management

**Product Management**
- Product creation with attributes:
  - Name, SKU, category
  - Cost price, selling price
  - Unit (kg, liters, pieces, etc.)
  - Unit size (500ml, 1L, etc.)
  - Product image
  - Multiple barcodes per product
- Bulk product import/export (CSV)
- Product search and filtering

**Stock Management**
- Stock adjustments (manual and automatic)
- Automatic stock deduction on sale
- Real-time stock level updates across terminals
- Low stock alerts and notifications
- Out-of-stock handling during sales
- Inventory history tracking
- Stock valuation reports

**Barcode Support**
- Barcode scanner integration
- Quick product lookup during sales
- Multiple barcodes per product
- Barcode label generation and printing

---

### 7.4 Branch & Terminal Management

**Branch Management**
- Branch creation and configuration
- Branch-specific inventory
- Branch-level reporting
- Branch assignment to managers

**Terminal Management**
- Terminal registration and activation
- LAN discovery or manual configuration
- Terminal-specific settings
- Terminal activity monitoring

---

### 7.5 User Management

**User Operations**
- Create/edit users
- Assign roles and branches
- Activate/deactivate accounts
- Password reset functionality

**User Attributes**
- Name, email, phone
- Role assignment
- Branch assignment (for managers and cashiers)
- Active status

---

### 7.6 Reporting & Analytics

**Sales Reports**
- Daily, weekly, monthly sales summaries
- Sales by payment method
- Sales by cashier
- Sales by product category
- Revenue trends and charts
- Export to CSV/PDF

**Product Analytics**
- Top-selling products
- Product performance by revenue
- Product performance by quantity
- Category revenue breakdown
- Slow-moving inventory

**Inventory Reports**
- Current stock levels
- Low stock items
- Out-of-stock items
- Inventory valuation
- Stock movement history

**Financial Reports**
- Revenue by date range
- Payment method distribution
- Tax summaries
- Profit margins

---

### 7.7 Dashboard & Analytics

**System Admin Dashboard**
- Multi-branch overview
- System-wide sales statistics
- All-branch inventory summary
- Top products across all branches
- Recent transactions from all branches
- Branch performance comparison

**Branch Manager Dashboard**
- Single-branch overview
- Branch-specific sales statistics
- Branch inventory summary
- Top products for the branch
- Recent transactions for the branch
- Branch badge indicator

**Dashboard Components**
- Real-time stats cards (revenue, sales count, inventory value)
- Sales trend charts
- Top products visualization
- Recent sales table
- Low stock alerts
- Payment method breakdown

---

### 7.8 Receipt Management

**Receipt Generation**
- Itemized transaction breakdown
- Subtotal, tax, and total
- Payment method and amount
- Change calculation
- Transaction date and time
- Cashier and branch information
- Business logo and details

**Receipt Delivery**
- Thermal printer support (80mm, 58mm)
- Standard printer support
- Digital receipt (email/SMS) - Future
- Receipt preview before printing

**Receipt Operations**
- Print receipt after sale
- Reprint previous receipts
- Receipt history and search
- Customizable receipt templates

---

## 8. Licensing & Subscription Requirements

### Subscription Model
- Per-branch subscription
- Tiered by number of terminals
- Monthly or annual billing

### License Behavior
- Local license file/token
- Expiry tracking
- Grace period enforcement (7-30 days)
- License validation on startup

### On Expiry
- Read-only mode during grace period
- Sales blocked after grace period
- Reports remain accessible
- License renewal prompts

---

## 9. Multi-Tenancy & Security

### Tenant Isolation

**Database-Level Security**
- PostgreSQL Row-Level Security (RLS) policies
- Automatic tenant filtering on all queries
- Tenant context set per request
- Impossible to bypass tenant isolation

**Application-Level Security**
- Tenant ID in JWT token
- Middleware-level tenant scoping
- Automatic tenant injection in queries
- Audit logging for data access

**Data Segregation**
- Complete data isolation between tenants
- No cross-tenant data access
- Tenant-specific backups
- Tenant deletion with data purging

---

## 10. Offline-First Behavior

### Core Principles
- System must operate fully without internet
- License checks cached locally
- All transactions processed locally
- Sync when internet becomes available

### Sync Strategy
- Queue failed M-Pesa callbacks for retry
- Sync sales data to cloud (future)
- Sync inventory updates across terminals
- Conflict resolution for concurrent edits

---

## 11. Non-Functional Requirements

### Performance
- Sale creation <200ms
- UI response <100ms
- Product search <50ms
- Report generation <2s

### Reliability
- No data loss on power failure
- Transactional integrity (ACID compliance)
- Automatic crash recovery
- Database connection pooling

### Security
- Password hashing (bcrypt)
- Encrypted license tokens
- Local network access controls
- HTTPS for API communication
- SQL injection prevention
- XSS protection

### Scalability
- Support 1-50 terminals per branch
- Support multi-branch enterprises
- Handle 10,000+ products per branch
- Handle 100,000+ transactions per branch

### Usability
- Intuitive POS interface
- Keyboard shortcuts for common actions
- Barcode scanner support
- Touch-friendly UI
- Responsive design

---

## 12. Data Requirements

### Core Entities
- **Tenants** - Top-level organization
- **Branches** - Physical store locations
- **Users** - System users with roles
- **Products** - Items for sale
- **Inventory** - Stock levels per branch
- **Sales** - Transaction records
- **Sale Items** - Line items in sales
- **Payments** - Payment records
- **Licenses** - Subscription licenses
- **Terminals** - POS terminal registrations

### Data Relationships
- Tenant → Branches (1:many)
- Branch → Users (1:many)
- Branch → Inventory (1:many)
- Product → Inventory (1:many)
- Sale → Sale Items (1:many)
- Sale → Payments (1:many)

---

## 13. Installation & Setup

### Initial Setup
- Server installation (Ubuntu/Debian recommended)
- PostgreSQL installation and configuration
- Database migration (Drizzle)
- License activation
- Initial admin user creation

### Client Setup
- Electron app installation
- LAN server configuration
- Barcode scanner setup
- Thermal printer configuration

---

## 14. Update Strategy

### Backend Updates
- Controlled updates via admin panel
- Schema migrations via Drizzle
- Backward-compatible API changes
- Rollback capability

### Frontend Updates
- Electron auto-update mechanism
- Version compatibility checks
- Update notifications
- Staged rollout capability

---

## 15. Testing Strategy

### Unit Testing
- Backend services and repositories
- Frontend components and hooks
- Utility functions

### Integration Testing
- API endpoint testing
- Database operations
- M-Pesa integration (sandbox)
- Tenant isolation verification

### End-to-End Testing
- Complete sales flow
- User authentication flow
- Inventory management flow
- Report generation

### Security Testing
- Tenant isolation testing
- SQL injection prevention
- XSS prevention
- Authentication bypass attempts

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Hardware failure | Regular backups, RAID configuration |
| License abuse | Server fingerprinting, license validation |
| Power outages | UPS recommendations, auto-save |
| Network issues | Offline-first design, local caching |
| Data corruption | Transaction logs, point-in-time recovery |
| Tenant data leaks | RLS policies, automated isolation tests |
| M-Pesa downtime | Queue and retry mechanism, fallback to cash |

---

## 17. Success Metrics

- Monthly active branches
- Transaction success rate (>99.5%)
- Subscription renewal rate (>80%)
- Support ticket volume (<5 per branch/month)
- Average transaction time (<30 seconds)
- System uptime (>99.9%)
- Tenant isolation breach incidents (0)

---

## 18. Future Enhancements

### Phase 2
- Cloud analytics dashboard
- Mobile POS (tablet/phone)
- Customer loyalty program
- Email/SMS receipts

### Phase 3
- Accounting integrations (QuickBooks, Xero)
- Tax automation and filing
- Multi-currency support
- E-commerce integration

### Phase 4
- AI-powered inventory forecasting
- Customer relationship management (CRM)
- Employee scheduling
- Advanced analytics and BI

---

## 19. Approval

This PRD serves as the authoritative reference for development, testing, and deployment of the POS system.

**Approved By:** POS Engineering Team  
**Date:** January 2026  
**Version:** 2.0

---

**End of Document**

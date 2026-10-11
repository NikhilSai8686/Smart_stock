# SmartStock — Inventory and Sales Management System

A professional, modern, responsive full-stack inventory and point-of-sale (POS) web application designed for retail shops, grocery stores, clothing boutiques, and stationery businesses.

---

## Architecture Overview

SmartStock consists of two decoupled services:

1. **Backend (`back_end/`)**:
   - **Java 21 & Spring Boot 3.3.4**
   - **Spring Data JPA** with MySQL 8 (and H2 in-memory profile for automated tests)
   - **Spring Security 6** with stateless HMAC-SHA256 JWT authentication
   - **Pessimistic write locking (`@Lock(PESSIMISTIC_WRITE)`)** on product records during sales and purchases to prevent race conditions and overselling
   - **Audit trail (`StockMovement`)** logging every inventory increase or reduction
   - **Historical gross profit calculation** storing actual purchase cost on sale items
   - **Swagger / OpenAPI UI** at `http://localhost:8080/swagger-ui.html`
   - **Spring Boot Actuator** health checks at `http://localhost:8080/actuator/health`

2. **Frontend (`front_end/`)**:
   - **React 18 & Vite 5**
   - **React Router DOM 6** with protected route guards
   - **Axios** with JWT request/response interceptors and error handling
   - **Lucide React** icons & **Recharts** charts (Area & Bar trends)
   - **Professional Theme**: White cards (`#ffffff`, `#f8fafc`), Dark Navy text (`#0f172a`), Vibrant Emerald Green accents (`#10b981`, `#059669`)
   - **Printable Invoicing** with real-time tax & discount calculations

---

## Default User Accounts (Pre-seeded)

Upon first run, the database is automatically seeded with demo accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin@smartstock.com` | `admin123` | Full system access, product deletion, supplier deletion, reports |
| **STAFF** | `staff@smartstock.com` | `staff123` | POS checkout, inventory catalog viewing, restocking |

*Note: On the login page, quick one-click demo login buttons are provided.*

---

## Prerequisites

- **Java 21 JDK**
- **Apache Maven 3.9+**
- **Node.js 18+ & npm 9+**
- **MySQL 8.0+** (running on port 3306)

---

## Quick Start Guide

### 1. Database Setup (MySQL)

Create the database in MySQL:

```sql
CREATE DATABASE smartstock_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

A complete reference schema script is provided at `back_end/schema.sql`.

### 2. Backend Setup & Startup

1. Open a terminal in the `back_end` directory:
   ```bash
   cd back_end
   ```

2. (Optional) Configure environment variables or edit `application.yml` / `.env`:
   ```bash
   export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/smartstock_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
   export SPRING_DATASOURCE_USERNAME="root"
   export SPRING_DATASOURCE_PASSWORD="your_mysql_password"
   export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
   ```

3. Run automated tests to verify:
   ```bash
   mvn test
   ```

4. Start the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

The backend starts at `http://localhost:8080`.
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health check: `http://localhost:8080/actuator/health`

### 3. Frontend Setup & Startup

1. Open a terminal in the `front_end` directory:
   ```bash
   cd front_end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify `.env`:
   ```properties
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## Modules and Key Features

### 1. Dashboard (`/`)
- Total Products, Total Sales count, Gross Revenue, Estimated Gross Profit, Low-Stock alerts.
- Interactive Recharts daily area chart (past 7 days) and monthly revenue bar chart.
- Quick priority alerts widget for products needing immediate restocking.
- Top 5 best-selling products table.
- Recent sales transactions table with instant "Receipt" modal viewer.

### 2. Product Management (`/products`)
- Search by product name or SKU with debounced query.
- Filter by Category (dynamic) and Stock Status (All, In Stock, Low Stock, Out of Stock).
- Add new product with purchase cost, selling price, threshold, supplier, and expiration date.
- Edit existing products with SKU collision validation.
- View product details modal with profit margin calculation.
- Delete product (restricted to ADMIN role with confirmation modal).

### 3. POS & Billing (`/sales/pos`)
- Real-time catalog grid with category pills and live stock counters.
- Interactive Cart with quantity increment/decrement and inventory boundary checks.
- Real-time calculation of subtotal, customizable discount, tax rate, and grand total.
- Stock validation prevents overselling beyond physical quantity on hand.
- Instant printable invoice modal with print layout (`window.print()`).

### 4. Sales History (`/sales/history`)
- Historical transaction audit trail.
- Date range filtering.
- View or reprint any past customer tax invoice.

### 5. Purchases & Suppliers (`/purchases`)
- **Purchases Tab**: Record incoming stock shipments from suppliers. Automatically increments inventory levels, updates current product purchase cost, and creates stock audit records.
- **Suppliers Tab**: Full vendor directory with contact name, phone, email, and address.

### 6. Reports & Profit Analytics (`/reports`)
- Comprehensive gross profit reporting: Total Revenue, Total Cost of Goods Sold, Gross Profit, and Gross Margin %.
- Revenue vs Profit comparative bar chart.
- Best-selling products by quantity and revenue.
- Slow-moving products (high stock, low sales velocity).
- **Export to CSV**: Client-side CSV generator for accounting or spreadsheet analysis.

### 7. Stock Alerts (`/alerts`)
- Low Stock warnings categorized by severity (Out of stock, Critical, Low).
- Expiration warnings highlighting expired goods and items expiring in the next 30 days.
- One-click restock purchase link.

---

## REST API Specification Summary

| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and obtain JWT | Public |
| `POST` | `/api/auth/register` | Register new staff user | Public |
| `GET` | `/api/auth/me` | Current authenticated user profile | Authenticated |
| `GET` | `/api/products` | Paginated product list with search/filters | Authenticated |
| `GET` | `/api/products/{id}` | Get product details | Authenticated |
| `POST` | `/api/products` | Create product | Authenticated |
| `PUT` | `/api/products/{id}` | Update product | Authenticated |
| `DELETE` | `/api/products/{id}` | Delete product | **ADMIN** |
| `GET` | `/api/products/categories` | Distinct product categories list | Authenticated |
| `GET` | `/api/suppliers` | Paginated suppliers | Authenticated |
| `GET` | `/api/suppliers/all` | List all suppliers for dropdowns | Authenticated |
| `POST` | `/api/suppliers` | Create supplier | Authenticated |
| `PUT` | `/api/suppliers/{id}` | Update supplier | Authenticated |
| `DELETE` | `/api/suppliers/{id}` | Delete supplier | **ADMIN** |
| `POST` | `/api/sales` | Create sale, decrement stock, generate invoice | Authenticated |
| `GET` | `/api/sales` | Paginated sales with date filters | Authenticated |
| `GET` | `/api/sales/{id}` | Get sale invoice details | Authenticated |
| `POST` | `/api/purchases` | Record purchase order, increment stock | Authenticated |
| `GET` | `/api/purchases` | Paginated purchases with date filters | Authenticated |
| `GET` | `/api/dashboard/summary` | Dashboard KPI summary & chart data | Authenticated |
| `GET` | `/api/reports/sales` | Periodic sales breakdown | Authenticated |
| `GET` | `/api/reports/profit` | Revenue, cost, profit, and margin % | Authenticated |
| `GET` | `/api/reports/best-selling-products` | Top selling products by volume | Authenticated |
| `GET` | `/api/reports/slow-moving-products` | Slow moving items with high stock | Authenticated |
| `GET` | `/api/alerts/low-stock` | Products at or below minimum threshold | Authenticated |
| `GET` | `/api/alerts/expiry` | Products nearing expiry or expired | Authenticated |

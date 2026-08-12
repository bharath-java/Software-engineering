# E-Commerce Analytics Dashboard

A production-quality, enterprise-grade Full-Stack E-Commerce Analytics Dashboard featuring role-based authorization (RBAC), live request mapping (Developer Mode), interactive simulators, dynamic chart analytics, and system performance monitoring.

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full write/update access to business modules, settings, monitors, and developer tools.
   - **Manager**: Limited to business operations (`Dashboard`, `Products`, `Orders`, `Customers`, `Analytics`). Restrained from deletion actions, settings, and developer diagnostics.
   - **Developer**: Full dashboard access, including `System Monitor` telemetry and the `Developer Mode` transaction logging suite.
2. **Context-Aware Developer Mode (ON/OFF)**:
   - **Interactive Request Inspector**: Toggling Developer Mode ON displays a drawer visualizer detailing HTTP request latencies, middleware verifications, model execution lines, and raw JSON payloads.
   - **MongoDB Query Logger**: Real-time visualization of Mongoose queries (e.g. `db.products.find()`, `$lookup` aggregates) run in the backend.
3. **Interactive Developer Tools Suite**:
   - **Git Branching Simulator**: Visual milestone timeline detailing branch checkouts, commits, PR review stages, and merge closes.
   - **CI/CD Build Pipeline**: Auto-animating pipeline showing dependency installation, linters, unit tests, bundler packing, and Render/Vercel edge updates.
   - **Pull Request Review Page**: Interactive checklists verifying build compile and TL approval states to unlock merging.
4. **Live System Telemetry Monitor**:
   - Displays real-time Node server heap allocations, CPU load charts, and actual MongoDB Atlas ping latencies in rolling charts.
5. **Swagger Documentation Playground**:
   - Interactive Swagger API sandbox available at `/api/docs` to test endpoints.

---

## 📂 Project Structure

```
ECommerce-Dashboard/
├── backend/
│   ├── config/          # db.js, swagger.js
│   ├── controllers/     # auth, dashboard, product, order, customer, system, audit
│   ├── middleware/      # auth (JWT + RBAC checks), devLogger
│   ├── models/          # User, Product, Order, Customer, Category, AuditLog
│   ├── routes/          # API route files
│   ├── services/        # Business logic separation (db aggregations, calculations)
│   ├── utils/           # JWT token utilities
│   ├── scripts/         # seed.js (programmatic seeder)
│   ├── server.js        # Express application entry
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, Sidebar, Nav, ApiFlowPanel, Toast
│   │   ├── pages/       # Dashboard, Products, Orders, Customers, Analytics, Settings
│   │   ├── context/     # AuthContext, ThemeContext, DevModeContext
│   │   ├── services/    # api.js (Axios wrapper with event logging)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🛠️ Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or an Atlas connection string)

### 1. Database Configuration
Create a `.env` file in the `/backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_dashboard
JWT_SECRET=super_secret_jwt_key_change_me_in_production
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
```

### 2. Backend Installation & Seeding
Navigate to `/backend`, install modules, and run the seeder:
```bash
cd backend
npm install
npm run seed
```
This populates the database with:
- **10 Categories**
- **50 Products**
- **100 Customers**
- **500 Orders** (spread over the past 6 months to generate rich analytics graphs)
- **3 Seeded Users**:
  - **Admin**: `admin@dashboard.com` / `admin123`
  - **Manager**: `manager@dashboard.com` / `manager123`
  - **Developer**: `developer@dashboard.com` / `developer123`

Start the Express backend:
```bash
npm run dev
```

### 3. Frontend Installation & Startup
Navigate to `/frontend`, install modules, and launch the dev server:
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛡️ API Endpoints Index

| Endpoint | Method | Role Restriction | Description |
|---|---|---|---|
| `/api/auth/login` | POST | None | Authenticate admin/manager/dev |
| `/api/auth/me` | GET | All Roles | Retrieve decoded session user |
| `/api/dashboard` | GET | All Roles | Dynamic business charts & metrics |
| `/api/products` | GET/POST/PUT | All Roles | CRUD products catalog |
| `/api/products/:id` | DELETE | Admin, Developer | Delete product from catalog |
| `/api/orders` | GET/POST/PUT | All Roles | Retrieve/update order dispatch state |
| `/api/orders/:id` | DELETE | Admin, Developer | Delete order record |
| `/api/customers` | GET | All Roles | Fetch customer lists |
| `/api/system/health` | GET | Admin, Developer | Fetch live telemetry CPU/memory stats |
| `/api/audit-logs` | GET | Admin, Developer | Fetch MongoDB transaction logs |

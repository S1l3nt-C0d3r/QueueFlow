# 🍽️ QueueFlow

### Local-First Restaurant Management System

**Simplifying restaurant operations, one table at a time.**

QueueFlow is a restaurant management system designed to streamline day-to-day restaurant operations through a unified platform for queue management, table allocation, menu management, staff administration, ordering, and billing.

Built with a **local-first architecture**, QueueFlow prioritizes data ownership, operational reliability, and real-time communication without making restaurants dependent on expensive cloud infrastructure or a constant internet connection.

---

## ✨ Features

### 🧑‍💼 Restaurant Administration
- Centralized restaurant administration dashboard.
- Staff management with role-based access control.
- Restaurant table and seating management.
- Menu creation, editing, and deletion.
- Operational overview through a unified dashboard.

### 🕒 Queue Management
- Manage customers waiting for a table.
- Generate and track queue tokens.
- Call the next eligible customer.
- Assign tables based on party size and availability.
- Track queue statuses throughout the seating process.

### 🪑 Table Management
- Create and manage restaurant tables.
- Configure table numbers and seating capacities.
- Track table availability and occupancy.
- Manage table allocation during customer seating.
- Free tables once customers have completed their dining experience.

### 📱 Customer QR Ordering
- Table-based QR ordering.
- Customers can access the restaurant menu through their table QR code.
- Support for dining sessions and multiple orders within a session.
- Preorders can be associated with customers waiting in the queue and sent to the kitchen after seating.

### 👥 Staff Management
- Staff account creation and administration.
- Role-based access control.
- Dedicated workflows for administrators, receptionists, and waiters.
- Staff authentication using staff numbers and passwords.

### 🧾 Orders & Billing
- Dining-session-based order management.
- Multiple orders associated with a single dining session.
- Kitchen order ticket (KOT) workflow.
- Billing and payment management.
- Explicit table release after customer departure.

---

## 🏗️ Architecture

QueueFlow follows a **local-first client-server architecture**.

The restaurant operates its own local backend server, allowing devices connected to the restaurant network to communicate with a shared database.

```text
                 ┌──────────────────────┐
                 │   Restaurant Staff   │
                 │  Phones / Tablets /  │
                 │      Computers      │
                 └──────────┬───────────┘
                            │
                     HTTP / Socket.IO
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Express Backend   │
                 │    Local Server     │
                 └──────────┬───────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
     ┌─────────────────┐        ┌──────────────────┐
     │   SQLite DB     │        │   Sync Service   │
     │                 │        │                  │
     │ Restaurant Data │        │ Error Reporting  │
     │ Staff / Tables  │        │ Remote Monitoring│
     │ Queue / Orders  │        └────────┬─────────┘
     │ Billing / Menu  │                 │
     └─────────────────┘                 ▼
                                ┌──────────────────┐
                                │ Firebase Spark   │
                                │ Cloud Logging    │
                                └──────────────────┘
```

### Architectural Principles

- **Local data ownership:** Core restaurant data resides in the restaurant's local SQLite database.
- **Offline-first operations:** Core workflows are designed to operate without continuous internet connectivity, provided the local server and network remain available.
- **Real-time communication:** Socket.IO enables real-time updates between connected restaurant devices.
- **Cloud cost efficiency:** Firebase is reserved for cloud-side error reporting and monitoring rather than primary operational storage.
- **Separation of concerns:** Frontend, backend business logic, and persistence are kept separate.

---

## 🔄 Core Restaurant Workflow

QueueFlow uses a dining-session-oriented workflow instead of treating every order as an independent table transaction.

```text
Customer Joins Queue
        │
        ▼
   WAITING
        │
        ▼
   CALLED
        │
        ▼
 Customer Seated
        │
        ▼
 Dining Session Created
        │
        ▼
   Orders (1...N)
        │
        ▼
    KOT / Kitchen
        │
        ▼
      Billing
        │
        ▼
     Payment
        │
        ▼
 Dining Session Paid
        │
        ▼
 Customer Leaves
        │
        ▼
   Table Freed
        │
        ▼
 Table Available
```

A dining session acts as the aggregate root for the customer's experience, allowing multiple orders to be associated with the same seating session.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | SQLite |
| SQLite Driver | better-sqlite3 |
| Authentication | JWT |
| Real-time Communication | Socket.IO |
| Cloud Monitoring | Firebase |
| API Testing | Bruno |

---

## 📂 Project Structure

The application follows a modular frontend/backend structure.

```text
QueueFlow/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── customer/
│   │   │   ├── queue/
│   │   │   ├── tables/
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   └── staff/
│   │   │
│   │   ├── services/
│   │   ├── context/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── staff/
│   │   │   ├── queue/
│   │   │   ├── tables/
│   │   │   ├── dining-sessions/
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   └── billing/
│   │   │
│   │   ├── shared/
│   │   ├── middleware/
│   │   ├── database/
│   │   └── server.ts
│   │
│   └── package.json
│
└── README.md
```

*Note: Directory names are illustrative; adjust them to match the actual repository structure.*

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/QueueFlow.git

cd QueueFlow
```

### 2. Setup the backend

```bash
cd backend

npm install
```

Configure the required environment variables using your backend `.env` configuration.

Example:

```env
PORT=5000
JWT_SECRET=your_secure_secret
```

Run the backend in development mode:

```bash
npm run dev
```

### 3. Setup the frontend

Open another terminal:

```bash
cd frontend

npm install
```

Start the frontend:

```bash
npm run dev
```

The Vite development server will provide the local URL for accessing the application.

*Note: Configure the frontend API base URL to point to your running backend.*

---

## 🔐 Authentication & Authorization

QueueFlow uses JWT-based authentication and role-based access control.

Supported staff roles include:

| Role | Responsibility |
|---|---|
| `role-admin` | Full restaurant administration |
| `role-manager` | Restaurant management |
| `role-waiter` | Table, dining session, and order operations |
| `role-receptionist` | Queue and customer seating operations |
| `role-cashier` | Billing and payment operations |

Staff members authenticate using their staff number and password.

Passwords are stored as hashes rather than plaintext credentials.

---

## 🎯 Design Philosophy

QueueFlow is built around three core ideas:

**1. Restaurants should own their data.**

A restaurant should not need to depend on an external cloud database for every operational action.

**2. Software should adapt to restaurant operations.**

Queue management, table allocation, dining sessions, orders, and billing should work together as one coherent workflow.

**3. Operational software should be affordable.**

By keeping core data and processing local, QueueFlow aims to reduce recurring infrastructure costs while retaining optional cloud-based monitoring.

---

## 🗺️ Roadmap

- [x] JWT authentication
- [x] Role-based authorization
- [x] Staff management
- [x] Queue management
- [x] Table management
- [x] Dining session architecture
- [x] Menu management
- [x] Order management
- [x] Billing module
- [x] Customer QR ordering foundation
- [ ] Complete end-to-end integration testing
- [ ] Production deployment and restaurant onboarding
- [ ] Hardware and printer integration
- [ ] Advanced analytics and reporting

---

## 🤝 Contributing

Contributions, suggestions, and ideas are welcome!

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

For major changes, please open an issue first to discuss the proposed implementation.

---

## 📜 License

This project is currently under development. Licensing and distribution terms will be specified separately.

---

## 👨‍💻 Author

**Nitayanta Srinivas**

Building products, experimenting with technology, and solving real-world problems through software.

GitHub: [@S1l3nt-C0d3r](https://github.com/S1l3nt-C0d3r)

---

<p align="center">
  <b>QueueFlow — Less waiting. Better dining. Smarter operations.</b>
</p>

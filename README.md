
# 🚴‍♂️ Bike Shop Backend

- The backend server for the Bike Shop Application built with Node.js, Express, and MongoDB. It provides RESTful APIs for authentication, product and order management, user role-based access, and payment integration via SurjoPay.

# 🔗 Links
- [Live Link Of Bi Cycle Store API](https://by-cycle-store-nine.vercel.app/)
- [Post Man Documentation Link](https://documenter.getpostman.com/view/30514800/2sB2qZE2Hm)

# ✨ Features

- Secure user registration & login with hashed passwords
- Role-based access (customer/admin)
- JWT-based session management
- CRUD APIs for Products and Orders
- Product search, filtering, and pagination
- Real-time order status tracking
- Admin control over products, users, and orders
- SurjoPay integration for checkout
- Middleware for authentication and role protection
- 
## 🛒 Product Management
- Role-based dashboards:
    - Admin: User, Product & Order Management (CRUD)
    - Customer: View orders, manage profile & update password
- Order placement with SurjoPay integration

## 🛒 🔄 Extras
- Track order status (progress bar)
- Admin control to update delivery status and estimated date
- Pagination on product and order listings

## 🛒 🧰 Tech Stack
- Node.js

- Express.js

- MongoDB + Mongoose

- JWT for Auth

- bcrypt.js for password hashing

- CORS, dotenv, and morgan middleware

- SurjoPay (payment gateway)

# 📁 Project Structure

```graphql
bike-shop-backend/
├── src/
│   ├── app/
│   │   ├── config/              # Environment and app-wide config files
│   │   │   └── index.ts
│   │   ├── middleware/          # Auth, error handling, request validation, etc.
│   │   ├── errors/              # Custom error classes and error formatters
│   │   ├── builder/             # Response builders or reusable factories
│   │   ├── routes/              # Route entry points (aggregators for modules)
│   │   ├── utils/               # Helpers, constants, token generators, etc.
│   │   ├── interfaces/          # TypeScript interfaces and DTOs
│   │   └── modules/             # Feature-based modules
│   │       ├── auth/            # Auth logic (register/login)
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.route.ts
│   │       │   ├── auth.validation.ts
│   │       │   └── auth.interface.ts
│   │       ├── users/           # User management
│   │       ├── products/        # Product CRUD
│   │       ├── orders/          # Order CRUD and tracking
│   │       ├── payments/        # SurjoPay integration
│   │       └── blog/            # (Optional module or extra feature)
│   │           ├── blog.controller.ts
│   │           ├── blog.route.ts
│   │           ├── blog.service.ts
│   │           └── blog.model.ts
│   ├── app.ts                   # Main app setup and middleware registration
│   └── server.ts                # Entry point – connects to DB, starts server
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md


```

## Installation

 1. Clone the repo:

```bash
git clone https://github.com/your-username/bike-shop-client.git
cd bike-shop-client

```
2. Install dependencies:

```bash
npm install

```
3. Configure environment variables (see Environment Variables)
4. Run the development server:

```bash
npm run dev

```
    
# ⚙️ Environment Variables

 Create a .env file in the root with the following keys:
```bash
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bike-shop
JWT_SECRET=your_jwt_secret
SURJOPAY_SECRET_KEY=your_surjopay_secret_key
SURJOPAY_PUBLIC_KEY=your_surjopay_public_key
CLIENT_URL=http://localhost:5173

```
Adjust values according to your backend and SurjoPay credentials.


# API Reference

##  🔐 Auth Routes

| Method    | 	Endpoint           | Description                      |
| :-------- | :------------------- | :--------------------------------|
| `POST`    | `/api/auth/register` |  Register a new customer         |
| `POST`    | `/api/auth/login`    |  Log in and receive **JWT token**|
| `POST`    | `/api/auth/register` |  Register a new customer         |
| `GET`     | `/api/auth/profile`  |  Get current user info (JWT)     |

## 🛍️ Product Routes
 
| Method    | 	Endpoint           | Description                               |
| :-------- | :------------------- | :---------------------------------------  |
| `GET`     | `/api/products`      |  Get all products (with filters)          |
| `GET`     | `/api/products/:id`  |  Get single product details **JWT token** |
| `POST`    | `/api/products`      |  Add a new product (Admin)  **JWT token** | 
| `PUT`     | `/api/products/:id`  |  Update a product (Admin)**JWT token**    |
| `DELETE`  | `/api/products/:id`  |  Delete a product (Admin)**JWT token**    | 

## 📦 Order Routes
 
| Method    | 	Endpoint           | Description                               |
| :-------- | :------------------- | :---------------------------------------  |
| `POST `   | `/api/orders`        |  Place a new order (Customer)        |
| `GET`     | `/api/orders`        |  Get orders by role **JWT required token** |
| `GET`     | `/api/orders/:id`    |  Get orders by Id **JWT required token** |
| `PUT`     | `/api/orders/:id`    |  Update order status (Admin only) **JWT token** | 
| `PUT`     | `/api/products/:id`  |  Update a product (Admin)**JWT token**    |
| `PUT`     | `/api/orders/varify` |  Varify order status (Admin)**JWT token**    | 

# 🛡️ Authentication & Authorization
- JWT Authentication: Secures protected routes via middleware.
- Role-Based Access Control:
    - `customer`: Can view and place orders, manage profile.
    - `admin`: Can manage users, orders, and products..
# 🗃️ Database Schema Overview
## 🔸 User
```bash
{
  name: String,
  email: String,
  password: String (hashed),
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
}

```
## 🔸 Product
```bash
{
  name: String,
  brand: String,
  model: String,
  category: String,
  price: Number,
  stock: Number,
  image: String
}


```
## 🔸 Order
```bash
{
  user: ObjectId (ref: User),
  products: [{ product: ObjectId, quantity: Number }],
  totalPrice: Number,
  paymentMethod: String,
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'] },
  estimatedDelivery: Date
}

```

# 💳 Payment Integration (SurjoPay)
- Orders are processed with SurjoPay on the client side.

- Backend validates order data and stores order post-payment.

- Payment-related metadata (e.g., transaction ID) can be stored for reference.


# ⚠️ Error Handling
## Consistent JSON error responses

### Handles:

- Invalid credentials

- Duplicate registration

- Stock issues

- Invalid operations or IDs

# 🚀 Performance
## API responses are optimized using:

  - Pagination for product and order queries

  - Indexing in MongoDB (recommended)

  - Lean queries where possible


# ShopIT - E-Commerce Application

A full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application with Docker containerization.

## 🚀 Features

- **User Authentication**: Register, login, logout with JWT tokens
- **Product Management**: Browse, search, filter products by category, price, and ratings
- **Shopping Cart**: Add/remove items, update quantities
- **Order Management**: Place orders, track order status
- **User Profile**: Update profile, upload avatar, change password
- **Admin Dashboard**: 
  - Manage products (CRUD operations)
  - Manage users and orders
  - Upload product images to AWS S3
  - View sales analytics

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **AWS S3** - Image storage
- **Nodemailer** - Email service

### Frontend
- **React.js** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Bootstrap** - Styling

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Nginx** - Reverse proxy for frontend
- **Terraform** - Infrastructure as Code

## 📦 Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- AWS S3 bucket (optional, for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/minhtri1612/IT_ecommerce_app.git
cd IT_ecommerce_app
```

### 2. Create environment file
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
JWT_SECRET=your_jwt_secret_here
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET_NAME=your_bucket_name
```

### 3. Run with Docker Compose
```bash
docker compose up -d
```

The app will automatically:
- Start MongoDB database
- Seed admin user and sample products
- Start the backend API server
- Build and serve the React frontend

### 4. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

### Default Admin Credentials
- **Email**: admin@shopit.com
- **Password**: admin123456

## 🧪 Running Tests
```bash
npm test
```

## 📁 Project Structure
```
├── backend/
│   ├── controllers/     # Route handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, error handling
│   ├── utils/           # Helper functions
│   ├── seeder/          # Database seeders
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── redux/       # State management
│   │   └── helpers/     # Utility functions
│   ├── nginx.conf
│   └── Dockerfile
├── terraform/           # Infrastructure as Code
├── docker-compose.yml
└── package.json
```

## 🔧 Local Development (without Docker)

### Backend
```bash
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📝 API Endpoints

### Auth
- `POST /api/v1/register` - Register user
- `POST /api/v1/login` - Login user
- `GET /api/v1/logout` - Logout user

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product details

### Orders
- `POST /api/v1/orders/new` - Create order
- `GET /api/v1/me/orders` - Get user orders

### Admin
- `GET /api/v1/admin/products` - Get all products (admin)
- `POST /api/v1/admin/products` - Create product
- `PUT /api/v1/admin/products/:id` - Update product
- `DELETE /api/v1/admin/products/:id` - Delete product

## 👤 Author

**Minh Tri**
- GitHub: [@minhtri1612](https://github.com/minhtri1612)

## 📄 License

This project is licensed under the ISC License.
# Trigger build

# Letsema Backend 1

A comprehensive backend API for the Letsema food delivery platform built with Node.js, TypeScript, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Customer, Partner, Admin, and Driver roles
- **Partner Management**: Restaurant/kitchen onboarding and management
- **Menu Management**: Dish creation, categorization, and filtering
- **Order Management**: Complete order lifecycle from creation to delivery
- **Cart & Favourites**: User shopping cart and favourite dishes
- **Real-time Updates**: Order status tracking and notifications
- **File Upload**: Image upload for dishes and partner logos
- **Search & Filtering**: Advanced search and filtering capabilities
- **Rate Limiting**: Protection against abuse and spam
- **Comprehensive Logging**: Winston-based logging system
- **API Documentation**: Auto-generated Swagger documentation
- **Testing**: Unit and integration tests with Jest
- **Docker Support**: Containerized deployment

## 🛠️ Tech Stack 

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Security**: Helmet, CORS, bcrypt
- **Development**: ts-node-dev, ESLint, Prettier

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd letsema-backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
PORT=4000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
CORS_ORIGIN=http://localhost:5173
```

### 3. Database Setup

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up -d mongo
```

#### Option B: Local MongoDB

Make sure MongoDB is running locally on port 27017.

### 4. Run the Application

#### Development Mode

```bash
npm run dev
```

#### Using Docker Compose (Full Stack)

```bash
docker-compose up
```

The API will be available at:
- **API**: http://localhost:4000
- **Health Check**: http://localhost:4000/healthz
- **API Documentation**: http://localhost:4000/docs

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:id` | Get user by ID | Yes |
| PUT | `/api/users/:id` | Update user | Yes |
| DELETE | `/api/users/:id` | Delete user (admin) | Yes |
| GET | `/api/users/:id/favourites` | Get user favourites | Yes |
| POST | `/api/users/:id/favourites` | Add to favourites | Yes |
| DELETE | `/api/users/:id/favourites/:dishId` | Remove from favourites | Yes |
| GET | `/api/users/:id/cart` | Get user cart | Yes |
| POST | `/api/users/:id/cart` | Add to cart | Yes |
| DELETE | `/api/users/:id/cart/:itemId` | Remove from cart | Yes |

### Partner Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/partners` | Get all partners | No |
| GET | `/api/partners/:id` | Get partner by ID | No |
| POST | `/api/partners` | Create partner | Yes |
| PUT | `/api/partners/:id` | Update partner | Yes |
| DELETE | `/api/partners/:id` | Delete partner | Yes |
| GET | `/api/partners/:id/dishes` | Get partner dishes | No |
| GET | `/api/partners/:id/orders` | Get partner orders | Yes |

### Dish Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dishes` | Get all dishes | No |
| GET | `/api/dishes/featured` | Get featured dishes | No |
| GET | `/api/dishes/categories` | Get dishes by category | No |
| GET | `/api/dishes/:id` | Get dish by ID | No |
| POST | `/api/partners/:partnerId/dishes` | Create dish | Yes |
| PUT | `/api/dishes/:id` | Update dish | Yes |
| DELETE | `/api/dishes/:id` | Delete dish | Yes |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create order | Yes |
| GET | `/api/orders/my` | Get user orders | Yes |
| GET | `/api/orders/:id` | Get order by ID | Yes |
| PATCH | `/api/orders/:id/status` | Update order status | Yes |
| POST | `/api/orders/:id/assign-driver` | Assign driver | Yes |
| POST | `/api/orders/:id/cancel` | Cancel order | Yes |

### Query Parameters

#### Partners
- `status`: Filter by status (active, inactive, pending)
- `city`: Filter by city
- `search`: Search in name, description, cuisine types
- `page`, `limit`: Pagination

#### Dishes
- `partnerId`: Filter by partner
- `category`: Filter by category
- `isVegetarian`, `isVegan`, `isSpicy`: Boolean filters
- `minPrice`, `maxPrice`: Price range
- `search`: Text search
- `page`, `limit`: Pagination

## 🗄️ Database Schema

### User Model
```typescript
{
  name: string,
  email: string,
  passwordHash: string,
  role: 'customer' | 'partner' | 'admin' | 'driver',
  favourites: ObjectId[],
  cart: [{ dishId: ObjectId, quantity: number, specialInstructions?: string }],
  profile: { phone?, avatar?, preferences: {...} },
  addresses: [{ label, street, city, province, postalCode, coordinates?, isDefault }],
  isActive: boolean,
  emailVerified: boolean,
  createdAt, updatedAt
}
```

### Partner Model
```typescript
{
  name: string,
  description?: string,
  logoUrl?: string,
  address: { street, city, province, postalCode, coordinates? },
  contact: { phone, email, whatsapp? },
  businessInfo: { businessType, cuisineTypes, operatingHours },
  status: 'active' | 'inactive' | 'pending' | 'suspended',
  rating: { average: number, count: number },
  deliveryInfo: { deliveryRadius, deliveryFee, minimumOrder, estimatedDeliveryTime },
  owner: ObjectId,
  dishes: ObjectId[],
  isVerified: boolean,
  isFeatured: boolean,
  createdAt, updatedAt
}
```

### Dish Model
```typescript
{
  name: string,
  description: string,
  price: number,
  photoUrl?: string,
  category: string,
  partnerId: ObjectId,
  isFeatured: boolean,
  isSpicy: boolean,
  isVegetarian: boolean,
  isVegan: boolean,
  containsNuts: boolean,
  containsDairy: boolean,
  isAvailable: boolean,
  preparationTime: number,
  servingSize: string,
  ingredients: string[],
  rating: { average: number, count: number },
  createdAt, updatedAt
}
```

### Order Model
```typescript
{
  orderNumber: string,
  customerId: ObjectId,
  partnerId: ObjectId,
  items: [{ dishId, name, price, quantity, specialInstructions? }],
  pricing: { subtotal, deliveryFee, serviceFee, tax, discount, total },
  deliveryAddress: { street, city, province, postalCode, coordinates?, instructions? },
  paymentMethod: 'cash' | 'card' | 'ewallet',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled',
  timeline: [{ status, timestamp, note? }],
  assignedDriverId?: ObjectId,
  estimatedDeliveryTime?: Date,
  actualDeliveryTime?: Date,
  createdAt, updatedAt
}
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🔧 Development Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Seed database with sample data
npm run seed
```

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the image
docker build -t letsema-backend .

# Run with Docker Compose
docker-compose up -d
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=4000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🚀 Deployment Options

### 1. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 2. Render
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### 3. Heroku
```bash
# Install Heroku CLI and login
heroku create letsema-backend
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_production_mongo_uri
git push heroku main
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse and spam
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Mongoose ODM
- **XSS Protection**: Input sanitization

## 📊 Monitoring & Logging

- **Winston Logging**: Structured logging with multiple transports
- **Health Checks**: `/healthz` endpoint for monitoring
- **Error Tracking**: Comprehensive error handling
- **Request Logging**: All API requests logged
- **Performance Monitoring**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: support@letsema.com
- Documentation: http://localhost:4000/docs

## 🔄 Migration from Monorepo

If migrating from a monorepo, update your frontend to use the new backend URL:

```javascript
// Frontend environment variable
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Update API calls
fetch(`${API_BASE_URL}/api/partners?status=active`)
```

## 📈 Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Payment integration (Stripe/PayFast)
- [ ] SMS notifications with Twilio
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Mobile app API optimizations
- [ ] Caching with Redis
- [ ] Background job processing
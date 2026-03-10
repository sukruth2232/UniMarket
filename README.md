# UniMarket - University Marketplace Backend

A production-ready Spring Boot backend for a university marketplace platform where students can buy and sell items within their campus.

---

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Core language |
| Spring Boot | 3.2.0 | Application framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | 3.x | Database ORM |
| MySQL | 8.x | Primary database |
| JWT (jjwt) | 0.11.5 | Token-based auth |
| WebSocket (STOMP) | - | Real-time messaging |
| Lombok | 1.18.30 | Boilerplate reduction |
| MapStruct | 1.5.5 | DTO mapping |
| SpringDoc OpenAPI | 2.3.0 | API documentation |
| BCrypt | - | Password encryption |
| Maven | 3.x | Build tool |

---

## 📁 Project Structure

```
com.unimarket
├── controller/          # REST controllers (HTTP request handling)
│   ├── AuthController
│   ├── UserController
│   ├── ProductController
│   ├── CategoryController
│   ├── MessageController
│   ├── NotificationController
│   ├── OrderController
│   ├── AdminController
│   └── FileUploadController
├── service/             # Business logic layer
│   ├── AuthService
│   ├── UserService
│   ├── ProductService
│   ├── CategoryService
│   ├── MessageService
│   ├── NotificationService
│   ├── OrderService
│   ├── FileStorageService
│   └── impl/            # Service implementations
├── repository/          # Data access layer (Spring Data JPA)
│   ├── UserRepository
│   ├── ProductRepository
│   ├── CategoryRepository
│   ├── MessageRepository
│   ├── NotificationRepository
│   └── OrderRepository
├── entity/              # JPA entities
│   ├── User
│   ├── Product
│   ├── Category
│   ├── Message
│   ├── Notification
│   └── Order
├── dto/
│   ├── request/         # Inbound DTOs with validation
│   └── response/        # Outbound DTOs
├── security/            # JWT security components
│   ├── JwtAuthenticationFilter
│   ├── JwtAuthenticationEntryPoint
│   └── CustomUserDetailsService
├── config/              # Configuration classes
│   ├── SecurityConfig
│   ├── WebSocketConfig
│   ├── CorsConfig
│   ├── OpenApiConfig
│   ├── WebMvcConfig
│   └── DataInitializer
├── exception/           # Exception handling
│   ├── GlobalExceptionHandler
│   ├── ResourceNotFoundException
│   ├── BadRequestException
│   └── UnauthorizedException
├── websocket/           # WebSocket event handlers
│   └── WebSocketEventListener
└── util/                # Utility classes
    ├── JwtUtil
    ├── AppConstants
    └── ConversationIdGenerator
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Database Setup
```sql
CREATE DATABASE unimarket_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Configuration
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/unimarket_db
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
app.jwt.secret=YOUR_SUPER_SECRET_JWT_KEY_MINIMUM_256_BITS
```

### Run the Application
```bash
mvn spring-boot:run
```

The server starts at: `http://localhost:8080/api`

### Default Admin Credentials
On first startup, an admin user is auto-created:
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@unimarket.com`

---

## 📖 API Documentation

Once running, visit Swagger UI at:
```
http://localhost:8080/api/swagger-ui.html
```

---

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@university.edu",
  "password": "secure123",
  "firstName": "John",
  "lastName": "Doe",
  "university": "MIT"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "john_doe",
  "password": "secure123"
}
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login | ❌ |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user | ✅ |
| PUT | `/users/me` | Update profile | ✅ |
| POST | `/users/me/avatar` | Upload profile image | ✅ |
| GET | `/users/{id}` | Get user by ID | ✅ |
| GET | `/users/{id}/listings` | Get user's listings | ❌ |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | Get all products (paginated) | ❌ |
| GET | `/products/search` | Search with filters | ❌ |
| GET | `/products/{id}` | Get product by ID | ❌ |
| POST | `/products` | Create product | ✅ |
| PUT | `/products/{id}` | Update product | ✅ |
| DELETE | `/products/{id}` | Deactivate product | ✅ |
| POST | `/products/{id}/images` | Upload product images | ✅ |
| PATCH | `/products/{id}/mark-sold` | Mark as sold | ✅ |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | List active categories | ❌ |
| GET | `/categories/{id}` | Get category | ❌ |
| POST | `/categories` | Create category | ADMIN |
| PUT | `/categories/{id}` | Update category | ADMIN |
| DELETE | `/categories/{id}` | Deactivate category | ADMIN |

### Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/messages` | Send message | ✅ |
| GET | `/messages/conversations` | List all conversations | ✅ |
| GET | `/messages/conversations/{id}` | Get conversation messages | ✅ |
| PATCH | `/messages/conversations/{id}/read` | Mark conversation read | ✅ |
| GET | `/messages/unread-count` | Unread message count | ✅ |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Get all notifications | ✅ |
| GET | `/notifications/unread-count` | Unread count | ✅ |
| PATCH | `/notifications/{id}/read` | Mark one as read | ✅ |
| PATCH | `/notifications/read-all` | Mark all as read | ✅ |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders` | Create order | ✅ |
| GET | `/orders/{id}` | Get order by ID | ✅ |
| GET | `/orders/my-purchases` | Buyer order history | ✅ |
| GET | `/orders/my-sales` | Seller order history | ✅ |
| PATCH | `/orders/{id}/complete` | Complete order | ✅ |
| PATCH | `/orders/{id}/cancel` | Cancel order | ✅ |

---

## 🔌 WebSocket (Real-time)

Connect to: `ws://localhost:8080/api/ws` (SockJS fallback)

### Subscriptions (STOMP)
```javascript
// Subscribe to personal messages
stompClient.subscribe('/user/queue/messages', onMessage);

// Subscribe to notifications
stompClient.subscribe('/user/queue/notifications', onNotification);
```

### Send Message via WebSocket
```javascript
stompClient.send('/app/chat.send', {}, JSON.stringify({
  receiverId: 2,
  productId: 5,
  content: 'Is this still available?'
}));
```

---

## 🔎 Product Search

```http
GET /api/products/search?keyword=laptop&categoryId=1&minPrice=100&maxPrice=500&page=0&size=10
```

Query Parameters:
- `keyword` – Search in title and description
- `categoryId` – Filter by category
- `minPrice` / `maxPrice` – Price range filter
- `page`, `size` – Pagination
- `sortBy`, `sortDir` – Sorting

---

## 🔒 Role-Based Access

| Role | Capabilities |
|------|-------------|
| USER | Register/login, create listings, message, order |
| ADMIN | All USER capabilities + manage categories, users, view stats |

---

## 📦 Pre-seeded Categories

On startup, the following 10 categories are automatically created:
Electronics, Textbooks, Furniture, Clothing, Sports & Fitness, Music & Instruments, Stationery, Kitchen & Appliances, Vehicles, Other

---

## ⚙️ Environment Configuration

| Property | Description | Default |
|----------|-------------|---------|
| `server.port` | Server port | 8080 |
| `spring.datasource.url` | MySQL URL | localhost:3306/unimarket_db |
| `app.jwt.secret` | JWT signing key | (set in properties) |
| `app.jwt.expiration` | Token expiry (ms) | 86400000 (24h) |
| `app.upload.dir` | File upload directory | uploads |
| `app.cors.allowed-origins` | CORS allowed origins | localhost:3000,4200,5173 |

---

## 🏗️ Architecture Decisions

1. **Stateless JWT Auth** – No session storage, scales horizontally
2. **Soft Deletes** – Products/users are deactivated, not deleted
3. **Conversation IDs** – Messages grouped by `conv_{user1}_{user2}_prod_{productId}`
4. **Real-time via WebSocket** – STOMP over SockJS for broad browser support
5. **Pagination** – All list endpoints return `Page<T>` with metadata
6. **Global Exception Handling** – Uniform `ApiResponse<T>` error format

---

## 🧪 Building

```bash
# Clean build
mvn clean package -DskipTests

# Run tests
mvn test

# Run specific test
mvn test -Dtest=UniMarketApplicationTests
```

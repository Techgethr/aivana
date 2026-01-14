# Aivana - AI-Powered E-Commerce Platform

Aivana is an innovative e-commerce platform that combines artificial intelligence with blockchain technology to create a secure, intelligent marketplace for buyers and sellers.

## Features

- **AI Sales Assistant**: Intelligent agent that helps customers find products and guides them through purchases
- **Blockchain Transactions**: Secure payments using Ethereum blockchain
- **Marketplace Management**: Web interface for sellers to manage products and inventory
- **Category Management**: Organize products into categories for better organization
- **Real-time Analytics**: Dashboard with sales metrics and insights
- **Secure Authentication**: JWT-based authentication system

## Architecture

### Backend
- **Framework**: Node.js with Express
- **Database**: SQLite (with support for other engines)
- **AI Integration**: OpenAI GPT-3.5-turbo for conversational commerce
- **Blockchain**: Ethereum integration via Viem for blockchain interactions

### Frontend
- **Template Engine**: EJS for server-side rendering
- **Styling**: Custom CSS with responsive design
- **Client-side Logic**: Vanilla JavaScript

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aivana-ecommerce
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- `OPENAI_API_KEY`: Your OpenAI API key
- `JWT_SECRET`: Secret for JWT tokens
- `ETHEREUM_RPC_URL`: Ethereum network RPC URL (e.g., Infura)
- `CONTRACT_ADDRESS`: Smart contract address
- `PRIVATE_KEY`: Ethereum wallet private key

## Configuration

### Database
The application uses SQLite by default. The database file will be created automatically at `./database/aivana.db`.

### AI Agent
The AI agent uses OpenAI's GPT-3.5-turbo model. You need to provide a valid API key in the environment variables.

### Blockchain
The application integrates with Ethereum for secure transactions. Configure the following in your `.env`:
- Ethereum network endpoint
- Smart contract address
- Wallet private key for transaction signing

## Usage

### Starting the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get specific product
- `GET /api/products/my` - Get user's products (authenticated)
- `POST /api/products` - Create new product (authenticated)
- `PUT /api/products/:id` - Update product (authenticated)
- `DELETE /api/products/:id` - Delete product (authenticated)

#### Categories
- `GET /api/categories` - Get all available categories
- `GET /api/categories/all` - Get all categories (authenticated)
- `GET /api/categories/:id` - Get specific category
- `POST /api/categories` - Create new category (authenticated)
- `PUT /api/categories/:id` - Update category (authenticated)
- `DELETE /api/categories/:id` - Delete category (authenticated)

#### Transactions
- `GET /api/transactions` - Get user's transactions (authenticated)
<!-- Transaction creation and verification endpoints will be implemented in a future update -->

#### AI Agent
- `POST /api/ai/chat` - Chat with AI agent
- `GET /api/ai/conversation/:sessionId` - Get conversation history

#### Rates
- `GET /api/rates/eth-usd` - Get ETH/USD conversion rate

#### Dashboard
- `GET /api/stats` - Get dashboard statistics (authenticated)
- `GET /api/activity` - Get recent activity (authenticated)

### Web Interface

- `/` - Homepage
- `/products` - Browse products
- `/dashboard` - Seller dashboard
- `/dashboard/products` - Product management
- `/login` - Login page
- `/register` - Registration page

## Blockchain Integration

The platform integrates with the Ethereum blockchain for secure transactions. Current functionality includes:
- Balance checking
- Transaction verification
- Block information retrieval
- Gas price estimation

Full transaction functionality will be implemented in a future update.

## Security

- Passwords are hashed using bcrypt
- JWT tokens for session management
- Input validation and sanitization
- Helmet.js for HTTP header security
- CORS configured for cross-origin requests

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

For production deployment:
1. Set up environment variables securely
2. Configure a production database
3. Set up SSL certificates
4. Use a process manager like PM2

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team.
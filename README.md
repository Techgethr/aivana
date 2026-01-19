# Aivana - AI-Powered E-Commerce Platform with Arc Blockchain & USDC Payments

Aivana is a cutting-edge e-commerce platform that revolutionizes online shopping by combining advanced artificial intelligence with Arc blockchain technology for secure, transparent transactions using USDC. Our platform enables seamless, intelligent commerce experiences while leveraging blockchain's security and transparency benefits.

## Key Features

- **AI Sales Assistant**: Advanced conversational agent powered by OpenAI models that helps customers find products, recommends items, and guides them through purchases with natural language interactions
- **Arc Blockchain Integration**: Secure, transparent payment processing using Arc blockchain technology with smart contracts for trustless transactions
- **USDC Payments**: Accept payments in USDC stablecoin for reduced volatility and faster settlement times
- **Intelligent Product Discovery**: AI-powered search and recommendation system that understands customer needs and preferences
- **Real-time Inventory Management**: Automated stock tracking with blockchain-verified transactions
- **Marketplace Management**: Comprehensive seller dashboard for product management, inventory tracking, and sales analytics
- **Secure Authentication**: JWT-based authentication system with blockchain-verified identities
- **Smart Contract Integration**: Automated escrow and payment release mechanisms using smart contracts

## Architecture

### Backend
- **Framework**: Node.js with Express.js for scalable server architecture
- **Database**: Supabase PostgreSQL with vector search capabilities for semantic product matching
- **AI Integration**: OpenAI models with custom tool integration for e-commerce operations
- **Blockchain**: Arc blockchain integration via Viem for secure, low-cost transactions
- **Cryptocurrency**: USDC (USD Coin) stablecoin integration for reliable payment processing

### Frontend
- **Template Engine**: EJS for server-side rendering with dynamic content
- **Styling**: Custom CSS with responsive design for optimal mobile and desktop experiences
- **Client-side Logic**: Vanilla JavaScript for enhanced user interactions

### AI Agent Architecture
- **Conversational Interface**: Natural language processing for intuitive shopping experiences
- **Multi-tool Orchestration**: Sophisticated tool calling for product search, cart management, and payment processing
- **Contextual Understanding**: Maintains conversation history for personalized shopping assistance
- **Semantic Search**: Vector-based product matching using OpenAI embeddings

## Blockchain & Cryptocurrency Integration

### Arc Blockchain
- **Low-Cost Transactions**: Leverages Arc's efficient consensus mechanism for minimal transaction fees
- **Fast Settlement**: Near-instantaneous payment confirmations compared to traditional blockchains
- **Environmental Sustainability**: Energy-efficient blockchain technology
- **Smart Contract Capabilities**: Automated payment processing and escrow services

### USDC Stablecoin
- **Price Stability**: Pegged to US Dollar to minimize cryptocurrency volatility
- **Global Accessibility**: Accessible worldwide without traditional banking infrastructure
- **Regulatory Compliance**: Fully compliant with financial regulations
- **Seamless Conversion**: Easy conversion between fiat and crypto currencies

### Payment Flow
1. Customer adds items to cart using AI assistant
2. AI verifies product availability and calculates total
3. Customer confirms payment via blockchain wallet
4. Transaction is verified on Arc blockchain
5. USDC is transferred to merchant account
6. Inventory is automatically updated
7. Order fulfillment begins

## Installation


1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
- `OPENAI_API_KEY`: Your OpenAI API key for AI agent functionality
- `OPENAI_MODEL`: OpenAI model to use for AI agent functionality
- `ARC_RPC_URL`: Arc blockchain RPC endpoint URL
- `WALLET_ADDRESS`: Merchant wallet address for receiving USDC payments
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `APP_HOST`: Application host URL (for product links)

## Configuration

### Database Setup
The application uses Supabase PostgreSQL database with vector search capabilities. The schema includes:
- Products table with vector embeddings for semantic search
- Cart sessions with blockchain transaction tracking
- Categories and inventory management
- Conversation history for AI agent context

### AI Agent Configuration
- OpenAI models for conversational commerce
- Custom tools for product search, cart management, and payment verification
- Semantic search using OpenAI embeddings for product matching
- Conversation history management for contextual responses

### Blockchain Configuration
Configure the following in your `.env` file:
- Arc blockchain RPC endpoint
- Merchant wallet address for receiving payments

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


#### AI Agent
- `POST /api/ai/chat` - Chat with AI agent for product discovery and cart management
- `GET /api/ai/conversation/:sessionId` - Get conversation history



## AI Agent Capabilities

### Product Discovery
- Natural language product search
- Semantic matching using vector embeddings
- Category-based product exploration
- Personalized recommendations

### Cart Management
- Add/remove items from cart
- View cart contents and totals
- Update quantities and special instructions
- Apply discounts or promotional codes

### Payment Processing
- Verify blockchain transactions
- Confirm USDC payments
- Track payment status (pending/paid)
- Generate payment instructions

### Multi-step Workflows
- Product search → Product details → Add to cart
- Category exploration → Product selection → Purchase
- Cart review → Payment verification → Order confirmation

## Security Features

- **Blockchain Verification**: All payments verified on Arc blockchain
- **Input Validation**: Sanitization and validation of all user inputs
- **HTTP Security**: Helmet.js for security headers
- **CORS Protection**: Configured for secure cross-origin requests
- **Private Key Security**: Environment-based storage for blockchain keys

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

For production deployment:
1. Securely configure environment variables
2. Set up production Supabase database
3. Configure SSL certificates
4. Use a process manager like PM2
5. Monitor blockchain transaction confirmations
6. Set up automated inventory updates


## License

This project is licensed under the MIT License.

## Support

For support with AI agent functionality, blockchain integration, or USDC payments, please open an issue in the repository or contact the development team.
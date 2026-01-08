# layR - Premium Code Repository Marketplace

A decentralized marketplace for discovering, sharing, and monetizing high-quality code repositories. Built with modern web technologies and blockchain integration.

## 🚀 Features

- **Repository Marketplace**: Browse and discover premium code repositories
- **Privy Authentication**: Email and social login for user accounts
- **Movement Wallet Integration**: Connect Petra or Razor wallet for transactions
- **Payment System**: Direct peer-to-peer payments on Movement blockchain (Aptos-based)
- **On-Chain Access Control**: Trustless access verification via Movement smart contracts
- **User Profiles**: Showcase your projects with detailed stats and analytics
- **Project Management**: Upload, manage, and monetize your code repositories
- **Dark Theme**: GitHub-inspired black/white/neutral aesthetic with glass morphism
- **Real-time Data**: MongoDB-backed API with full CRUD operations
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Privy** for authentication (email/social)
- **Aptos Wallet Adapter** for Movement wallet integration

### Backend
- **Node.js** with Express
- **TypeScript**
- **MongoDB** with Mongoose ODM
- **MongoDB Atlas** for cloud database

### Blockchain
- **Movement** blockchain (Aptos-based, Chain ID: 250)
- **Aptos SDK** for blockchain interactions
- **Movement Smart Contracts** (Move language)
- **Petra Wallet** and **Razor Wallet** support

## 📦 Project Structure

```
layR/
├── src/                      # Frontend source
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── homepage/       # Landing page components
│   │   ├── layout/         # Layout components (Header, Footer)
│   │   ├── repository/     # Repository card components
│   │   ├── ui/             # shadcn/ui components
│   │   └── wallet/         # Wallet components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   └── main.tsx            # App entry point
├── server/                  # Backend source
│   └── src/
│       ├── db/             # Database connection
│       ├── models/         # Mongoose models
│       └── routes/         # API routes
└── public/                 # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Privy account (for wallet integration)

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd layR
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Environment Setup**

Copy the example files and fill in your values:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

#### Frontend Environment Variables (`.env`)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_PRIVY_APP_ID` | Your Privy application ID | Yes | `cmjsp6eev015pk00cfg0sp2qc` |
| `VITE_API_URL` | Backend API URL | Yes | `http://localhost:3001` |
| `VITE_MOVEMENT_CHAIN_ID` | Movement blockchain chain ID | Yes | `250` (testnet) |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |

#### Backend Environment Variables (`server/.env`)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | Yes | `3001` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | `http://localhost:5173` |
| `MOVEMENT_RPC_URL` | Movement blockchain RPC endpoint | Yes | `https://testnet.movementnetwork.xyz/v1` |
| `MOVEMENT_CHAIN_ID` | Movement blockchain chain ID | Yes | `250` (testnet) |
| `MOVEMENT_CONTRACT_ADDRESS` | Deployed access control contract address | Yes | `0x...` |
| `MOVEMENT_ADMIN_PRIVATE_KEY` | Admin private key for granting access | Yes | `0x...` |
| `X402_FACILITATOR_URL` | x402 payment facilitator URL | Yes | `https://facilitator.stableyard.fi` |
| `VIEW_PRICE_MOVE` | Price for view access (in smallest unit, 8 decimals) | Yes | `50000000` (0.5 MOVE) |
| `DOWNLOAD_PRICE_MOVE` | Price for download access (in smallest unit, 8 decimals) | Yes | `100000000` (1 MOVE) |

**Important Notes:**
- **MOVEMENT_ADMIN_PRIVATE_KEY**: Keep this secure! Never commit to version control. This key is used to sign transactions that grant on-chain access.
- **Pricing**: MOVE token uses 8 decimals. `50000000` = 0.5 MOVE, `100000000` = 1 MOVE
- **Contract Address**: You must deploy the Movement access control contract first and use its address
- **Network**: Start with Movement testnet before deploying to mainnet
- **Payment Flow**: Payments go directly to project owners (peer-to-peer), not to a centralized address

4. **Start Development Servers**

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

Frontend: http://localhost:8080
Backend: http://localhost:3001

## 💰 Payment Integration Setup

### Movement Blockchain Configuration

1. **Get Testnet Tokens**
   - Visit the faucet: https://faucet.testnet.movementnetwork.xyz/
   - Request testnet MOVE tokens for your wallet
   - Use the explorer to verify: https://explorer.movementnetwork.xyz/?network=bardock+testnet

2. **Deploy Access Control Contract**
   - Deploy the `layr::access` Move contract to Movement testnet
   - Note the contract address for `MOVEMENT_CONTRACT_ADDRESS`
   - Testnet Chain ID: **250**
   - RPC URL: **https://testnet.movementnetwork.xyz/v1**

3. **Configure Admin Account**
   - Create or use an existing Movement wallet
   - Fund it with testnet MOVE tokens from the faucet
   - Export the private key for `MOVEMENT_ADMIN_PRIVATE_KEY`
   - Use the address for `MOVEMENT_PAY_TO` (payment recipient)

4. **Test Payment Flow**
   - Use Movement testnet first
   - Test payment initiation, signing, and verification
   - Verify on-chain access grants work correctly
   - Monitor transactions on Movement explorer: https://explorer.movementnetwork.xyz/?network=bardock+testnet

5. **Security Checklist**
   - ✅ Admin private key stored in environment variable only
   - ✅ Never commit `.env` files to version control
   - ✅ Use different keys for testnet and mainnet
   - ✅ Regularly rotate admin keys
   - ✅ Monitor admin account balance for gas

### x402 Protocol

The system uses x402 (HTTP 402 Payment Required) protocol for payment flow:
- Payment requests are initiated through x402 middleware
- Users sign transactions with Privy embedded wallets
- **Payments go directly to project owners** (peer-to-peer marketplace)
- Payments are verified on Movement blockchain
- Access is granted via smart contract calls

**Key Feature:** Unlike traditional marketplaces, layR operates as a true peer-to-peer platform where creators receive payments directly without intermediaries or platform fees.

## 🗄️ Database Models

### User
- Wallet address (primary identifier)
- Privy ID
- Email (optional)
- Profile metadata

### Project
- Title, slug, descriptions
- Owner wallet address
- Pricing (view/download)
- Technologies, category
- Images, preview, demo URL
- Stats (stars, forks, downloads)
- Publication status

### Access
- Project access control
- View/download permissions
- Transaction references

### Transaction
- Purchase records
- Blockchain transaction hashes
- Status tracking

## 🎨 Design System

- **Font**: Rubik (headings), Inter (body)
- **Colors**: Black background, white text, neutral grays
- **Components**: Glass morphism with backdrop blur
- **Borders**: Sharp edges (minimal border-radius)
- **Style**: GitHub-inspired minimalist aesthetic

## 📱 Pages

- `/` - Homepage (landing page for non-authenticated users)
- `/repositories` - Explore projects
- `/repository/:slug` - Project details
- `/repositories/new` - Add new project (protected)
- `/profile/:username` - User profile with stats
- `/login` - Authentication
- `/signup` - Registration
- `/admin` - Admin panel (protected)

## 🔐 Authentication

Uses Privy for wallet-based authentication:
- Embedded Ethereum wallets
- Email + wallet creation
- Automatic wallet generation on signup
- Sepolia testnet by default

## 🌐 API Endpoints

### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/slug/:slug` - Get project by slug
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Users
- `POST /api/users/sync` - Sync user with Privy
- `GET /api/users/:walletAddress` - Get user by wallet

### Access
- `GET /api/access/check` - Check access permissions
- `POST /api/access/grant` - Grant access
- `GET /api/access/user/:walletAddress` - Get user access

### Transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id/confirm` - Confirm transaction
- `GET /api/transactions/user/:walletAddress` - Get user transactions
- `GET /api/transactions/project/:projectId` - Get project transactions

### Payments (x402 + Movement)
- `POST /api/payments/initiate` - Initiate payment for repository access
- `POST /api/payments/verify` - Verify payment and grant on-chain access
- `GET /api/payments/check-access/:projectId` - Check user access (queries on-chain state)

## 🧪 Development

### Code Style
- TypeScript strict mode
- ESLint for linting
- Prettier for formatting

### Key Hooks
- `useAuth()` - Authentication state
- `useWallet()` - Wallet operations
- `useProjects()` - Fetch projects
- `useProject()` - Fetch single project

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Ethereum

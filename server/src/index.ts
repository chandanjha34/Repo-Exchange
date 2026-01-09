import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, isDBConnected } from './db/connection';
import { usersRouter, projectsRouter, accessRouter, transactionsRouter, paymentsRouter } from './routes';
import { paywallMiddleware } from './middleware/paywall';
import { movementService } from './services/movement';
import { bountyRouter } from './routes/bounty';


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",

];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Use regex instead of "*" to fix "path-to-regexp" error
app.options(/.*/, cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDBConnected() ? 'connected' : 'disconnected',
    blockchain: movementService.isServiceConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use(paywallMiddleware);
// API Routes
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/access', accessRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/bounty', bountyRouter);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
async function start() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Movement blockchain
    const rpcUrl = process.env.MOVEMENT_RPC_URL || 'https://testnet.movementnetwork.xyz/v1';
    const chainId = parseInt(process.env.MOVEMENT_CHAIN_ID || '250', 10);

    console.log('[Movement] Connecting to Movement network...');
    await movementService.connect(rpcUrl, chainId);
    console.log('[Movement] Connected to Movement network');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();

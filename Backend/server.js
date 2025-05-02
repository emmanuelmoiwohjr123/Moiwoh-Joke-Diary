import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv"
import sequelize from './config/database.js';
// Import models to ensure they are initialized before routes
import './models/index.js';
import authRoutes from './routes/authRoutes.js';
import jokeRoutes from './routes/jokeRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';

dotenv.config();
 const app = express()
const SESSION_SECRET= process.env.SESSION_SECRET;
if(!SESSION_SECRET){
  console.log("Session id is mission");
  process.exit(1);
}

const { Pool } = pg;

// Create a new PostgreSQL pool with explicit credentials
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST, 
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT,
max: 10,
idleTimeoutMillis: 20000
});

// Initialize the session store with the pool
const PgSession = connectPgSimple(session);


// Middleware
// CORS configuration must come first
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security middleware
app.use(helmet());

// Session configuration
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  name: 'sessionId',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/',
    domain: 'localhost'
  }
}));

// Enable request logging in development
// app.use(morgan('dev'));

// Session configuration


// Routes
app.use('/api/auth/', authRoutes);
app.use('/api', jokeRoutes);
app.use('/api', commentRoutes);

const PORT = process.env.PORT || 4000;

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Database connected: ${process.env.DB_NAME}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
  });

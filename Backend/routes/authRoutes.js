import express from 'express';
import { register, login, logout, checkAuth } from '../controllers/authController.js';
const authRoutes = express.Router();

// User registration and authentication
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.get('/check', checkAuth);

export default authRoutes;
import express from 'express';
import { signUp, login} from '../controllers/authController.js';
const authRoutes = express.Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", login);


export default authRoutes; 
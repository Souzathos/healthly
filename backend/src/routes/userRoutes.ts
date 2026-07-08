import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const userRoutes = Router()
const auth = new AuthController()

userRoutes.post('/register', auth.register.bind(auth))
userRoutes.post('/login', auth.login.bind(auth))

export default userRoutes
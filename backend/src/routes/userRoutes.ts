import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { validateBody } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../schemas/authSchemas";

const userRoutes = Router()
const auth = new AuthController()
const user = new UserController()

userRoutes.post('/register', validateBody(registerSchema), auth.register.bind(auth))
userRoutes.post('/login', validateBody(loginSchema), auth.login.bind(auth))
userRoutes.get('/:id', user.profile.bind(user))

export default userRoutes

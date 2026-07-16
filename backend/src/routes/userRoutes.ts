import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { validateBody } from "../middlewares/validate";
import { authMiddleware } from "../middlewares/authMiddleware";
import { registerSchema, loginSchema, updateUserSchema } from "../schemas/authSchemas";

const userRoutes = Router()
const auth = new AuthController()
const user = new UserController()

userRoutes.post('/register', validateBody(registerSchema), auth.register.bind(auth))
userRoutes.post('/login', validateBody(loginSchema), auth.login.bind(auth))

// Rotas do usuário logado (antes de /:id para não haver conflito)
userRoutes.get('/me', authMiddleware, user.me.bind(user))
userRoutes.put('/update', authMiddleware, validateBody(updateUserSchema), user.update.bind(user))
userRoutes.delete('/delete', authMiddleware, user.delete.bind(user))

userRoutes.get('/:id', user.profile.bind(user))

export default userRoutes

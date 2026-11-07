import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { validateBody, validateIds } from "../middlewares/validate";
import { authMiddleware } from "../middlewares/authMiddleware";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimit";
import { LoginDTO, RegisterDTO, UpdateUserDTO } from "../dtos/user";

const userRoutes = Router()
const auth = new AuthController()
const user = new UserController()

userRoutes.post('/register', registerLimiter, validateBody(RegisterDTO), auth.register.bind(auth))
userRoutes.post('/login', loginLimiter, validateBody(LoginDTO), auth.login.bind(auth))

// Rotas do usuário logado (antes de /:id para não haver conflito)
userRoutes.get('/me', authMiddleware, user.me.bind(user))
userRoutes.put('/update', authMiddleware, validateBody(UpdateUserDTO), user.update.bind(user))
userRoutes.delete('/delete', authMiddleware, user.delete.bind(user))

userRoutes.get('/:id', validateIds('id'), user.profile.bind(user))

export default userRoutes

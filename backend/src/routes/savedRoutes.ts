import { Router } from "express";
import { SavedPostController } from "../controllers/SavedPostController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateIds } from "../middlewares/validate";

const savedRoutes = Router()
const saved = new SavedPostController()

savedRoutes.get('/', authMiddleware, saved.list.bind(saved))
savedRoutes.post('/:postId', validateIds('postId'), authMiddleware, saved.toggle.bind(saved))

export default savedRoutes

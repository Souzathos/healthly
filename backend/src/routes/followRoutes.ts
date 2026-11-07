import { Router } from "express";
import { FollowController } from "../controllers/FollowController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateIds } from "../middlewares/validate";

const followRoutes = Router()
const follow = new FollowController()

followRoutes.post('/:userId', validateIds('userId'), authMiddleware, follow.toggle.bind(follow))
followRoutes.get('/:userId/followers', validateIds('userId'), follow.followers.bind(follow))
followRoutes.get('/:userId/following', validateIds('userId'), follow.following.bind(follow))

export default followRoutes

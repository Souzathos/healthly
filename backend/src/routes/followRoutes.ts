import { Router } from "express";
import { FollowController } from "../controllers/FollowController";
import { authMiddleware } from "../middlewares/authMiddleware";

const followRoutes = Router()
const follow = new FollowController()

followRoutes.post('/:userId', authMiddleware, follow.toggle.bind(follow))
followRoutes.get('/:userId/followers', follow.followers.bind(follow))
followRoutes.get('/:userId/following', follow.following.bind(follow))

export default followRoutes

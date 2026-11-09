import { Request, Response } from "express";
import { NotificationService } from "../services/NotificationService";
import { getPagination } from "../utils/pagination";

export class NotificationController {
    private service = new NotificationService()

    async list(req: Request, res: Response) {
        const notifications = await this.service.list(req.user!.id, getPagination(req))

        return res.status(200).json(notifications)
    }

    async unreadCount(req: Request, res: Response) {
        return res.status(200).json(await this.service.unreadCount(req.user!.id))
    }

    async markRead(req: Request, res: Response) {
        return res.status(200).json(await this.service.markRead(Number(req.params.id), req.user!.id))
    }

    async markAllRead(req: Request, res: Response) {
        return res.status(200).json(await this.service.markAllRead(req.user!.id))
    }
}

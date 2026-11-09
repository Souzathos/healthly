import { Request, Response } from "express";
import { MessageService } from "../services/MessageService";
import { getPagination } from "../utils/pagination";

export class MessageController {
    private service = new MessageService()

    async list(req: Request, res: Response) {
        return res.status(200).json(await this.service.list(req.user!.id, getPagination(req)))
    }

    async open(req: Request, res: Response) {
        return res.status(200).json(await this.service.open(req.user!.id, Number(req.params.userId)))
    }

    async messages(req: Request, res: Response) {
        const messages = await this.service.messages(Number(req.params.id), req.user!.id, getPagination(req))
        return res.status(200).json(messages)
    }

    async send(req: Request, res: Response) {
        const message = await this.service.send(Number(req.params.id), req.user!.id, req.body.text)
        return res.status(201).json(message)
    }

    async markRead(req: Request, res: Response) {
        return res.status(200).json(await this.service.markRead(Number(req.params.id), req.user!.id))
    }

    async unreadCount(req: Request, res: Response) {
        return res.status(200).json(await this.service.unreadCount(req.user!.id))
    }
}

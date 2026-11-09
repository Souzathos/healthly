import { Request, Response } from "express";
import { ProfessionalService } from "../services/ProfessionalService";

export class ProfessionalController {
    private service = new ProfessionalService()

    async create(req: Request, res: Response) {
        const request = await this.service.create(req.user!.id, req.body, req.file)
        return res.status(201).json(request)
    }

    async mine(req: Request, res: Response) {
        return res.status(200).json({request: await this.service.mine(req.user!.id)})
    }

    async listPending(_req: Request, res: Response) {
        return res.status(200).json(await this.service.listPending())
    }

    async review(req: Request, res: Response) {
        const result = await this.service.review(Number(req.params.id), req.user!.id, req.body.approve)
        return res.status(200).json(result)
    }
}

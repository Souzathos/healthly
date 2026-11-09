import { Router } from "express";
import { ProfessionalController } from "../controllers/ProfessionalController";
import { CreateProfessionalRequestDTO, ReviewProfessionalRequestDTO } from "../dtos/professional";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadDocument } from "../middlewares/upload";
import { validateBody, validateIds } from "../middlewares/validate";

const professionalRoutes = Router()
const professional = new ProfessionalController()

professionalRoutes.use(authMiddleware)

// Profissional pede o selo
professionalRoutes.post('/requests', uploadDocument, validateBody(CreateProfessionalRequestDTO), professional.create.bind(professional))
professionalRoutes.get('/requests/me', professional.mine.bind(professional))

// Admin analisa
professionalRoutes.get('/requests/pending', adminMiddleware, professional.listPending.bind(professional))
professionalRoutes.patch('/requests/:id', validateIds('id'), adminMiddleware, validateBody(ReviewProfessionalRequestDTO), professional.review.bind(professional))

export default professionalRoutes

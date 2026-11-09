import { ProfessionalRequest } from "../models/ProfessionalRequest";
import { UserMapper } from "./UserMapper";

export class ProfessionalRequestMapper {
    // Visão de quem pediu: sem o documento
    static toResponse(request: ProfessionalRequest) {
        return {
            id: request.id,
            type: request.type,
            registryNumber: request.registryNumber,
            status: request.status,
            reviewedAt: request.reviewedAt,
            createdAt: request.createdAt
        }
    }

    // Visão do admin: com quem pediu e a foto do documento para conferir
    static toAdminResponse(request: ProfessionalRequest) {
        return {
            ...ProfessionalRequestMapper.toResponse(request),
            user: UserMapper.toPublic(request.user),
            document: `data:${request.documentMimeType};base64,${request.document.toString('base64')}`
        }
    }
}

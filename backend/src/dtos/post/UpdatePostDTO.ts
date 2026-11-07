import { z } from "zod";
import { CreatePostDTO } from "./CreatePostDTO";

export const UpdatePostDTO = CreatePostDTO.partial()

export type UpdatePostDTO = z.infer<typeof UpdatePostDTO>

    import { User } from "../../models/User";
    import { Post } from "../../models/Post";

    declare global {
        namespace Express {
            interface Request {
                user?: { id: number; email: string };
                post?: Post;
            }
        }
    }
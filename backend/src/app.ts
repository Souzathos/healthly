import express from "express";
import cors from "cors";
import helmet from "helmet";
import { allowedOrigins } from "./config/cors";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app = express()

// As imagens são carregadas por outra origem no Expo Web
app.use(helmet({crossOriginResourcePolicy: {policy: 'cross-origin'}}))
app.use(cors({origin: allowedOrigins()}))
app.use(express.json())
app.use(routes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app

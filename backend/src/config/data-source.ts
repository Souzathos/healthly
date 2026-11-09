import { DataSource } from "typeorm";
import { env } from "./env";
import { User } from "../models/User";
import { CommentLike } from "../models/CommentLike";
import { Post } from "../models/Post";
import {Like} from '../models/Like'
import { Comment } from "../models/Comment";
import { PostMedia } from "../models/PostMedia";
import { SavedPost } from "../models/SavedPost";
import { Follow } from "../models/Follow";
import { Notification } from "../models/Notification";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { ProfessionalRequest } from "../models/ProfessionalRequest";
import { Hashtag } from "../models/Hashtag";
import { Repost } from "../models/Repost";
import { InitialSchema1793919422850 } from "../migrations/1793919422850-InitialSchema";
import { Notifications1794254176446 } from "../migrations/1794254176446-Notifications";
import { Messages1794254752489 } from "../migrations/1794254752489-Messages";
import { Professionals1794255157775 } from "../migrations/1794255157775-Professionals";
import { Hashtags1794255471842 } from "../migrations/1794255471842-Hashtags";
import { Reposts1794255766839 } from "../migrations/1794255766839-Reposts";

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    // Painéis de variáveis às vezes guardam as quebras de linha do certificado como "\n"
    ssl: env.DB_SSL_CA ? {ca: env.DB_SSL_CA.replace(/\\n/g, '\n')} : undefined,
    entities: [User, Comment, CommentLike, Like, Post, PostMedia, SavedPost, Follow, Notification, Conversation, Message, ProfessionalRequest, Hashtag, Repost],
    migrations: [InitialSchema1793919422850, Notifications1794254176446, Messages1794254752489, Professionals1794255157775, Hashtags1794255471842, Reposts1794255766839],
    migrationsRun: true,
    synchronize: false,
    logging: false
})
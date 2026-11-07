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
import { InitialSchema1793919422850 } from "../migrations/1793919422850-InitialSchema";


export const AppDataSource = new DataSource({
    type: 'mysql',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    entities: [User, Comment, CommentLike, Like, Post, PostMedia, SavedPost, Follow],
    migrations: [InitialSchema1793919422850],
    migrationsRun: true,
    synchronize: false,
    logging: false
})
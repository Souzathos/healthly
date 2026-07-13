import { DataSource } from "typeorm";
import * as dotenv from 'dotenv'
import { User } from "../models/User";
import { CommentLike } from "../models/CommentLike";
import { Post } from "../models/Post";
import {Like} from '../models/Like'
import { Comment } from "../models/Comment";
import { PostMedia } from "../models/PostMedia";
import { SavedPost } from "../models/SavedPost";
import { Follow } from "../models/Follow";

dotenv.config()
export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Comment, CommentLike, Like, Post, PostMedia, SavedPost, Follow],
    synchronize: true,
    logging: false
})
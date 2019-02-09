import { PostSchema } from "./models";

export const getPostsResponseSchema = [PostSchema];
export const likePostResponseSchema = PostSchema;
export const unlikePostResponseSchema = PostSchema;

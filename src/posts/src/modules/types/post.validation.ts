

import {z} from "zod";

export const AddPostSchema= z.object({
    title : z
    .string()
    .trim()
    .min(10),

    description : z
    .string()
    .trim()
    .min(10)
})
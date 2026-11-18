
import { z } from 'zod';

export const AddPostSchema = z.object({
  title: z.string().trim().min(5),
  description: z.string().trim().min(10),
});

export type PostInput = z.infer<typeof AddPostSchema>;

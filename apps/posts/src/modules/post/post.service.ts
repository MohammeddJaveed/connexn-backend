import { and, desc, eq } from 'drizzle-orm';

import { db } from '../../db/index.ts';
import { posts } from '../../db/schema/post.ts';
import type { PostInput } from './types/post.validation.ts';

type PostCreateInput = PostInput;

export type PostRecord = {
  postId: string;
  title: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

class PostService {
  async createPost(data: PostCreateInput, userId: string): Promise<PostRecord> {
    const [post] = await db
      .insert(posts)
      .values({
        title: data.title.trim(),
        description: data.description.trim(),
        userId,
      })
      .returning();

    if (!post) {
      throw new Error('Unable to create post');
    }

    return post;
  }

  async getAllPosts(): Promise<PostRecord[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async getPostById(postId: string): Promise<PostRecord> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.postId, postId))
      .limit(1);

    if (!post) {
      const error = new Error('Post not found');
      Object.assign(error, { statusCode: 404 });
      throw error;
    }

    return post;
  }

  async updatePost(postId: string, userId: string, data: Partial<PostInput>): Promise<PostRecord> {
    const existingPost = await this.getPostById(postId);

    if (existingPost.userId !== userId) {
        console.log(existingPost.userId,"existPost")
        console.log(userId,"requestuserId")
      const error = new Error('You are not allowed to update this post');
      Object.assign(error, { statusCode: 403 });
      throw error;
    }

    const [updatedPost] = await db
      .update(posts)
      .set({
        title: data.title?.trim() ?? existingPost.title,
        description: data.description?.trim() ?? existingPost.description,
        updatedAt: new Date(),
      })
      .where(and(eq(posts.postId, postId), eq(posts.userId, userId)))
      .returning();

    if (!updatedPost) {
      throw new Error('Unable to update post');
    }

    return updatedPost;
  }

  async deletePost(postId: string, userId: string): Promise<{ postId: string }> {
    const existingPost = await this.getPostById(postId);

    if (existingPost.userId !== userId) {
      const error = new Error('You are not allowed to delete this post');
      Object.assign(error, { statusCode: 403 });
      throw error;
    }

    const [deletedPost] = await db
      .delete(posts)
      .where(and(eq(posts.postId, postId), eq(posts.userId, userId)))
      .returning({ postId: posts.postId });

    if (!deletedPost) {
      throw new Error('Unable to delete post');
    }

    return deletedPost;
  }
}

export const postService = new PostService();

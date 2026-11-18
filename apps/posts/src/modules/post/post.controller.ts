import type { NextFunction, Request, Response } from 'express';

import { postService } from './post.service.ts';
import { AddPostSchema } from './types/post.validation.ts';

const getUserId = (req: Request): string => {
  const userId =
    typeof req.headers['x-user-id'] === 'string'
      ? req.headers['x-user-id']
      : req.body?.userId;

  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  return userId;
};

export class PostController {
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = AddPostSchema.parse(req.body);
      const userId = getUserId(req);
      const post = await postService.createPost(payload, userId);

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const posts = await postService.getAllPosts();
      res.status(200).json({
        success: true,
        message: 'Posts fetched successfully',
        posts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
      const post = await postService.getPostById(postId);

      res.status(200).json({
        success: true,
        message: 'Post fetched successfully',
        post,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
      const userId = getUserId(req);
      const payload = AddPostSchema.partial().parse(req.body);
      const post = await postService.updatePost(postId, userId, payload);

      res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        post,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
      const userId = getUserId(req);
      const result = await postService.deletePost(postId, userId);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
        postId: result.postId,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();

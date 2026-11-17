import { Router } from 'express';

import { postController } from './post.controller.ts';

const router = Router();

router.get('/', (req, res, next) => postController.getPosts(req, res, next));
router.post('/', (req, res, next) => postController.createPost(req, res, next));
router.get('/:postId', (req, res, next) => postController.getPostById(req, res, next));
router.put('/:postId', (req, res, next) => postController.updatePost(req, res, next));
router.delete('/:postId', (req, res, next) => postController.deletePost(req, res, next));

export default router;

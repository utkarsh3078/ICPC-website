import { Request, Response } from 'express';
import * as blogService from '../services/blogService';
import { success, fail } from '../utils/response';

export const create = async (req: any, res: Response) => {
  try {
    const authorId = req.user.id;
    const blog = await blogService.createBlog(authorId, req.body);
    success(res, blog, 201);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const approve = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await blogService.approveBlog(id, true);
    success(res, blog);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const listPending = async (req: Request, res: Response) => {
  try {
    const blogs = await blogService.listPending();
    success(res, blogs);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const comment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { comment } = req.body;
    const b = await blogService.addComment(id, userId, comment);
    success(res, b);
  } catch (err: any) {
    fail(res, err.message);
  }
};

export const approveComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const b = await blogService.approveComment(id, commentId);
    success(res, b);
  } catch (err: any) {
    fail(res, err.message);
  }
};

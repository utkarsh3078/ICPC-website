import prisma from '../models/prismaClient';

export const createBlog = async (authorId: string, payload: any) => {
  return prisma.blog.create({ data: { authorId, ...payload } });
};

export const approveBlog = async (id: string, approved = true) => {
  return prisma.blog.update({ where: { id }, data: { approved } });
};

export const listPending = async () => {
  return prisma.blog.findMany({ where: { approved: false } });
};

export const addComment = async (blogId: string, userId: string, comment: string) => {
  const b = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!b) throw new Error('Blog not found');
  const comments = (b.comments as any[]) || [];
  const newComment = { id: `c_${Date.now()}`, userId, comment, approved: false, createdAt: new Date() };
  comments.push(newComment);
  return prisma.blog.update({ where: { id: blogId }, data: { comments } });
};

export const approveComment = async (blogId: string, commentId: string) => {
  const b = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!b) throw new Error('Blog not found');
  const comments = (b.comments as any[]) || [];
  const updated = comments.map((c: any) => (c.id === commentId ? { ...c, approved: true } : c));
  return prisma.blog.update({ where: { id: blogId }, data: { comments: updated } });
};

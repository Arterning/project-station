import { prisma } from './prisma';

// 检查用户是否为管理员
export async function isAdmin(userEmail: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((email) => email.trim()) || [];
  return adminEmails.includes(userEmail);
}

// 从Clerk用户ID获取用户邮箱并检查管理员权限
export async function checkAdminByClerkId(clerkId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { email: true },
    });

    if (!user) {
      return false;
    }

    return await isAdmin(user.email);
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

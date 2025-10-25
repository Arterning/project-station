import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkAdminByClerkId } from '@/lib/admin';

// GET /api/trends/check-admin - 检查当前用户是否为管理员
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkAdminByClerkId(userId);

    return NextResponse.json({ isAdmin });
  } catch (error: any) {
    console.error('Failed to check admin status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status', details: error.message },
      { status: 500 }
    );
  }
}

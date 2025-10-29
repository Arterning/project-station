import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// DELETE - 删除书签
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const { id } = await params

    // 查找书签
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
    })

    if (!bookmark) {
      return NextResponse.json({ error: '书签不存在' }, { status: 404 })
    }

    // 验证书签所有权
    if (bookmark.userId !== dbUser.id) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    // 不允许删除默认书签
    if (bookmark.isDefault) {
      return NextResponse.json(
        { error: '不能删除默认书签' },
        { status: 400 }
      )
    }

    // 删除书签
    await prisma.bookmark.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete bookmark:', error)
    return NextResponse.json(
      { error: '删除书签失败' },
      { status: 500 }
    )
  }
}

import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NavigatorContent } from './navigator-content'

export default async function NavigatorPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">创业导航</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          创业者常用网站和工具集合
        </p>
      </div>

      <Suspense fallback={<div>加载中...</div>}>
        <NavigatorContent userId={user.id} />
      </Suspense>
    </div>
  )
}

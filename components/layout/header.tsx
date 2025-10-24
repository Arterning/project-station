'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Rocket } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/projects" className="mr-6 flex items-center space-x-2">
            <Rocket className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              VenturePulse
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/projects"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              项目
            </Link>
            <Link
              href="/trends"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 text-zinc-500"
            >
              风向标
            </Link>
            <Link
              href="/keywords"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 text-zinc-500"
            >
              关键词追踪
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}

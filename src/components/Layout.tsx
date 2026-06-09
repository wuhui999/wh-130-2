import { NavLink, Outlet, useParams } from 'react-router-dom'
import { List, PenLine, Clock, Play, FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: List, label: '套路库' },
]

export default function Layout() {
  const { id } = useParams<{ id: string }>()

  const routineNavItems = id
    ? [
        { to: `/routine/${id}/edit`, icon: PenLine, label: '编辑' },
        { to: `/routine/${id}/rhythm`, icon: Clock, label: '节奏' },
        { to: `/routine/${id}/practice`, icon: Play, label: '练习' },
        { to: `/routine/${id}/export`, icon: FileJson, label: '导出' },
      ]
    : []

  return (
    <div className="flex h-screen bg-ink-900">
      <nav className="w-16 md:w-56 flex-shrink-0 bg-ink-800 border-r border-ink-700 flex flex-col">
        <div className="p-4 border-b border-ink-700">
          <h1 className="text-rice font-serif text-lg font-bold hidden md:block">太极节奏</h1>
          <span className="text-rice font-serif text-lg font-bold md:hidden">太</span>
        </div>
        <div className="flex-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  isActive
                    ? 'text-cinnabar bg-cinnabar/10 border-r-2 border-cinnabar'
                    : 'text-rice/60 hover:text-rice hover:bg-ink-700/50'
                )
              }
            >
              <item.icon size={18} />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
          {routineNavItems.length > 0 && (
            <>
              <div className="border-t border-ink-700 my-2 mx-4" />
              {routineNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                      isActive
                        ? 'text-jade bg-jade/10 border-r-2 border-jade'
                        : 'text-rice/60 hover:text-rice hover:bg-ink-700/50'
                    )
                  }
                >
                  <item.icon size={18} />
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </div>
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

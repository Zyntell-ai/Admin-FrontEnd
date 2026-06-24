import Sidebar from './Sidebar'
import TopNav from './TopNav'
import CommandCenter from '../ui/CommandCenter'
import { SidebarProvider, useSidebar } from '../../context/SidebarContext'

function LayoutInner({ title, children }) {
  const { collapsed } = useSidebar()
  const sidebarW      = collapsed ? 80 : 260

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--obsidian)' }}>
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden content-transition"
        style={{ marginLeft: sidebarW }}
      >
        <TopNav title={title} />
        <main className="flex-1 overflow-y-auto px-5 py-5 page-enter">
          {children}
        </main>
      </div>
      {/* Global AI Command Center (⌘J) */}
      <CommandCenter />
    </div>
  )
}

export default function Layout({ title, children }) {
  return (
    <SidebarProvider>
      <LayoutInner title={title}>{children}</LayoutInner>
    </SidebarProvider>
  )
}

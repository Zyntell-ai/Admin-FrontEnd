import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function Layout({ title, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-navy">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden ml-[220px]">
        <TopNav title={title} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}

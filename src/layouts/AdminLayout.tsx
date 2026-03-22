import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/dashboard/AdminSidebar'

function AdminLayout() {
  return (
    <main className="min-h-screen w-full px-3 py-4 sm:px-4 lg:px-5">
      <div className="grid w-full gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <AdminSidebar />
        <section className="min-w-0 space-y-5">
          <Outlet />
        </section>
      </div>
    </main>
  )
}

export default AdminLayout

// src/components/Layout.tsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menubar } from 'primereact/menubar'
import { PrimeReactProvider } from 'primereact/api'
import type { MenuItem } from 'primereact/menuitem'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import { useEffect } from 'react'



export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const items: MenuItem[] = [
    {
      label: 'Busqueda Folios',
      icon: 'pi pi-search',
      command: () => navigate('/'),
      className: location.pathname === '/' ? 'active-route' : ''
    },
    {
      label: 'Reporte Excel',
      icon: 'pi pi-book',
      command: () => navigate('/ReporteExcel'),
      className: location.pathname === '/ReporteExcel' ? 'active-route' : ''
    },
  ]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname]);

  

  return (
    <PrimeReactProvider>
      <div className="card">
        <Menubar  model={items} />
       
      </div>

       <div className="content">
          <Outlet />
        </div>
    </PrimeReactProvider>
  )
}
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Pipeline', path: '/' },
  { label: 'Clientes', path: '/clientes' },
  { label: 'Propostas', path: '/propostas' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Topbar */}
      <header className="bg-[#b61b24] text-white px-6 py-0 flex items-center justify-between h-12">
        <div className="flex items-center gap-6">
          <span className="font-black text-lg tracking-tight">brooks</span>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-3 text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-[#9a1720] font-medium'
                    : 'hover:bg-[#9a1720] opacity-90'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">{usuario?.nombre}</span>
          <button
            onClick={logout}
            className="text-xs opacity-70 hover:opacity-100 border border-white/30 px-3 py-1 rounded"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
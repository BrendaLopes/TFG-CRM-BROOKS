import { useAuth } from '../context/AuthContext'

export default function PipelinePage() {
  const { usuario, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="font-black text-gray-800 text-lg">brooks CRM</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{usuario?.nombre}</span>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
        </div>
      </div>
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">Pipeline comercial</h1>
        <p className="text-gray-500 mt-1">Em construção...</p>
      </div>
    </div>
  )
}
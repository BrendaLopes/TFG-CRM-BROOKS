import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import PipelinePage from './pages/PipelinePage'
import NuevoLeadPage from './pages/NuevoLeadPage'
import OportunidadPage from './pages/OportunidadPage'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setChecking(false)
  }, [isAuthenticated])

  if (checking) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><PipelinePage /></PrivateRoute>} />
      <Route path="/nuevo-lead" element={<PrivateRoute><NuevoLeadPage /></PrivateRoute>} />
      <Route path="/oportunidades/:id" element={<PrivateRoute><OportunidadPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
      
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import PipelinePage from './pages/PipelinePage'
import NuevoLeadPage from './pages/NuevoLeadPage'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><PipelinePage /></PrivateRoute>} />
      <Route path="/nuevo-lead" element={<PrivateRoute><NuevoLeadPage /></PrivateRoute>} />
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
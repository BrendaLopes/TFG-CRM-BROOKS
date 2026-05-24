import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.token, res.data.usuario)
      navigate('/')
    } catch {
      setError('Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md w-full max-w-sm overflow-hidden">
        
        {/* Header rojo Brooks */}
        <div className="bg-[#b61b24] px-8 py-8 text-center">
          <svg viewBox="0 0 512 225.77733" className="h-10 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1.3333333,0,0,-1.3333333,0,225.77733)">
              <g><g clipPath="url(#cp)">
                <g transform="translate(60.981,117.9106)"><path fill="white" d="m 0,0 c 9.308,0 16.556,-2.866 21.752,-8.597 5.196,-5.732 7.792,-12.57 7.792,-20.507 0,-7.838 -2.596,-14.626 -7.792,-20.354 C 16.556,-55.194 9.308,-58.055 0,-58.055 c -8.229,0 -15.432,2.592 -21.604,7.788 -6.172,5.191 -9.259,11.904 -9.259,20.138 v 45.183 h 16.903 v -45.183 c 0.49,-3.235 2.083,-5.881 4.777,-7.942 2.691,-2.055 5.755,-3.086 9.183,-3.086 4.018,0 7.203,1.372 9.556,4.116 2.353,2.742 3.527,5.931 3.527,9.557 0,3.523 -1.103,6.537 -3.307,9.034 -2.205,2.501 -5.466,3.752 -9.776,3.752 -2.546,0 -4.629,-0.175 -6.245,-0.517 -1.615,-0.342 -4.593,-1.791 -5.745,-3.154 v 15.683 c 1.678,0.801 3.667,1.674 6.479,2.169 C -3.788,-0.211 -1.962,0 0,0"/></g>
                <g transform="translate(123.0928,117.9106)"><path fill="white" d="m 0,0 v -14.698 c -4.701,0 -8.08,-0.859 -10.141,-2.573 -2.055,-1.714 -3.081,-4.243 -3.081,-7.567 v -31.745 h -15.436 v 31.745 c 0,8.228 2.227,14.423 6.69,18.589 C -17.51,-2.087 -10.19,0 0,0"/></g>
                <g transform="translate(278.0435,61.3447)"><path fill="white" d="m 0,0 -13.254,15.872 v -15.89 h -15.432 v 72.227 h 15.432 V 38.485 L 1.588,56.417 H 21.721 L -2.672,27.314 6.825,15.499 h 2.213 1.246 3.253 c 4.522,0.314 9.29,1.813 11.36,6.218 2.182,4.652 1.48,9.907 2.083,14.865 0.54,4.427 1.763,8.935 4.211,12.705 3.086,4.755 10.703,7.13 22.855,7.13 V 40.253 c -4.994,0 -8.063,-0.909 -9.188,-2.722 C 43.734,35.718 42.803,31.579 42.069,25.11 41.269,18.05 38.866,7.388 31.987,3.662 29.711,2.43 27.236,1.358 24.699,0.823 21.096,0.059 17.397,-0.207 13.722,-0.176 9.15,-0.131 4.575,-0.059 0,0"/></g>
                <g transform="translate(157.7163,118.8423)"><path fill="white" d="m 0,0 c -16.178,2.429 -31.263,-8.728 -33.688,-24.906 -2.425,-16.188 8.728,-31.269 24.911,-33.694 10.59,-1.583 20.695,2.654 27.106,10.303 l 2.803,-2.349 -3.15,13.483 -9.551,0.706 -4.625,0.343 3.073,-2.578 c -3.176,-3.802 -8.184,-5.912 -13.442,-5.124 -8.018,1.201 -13.547,8.675 -12.346,16.692 1.201,8.021 8.679,13.546 16.696,12.345 8.017,-1.201 13.546,-8.674 12.345,-16.696 C 9.97,-32.55 9.691,-33.58 9.317,-34.561 l 10.245,-0.756 1.952,-8.373 c 1.677,3.019 2.856,6.384 3.395,10.002 C 27.339,-17.505 16.183,-2.42 0,0"/></g>
                <g transform="translate(211.437,60.2422)"><path fill="white" d="M 0,0 C 16.183,-2.42 31.272,8.729 33.692,24.912 36.117,41.095 24.965,56.18 8.782,58.604 -1.809,60.188 -11.918,55.95 -18.324,48.297 l -2.803,2.353 3.145,-13.483 9.555,-0.706 4.625,-0.342 -3.072,2.578 c 3.172,3.801 8.187,5.911 13.442,5.124 C 14.586,42.62 20.11,35.147 18.909,27.125 17.708,19.107 10.235,13.583 2.218,14.784 c -8.022,1.201 -13.546,8.675 -12.345,16.692 0.162,1.08 0.44,2.11 0.814,3.091 l -10.24,0.755 -1.957,8.373 c -1.677,-3.023 -2.856,-6.384 -3.4,-10.001 C -27.335,17.51 -16.178,2.425 0,0"/></g>
                <g transform="translate(255.0854,39.5293)"><path fill="white" d="m 0,0 h -1.813 v -4.301 h 1.912 c 1.057,0 1.782,0.086 2.16,0.247 0.378,0.167 0.679,0.419 0.913,0.775 0.229,0.346 0.342,0.719 0.342,1.125 0,0.413 -0.121,0.791 -0.365,1.133 C 2.906,-0.675 2.564,-0.418 2.114,-0.252 1.669,-0.085 0.968,0 0,0 M -0.144,5.804 H -1.813 V 1.728 h 1.292 c 1.034,0 1.772,0.198 2.208,0.589 0.437,0.396 0.657,0.909 0.657,1.538 0,1.301 -0.832,1.949 -2.488,1.949 M 0.832,-6.028 H -3.757 V 7.531 h 3.555 c 1.12,0 1.993,-0.148 2.618,-0.45 C 3.046,6.78 3.522,6.366 3.855,5.84 4.184,5.309 4.351,4.701 4.351,4.009 4.351,2.677 3.657,1.719 2.281,1.143 3.271,0.958 4.058,0.554 4.643,-0.076 5.232,-0.701 5.524,-1.457 5.524,-2.33 5.524,-3.019 5.345,-3.64 4.989,-4.184 4.634,-4.724 4.112,-5.169 3.424,-5.511 2.73,-5.853 1.872,-6.028 0.832,-6.028"/></g>
                <g transform="translate(227.1245,39.2461)"><path fill="white" d="M 0,0 -2.187,4.913 -4.211,0 Z m -2.848,7.892 h 1.364 L 4.594,-5.745 H 2.609 l -1.808,4.022 h -5.785 l -1.697,-4.022 h -1.993 z"/></g>
                <g transform="translate(245.2915,47.0605)"><path fill="white" d="m 0,0 h 1.812 v -13.56 h -1.947 v 10.55 l -4.171,-5.241 h -0.359 l -4.221,5.241 v -10.55 h -1.938 V 0 h 1.84 l 4.503,-5.569 z"/></g>
                <path fill="white" d="m 263.845,47.061 h 1.938 v -13.56 h -1.938 z"/>
                <g transform="translate(270.0981,47.0605)"><path fill="white" d="M 0,0 H 7.685 V -1.728 H 1.939 V -5.862 H 7.491 V -7.599 H 1.939 v -4.214 h 5.93 v -1.729 H 0 Z"/></g>
                <g transform="translate(292.1118,47.0605)"><path fill="white" d="M 0,0 H 1.845 V -13.56 H 0.175 L -8.89,-3.113 V -13.56 h -1.827 V 0 h 1.575 L 0,-10.532 Z"/></g>
                <g transform="translate(297.0063,47.083)"><path fill="white" d="M 0,0 H 11.328 V -1.728 H 6.6 V -13.582 H 4.652 v 11.854 l -4.652,0 z"/></g>
                <g transform="translate(316.6665,39.2461)"><path fill="white" d="M 0,0 -2.19,4.913 -4.22,0 Z m -2.856,7.892 h 1.367 L 4.589,-5.745 H 2.601 l -1.804,4.022 h -5.786 l -1.697,-4.022 h -1.992 z"/></g>
                <g transform="translate(324.0454,47.0605)"><path fill="white" d="M 0,0 H 1.938 V -11.792 H 8.044 V -13.56 H 0 Z"/></g>
              </g></g>
            </g>
          </svg>
          <p className="text-white text-xs opacity-80 mt-1">Sistema de Gestão Comercial</p>
        </div>

        {/* Formulario */}
        <div className="px-8 py-8">
          <p className="text-gray-600 text-sm mb-6 text-center">Bem-vindo, faça seu login</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Usuário</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b61b24] text-white rounded py-2 text-sm font-medium hover:bg-[#9a1720] disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 px-8 py-3 text-center">
          <p className="text-xs text-gray-400">Brooks Ambiental © 2026</p>
        </div>
      </div>
    </div>
  )
}
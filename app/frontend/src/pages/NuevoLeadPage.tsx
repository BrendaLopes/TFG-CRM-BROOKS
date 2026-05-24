import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function NuevoLeadPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [duplicado, setDuplicado] = useState(false)
  const [form, setForm] = useState({
    nombreEmpresa: '',
    canalEntrada: 'WHATSAPP',
    descripcionInicial: '',
    contactoNombre: '',
    contactoTelefono: '',
    contactoEmail: '',
    municipio: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/leads', form)
      if (res.data.posibleDuplicado) {
        setDuplicado(true)
        setLoading(false)
        return
      }
      navigate('/')
    } catch {
      setError('Erro ao registrar lead. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Pipeline
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-800">Registrar novo lead</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-6">Preencha os dados do contato e a origem da entrada.</p>

          {duplicado && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800 mb-1">⚠️ Possível duplicado detectado</p>
              <p className="text-sm text-yellow-700 mb-3">Já existe um registro com nome similar. Deseja continuar mesmo assim?</p>
              <div className="flex gap-2">
                <button onClick={async () => { await api.post('/leads', form); navigate('/') }}
                  className="bg-yellow-600 text-white px-4 py-1.5 rounded text-sm hover:bg-yellow-700">
                  Sim, registrar mesmo assim
                </button>
                <button onClick={() => setDuplicado(false)}
                  className="border border-gray-300 px-4 py-1.5 rounded text-sm hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Dados do contato</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome da empresa *</label>
                  <input name="nombreEmpresa" value={form.nombreEmpresa} onChange={handleChange} required
                    placeholder="Ex: Metalúrgica Souza Ltda."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome do contato</label>
                  <input name="contactoNombre" value={form.contactoNombre} onChange={handleChange}
                    placeholder="Ex: João Silva"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cargo</label>
                  <input name="cargo" placeholder="Ex: Gerente de Facilities"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                  <input name="contactoTelefono" value={form.contactoTelefono} onChange={handleChange}
                    placeholder="(48) 9 0000-0000"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                  <input name="contactoEmail" value={form.contactoEmail} onChange={handleChange}
                    placeholder="contato@empresa.com.br"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Município</label>
                  <input name="municipio" value={form.municipio} onChange={handleChange}
                    placeholder="Ex: Palhoça"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Origem e qualificação inicial</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Canal de entrada *</label>
                  <select name="canalEntrada" value={form.canalEntrada} onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24]">
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="TELEFONO">Telefone</option>
                    <option value="WEB">Formulário web</option>
                    <option value="INDICACION">Indicação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Responsável comercial</label>
                  <input value={usuario?.nombre || ''} disabled
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Descrição da demanda</label>
                  <textarea name="descripcionInicial" value={form.descripcionInicial} onChange={handleChange}
                    rows={3} placeholder="Descreva brevemente o que o cliente precisa..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#b61b24] resize-none" />
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/')}
                className="border border-gray-300 text-gray-600 px-6 py-2 rounded text-sm hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="bg-[#b61b24] text-white px-6 py-2 rounded text-sm font-medium hover:bg-[#9a1720] disabled:opacity-50">
                {loading ? 'Registrando...' : 'Registrar lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
// ─────────────────────────────────────────────────────────────────
// App.jsx — Root Component
// MRF Request Management System — HS Technologies (Phils.), Inc.
//
// Firebase auth temporarily removed — using dev session only.
// TODO: Re-add Firebase onAuthStateChanged once connected.
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Toaster } from 'sonner'

import LoginPage          from './pages/LoginPage'
import Dashboard          from './pages/Dashboard'
import UserDashboard      from './pages/UserDashboard'
import MRFForm            from './pages/MRFForm'
import PresidentDashboard from './pages/PresidentDashboard'
import MRFDetail          from './pages/MRFDetail'

export default function App() {
  const [user,       setUser]       = useState(null)
  const [view,       setView]       = useState('login')
  const [selectedMRF, setSelectedMRF] = useState(null)

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setView('login')
  }

  const handleNavigate = (dest, mrfId) => {
    if (mrfId) setSelectedMRF(mrfId)
    setView(dest)
  }

  return (
    <>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px' },
          duration: 4000,
        }}
      />

      {view === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {view === 'dashboard' && (() => {
        const role = user?.role || 'engineering'
        if (role === 'qa')        return <Dashboard          user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
        if (role === 'president') return <PresidentDashboard user={user} onLogout={handleLogout} />
        return <UserDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
      })()}

      {view === 'create' && (
        <div style={{ padding: '0 28px', overflowY: 'auto', height: '100vh', background: '#F5F5F5' }}>
          <MRFForm
            user={user}
            onNavigate={handleNavigate}
            onBack={() => setView('dashboard')}
          />
        </div>
      )}

      {view === 'view' && (
        <div style={{ padding: '0 28px', overflowY: 'auto', height: '100vh', background: '#F5F5F5' }}>
          <MRFDetail
            user={user}
            mrfId={selectedMRF}
            onNavigate={setView}
            onBack={() => setView('dashboard')}
          />
        </div>
      )}
    </>
  )
}
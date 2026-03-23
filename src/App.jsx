// ─────────────────────────────────────────────────────────────────
// App.jsx — Root Component
// MRF Request Management System — HS Technologies (Phils.), Inc.
// View-state navigation (no router dependency, Firebase Hosting ready)
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

import { Toaster } from 'sonner'
import LoginPage           from './pages/LoginPage'
import Dashboard           from './pages/Dashboard'
import UserDashboard       from './pages/UserDashboard'
import MRFForm             from './pages/MRFForm'
import FinalApproved       from './pages/FinalApproved'
import PresidentDashboard  from './pages/PresidentDashboard'
import MRFDetail           from './pages/MRFDetail'

// ── DEV session helpers — remove once Firebase is connected ──────
const DEV_SESSION_KEY = 'mrf_dev_user'

function saveDevSession(userData) {
  sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(userData))
}
function loadDevSession() {
  try {
    const raw = sessionStorage.getItem(DEV_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function clearDevSession() {
  sessionStorage.removeItem(DEV_SESSION_KEY)
}
// ── END DEV helpers ───────────────────────────────────────────────

export default function App() {
  const [user,    setUser]    = useState(null)
  const [view,    setView]    = useState('login')
  const [loading, setLoading] = useState(true)
  const [selectedMRF, setSelectedMRF] = useState(null)

  // ── Restore session on page reload ──────────────────────────────
  useEffect(() => {
    // 1. Check for dev session first (no Firebase needed)
    const devUser = loadDevSession()
    if (devUser) {
      setUser(devUser)
      setView('dashboard')
      setLoading(false)
      return
    }

    // 2. Fall through to Firebase session restore
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() })
            setView('dashboard')
          } else {
            await signOut(auth)
            setView('login')
          }
        } catch {
          setView('login')
        }
      } else {
        setUser(null)
        setView('login')
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // ── Handlers ────────────────────────────────────────────────────
  const handleLoginSuccess = (userData) => {
    saveDevSession(userData)   // persist for refresh
    setUser(userData)
    setView('dashboard')
  }

  const handleLogout = async () => {
    clearDevSession()          // clear dev session
    try { await signOut(auth) } catch { /* Firebase not connected yet */ }
    setUser(null)
    setView('login')
  }

  const handleNavigate = (view, mrfId) => {
    if (mrfId) setSelectedMRF(mrfId)
    setView(view)
  }

  // ── Loading screen ───────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#111',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '38px', height: '38px', background: '#F5C200',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontWeight: '700', fontSize: '15px', color: '#111',
        }}>MR</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '2px', margin: 0 }}>
          LOADING...
        </p>
      </div>
    )
  }

  // ── View routing ─────────────────────────────────────────────────
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

      {/* ── Dashboard — role-based routing ─────────────────────── */}
      {view === 'dashboard' && (() => {
        const role = user?.role || 'engineering'
        if (role === 'qa')        return <Dashboard          user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
        if (role === 'president') return <PresidentDashboard user={user} onLogout={handleLogout} />
        return <UserDashboard user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
      })()}

      {/* ── MRF Request Form ────────────────────────────────────── */}
      {view === 'create' && (
        <div style={{ padding: '0 28px', overflowY: 'auto', height: '100vh', background: '#F5F5F5' }}>
          <MRFForm
            user={user}
            onNavigate={handleNavigate}
            onBack={() => setView('dashboard')}
          />
        </div>
      )}

      {/* ── MRF Detail — status-driven view/action page ─────────── */}
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
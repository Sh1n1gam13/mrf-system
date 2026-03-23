// ─────────────────────────────────────────────────────────────────
// LoginPage.jsx
// MRF Request Management System — HS Technologies (Phils.), Inc.
// QAD-F-7.1.1.2 REV.10
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// ── Department accounts ──────────────────────────────────────────
const DEPARTMENTS = [
  { label: 'Quality Assurance (QA)', email: 'qa@hs.com'          },
  { label: 'Engineering',            email: 'engineering@hs.com'  },
  { label: 'Production',             email: 'production@hs.com'   },
  { label: 'President',              email: 'president@hs.com'    },
]

export default function LoginPage({ onLoginSuccess }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSignIn = async () => {
    if (!email)    return setError('Please select a department.')
    if (!password) return setError('Please enter your password.')
    setLoading(true)
    setError('')

    // ── DEV BYPASS — remove once Firebase is connected ────────────
    // Temporary password for UI testing without Firebase
    const DEV_PASSWORD = 'hst2026'
    if (password === DEV_PASSWORD) {
      const DEV_USERS = {
        'qa@hs.com':           { uid: 'dev-qa',   name: 'QA Admin',        department: 'Quality Assurance', role: 'qa'          },
        'engineering@hs.com':  { uid: 'dev-eng',  name: 'Engineering User', department: 'Engineering',       role: 'engineering' },
        'production@hs.com':   { uid: 'dev-prod', name: 'Production User',  department: 'Production',        role: 'production'  },
        'president@hs.com':    { uid: 'dev-pres', name: 'President',        department: 'Executive',         role: 'president'   },
      }
      const devUser = DEV_USERS[email]
      if (devUser) {
        setLoading(false)
        return onLoginSuccess(devUser)
      }
    }
    // ── END DEV BYPASS ────────────────────────────────────────────

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const uid        = credential.user.uid
      const userDoc    = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) throw new Error('User profile not found.')
      onLoginSuccess({ uid, ...userDoc.data() })
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'     ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Invalid credentials. Please try again.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSignIn() }

  return (
    <div style={{
      minHeight:      '100vh',
      background:     '#1a1a1a',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      fontFamily:     'Arial, Helvetica, sans-serif',
      padding:        '24px',
    }}>

      {/* Company name above card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <img
          src="/hst-logo.jpg"
          alt="HS Technologies Logo"
          style={{ width: '48px', height: '48px', objectFit: 'contain' }}
          onError={e => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        {/* Fallback if logo not found */}
        <div style={{
          display: 'none', width: '48px', height: '48px', background: '#F5C200',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontWeight: '700', fontSize: '13px', color: '#111', flexShrink: 0,
        }}>HST</div>
        <div>
          <p style={{ margin: 0, fontSize: '14px', letterSpacing: '3px', color: '#F5C200', textTransform: 'uppercase', fontWeight: '700' }}>HS Technologies</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.55)', letterSpacing: '1px' }}>Phils., Inc. · Since 1956</p>
        </div>
      </div>

      {/* Yellow Card */}
      <div style={{
        width: '100%', maxWidth: '380px',
        background: '#F5C200', borderRadius: '12px',
        padding: '36px 32px 32px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>

        {/* Avatar + Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '72px', height: '72px', background: '#111', borderRadius: '50%',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="13" r="6" fill="rgba(255,255,255,0.3)" />
              <path d="M4 34c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <h2 style={{
            margin: 0, fontSize: '13px', fontWeight: '700',
            color: '#111', letterSpacing: '3px', textTransform: 'uppercase',
          }}>Login Form</h2>
        </div>

        {/* Department dropdown */}
        <div style={{ marginBottom: '12px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="5" width="14" height="10" rx="1.5" stroke="#aaa" strokeWidth="1.2"/>
              <path d="M5 5V3.5A2.5 2.5 0 0 1 8 1v0a2.5 2.5 0 0 1 2.5 2.5V5" stroke="#aaa" strokeWidth="1.2"/>
              <circle cx="8" cy="10" r="1.5" fill="#aaa"/>
            </svg>
          </div>
          <select
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%', padding: '12px 36px 12px 38px',
              fontSize: '13px', border: 'none', borderRadius: '6px',
              background: '#fff', color: email ? '#111' : '#aaa',
              boxSizing: 'border-box', appearance: 'none', cursor: 'pointer',
              outline: 'none', fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          >
            <option value="" disabled>Select department...</option>
            {DEPARTMENTS.map(({ label, email: deptEmail }) => (
              <option key={deptEmail} value={deptEmail}>{label}</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '9px', color: '#aaa' }}>▼</div>
        </div>

        {/* Password input */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="7" width="12" height="8" rx="1.5" stroke="#aaa" strokeWidth="1.2"/>
              <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#aaa" strokeWidth="1.2"/>
              <circle cx="8" cy="11" r="1.2" fill="#aaa"/>
            </svg>
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%', padding: '12px 14px 12px 38px',
              fontSize: '13px', border: 'none', borderRadius: '6px',
              background: '#fff', color: '#111', boxSizing: 'border-box',
              outline: 'none', fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(0,0,0,0.08)', borderLeft: '3px solid #111',
            padding: '9px 12px', borderRadius: '4px', marginBottom: '14px',
          }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#111' }}>{error}</p>
          </div>
        )}

        {/* Login button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#222' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#111' }}
          style={{
            width: '100%', padding: '13px',
            background: loading ? '#333' : '#111',
            color: '#F5C200', fontSize: '12px', letterSpacing: '3px',
            textTransform: 'uppercase', fontWeight: '700',
            border: 'none', borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          {loading ? 'Signing In...' : 'Login'}
        </button>

      </div>

      {/* Footnote */}
      <p style={{
        marginTop: '20px', fontSize: '13px',
        color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', textAlign: 'center',
      }}>
        MRF Request Management System · QAD-F-7.1.1.2 REV.10 · Internal Use Only
      </p>

    </div>
  )
}
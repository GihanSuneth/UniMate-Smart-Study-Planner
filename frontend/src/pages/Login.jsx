import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconUser, IconLock, IconEye, IconEyeOff, IconSearch, IconX, IconInfoCircle } from '@tabler/icons-react';
import mascot1 from '../images/action-figure-1.png';
import mascot2 from '../images/action-figure-2.png';
import mascot3 from '../images/action-figure-3.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../api';
import './Login.css';

// Login Page

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  // Page state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showLookup, setShowLookup] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Role-based configuration changes the mascot and helper text.
  const config = {
    student: { title: 'Student Login', mascot: mascot1, bg: 'bg-student', credUsername: 'student' },
    Lecturer: { title: 'Lecturer Login', mascot: mascot2, bg: 'bg-Lecturer', credUsername: 'Lecturer' },
    admin: { title: 'Admin Login', mascot: mascot3, bg: 'bg-admin', credUsername: 'admin' },
  };

  // Form actions
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupEmail) return;
    setLookupLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/portal-id-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lookupEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setLookupResult(data);
      } else {
        toast.error(data.message || "Lookup failed");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setLookupLoading(false);
    }
  };

  const currentConfig = config[role] || config['student'];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill out both username and password.');
      toast.error('Please fill out both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.username);
        localStorage.setItem('userId', data._id);
        localStorage.setItem('token', data.token);

        window.dispatchEvent(new Event('auth-change'));
        
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const errorMsg = data.message || 'Invalid username or password';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setLoading(false);
      setError('Connection refused. Please check if backend server is running.');
      toast.error('Connection refused. Please check if backend server is running.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // Render
  return (
    <div className="login-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={`login-split ${currentConfig.bg}`}>
        <button className="back-btn" onClick={handleBack}>
          <IconArrowLeft size={20} /> Back to roles
        </button>
        <div className="mascot-showcase">
          <img src={currentConfig.mascot} alt="Role Mascot" />
        </div>
      </div>
      
      <div className="login-form-container">
        <div className="login-form-box">
          <div className="login-header">
            <h1>{currentConfig.title}</h1>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label>Username, Email, or Portal ID</label>
              <div className="input-wrapper">
                <IconUser size={20} className="input-icon" />
                <input 
                  type="text" 
                  placeholder={`Enter ${currentConfig.credUsername}...`}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label>Password</label>
              <div className="input-wrapper">
                <IconLock size={20} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter passcode..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-actions" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span onClick={() => setShowLookup(true)} className="forgot-pass" style={{cursor: 'pointer', textDecoration: 'none', color: '#6366f1', fontWeight: '700', fontSize: '0.85rem'}}>Forgot Portal ID?</span>
              <span onClick={() => navigate('/forgot-password')} className="forgot-pass" style={{cursor: 'pointer', textDecoration: 'none', fontSize: '0.85rem'}}>Forgot password?</span>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Sign In"}
            </button>
            
            {role === 'student' && (
              <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b'}}>
                Don't have an account? <span onClick={() => navigate('/signup')} style={{color: '#6366f1', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline'}}>Sign up here</span>
              </div>
            )}
            {role === 'Lecturer' && (
              <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b'}}>
                Don't have an account? <span onClick={() => navigate('/signup/lecturer')} style={{color: '#6366f1', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline'}}>Request Account</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Portal ID Lookup Modal */}
      {showLookup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18, 28, 56, 0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '400px', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative', animation: 'slideUp 0.3s ease-out' }}>
            <button onClick={() => { setShowLookup(false); setLookupResult(null); setLookupEmail(''); }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><IconX size={20}/></button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <IconSearch size={28} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0', color: '#1e293b' }}>Portal ID Lookup</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Enter your email to find your identifier.</p>
            </div>

            {!lookupResult ? (
              <form onSubmit={handleLookup}>
                <div style={{ marginBottom: '20px' }}>
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter registered email..." 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none' }} 
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={lookupLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  {lookupLoading ? "Searching..." : "Lookup ID"}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Your Portal ID</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#6366f1', margin: '8px 0' }}>{lookupResult.portalId}</div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>Registered as <strong>@{lookupResult.username}</strong></div>
                </div>
                <button onClick={() => { setShowLookup(false); setLookupResult(null); setLookupEmail(''); }} style={{ width: '100%', padding: '14px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  Back to Login
                </button>
              </div>
            )}
            
            <div style={{ marginTop: '24px', display: 'flex', gap: '10px', backgroundColor: '#fff7ed', padding: '12px', borderRadius: '12px', border: '1px solid #ffedd5' }}>
              <IconInfoCircle size={18} style={{ color: '#f97316', flexShrink: 0 }} />
              <p style={{ fontSize: '11px', color: '#9a3412', margin: 0, lineHeight: '1.4' }}>Use this ID, your email, or username to securely sign in to your portal.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;

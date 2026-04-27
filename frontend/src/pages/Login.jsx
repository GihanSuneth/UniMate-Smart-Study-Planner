import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconUser, IconLock } from '@tabler/icons-react';
import mascot1 from '../images/action-figure-1.png';
import mascot2 from '../images/action-figure-2.png';
import mascot3 from '../images/action-figure-3.png';
import './Login.css';

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine configuration based on URL param
  const config = {
    student: { title: 'Student Login', mascot: mascot1, bg: 'bg-student', credUsername: 'student' },
    teacher: { title: 'Teacher Login', mascot: mascot2, bg: 'bg-teacher', credUsername: 'teacher' },
    admin: { title: 'Admin Login', mascot: mascot3, bg: 'bg-admin', credUsername: 'admin' },
  };

  const currentConfig = config[role] || config['student'];

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill out both username and password.');
      return;
    }

    setLoading(true);
    // Mock DB Validation logic
    setTimeout(() => {
      setLoading(false);
      // Validating fixed credentials exactly as per requirement
      if (
        (role === 'student' && username === 'student' && password === '12345') ||
        (role === 'teacher' && username === 'teacher' && password === '12345') ||
        (role === 'admin' && username === 'admin' && password === '12345')
      ) {
        // Success
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', username);
        // Dispatch event so layout can update if needed, or simply navigate
        window.dispatchEvent(new Event('auth-change'));
        
        // Redirect logic to correct landing dashboard index
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // Failure
        setError('Invalid username or password. Please try again.');
      }
    }, 1200);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
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
              <label>Username</label>
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

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <IconLock size={20} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Enter 12345..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
              </div>
            </div>

            <div className="form-actions">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-pass">Forgot password?</a>
            </div>
            

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Sign In"}
            </button>
          </form>

          <div className="mongodb-notice">
            <p><strong>DB Connection Integration Note:</strong></p>
            <p>To connect standard MongoDB instances, install <code>mongoose</code> and paste your cluster connection string (e.g., <code>mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0...</code>) in your environmental variables (<code>.env</code> file) using a variable like <code>MONGO_URI</code>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconId, IconUser, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import mascot2 from '../images/action-figure-2.png';
import { BASE_URL } from '../api';
import './StudentSignup.css';

function LecturerSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    lecturerId: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Name is required";
    
    if (!formData.lecturerId.trim()) {
      newErrors.lecturerId = "Lecturer ID is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Lecturer mail is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: 'Lecturer',
            // Note: lecturerId is sent but ignored by current backend schema safely
          }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          toast.success(`Welcome! Your Portal ID is ${data.portalId || 'Pending'}. Use this, your email, or username to log in!`, {
            autoClose: 6000,
            style: { border: '1px solid #6366f1', borderRadius: '12px' }
          });
          setTimeout(() => {
            navigate('/login/Lecturer');
          }, 4500);
        } else {
          setErrors({ general: data.message || 'Signup failed' });
          toast.error(data.message || 'Signup failed');
        }
      } catch (err) {
        setLoading(false);
        setErrors({ general: 'Connection refused. Please check if backend server is running.' });
        toast.error('Connection refused. Please check if backend server is running.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBack = () => {
    navigate('/login/Lecturer');
  };

  return (
    <div className="signup-page">
      <ToastContainer position="top-right" autoClose={3500} />
      <div className="signup-split bg-Lecturer">
        <button className="back-btn" onClick={handleBack}>
          <IconArrowLeft size={20} /> Back to Sign In
        </button>
        <div className="mascot-showcase">
          <img src={mascot2} alt="Lecturer Mascot" />
        </div>
      </div>
      
      <div className="signup-form-container">
        <div className="signup-form-box flex-scroll">
          <div className="signup-header">
            <h1>Lecturer Sign Up</h1>
            <p>Request account access to manage modules.</p>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
            <div className={`input-group ${errors.username ? 'has-error' : ''}`}>
              <label>Full Name</label>
              <div className="input-wrapper">
                <IconUser size={20} className="input-icon" />
                <input 
                  type="text" 
                  name="username"
                  placeholder="Enter full name..."
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className={`input-group ${errors.lecturerId ? 'has-error' : ''}`}>
              <label>Lecturer ID</label>
              <div className="input-wrapper">
                <IconId size={20} className="input-icon" />
                <input 
                  type="text" 
                  name="lecturerId"
                  placeholder="e.g., LEC1234"
                  value={formData.lecturerId}
                  onChange={handleChange}
                />
              </div>
              {errors.lecturerId && <span className="error-text">{errors.lecturerId}</span>}
            </div>

            <div className={`input-group ${errors.email ? 'has-error' : ''}`}>
              <label>Lecturer Mail</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input 
                  type="email" 
                  name="email"
                  placeholder="e.g., smith@unimate.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className={`input-group ${errors.password ? 'has-error' : ''}`}>
              <label>Password</label>
              <div className="input-wrapper">
                <IconLock size={20} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="Create a password..."
                  value={formData.password}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
              <button 
                type="button" 
                onClick={() => navigate('/login/Lecturer')}
                style={{
                  flex: 1, 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid #cbd5e1', 
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  fontWeight: '600', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f8fafc'}
              >
                Back
              </button>
              <button type="submit" className="signup-submit-btn" disabled={loading} style={{flex: 1, marginTop: 0}}>
                {loading ? <div className="spinner"></div> : "Sign Up"}
              </button>
            </div>
            
            <div className="login-redirect">
              Already have an account? <span onClick={() => navigate('/login/Lecturer')} className="login-link">Sign in</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LecturerSignup;

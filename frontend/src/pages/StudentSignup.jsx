import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconId, IconUser, IconLock, IconCalendarStats, IconDeviceDesktopAnalytics, IconEye, IconEyeOff } from '@tabler/icons-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import mascot1 from '../images/action-figure-1.png';
import { BASE_URL } from '../api';
import './StudentSignup.css';

// Student Signup Page

function StudentSignup() {
  const navigate = useNavigate();
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    itNumber: '',
    email: '',
    password: '',
    year: '1',
    semester: '1'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation and form handlers
  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    
    // IT Number validation
    const itRegex = /^IT\d{8}$/;
    if (!formData.itNumber) {
      newErrors.itNumber = "IT Number is required";
    } else if (!itRegex.test(formData.itNumber)) {
      newErrors.itNumber = "Format must be ITxxxxxxxx (8 digits)";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
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
            role: 'student'
          }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          // Show toast popup with Portal ID
          toast.success(`Welcome! Your Portal ID is ${data.portalId || 'Pending'}. Use this, your email, or username to log in!`, {
            autoClose: 6000,
            style: { border: '1px solid #6366f1', borderRadius: '12px' }
          });
          // Delay navigation by 3.5 seconds
          setTimeout(() => {
            navigate('/login/student');
          }, 3500);
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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBack = () => {
    navigate('/login/student');
  };

  // Render
  return (
    <div className="signup-page">
      <ToastContainer position="top-right" autoClose={3500} />
      <div className="signup-split bg-student">
        <button className="back-btn" onClick={handleBack}>
          <IconArrowLeft size={20} /> Back to Sign In
        </button>
        <div className="mascot-showcase">
          <img src={mascot1} alt="Student Mascot" />
        </div>
      </div>
      
      <div className="signup-form-container">
        <div className="signup-form-box flex-scroll">
          <div className="signup-header">
            <h1>Student Sign Up</h1>
            <p>Create your account to start planning your studies.</p>
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

            <div className={`input-group ${errors.itNumber ? 'has-error' : ''}`}>
              <label>IT Number</label>
              <div className="input-wrapper">
                <IconId size={20} className="input-icon" />
                <input 
                  type="text" 
                  name="itNumber"
                  placeholder="e.g., IT12345678"
                  value={formData.itNumber}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
              {errors.itNumber && <span className="error-text">{errors.itNumber}</span>}
            </div>

            <div className="split-inputs">
              <div className="input-group">
                <label>Year</label>
                <div className="input-wrapper select-wrapper">
                  <IconCalendarStats size={20} className="input-icon" />
                  <select name="year" value={formData.year} onChange={handleChange}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Semester</label>
                <div className="input-wrapper select-wrapper">
                  <IconDeviceDesktopAnalytics size={20} className="input-icon" />
                  <select name="semester" value={formData.semester} onChange={handleChange}>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`input-group ${errors.email ? 'has-error' : ''}`}>
              <label>Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Enter email address..."
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
                onClick={() => navigate('/login/student')}
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
              Already have an account? <span onClick={() => navigate('/login/student')} className="login-link">Sign in</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentSignup;

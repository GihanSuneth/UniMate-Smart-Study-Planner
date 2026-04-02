import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconId, IconUser, IconLock } from '@tabler/icons-react';
import mascot2 from '../images/action-figure-2.png';
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

  const handleSignup = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const existingReqs = JSON.parse(localStorage.getItem('pendingLecturerReqs')) || [];
        existingReqs.push({
          id: Date.now(),
          name: formData.username,
          lecturerId: formData.lecturerId,
          email: formData.email
        });
        localStorage.setItem('pendingLecturerReqs', JSON.stringify(existingReqs));
        
        navigate('/login/Lecturer');
      }, 1500);
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
                  type="password" 
                  name="password"
                  placeholder="Create a password..."
                  value={formData.password}
                  onChange={handleChange}
                />
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

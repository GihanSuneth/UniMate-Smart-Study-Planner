import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconMail } from '@tabler/icons-react';
import { ToastContainer, toast } from 'react-toastify';
import mascot1 from '../images/action-figure-1.png';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

// Forgot Password Page

function ForgotPassword() {
  const navigate = useNavigate();

  // Page state
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      toast.error('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // Mock API call to send reset link
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    }, 1200);
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page (e.g., login)
  };

  // Render
  return (
    <div className="login-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="login-split bg-student">
        <button className="back-btn" onClick={handleBack}>
          <IconArrowLeft size={20} /> Back
        </button>
        <div className="mascot-showcase">
          <img src={mascot1} alt="Mascot" />
        </div>
      </div>
      
      <div className="login-form-container">
        <div className="login-form-box">
          <div className="login-header">
            <h1>Reset Password</h1>
            <p>
              {submitted 
                ? "Check your inbox (and spam folder) for the password reset link."
                : "Enter your registered email address and we'll send you a link to reset your password."}
            </p>
          </div>

          {error && !submitted && <div className="error-banner">{error}</div>}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <IconMail size={20} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading} style={{ marginTop: '24px' }}>
                {loading ? <div className="spinner"></div> : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button onClick={handleBack} className="login-submit-btn" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-dark)' }}>
                Return to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

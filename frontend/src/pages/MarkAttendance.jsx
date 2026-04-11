import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconQrcode, IconScan } from '@tabler/icons-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../api';

function MarkAttendance() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-character attendance code.');
      return;
    }

    const studentId = localStorage.getItem('userId');
    if (!studentId) {
      toast.error('You must be logged in to mark attendance.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Optional based on auth middleware
        },
        body: JSON.stringify({ studentId, code }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success(data.message || 'Attendance marked successfully!');
        setCode('');
        setTimeout(() => {
          navigate('/analytics');
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to mark attendance.');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Connection refused. Is the server running?');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <button 
        onClick={() => navigate('/analytics')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'none', border: 'none', 
          color: 'var(--primary)', fontWeight: '600', cursor: 'pointer',
          marginBottom: '30px'
        }}
      >
        <IconArrowLeft size={20} /> Back to Dashboard
      </button>

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-flex', padding: '16px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5', marginBottom: '20px' }}>
          <IconScan size={40} />
        </div>
        <h1 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '10px' }}>Mark Attendance</h1>
        <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.5' }}>
          Look at the screen presented by your Lecturer. You can either scan the QR Code or manually type the 6-digit Code below.
        </p>

        <form onSubmit={handleMarkAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', background: '#f8fafc',
            border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0 16px',
            transition: 'border-color 0.2s',
          }}>
            <IconQrcode size={24} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Enter 6-Digit Code (e.g. X92BD4)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              style={{
                width: '100%', padding: '16px', background: 'transparent',
                border: 'none', outline: 'none', fontSize: '16px',
                textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', color: '#334155'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '16px', background: '#4f46e5', color: '#fff',
              border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => { if(!loading) e.target.style.background = '#4338ca'}}
            onMouseOut={(e) => { if(!loading) e.target.style.background = '#4f46e5'}}
          >
            {loading ? 'Verifying...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MarkAttendance;

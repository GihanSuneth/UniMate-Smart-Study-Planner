import React, { useState, useEffect } from 'react';
import { 
  IconCheck, IconX, IconUser, IconDownload, IconChevronRight, 
  IconQrcode, IconUsers 
} from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../api';
import './Attendance.css';

function LecturerAttendance() {
  const [selectedModule, setSelectedModule] = useState('Programming Applications');
  const [selectedWeek, setSelectedWeek] = useState(5);
  const [qrCode, setQrCode] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  
  const modules = ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];

  // 1. Fetch live attendance for the active session or selected criteria
  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${BASE_URL}/attendance/module/${encodeURIComponent(selectedModule)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter by the selected week
        const weekData = data.filter(r => r.week === selectedWeek);
        setAttendanceList(weekData);
      }
    } catch (error) {
           console.error('Fetch attendance error', error);
    }
  };

  // 2. Create a new live session
  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/attendance/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecturer: localStorage.getItem('userId'),
          module: selectedModule,
          week: selectedWeek
        })
      });
      const data = await response.json();
      setLoading(false);
      
      if (response.ok) {
        setQrCode(data.uniqueCode);
        setActiveSessionId(data._id);
        toast.success(`Session created! Code: ${data.uniqueCode}`);
        fetchAttendance();
      } else {
        toast.error('Failed to create session');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Server connection error');
    }
  };

  // 3. Close the active session
  const endActiveSession = async () => {
    if (!activeSessionId) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/attendance/session/${activeSessionId}/end`, {
        method: 'PUT',
      });
      setLoading(false);
      if (response.ok) {
        setQrCode(null);
        setActiveSessionId(null);
        toast.success('Attendance session ended.');
      } else {
        toast.error('Failed to end session');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Server connection error');
    }
  };

  // Polling for live updates every 5 seconds if a session is active
  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(() => {
      if (activeSessionId) fetchAttendance();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedModule, selectedWeek, activeSessionId]);

  return (
    <div className="attendance-page">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Start a live session, share the QR code, and track student check-ins in real-time.</p>
      </div>

      <div className="attendance-grid">
        <div className="role-column" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card">
            <h3 className="card-title">Live QR Generator</h3>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px', display: 'block' }}>Module</label>
                <select 
                  value={selectedModule} 
                  onChange={(e) => setSelectedModule(e.target.value)}
                  disabled={!!activeSessionId}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                >
                  {modules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px', display: 'block' }}>Week</label>
                <select 
                  value={selectedWeek} 
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  disabled={!!activeSessionId}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => <option key={w} value={w}>Week {w}</option>)}
                </select>
              </div>
            </div>

            <div className="qr-display-box" style={{ padding: '30px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
              {qrCode ? (
                <>
                  <QRCodeSVG value={qrCode} size={160} level={"H"} includeMargin={true} />
                  <div style={{ marginTop: '16px', fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', color: '#4f46e5' }}>
                    {qrCode}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <IconQrcode size={64} style={{ opacity: 0.3 }} />
                  <p style={{ marginTop: '10px' }}>No active session. Select criteria and click generate.</p>
                </div>
              )}
            </div>

            <div className="status-indicators" style={{ marginBottom: '20px' }}>
              <div className="status-item present">
                 <IconCheck size={20} color="var(--success)" stroke={3} />
                 <span>Checked In: <span className="count">{attendanceList.length}</span></span>
              </div>
            </div>

            {activeSessionId ? (
              <button className="action-btn" onClick={endActiveSession} style={{ backgroundColor: '#dc2626' }}>End Active Session</button>
            ) : (
              <button className="generate-btn" onClick={generateQRCode} style={{ width: '100%' }}>Generate QR Code</button>
            )}
          </div>
        </div>

        {/* Right side: Real-time Submissions */}
        <div className="role-column" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Real-time Submissions</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#22c55e', background: '#f0fdf4', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div> LIVE
                </span>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                  <IconDownload size={16} />
                  <span style={{ fontSize: '12px' }}>CSV</span>
                </button>
              </div>
            </div>
            
            <div className="submissions-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {attendanceList.length > 0 ? [...attendanceList].reverse().map((rec, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  backgroundColor: idx === 0 ? '#eff6ff' : 'var(--bg-main)', 
                  border: '1px solid',
                  borderColor: idx === 0 ? '#bfdbfe' : 'var(--border-color)',
                  animation: idx === 0 ? 'slideIn 0.3s ease-out' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconUser size={16} color="#64748b" />
                      </div>
                      <strong style={{ color: 'var(--text-dark)', fontSize: '14px' }}>{rec.student?.username || 'Unknown'}</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '40px' }}>
                    <span>{rec.module}</span>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>SUCCESS ✅</span>
                  </div>
                </div>
              )) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '12px' }}>
                  <IconUsers size={48} style={{ opacity: 0.2 }} />
                  <p style={{ fontSize: '14px' }}>Waiting for students to check in...</p>
                </div>
              )}
            </div>
            
            <button style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
              View Historical Records <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default LecturerAttendance;

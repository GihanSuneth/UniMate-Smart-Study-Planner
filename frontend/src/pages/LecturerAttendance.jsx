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
  const [selectedModule, setSelectedModule] = useState('Network Design and Modeling');
  const [selectedWeek, setSelectedWeek] = useState(5);
  const [loading, setLoading] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [allStudents, setAllStudents] = useState([]); // All enrolled students
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('Attended'); 
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [historyFilterModule, setHistoryFilterModule] = useState('');
  const [historyFilterWeek, setHistoryFilterWeek] = useState(5);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  
  // Logic to determine current academic week
  const currentAcademicWeek = 5; 
  
  const [modules, setModules] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [duration, setDuration] = useState(10);
  const [qrCode, setQrCode] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        const assigned = Array.isArray(data.assignedModules) ? data.assignedModules : [];
        setModules(assigned);
        if (assigned.length > 0) {
          setSelectedModule(assigned[0]);
          setHistoryFilterModule(assigned[0]);
        }
      }
    } catch (err) {
      console.error("Profile fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!historyFilterModule) return;
    try {
      const response = await fetch(`${BASE_URL}/attendance/module/${encodeURIComponent(historyFilterModule)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const weekData = data.filter(r => r.week === historyFilterWeek);
          setHistoryList(weekData);
        } else {
          setHistoryList([]);
        }
      }
    } catch (error) {
      console.error('Fetch history error', error);
      setHistoryList([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [historyFilterModule, historyFilterWeek]);


  // 1. Fetch live attendance for the active session or selected criteria
  const fetchAttendance = async () => {
    try {
      const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const response = await fetch(`${BASE_URL}/attendance/module/${encodeURIComponent(selectedModule)}`, { headers: authHeader });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const weekData = data.filter(r => r.week === selectedWeek);
          setAttendanceList(weekData);
        }
      }
      
      const enrollRes = await fetch(`${BASE_URL}/attendance/enrollment-count?module=${encodeURIComponent(selectedModule)}`, { headers: authHeader });
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        setEnrollmentCount(enrollData.count || 0);
        
        const studentsRes = await fetch(`${BASE_URL}/auth/students?module=${encodeURIComponent(selectedModule)}`, { headers: authHeader });
        if (studentsRes.ok) {
          const students = await studentsRes.json();
          setAllStudents(Array.isArray(students) ? students : []);
        }
      }
    } catch (error) {
      console.error('Fetch attendance error', error);
    }
  };

  const handleManualOverride = async (studentId, status) => {
    try {
      const response = await fetch(`${BASE_URL}/attendance/override`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          module: selectedModule,
          week: selectedWeek,
          status
        })
      });
      if (response.ok) {
        toast.success(`Marked as ${status}`);
        fetchAttendance();
      }
    } catch (err) {
      toast.error('Override failed');
    }
  };

  const downloadCSV = () => {
    const sessionDuration = sessionStartTime ? Math.round((new Date() - sessionStartTime) / 60000) : 'N/A';
    let csv = `Session Name,${selectedModule} - Week ${selectedWeek}\n`;
    csv += `Session Duration,${sessionDuration} minutes\n\n`;
    csv += 'Portal ID,Student Name,Email,Status\n';

    allStudents.forEach(student => {
      const attendance = attendanceList.find(a => a.student?._id === student._id);
      const status = attendance ? attendance.status : 'Absent';
      csv += `${student.portalId},${student.username},${student.email},${status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedModule}_Week${selectedWeek}.csv`;
    a.click();
    toast.success('CSV Exported!');
  };

  // 2. Create a new live session
  const generateQRCode = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/qr/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          module: selectedModule,
          week: selectedWeek,
          duration: duration,
          baseUrl: window.location.origin
        })
      });
      const data = await response.json();
      setLoading(false);
      
      if (response.ok) {
        console.log("QR Generation Success:", data.sessionToken);
        setQrCode(data.qrImage);
        setSessionToken(data.sessionToken);
        setExpiresAt(new Date(data.expiresAt));
        setSessionStartTime(new Date());
        setTimeLeft(`${duration}:00`);
        toast.success(`Session created! Code: ${data.sessionToken}`);
        fetchAttendance();
      } else {
        toast.error(data.message || 'Failed to create session');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Server connection error');
    }
  };

  const extendSession = async (mins = 5) => {
    if (!sessionToken) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/qr/extend`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionToken: sessionToken, // Backend needs to find by code or ID
          additionalMinutes: mins
        })
      });
      if (response.ok) {
        const data = await response.json();
        setExpiresAt(new Date(data.expiresAt));
        toast.success(`Session extended by ${mins} minutes`);
      }
    } catch (err) {
      toast.error('Extension failed');
    }
  };

  const endActiveSession = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/qr/end`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionToken })
      });
      setLoading(false);
      if (response.ok) {
        setQrCode(null);
        setSessionToken(null);
        setExpiresAt(null);
        toast.success('Attendance session ended.');
      } else {
        toast.error('Failed to end session');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Server connection error');
    }
  };

  // Timer logic
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiresAt.getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('EXPIRED');
        setQrCode(null);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  // Polling for live updates every 5 seconds if a session is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionToken) fetchAttendance();
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, selectedWeek, sessionToken]);

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
                  disabled={!!sessionToken}
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
                  disabled={!!sessionToken}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => <option key={w} value={w}>Week {w}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px', display: 'block' }}>Timer (Mins)</label>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={!!sessionToken}
                  min="1"
                  max="60"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div className="qr-display-box" style={{ padding: '30px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
              {qrCode ? (
                <>
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{selectedModule}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Week {selectedWeek} • Time Left: <span style={{ color: '#ef4444', fontWeight: '800' }}>{timeLeft}</span></div>
                  </div>
                  <div style={{ 
                    position: 'relative', 
                    width: '200px', 
                    height: '200px', 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    padding: '10px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <img 
                      src={qrCode} 
                      alt="Attendance QR" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      onError={(e) => {
                        console.error("QR Image Load Error", e);
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>
                      <IconQrcode size={48} />
                      <div style={{ fontSize: '10px', marginTop: '4px' }}>Image Load Failed<br/>Use Token ID Below</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', color: '#4f46e5' }}>
                    {sessionToken}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button onClick={() => extendSession(5)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#eef2ff', color: '#4f46e5', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>+5 Mins</button>
                    <button onClick={() => extendSession(10)} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#eef2ff', color: '#4f46e5', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>+10 Mins</button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <IconQrcode size={64} style={{ opacity: 0.3 }} />
                  <p style={{ marginTop: '10px' }}>No active session. Select criteria and click generate.</p>
                </div>
              )}
            </div>

            <div className="status-indicators" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
              <div className="status-item present">
                 <IconCheck size={20} color="var(--success)" stroke={3} />
                 <span>Checked In: <span className="count">{attendanceList.length}</span></span>
              </div>
              <div className="status-item total" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                 <IconUsers size={20} color="#64748b" />
                 <span>Enrolled: <span className="count">{enrollmentCount}</span></span>
              </div>
            </div>

            {sessionToken ? (
              <button className="action-btn" onClick={endActiveSession} style={{ backgroundColor: '#dc2626' }}>End Session Now</button>
            ) : (
              <button 
                className="generate-btn" 
                onClick={generateQRCode} 
                style={{ width: '100%', opacity: selectedWeek < 5 ? 0.5 : 1 }}
                disabled={selectedWeek < 5}
              >
                {selectedWeek < 5 ? `Locked (Past Week records cannot be created)` : 'Start Attendance Session'}
              </button>
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
                <button 
                  onClick={downloadCSV}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <IconDownload size={16} />
                  <span style={{ fontSize: '12px' }}>CSV</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button 
                className={`filter-tab ${submissionFilter === 'Attended' ? 'active' : ''}`}
                onClick={() => setSubmissionFilter('Attended')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: submissionFilter === 'Attended' ? 'var(--primary)' : 'white', color: submissionFilter === 'Attended' ? 'white' : 'var(--text-dark)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Attended ({attendanceList.length})
              </button>
              <button 
                className={`filter-tab ${submissionFilter === 'Missed' ? 'active' : ''}`}
                onClick={() => setSubmissionFilter('Missed')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: submissionFilter === 'Missed' ? '#ef4444' : 'white', color: submissionFilter === 'Missed' ? 'white' : 'var(--text-dark)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Missed ({Math.max(0, enrollmentCount - attendanceList.length)})
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
               <input 
                 type="text" 
                 placeholder="Filter by Student Portal ID..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}
               />
            </div>
            
            <div className="submissions-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {(submissionFilter === 'Attended' ? attendanceList : allStudents.filter(s => !attendanceList.find(a => a.student?._id === s._id)))
                .filter(item => {
                  const student = submissionFilter === 'Attended' ? item.student : item;
                  return student?.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student?.portalId?.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((item, idx) => {
                  const student = submissionFilter === 'Attended' ? item.student : item;
                  const record = submissionFilter === 'Attended' ? item : null;
                  
                  return (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--bg-main)', 
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconUser size={16} color="#64748b" />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: 'var(--text-dark)', fontSize: '14px' }}>{student?.username || 'Unknown'}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{student?.portalId}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleManualOverride(student._id, 'Present')} title="Mark Present" style={{ padding: '4px', borderRadius: '4px', border: 'none', background: record?.status === 'Present' ? '#dcfce7' : '#f1f5f9', color: '#15803d', cursor: 'pointer' }}><IconCheck size={14}/></button>
                          <button onClick={() => handleManualOverride(student._id, 'Absent')} title="Mark Absent" style={{ padding: '4px', borderRadius: '4px', border: 'none', background: record?.status === 'Absent' || !record ? '#fee2e2' : '#f1f5f9', color: '#dc2626', cursor: 'pointer' }}><IconX size={14}/></button>
                          <button onClick={() => handleManualOverride(student._id, 'Excused')} title="Mark Excused" style={{ padding: '4px', borderRadius: '4px', border: 'none', background: record?.status === 'Excused' ? '#fef3c7' : '#f1f5f9', color: '#d97706', cursor: 'pointer' }}><div style={{ fontSize: '10px', fontWeight: 'bold' }}>EX</div></button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '40px' }}>
                        <span>{record ? new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No Record'}</span>
                        <span style={{ fontWeight: 600, color: record?.status === 'Present' ? 'var(--success)' : record?.status === 'Excused' ? '#d97706' : '#ef4444' }}>
                          {record?.status || 'ABSENT'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              {((submissionFilter === 'Attended' ? attendanceList : allStudents.filter(s => !attendanceList.find(a => a.student?._id === s._id)))
                .filter(item => {
                  const student = submissionFilter === 'Attended' ? item.student : item;
                  return student?.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student?.portalId?.toLowerCase().includes(searchQuery.toLowerCase());
                })).length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '12px' }}>
                  <IconUsers size={48} style={{ opacity: 0.2 }} />
                  <p style={{ fontSize: '14px' }}>No matches found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
            
      {/* Permanent Historical Records Section */}
      <div className="attendance-card" style={{ marginTop: '32px', borderTop: '4px solid var(--primary)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <div>
             <h3 className="card-title" style={{ margin: 0 }}>Past Attendance Details</h3>
             <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Review historical participation records by module and week.</p>
           </div>
           <div style={{ display: 'flex', gap: '12px' }}>
              <select 
                value={historyFilterModule} 
                onChange={e => setHistoryFilterModule(e.target.value)} 
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '600', minWidth: '180px' }}
              >
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select 
                value={historyFilterWeek} 
                onChange={e => setHistoryFilterWeek(Number(e.target.value))} 
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '600' }}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  style={{ padding: '8px 12px', paddingRight: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', width: '200px' }}
                />
              </div>
           </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Portal ID</th>
                <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Student Name</th>
                <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Date & Time</th>
                <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyList.filter(rec => 
                rec.student?.username?.toLowerCase().includes(historySearchQuery.toLowerCase()) || 
                rec.student?.portalId?.toLowerCase().includes(historySearchQuery.toLowerCase())
              ).length > 0 ? historyList.filter(rec => 
                rec.student?.username?.toLowerCase().includes(historySearchQuery.toLowerCase()) || 
                rec.student?.portalId?.toLowerCase().includes(historySearchQuery.toLowerCase())
              ).map((rec, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: '#4f46e5' }}>{rec.student?.portalId}</td>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{rec.student?.username}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                    {new Date(rec.date).toLocaleDateString()} at {new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '800', 
                      backgroundColor: rec.status === 'Present' ? '#dcfce7' : rec.status === 'Excused' ? '#fef3c7' : '#fee2e2', 
                      color: rec.status === 'Present' ? '#15803d' : rec.status === 'Excused' ? '#d97706' : '#dc2626' 
                    }}>
                      {rec.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <IconUsers size={40} style={{ opacity: 0.2 }} />
                      <p>No historical records found for this selection.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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


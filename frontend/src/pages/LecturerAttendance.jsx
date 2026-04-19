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
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [allStudents, setAllStudents] = useState([]); // All enrolled students
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('Attended'); // 'Attended' or 'Missed'
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Logic to determine current academic week (e.g. Week 8 for current date)
  const currentAcademicWeek = 8; 
  
  const modules = ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];

  // 1. Fetch live attendance for the active session or selected criteria
  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${BASE_URL}/attendance/module/${encodeURIComponent(selectedModule)}`);
      if (response.ok) {
        const data = await response.json();
        const weekData = data.filter(r => r.week === selectedWeek);
        setAttendanceList(weekData);
      }
      
      // Fetch all enrolled students to calculate "Missed"
      const enrollRes = await fetch(`${BASE_URL}/attendance/enrollment-count?module=${encodeURIComponent(selectedModule)}`);
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        setEnrollmentCount(enrollData.count);
        // We assume the backend might return student list if requested, but for now we look at the attendance controller logic
        // Let's fetch the actual student list for the module
        const studentsRes = await fetch(`${BASE_URL}/auth/students?module=${encodeURIComponent(selectedModule)}`);
        if (studentsRes.ok) {
          const students = await studentsRes.json();
          setAllStudents(students);
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
        setSessionStartTime(new Date());
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
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{selectedModule}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Week {selectedWeek}</div>
                  </div>
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

            {activeSessionId ? (
              <button className="action-btn" onClick={endActiveSession} style={{ backgroundColor: '#dc2626' }}>End Active Session</button>
            ) : (
              <button 
                className="generate-btn" 
                onClick={generateQRCode} 
                style={{ width: '100%', opacity: selectedWeek !== currentAcademicWeek ? 0.5 : 1 }}
                disabled={selectedWeek !== currentAcademicWeek}
              >
                {selectedWeek !== currentAcademicWeek ? `Locked (Only Week ${currentAcademicWeek} open)` : 'Generate QR Code'}
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
            
            <button 
              onClick={() => setShowHistoryModal(true)}
              style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              View Historical Records <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {showHistoryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '800px', borderRadius: '20px', padding: '32px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowHistoryModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><IconX size={24} /></button>
            <h2 style={{ marginBottom: '20px' }}>Historical Attendance Records</h2>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
               <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                 {modules.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                 {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => <option key={w} value={w}>Week {w}</option>)}
               </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attendanceList.length > 0 ? attendanceList.map((rec, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>{rec.student?.username}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{rec.student?.portalId} • {new Date(rec.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontWeight: '700', color: rec.status === 'Present' ? '#10b981' : rec.status === 'Excused' ? '#f59e0b' : '#ef4444' }}>{rec.status.toUpperCase()}</div>
                </div>
              )) : <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No records found for this week.</div>}
            </div>
          </div>
        </div>
      )}
      
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

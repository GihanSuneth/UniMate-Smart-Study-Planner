import React, { useState, useEffect } from 'react';
import { IconCheck, IconX, IconCalendarEvent, IconClock, IconMapPin, IconUsers, IconUser, IconAlertTriangle } from '@tabler/icons-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../api';
import './Attendance.css';

// Ensure we have access to the logged in student ID
const studentId = localStorage.getItem('userId');

function StudentAttendance() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [submittedSessions, setSubmittedSessions] = useState(new Set()); // track local session ids marked
  const [filterModule, setFilterModule] = useState('All');
  const [filterWeek, setFilterWeek] = useState('All');
  const [showMarkModal, setShowMarkModal] = useState(null); // stores the session for modal
  const [tokenInput, setTokenInput] = useState('');
  const [sessionQR, setSessionQR] = useState(null);
  const [historyFilterModule, setHistoryFilterModule] = useState('All');
  const [historyFilterWeek, setHistoryFilterWeek] = useState('All');

  const currentAcademicWeek = 5;
  const modules = ['All', 'Network Design and Modeling', 'Database Systems', 'Operating Systems', 'Data Structures and Algorithms', 'Data Science and Analytics'];
  const weeks = ['All', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];


  useEffect(() => {
    fetchActiveSessions();
    fetchStudentAttendance();
    
    // Poll for active sessions every 10 seconds
    const interval = setInterval(() => {
      fetchActiveSessions();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/attendance/sessions/active`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data);
      }
    } catch (err) {
      console.error('Error fetching active sessions:', err);
    }
  };

  const fetchStudentAttendance = async () => {
    if (!studentId) return;
    try {
      const response = await fetch(`${BASE_URL}/attendance/${studentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      }
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionQR = async (sessionId) => {
    try {
      const response = await fetch(`${BASE_URL}/qr/session/${sessionId}/image`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSessionQR(data.qrImage);
      }
    } catch (err) {
      console.error('Error fetching session QR:', err);
    }
  };

  const markAttendance = async (session) => {
    if (!tokenInput || tokenInput.trim().length !== 6) {
      toast.warning('Please enter a valid 6-character token ID');
      return;
    }

    setMarkingId(session._id);
    try {
      const response = await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: tokenInput.trim().toUpperCase() // using the manual token input for verification
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Successfully marked attendance!`);
        setSubmittedSessions(prev => new Set(prev).add(session._id));
        setTokenInput('');
        fetchStudentAttendance(); // Refresh history
        setTimeout(() => setShowMarkModal(null), 1500);
      } else {
        toast.error(data.message || 'Verification failed. Please check the token ID.');
      }
    } catch (err) {
      toast.error('Network Error. Please try again.');
    } finally {
      setMarkingId(null);
    }
  };


  const overallPercentage = attendanceData?.overallPercentage ? Math.round(attendanceData.overallPercentage) : 0;
  const totalPresent = attendanceData?.records?.filter(r => r.status === 'Present').length || 0;
  // A rough estimate of total days absent based on dynamic denominator (for visual representation)
  // Actually, backend calculates percentage. Total days possible = totalPresent / (overallPercentage/100)
  const totalRecords = attendanceData?.records?.length || 0;
  const totalAssigned = overallPercentage > 0 ? Math.round((totalPresent / overallPercentage) * 100) : totalRecords;
  const totalAbsent = totalAssigned - totalPresent > 0 ? totalAssigned - totalPresent : 0;

  return (
    <div className="attendance-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-header">
        <h1>Digital Check-in</h1>
        <p>Join live lecturer sessions and track your academic participation automatically.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Search Active Sessions</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select value={filterModule} onChange={e => setFilterModule(e.target.value)} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}>
              {weeks.map(w => <option key={w} value={w}>{w === 'All' ? 'All Weeks' : `Week ${w}`}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '8px', borderRadius: '8px' }}><IconClock size={20} /></div>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#92400e' }}>Current Academic Week: {currentAcademicWeek}</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#b45309' }}>You can only join sessions active for this week.</p>
        </div>
      </div>

      <div className="attendance-grid">
        {/* Left Side: Active Sessions */}
        <div className="role-column" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h3 className="card-title" style={{ margin: 0 }}>Active Live Sessions</h3>
               {activeSessions.length > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#22c55e', background: '#f0fdf4', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div> LIVE
                  </span>
               )}
            </div>
            
            <div className="active-sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '220px' }}>
               {activeSessions.filter(s => s.week === currentAcademicWeek && (filterModule === 'All' || s.module === filterModule) && (filterWeek === 'All' || s.week.toString() === filterWeek)).length > 0 ? 
                 activeSessions.filter(s => s.week === currentAcademicWeek && (filterModule === 'All' || s.module === filterModule) && (filterWeek === 'All' || s.week.toString() === filterWeek)).map((session) => {
                 // Check if student has already marked it (via local tracking or historical records match)
                 const hasMarkedLocal = submittedSessions.has(session._id);
                 const hasMarkedHistory = attendanceData?.records?.some(r => r.module === session.module && r.week === session.week);
                 const isSubmitted = hasMarkedLocal || hasMarkedHistory;

                 return (
                   <div key={session._id} style={{
                     padding: '20px',
                     borderRadius: '16px',
                     border: '1px solid #e2e8f0',
                     backgroundColor: '#f8fafc',
                     position: 'relative',
                     overflow: 'hidden'
                   }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                           <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                             Week {session.week} Module
                           </div>
                           <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{session.module}</h4>
                        </div>
                        <div style={{ padding: '6px', backgroundColor: '#eef2ff', borderRadius: '8px', color: '#4f46e5' }}>
                           <IconMapPin size={20} />
                        </div>
                     </div>
                     
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                        <IconUser size={14} /> Lecturer: {session.lecturer?.username || 'Faculty'}
                     </div>

                     {isSubmitted ? (
                        <div style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #a7f3d0' }}>
                          <IconCheck size={18} stroke={3} /> Attendance Recorded
                        </div>
                     ) : (
                        <button 
                          onClick={() => {
                            setShowMarkModal(session);
                            setTokenInput('');
                            setSessionQR(null);
                            fetchSessionQR(session._id);
                          }}
                          disabled={markingId === session._id}
                          style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.2)' }}
                        >
                          {markingId === session._id ? 'Verifying...' : 'Join & Mark Attendance'}
                        </button>

                     )}
                   </div>
                 );
               }) : (
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '12px', padding: '40px 0' }}>
                    <IconClock size={48} stroke={1.5} style={{ opacity: 0.3 }} />
                    <p style={{ textAlign: 'center', fontSize: '14px' }}>No active classes found for the selected filters.<br/>Wait for your lecturer to start a session.</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right side piece chart */}
        <div className="role-column" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 className="card-title" style={{ alignSelf: 'flex-start', width: '100%' }}>Participation Overview</h3>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div className="chart-container" style={{ position: 'relative', width: '220px', height: '220px', margin: '20px 0' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(238, 93, 80, 0.2)"
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#01b574"
                    strokeWidth="4"
                    strokeDasharray={`${overallPercentage}, 100`}
                    strokeLinecap="round"
                    style={{ animation: 'fillChart 1.5s ease-out forwards', strokeDasharray: `${overallPercentage}, 100` }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{overallPercentage}%</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Present</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px', marginTop: '24px', backgroundColor: 'var(--bg-main)', padding: '16px 24px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#01b574' }}></div>
                    <span style={{ fontSize: '15px', color: 'var(--text-dark)', fontWeight: '600' }}>Present</span>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{totalPresent} Session{totalPresent !== 1 && 's'}</span>
                </div>
                
                <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ee5d50' }}></div>
                    <span style={{ fontSize: '15px', color: 'var(--text-dark)', fontWeight: '600' }}>Absent Limit</span>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>~{totalAbsent} Session{totalAbsent !== 1 && 's'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Missed Attendance Section */}
      <div className="attendance-card" style={{ marginTop: '30px', borderLeft: '4px solid #ef4444' }}>
         <h3 className="card-title" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <IconAlertTriangle size={20} color="#ef4444"/> Missed This Week (Week {currentAcademicWeek})
         </h3>
         <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Sessions you were enrolled in but missed checking into.</p>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Logic: modules - attended_in_week8 */}
            {modules.filter(m => m !== 'All').map(mod => {
              const attended = attendanceData?.records?.some(r => r.module === mod && r.week === currentAcademicWeek);
              const activeNow = activeSessions.some(s => s.module === mod && s.week === currentAcademicWeek);
              
              if (!attended && !activeNow) {
                return (
                  <div key={mod} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>{mod}</div>
                      <div style={{ fontSize: '12px', color: '#b91c1c' }}>Missed Week {currentAcademicWeek}</div>
                    </div>
                    <button onClick={() => setHistoryFilterModule(mod)} style={{ background: 'white', color: '#ef4444', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View History</button>
                  </div>
                );
              }
              return null;
            })}
            {/* Placeholder if nothing missed */}
            {modules.filter(m => m !== 'All').every(mod => attendanceData?.records?.some(r => r.module === mod && r.week === currentAcademicWeek) || activeSessions.some(s => s.module === mod && s.week === currentAcademicWeek)) && (
               <div style={{ padding: '20px', textAlign: 'center', color: '#059669', background: '#ecfdf5', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
                 Perfect! You've attended all sessions for your modules so far this week. ✨
               </div>
            )}
         </div>
      </div>

      {/* Historical Records Table */}
      <div className="attendance-card" style={{ marginTop: '30px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><IconCalendarEvent size={20}/> Past Attendance History</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
               <select value={historyFilterModule} onChange={e => setHistoryFilterModule(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600' }}>
                  {modules.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               <select value={historyFilterWeek} onChange={e => setHistoryFilterWeek(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600' }}>
                  {weeks.map(w => <option key={w} value={w}>{w === 'All' ? 'All Weeks' : `Week ${w}`}</option>)}
               </select>
            </div>
         </div>
         
         {!loading && attendanceData?.records?.filter(r => (historyFilterModule === 'All' || r.module === historyFilterModule) && (historyFilterWeek === 'All' || r.week.toString() === historyFilterWeek)).length > 0 ? (
           <div style={{ overflowX: 'auto' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                 <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                   <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Module</th>
                   <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Week</th>
                   <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Date Recorded</th>
                   <th style={{ padding: '16px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {[...attendanceData.records]
                   .filter(r => (historyFilterModule === 'All' || r.module === historyFilterModule) && (historyFilterWeek === 'All' || r.week.toString() === historyFilterWeek))
                   .reverse().map((record) => (
                   <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                     <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{record.module}</td>
                     <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>Week {record.week}</td>
                     <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                     <td style={{ padding: '16px' }}>
                       <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: record.status === 'Present' ? '#dcfce7' : '#fee2e2', color: record.status === 'Present' ? '#15803d' : '#b91c1c' }}>
                         {record.status === 'Present' ? <IconCheck size={14}/> : <IconX size={14}/>} {record.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <p>No historical attendance records found for the selected filters.</p>
           </div>
         )}
      </div>

      {/* Marking Attendance Modal (Slide Window) */}
      {showMarkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', transition: '0.3s' }}>
          <div style={{ width: '100%', maxWidth: '400px', height: '100%', backgroundColor: 'white', boxShadow: '-8px 0 32px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', position: 'relative', animation: 'slideInRight 0.4s ease-out' }}>
            <div style={{ padding: '32px 24px', borderBottom: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Join Lecture Session</h2>
                  <button onClick={() => setShowMarkModal(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><IconX size={24}/></button>
               </div>
               <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Confirm your details to mark attendance for this session.</p>
            </div>             <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
               <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Active Module</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0' }}>{showMarkModal.module}</h3>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Week {showMarkModal.week} • Academic Session</div>
               </div>

               {/* QR Image Injection */}
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '160px', height: '160px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', border: '1px dashed #cbd5e1' }}>
                    {sessionQR ? (
                      <img src={sessionQR} alt="Session QR" style={{ width: '100%', height: '100%', borderRadius: '11px' }} />
                    ) : (
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Loading QR...</div>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>Scan the QR or enter the 6-digit verification code provided by your lecturer.</p>
               </div>

               <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block' }}>Verification Token ID</label>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '24px', fontWeight: '800', textAlign: 'center', letterSpacing: '8px', outline: 'none', color: '#4f46e5' }}
                  />
               </div>

               <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.5' }}>
                  By clicking 'Confirm and Mark', you acknowledge that you are physically present in the lecture hall for this session.
               </p>
            </div>

            <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
               <button 
                 disabled={markingId === showMarkModal._id || tokenInput.length !== 6}
                 onClick={() => markAttendance(showMarkModal)}
                 style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)', transition: '0.2s', opacity: tokenInput.length === 6 ? 1 : 0.6 }}
                 onMouseEnter={(e) => { if(tokenInput.length === 6) e.currentTarget.style.transform = 'translateY(-2px)' }}
                 onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
               >
                 {markingId === showMarkModal._id ? 'Verifying Attendance...' : 'Confirm and Mark Attendance'}
               </button>
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
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default StudentAttendance;

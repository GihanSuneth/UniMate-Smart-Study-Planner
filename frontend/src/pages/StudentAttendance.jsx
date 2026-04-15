import React, { useState, useEffect } from 'react';
import { IconCheck, IconX, IconCalendarEvent, IconClock, IconMapPin, IconUsers, IconUser } from '@tabler/icons-react';
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

  const modules = ['All', 'Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];
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

  const markAttendance = async (session) => {
    setMarkingId(session._id);
    try {
      const response = await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId,
          code: session.uniqueCode // using the hidden code mapped to the visible session
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Successfully marked attendance for ${session.module}!`);
        setSubmittedSessions(prev => new Set(prev).add(session._id));
        fetchStudentAttendance(); // Refresh history
      } else {
        toast.error(data.message || 'Failed to mark attendance. You may have already marked it.');
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
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Filter by Module</label>
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#1e293b' }}>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Filter by Week</label>
          <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#1e293b' }}>
            {weeks.map(w => <option key={w} value={w}>{w === 'All' ? 'All Weeks' : `Week ${w}`}</option>)}
          </select>
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
               {activeSessions.filter(s => (filterModule === 'All' || s.module === filterModule) && (filterWeek === 'All' || s.week.toString() === filterWeek)).length > 0 ? 
                 activeSessions.filter(s => (filterModule === 'All' || s.module === filterModule) && (filterWeek === 'All' || s.week.toString() === filterWeek)).map((session) => {
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
                          onClick={() => markAttendance(session)}
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

      {/* Historical Records Table */}
      <div className="attendance-card" style={{ marginTop: '30px' }}>
         <h3 className="card-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><IconCalendarEvent size={20}/> Past Attendance History</h3>
         
         {!loading && attendanceData?.records?.filter(r => (filterModule === 'All' || r.module === filterModule) && (filterWeek === 'All' || r.week.toString() === filterWeek)).length > 0 ? (
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
                   .filter(r => (filterModule === 'All' || r.module === filterModule) && (filterWeek === 'All' || r.week.toString() === filterWeek))
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
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default StudentAttendance;

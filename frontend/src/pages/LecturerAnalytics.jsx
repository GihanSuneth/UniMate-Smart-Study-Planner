import React, { useState, useEffect } from 'react';
import { 
  IconFlame, IconUserOff, IconCheck, IconX, IconUser,
  IconBooks, IconNotes, IconBrain, IconAlertTriangle, IconChartBar, IconListCheck,
  IconDownload, IconQrcode
} from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../api';
import './Analytics.css';

function LecturerAnalytics() {
  const [selectedModule, setSelectedModule] = useState('Programming Applications');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [qrCode, setQrCode] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  
  const modules = ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];

  // Handle generating the Session QR
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
        // Auto-refresh the list
        fetchAttendance();
      } else {
        toast.error('Failed to create session');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Server connection error');
    }
  };

  // Handle ending the session
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

  // Handle fetching attendance list for the module
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
      console.error(error);
    }
  };

  // Fetch when module or week changes
  useEffect(() => {
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, selectedWeek]);

  // Handle CSV Download natively
  const downloadCSV = () => {
    if (!attendanceList.length) return toast.warn('No records to export');
    
    let csv = 'Student ID,Username,Email,Module,Week,Date,Status\n';
    
    attendanceList.forEach(rec => {
      const studentId = rec.student?._id || 'N/A';
      const name = rec.student?.username || 'Unknown';
      const email = rec.student?.email || 'N/A';
      const date = new Date(rec.date).toLocaleDateString();
      csv += `"${studentId}","${name}","${email}","${rec.module}",${rec.week},"${date}","${rec.status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_${selectedModule.replace(' ', '')}_Week${selectedWeek}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Downloaded!');
  };

  return (
    <div className="analytics-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-header">
        <h1>Lecturer Analytics & Attendance</h1>
        <p>Comprehensive overview of class performance and historical attendance records.</p>
      </div>

      <div className="analytics-dashboard-grid">
        
        {/* Main Column */}
        <div className="analytics-main-col">
          
          <div className="overview-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Module</label>
                <select 
                  value={selectedModule} 
                  onChange={(e) => setSelectedModule(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  {modules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Week</label>
                <select 
                  value={selectedWeek} 
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => <option key={w} value={w}>Week {w}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="overview-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="overview-card-header" style={{ margin: 0 }}>Attendance Records ({selectedModule} - W{selectedWeek})</h3>
              <button 
                onClick={downloadCSV}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', background: '#10b981', color: '#fff',
                  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                <IconDownload size={14} /> Export CSV
              </button>
            </div>
            
            <div className="overview-stats-grid">
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className="icon blue"><IconUser size={14}/></div>
                  <span>Total Present (This Week)</span>
                </div>
                <div className="stat-box-value">
                  <h2>{attendanceList.length}</h2>
                  <span className="trend up">Students</span>
                </div>
              </div>
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className="icon orange"><IconChartBar size={14}/></div>
                  <span>Proportion (Est 100 Class Size)</span>
                </div>
                <div className="stat-box-value">
                  <h2>{attendanceList.length > 0 ? ((attendanceList.length / 100) * 100).toFixed(1) : 0}%</h2>
                </div>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill orange" style={{width: `${Math.min((attendanceList.length/100)*100, 100)}%`}}></div>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div style={{ marginTop: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Student Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#475569', fontWeight: '600' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.length > 0 ? attendanceList.map(rec => (
                    <tr key={rec._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1e293b' }}>
                        {rec.student?.username || 'Unknown'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {rec.student?.email || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', padding: '4px 10px', background: '#dcfce7', color: '#15803d', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          <IconCheck size={12} style={{marginRight: 4}}/> Present
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>
                        {new Date(rec.date).toLocaleDateString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                        No records found for this week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          <div className="overview-card" style={{ marginBottom: '24px' }}>
            <h3 className="overview-card-header">Class Insights</h3>
            <div className="overview-stats-grid">
              
              <div className="analytics-stat-box weak-topics-box">
                <div className="stat-box-top">
                  <div className="icon light-blue" style={{backgroundColor: '#e3f2fd', color: '#42a5f5'}}><IconAlertTriangle size={14}/></div>
                  <span>Class Weak Scenarios</span>
                </div>
                <ul className="topic-bullet-list">
                  <li>Complex Joins (COMP200)</li>
                  <li>Recursion Trees (CS101)</li>
                  <li>Dynamic Programming (CS101)</li>
                </ul>
                <button className="review-btn" style={{ alignSelf: 'flex-start' }}>
                  Adjust Modules
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="analytics-side-col">
          
          <div className="lecturer-analytics-card">
            <h3 className="la-header">Engagement Pulse</h3>
            <p className="la-subheader">Student Engagement across all modules this week</p>

            <div className="donut-chart-container" style={{ margin: '20px 0' }}>
              <div className="donut-svg-wrapper">
                <svg viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e9edf7" strokeWidth="6" />
                  {/* Primary Blue segment */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#266df1" strokeWidth="6" strokeDasharray="65, 100" />
                  {/* Orange segment */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffb547" strokeWidth="6" strokeDasharray="15, 100" strokeDashoffset="-65" />
                  {/* Green segment */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#01b574" strokeWidth="6" strokeDasharray="20, 100" strokeDashoffset="-80" />
                </svg>
              </div>
              <div className="donut-legend">
                <div className="legend-item">
                   <div className="legend-label legend-color-active"><IconFlame size={14} /> Active</div>
                   <div className="legend-sub">64 Students</div>
                </div>
                <div className="legend-item">
                   <div className="legend-label legend-color-inactive"><IconUserOff size={14} /> Inactive</div>
                   <div className="legend-sub">11 Students</div>
                </div>
              </div>
            </div>

            <div className="lecturer-insights" style={{ marginBottom: '20px' }}>
              <div className="insight-title">Quick Action Items:</div>
              <ul className="insight-list">
                <li>Review CS101 Recursion materials</li>
                <li>Send reminder to 11 inactive students</li>
              </ul>
            </div>

            <div className="key-observation">
              <div className="key-title">AI Suggestion:</div>
              <div className="key-text">
                Your students show strong interactive learning patterns. Consider adding visual step-by-step algorithms in the next CS101 session.
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

export default LecturerAnalytics;

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
  const [activeTab, setActiveTab] = useState('attendance');
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
    
    let csv = 'Portal ID,Username,Email,Module,Week,Date,Status\n';
    
    attendanceList.forEach(rec => {
      const studentId = rec.student?.portalId || 'N/A';
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
    <div className="analytics-page" style={{ paddingBottom: '40px' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-header">
        <h1>Lecturer Analytics & Attendance</h1>
        <p>Comprehensive overview of class performance and historical attendance records.</p>
      </div>

      <div className="overview-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Academic Week</label>
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

      {/* Tabs List */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('attendance')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'attendance' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'attendance' ? '#6366f1' : '#64748b', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s' }}
        >
          Attendance Analytics
        </button>
        <button 
          onClick={() => setActiveTab('performance')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === 'performance' ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === 'performance' ? '#6366f1' : '#64748b', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s' }}
        >
          Performance Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'attendance' && (
          <div className="overview-card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="overview-card-header" style={{ margin: 0 }}>Attendance Records ({selectedModule} - Week {selectedWeek})</h3>
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

            {/* Attendance Pattern Analysis */}
            <div className="actual-vs-target-summary" style={{ marginBottom: '24px', marginTop: '24px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
               <div className="target-summary-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                  <IconBrain size={18} color="#6366f1" /> 
                  <span>Attendance Pattern Analysis</span>
               </div>
               <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', marginBottom: '16px' }}>
                 Intelligence cluster indicates a <strong>15% drop-off</strong> in attendance during the second half of the module relative to the first week. Students who miss Week {Math.max(1, selectedWeek - 1)} tend to also miss Week {selectedWeek}.
               </p>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '16px', fontWeight: '600' }}>High Risk: Friday Morning Labs</span>
                 <span style={{ fontSize: '12px', background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '16px', fontWeight: '600' }}>Strong: Monday Lectures</span>
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
        )}

        {activeTab === 'performance' && (
          <div className="details-row" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="overview-card-header" style={{ marginBottom: 0 }}>Class Weekly Learning Report: {selectedModule} (Week {selectedWeek})</h3>
              <div className="ai-badge"><IconBrain size={14}/> Clustered Class Data</div>
            </div>

            <div className="deep-analysis-section">
               <div className="analysis-grid">
                  {/* Question Failure Analysis */}
                  <div className="analysis-box">
                     <div className="box-header"><IconAlertTriangle size={18} color="#ef4444" /> <span>Critical: Highest Failure Questions</span></div>
                     <p className="box-desc">These specific questions have the lowest pass rate across all student attempts in {selectedModule}.</p>
                     <ul className="failing-questions-list">
                        {[
                          { text: "What is the primary difference between a clustered and non-clustered index?", rate: 72 },
                          { text: "Explain the BCNF normalization form with an example.", rate: 61 }
                        ].map((q, i) => (
                          <li key={i}>
                            <div className="q-head">
                               <span className="q-text">{q.text}</span>
                               <span className="fail-badge">{q.rate}% Failure</span>
                            </div>
                            <div className="fail-bar"><div className="fail-fill" style={{ width: `${q.rate}%` }}></div></div>
                          </li>
                        ))}
                     </ul>
                  </div>

                  {/* High Score Clusters */}
                  <div className="analysis-box">
                     <div className="box-header"><IconCheck size={18} color="#10b981" /> <span>High Mastery Topics</span></div>
                     <p className="box-desc">Topics where the class average is above 85%.</p>
                     <div className="mastery-chips">
                        <span className="chip green">ER Diagrams</span>
                        <span className="chip green">Basic SQL</span>
                        <span className="chip green">DDL Commands</span>
                     </div>
                  </div>
               </div>

               {/* AI Gaps Suggestion */}
               <div className="actual-vs-target-summary" style={{ marginTop: '24px', backgroundColor: '#eef2ff', borderColor: '#c7d2fe', padding: '20px', borderRadius: '12px' }}>
                  <div className="target-summary-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#312e81' }}>
                     <IconBrain size={18} color="#4338ca" /> 
                     <span>Intelligence Suggestion: Curriculum Gap Filling</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#374151', marginTop: '12px', lineHeight: '1.5' }}>
                    Based on the high failure rate in clustered vs. non-clustered indexes, it is recommended to introduce a visual diagram exercise mapping out index nodes. Providing a short, ungraded pop-quiz focusing purely on index lookup times might reinforce the theoretical differences practically.
                  </p>
                  <button style={{ marginTop: '16px', background: '#4338ca', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Generate Exercise Material
                  </button>
               </div>

               <div className="actual-vs-target-summary" style={{ marginTop: '24px' }}>
                  <div className="target-summary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Class Performance Summary (Current Week)</span>
                    <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconBulb size={14} color="#f59e0b" /> **Bench:** Standard target/benchmark for this module
                    </div>
                  </div>
                  <div className="summary-bars">
                     <div className="summary-row">
                        <span>Average Attendance</span>
                        <div className="bar-set">
                           <div className="target-marker" style={{ left: '75%' }}>Bench</div>
                           <div className="actual-bar" style={{ width: '82%' }}>82%</div>
                        </div>
                     </div>
                     <div className="summary-row">
                        <span>Average Quiz Score</span>
                        <div className="bar-set">
                           <div className="target-marker" style={{ left: '80%' }}>Bench</div>
                           <div className="actual-bar quiz" style={{ width: '74%' }}>74%</div>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Note Taking Patterns Analysis */}
               <div className="actual-vs-target-summary" style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                  <div className="target-summary-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <IconNotes size={18} color="#6366f1" /> 
                     <span>Note Taking Patterns Analysis</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: '16px' }}>Student engagement with AI-generated notes for {selectedModule} in Week {selectedWeek}.</p>
                  
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                     <div style={{ flex: 1, minWidth: '200px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Total Notes Generated</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>142</div>
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>+12% vs Last Week</div>
                     </div>
                     <div style={{ flex: 1, minWidth: '200px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Active Note Takers</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>48<span style={{ fontSize: '16px', color: '#94a3b8' }}>/64</span></div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Students utilizing AI Notes</div>
                     </div>
                     <div style={{ flex: 1, minWidth: '200px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Top Summarized Topic</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>Normalization (1NF-3NF)</div>
                        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>High review priority indicating struggle</div>
                     </div>
                  </div>
               </div>
               
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LecturerAnalytics;

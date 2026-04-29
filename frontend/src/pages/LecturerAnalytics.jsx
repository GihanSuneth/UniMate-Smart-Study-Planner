import React, { useState, useEffect } from 'react';
import { 
  IconFlame, IconUserOff, IconCheck, IconX, IconUser,
  IconBooks, IconNotes, IconBrain, IconAlertTriangle, IconChartBar, IconListCheck,
  IconDownload, IconQrcode, IconBulb, IconRobot
} from '@tabler/icons-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../api';
import './Analytics.css';

function LecturerAnalytics() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedModule, setSelectedModule] = useState('Network Design and Modeling');
  const [selectedWeek, setSelectedWeek] = useState(5);
  const [loading, setLoading] = useState(false); // eslint-disable-line no-unused-vars
  const [attendanceList, setAttendanceList] = useState([]);
  const [classInsight, setClassInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deepDive, setDeepDive] = useState(null);
  const [attendanceInsight, setAttendanceInsight] = useState(null);
  const [attInsightLoading, setAttInsightLoading] = useState(false);
  
  const [modules, setModules] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const moduleNames = {
    'Network Design and Modeling': 'IT3010 - Network Design and Modeling',
    'Database System': 'IT3011 - Database System',
    'Operating Systems': 'IT3012 - Operating Systems',
    'Data Structures and Algorithms': 'IT3013 - Data Structures and Algorithms',
    'Data Science and Analytics': 'IT3014 - Data Science and Analytics'
  };

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
        }
      }
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  const getFullModuleName = (code) => moduleNames[code] || code;
  // Handle fetching attendance list for the module
  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${BASE_URL}/attendance/module/${encodeURIComponent(selectedModule)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const weekData = data.filter(r => r.week === selectedWeek);
          setAttendanceList(weekData);
        } else {
          setAttendanceList([]);
        }
      }
    } catch (error) {
      console.error(error);
      setAttendanceList([]);
    }
  };

  // Fetch when module or week changes
  useEffect(() => {
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, selectedWeek]);

  const fetchClassInsight = async (deepDiveData = null) => {
    const dataToUse = deepDiveData || deepDive;
    if (!dataToUse) return;
    
    setInsightLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/analytics/generate-ai-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          role: 'lecturer',
          module: selectedModule,
          week: selectedWeek,
          studentId: localStorage.getItem('userId') 
        })
      });
      if (response.ok) {
        const data = await response.json();
        setClassInsight(data);
        toast.success("AI Academic Intelligence Deployed!");
      } else {
        const errData = await response.json();
        if (response.status === 429) {
          toast.warning("Gemini AI Quota Exceeded. Please wait 60 seconds before retrying.");
        } else {
          toast.error(errData.message || "Failed to deploy AI Intelligence.");
        }
      }
    } catch (err) {
      console.error('Failed to fetch class insight', err);
      toast.error("Network error while deploying AI.");
    } finally {
      setInsightLoading(false);
    }
  };

  const fetchAttendanceInsight = async () => {
    setAttInsightLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/analytics/generate-ai-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          role: 'lecturer',
          module: selectedModule,
          week: selectedWeek,
          type: 'attendance_patterns'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceInsight(data);
        toast.success("AI Attendance Patterns Deployed!");
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Failed to deploy Attendance AI.");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setAttInsightLoading(false);
    }
  };

  const handleDeployResource = async () => {
    if (!classInsight?.weeklyAnalysis) {
      toast.error("No intelligence insight available to deploy.");
      return;
    }
    
    setIsDeploying(true);
    try {
      const response = await fetch(`${BASE_URL}/notes/deploy-insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: `AI Insight: ${selectedModule} (Week ${selectedWeek})`,
          module: selectedModule,
          content: {
            "Identified Problem": classInsight.weeklyAnalysis.problem,
            "Pattern Reason": classInsight.weeklyAnalysis.reason,
            "AI Suggestion": classInsight.weeklyAnalysis.suggestion,
            "Mandatory Improvement Plan": classInsight.improvementPlan
          }
        })
      });

      if (response.ok) {
        toast.success(`Resource deployed to all students in ${selectedModule}!`);
      } else {
        throw new Error("Failed to deploy resource");
      }
    } catch (err) {
      console.error(err);
      toast.error("Resource deployment failed.");
    } finally {
      setIsDeploying(false);
    }
  };

  const fetchDeepDive = async () => {
    try {
      const response = await fetch(`${BASE_URL}/analytics/quiz-deep-dive/${encodeURIComponent(selectedModule)}?week=${selectedWeek}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDeepDive(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'performance') {
      setClassInsight(null); // Clear stale insight for fresh AI pull
      fetchDeepDive();
    }
  }, [activeTab, selectedModule, selectedWeek]);

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
               {modules.length > 0 ? (
                 modules.map(m => <option key={m} value={m}>{getFullModuleName(m)}</option>)
               ) : (
                 <option value="">No Modules Assigned</option>
               )}
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
              <h3 className="overview-card-header" style={{ margin: 0 }}>Attendance Records ({getFullModuleName(selectedModule)} - Week {selectedWeek})</h3>
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
                  <span>Proportion (Class Size: {deepDive?.classStats?.totalEnrolled || 25})</span>
                </div>
                <div className="stat-box-value">
                  <h2>{attendanceList.length > 0 ? ((attendanceList.length / (deepDive?.classStats?.totalEnrolled || 25)) * 100).toFixed(1) : 0}%</h2>
                </div>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill orange" style={{width: `${Math.min((attendanceList.length / (deepDive?.classStats?.totalEnrolled || 25)) * 100, 100)}%`}}></div>
                </div>
              </div>
            </div>

            {/* Attendance Pattern Analysis */}
            <div className="actual-vs-target-summary" style={{ 
              marginBottom: '24px', 
              marginTop: '24px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '16px',
              padding: '24px',
              background: '#f8fafc',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}>
               <div className="target-summary-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1e293b', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconBrain size={20} color="#6366f1" /> 
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.5px' }}>Attendance Pattern Analysis</span>
                  </div>
                  {!attendanceInsight && (
                    <button 
                      onClick={fetchAttendanceInsight}
                      disabled={attInsightLoading}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: attInsightLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {attInsightLoading ? 'Analyzing...' : <><IconRobot size={14} /> Deploy Pattern AI</>}
                    </button>
                  )}
               </div>

               {attInsightLoading ? (
                 <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    Cracking class participation clusters...
                 </div>
               ) : attendanceInsight ? (
                 <div style={{ animation: 'slideIn 0.4s ease-out' }}>
                   <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', marginBottom: '16px' }}>
                     Intelligence cluster indicates a <strong>{attendanceInsight.dropOffTrend}</strong> in attendance. <strong>{attendanceInsight.patternInsight}</strong>.
                   </p>
                   <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #fecaca' }}>
                       <IconAlertTriangle size={14} /> High Risk: {attendanceInsight.highRiskWindow}
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid #bbf7d0' }}>
                       <IconCheck size={14} /> Strong Record: {attendanceInsight.strongCoverage}
                     </div>
                   </div>
                 </div>
               ) : (
                 <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Deploy Attendance AI to reveal hidden participation correlations and risk windows.</p>
                 </div>
               )}
            </div>

          </div>
        )}

        {activeTab === 'performance' && (
          <div className="details-row" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="overview-card-header" style={{ marginBottom: 0 }}>
                Class Weekly Learning Report: {getFullModuleName(selectedModule)} (Week {selectedWeek})
              </h3>
              <div className="ai-badge"><IconBrain size={14}/> Clustered Class Data</div>
            </div>

            <div className="deep-analysis-section">
               <div className="analysis-grid">
                   {/* Question Failure Analysis */}
                  <div className="analysis-box">
                     <div className="box-header"><IconAlertTriangle size={18} color="#ef4444" /> <span>Critical: Highest Failure Questions</span></div>
                     <p className="box-desc">These specific questions have the lowest pass rate across all student attempts in {selectedModule}.</p>
                     <ul className="failing-questions-list">
                        {deepDive?.hardestQuestions?.length > 0 ? deepDive.hardestQuestions.map((q, i) => (
                          <li key={i}>
                            <div className="q-head">
                               <span className="q-text">{q.text}</span>
                               <span className="fail-badge">{q.failureRate.toFixed(1)}% Failure</span>
                            </div>
                            <div className="fail-bar"><div className="fail-fill" style={{ width: `${q.failureRate}%` }}></div></div>
                          </li>
                        )) : (
                          <p style={{ fontSize: '13px', color: '#94a3b8' }}>Not enough quiz data to determine failure spots.</p>
                        )}
                     </ul>
                  </div>

                  {/* High Score Clusters */}
                  <div className="analysis-box">
                     <div className="box-header"><IconCheck size={18} color="#10b981" /> <span>High Mastery Topics</span></div>
                     <p className="box-desc">Overall topic performance based on average scores.</p>
                     <div className="mastery-chips">
                        {deepDive?.quizPerformance?.map((qp, i) => (
                           <span key={i} className={`chip ${qp.avgScore >= 80 ? 'green' : qp.avgScore >= 50 ? 'orange' : 'red'}`}>
                             {qp.title} ({(qp.avgScore || 0).toFixed(0)}%)
                           </span>
                        ))}
                        {!deepDive?.quizPerformance?.length && <span className="chip" style={{ background: '#f1f5f9', color: '#64748b' }}>No quizzes taken yet</span>}
                     </div>
                  </div>
               </div>

               {/* AI Gaps Suggestion */}
               <div className="actual-vs-target-summary" style={{ 
                 marginTop: '24px', 
                 backgroundColor: '#f8fafc', 
                 borderColor: '#e2e8f0', 
                 padding: '24px', 
                 borderRadius: '16px',
                 border: '1px solid #e2e8f0',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
               }}>
                  <div className="target-summary-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: '800', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.5px' }}>
                     <IconBrain size={20} color="#6366f1" /> 
                     <span>Class Weekly Academic Intelligence</span>
                  </div>
                  
                  {insightLoading ? (
                    <div style={{ marginTop: '20px', padding: '20px', textAlign: 'center', color: '#64748b' }}>Analyzing class patterns...</div>
                  ) : classInsight && classInsight.weeklyAnalysis ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                       <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', marginBottom: '4px' }}>Detected Problem</div>
                          <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>{classInsight.weeklyAnalysis.problem}</div>
                       </div>
                       
                       <div style={{ borderLeft: '4px solid #6366f1', paddingLeft: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', marginBottom: '4px' }}>Pattern Reason</div>
                          <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{classInsight.weeklyAnalysis.reason}</div>
                       </div>

                       <div style={{ borderLeft: '4px solid #10b981', paddingLeft: '16px', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', marginBottom: '4px' }}>AI Suggestion for Faculty</div>
                          <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '500', lineHeight: '1.6' }}>{classInsight.weeklyAnalysis.suggestion}</div>
                       </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '20px', padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                       <IconBrain size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
                       <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Class Intelligence Offline</div>
                       <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 20px' }}>Deploy AI Analytics manually to generate deep pedagogical insights for this module.</p>
                       <button 
                        onClick={() => fetchClassInsight()}
                        disabled={insightLoading || !deepDive}
                        style={{ 
                          backgroundColor: insightLoading ? '#94a3b8' : '#6366f1', 
                          color: 'white', 
                          border: 'none', 
                          padding: '12px 32px', 
                          borderRadius: '12px', 
                          fontWeight: '800', 
                          fontSize: '14px', 
                          cursor: insightLoading ? 'not-allowed' : 'pointer',
                          boxShadow: insightLoading ? 'none' : '0 10px 25px rgba(99, 102, 241, 0.4)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          margin: '0 auto'
                        }}
                       >
                         {insightLoading ? (
                           <>
                             <div className="spinner" style={{ width: '16px', height: '16px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                             Deploying Intelligence...
                           </>
                         ) : (
                           <>
                             <IconRobot size={18} /> Deploy AI Analytics
                           </>
                         )}
                       </button>
                    </div>
                  )}
                  

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
                           <div className="actual-bar" style={{ width: `${deepDive?.classStats?.attendance || 0}%` }}>{deepDive?.classStats?.attendance || 0}%</div>
                        </div>
                     </div>
                     <div className="summary-row">
                        <span>Average Quiz Score</span>
                        <div className="bar-set">
                           <div className="target-marker" style={{ left: '80%' }}>Bench</div>
                           <div className="actual-bar quiz" style={{ width: `${deepDive?.averageScore || 0}%` }}>{deepDive?.averageScore || 0}%</div>
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
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{deepDive?.classStats?.notesFrequency || 0}</div>
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Active Class Records</div>
                     </div>
                     <div style={{ flex: 1, minWidth: '200px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Active Note Takers</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>
                          {deepDive?.classStats?.activeNoteTakers || 0}
                          <span style={{ fontSize: '16px', color: '#94a3b8' }}>/{deepDive?.classStats?.totalEnrolled || 64}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Students utilizing AI Notes</div>
                     </div>
                     <div style={{ flex: 1, minWidth: '200px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Top Summarized Topic</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>{deepDive?.bestSubtopic || 'General Concepts'}</div>
                        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>Recent AI engagement hub</div>
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

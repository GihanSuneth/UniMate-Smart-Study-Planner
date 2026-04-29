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
                  <h2>{attendanceList.length > 0 ? ((attendanceList.length / (deepDive?.classStats?.totalEnrolled || 25)) * 100).toFixed(2) : (0).toFixed(2)}%</h2>
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

            {/* ── Unified Class Academic Intelligence Card ─────────────────── */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>

              {/* Card Header — always visible */}
              <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'white', fontSize: '16px', fontWeight: '800', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: classInsight ? '#4ade80' : '#818cf8', flexShrink: 0 }}></div>
                    🧠 Class Academic Intelligence
                  </div>
                  <div style={{ color: '#a5b4fc', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>
                    {getFullModuleName(selectedModule)} · Week {selectedWeek}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {classInsight && (
                    <div style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '10px', letterSpacing: '1px' }}>AI LIVE</div>
                  )}
                  <div style={{ background: 'rgba(255,255,255,0.1)', color: '#c7d2fe', fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px' }}>CLUSTERED DATA</div>
                </div>
              </div>

              {/* ── PRE-DEPLOY: Teaser + Deploy Button ─────────────────────── */}
              {!classInsight && (
                <div style={{ padding: '28px' }}>
                  {/* 3 live metric tiles (from deepDive — no AI needed) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {[
                      { label: 'Class Avg Score', value: `${(deepDive?.averageScore || 0).toFixed(1)}%`, color: '#6366f1', icon: '📊', sub: 'This week' },
                      { label: 'Attendance', value: `${(deepDive?.classStats?.attendance || 0).toFixed(1)}%`, color: '#10b981', icon: '✅', sub: `of ${deepDive?.classStats?.totalEnrolled || 25} students` },
                      { label: 'Notes Generated', value: deepDive?.classStats?.notesFrequency || 0, color: '#f59e0b', icon: '📝', sub: `${deepDive?.classStats?.activeNoteTakers || 0} active takers` }
                    ].map((tile, i) => (
                      <div key={i} style={{ background: '#f8fafc', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{tile.icon}</div>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: tile.color }}>{tile.value}</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginTop: '4px' }}>{tile.label}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{tile.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Deploy prompt */}
                  <div style={{ background: '#f0f4ff', borderRadius: '16px', padding: '32px', textAlign: 'center', border: '2px dashed #c7d2fe' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧠</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>AI Intelligence Offline</div>
                    <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                      Deploy AI to identify class-wide topic gaps, the hardest questions, mastery patterns, and a targeted lecturer action protocol for Week {selectedWeek}.
                    </p>
                    <button
                      onClick={() => fetchClassInsight()}
                      disabled={insightLoading || !deepDive}
                      style={{
                        background: insightLoading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        color: 'white', border: 'none', padding: '14px 40px', borderRadius: '12px',
                        fontWeight: '800', fontSize: '14px', cursor: insightLoading ? 'not-allowed' : 'pointer',
                        boxShadow: insightLoading ? 'none' : '0 8px 24px rgba(99,102,241,0.4)',
                        transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', gap: '10px'
                      }}
                    >
                      {insightLoading ? (
                        <><div className="spinner" style={{ width: '16px', height: '16px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>Deploying Intelligence...</>
                      ) : (
                        <><IconBrain size={18} /> Deploy AI Analytics</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── POST-DEPLOY: Full Intelligence ─────────────────────────── */}
              {classInsight && (
                <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Section 1 — Topic Gap Map */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🔴 Class Topic Gap Map
                    </div>
                    {deepDive?.topicFailureSummary?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {deepDive.topicFailureSummary.map((t, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', borderRadius: '10px', padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ flex: '0 0 160px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{t.topic}</div>
                            <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${t.failureRate}%`, background: t.severity === 'Critical' ? '#ef4444' : t.severity === 'Warning' ? '#f97316' : '#eab308', borderRadius: '10px', transition: 'width 0.8s ease' }}></div>
                            </div>
                            <div style={{ flex: '0 0 60px', textAlign: 'right', fontSize: '13px', fontWeight: '800', color: t.severity === 'Critical' ? '#dc2626' : t.severity === 'Warning' ? '#ea580c' : '#ca8a04' }}>{t.failureRate.toFixed(1)}%</div>
                            <div style={{ flex: '0 0 100px', textAlign: 'right', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{t.studentsAffected} students</div>
                            <div style={{ background: t.severity === 'Critical' ? '#fee2e2' : t.severity === 'Warning' ? '#ffedd5' : '#fef9c3', color: t.severity === 'Critical' ? '#dc2626' : t.severity === 'Warning' ? '#ea580c' : '#ca8a04', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '8px' }}>{t.severity}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', borderRadius: '10px' }}>No topic gaps detected for this week.</div>
                    )}
                  </div>

                  {/* Section 2 — Mastery Confirmed */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>🟢 Mastery Confirmed This Week</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {deepDive?.topicFailureSummary?.filter(t => t.failureRate < 35).length > 0
                        ? deepDive.topicFailureSummary.filter(t => t.failureRate < 35).map((t, i) => (
                            <span key={i} style={{ background: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: '700', padding: '5px 14px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>✅ {t.topic}</span>
                          ))
                        : deepDive?.quizPerformance?.filter(q => q.avgScore >= 75).map((q, i) => (
                            <span key={i} style={{ background: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: '700', padding: '5px 14px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>✅ {q.title} ({q.avgScore.toFixed(0)}%)</span>
                          ))
                      }
                      {(!deepDive?.topicFailureSummary?.some(t => t.failureRate < 35) && !deepDive?.quizPerformance?.some(q => q.avgScore >= 75)) && (
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No topics have reached mastery threshold this week.</span>
                      )}
                    </div>
                  </div>

                  {/* Section 3 — Hardest Questions */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>❗ Top Hardest Questions</div>
                    {deepDive?.hardestQuestions?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {deepDive.hardestQuestions.map((q, i) => (
                          <div key={i} style={{ background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', overflow: 'hidden' }}>
                            {/* Question text */}
                            <div style={{ padding: '12px 16px 8px' }}>
                              <div style={{ fontSize: '13px', color: '#78350f', fontWeight: '600', marginBottom: '10px', lineHeight: '1.5' }}>
                                Q{i + 1}: {q.text.length > 140 ? q.text.substring(0, 140) + '…' : q.text}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1, height: '6px', background: '#fde68a', borderRadius: '10px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${q.failureRate}%`, background: q.failureRate === 100 ? '#ef4444' : '#f59e0b', borderRadius: '10px' }}></div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: q.failureRate === 100 ? '#dc2626' : '#b45309', whiteSpace: 'nowrap' }}>{q.failureRate.toFixed(0)}% failed</span>
                              </div>
                            </div>
                            {/* Quiz source metadata */}
                            <div style={{ background: '#fef3c7', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid #fde68a' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#92400e', fontWeight: '600' }}>
                                <span>📋</span>
                                <span>{q.quizTitle || 'Unknown Quiz'}</span>
                              </div>
                              {q.quizDate && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#a16207', fontWeight: '500' }}>
                                  <span>🗓</span>
                                  <span>{new Date(q.quizDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', borderRadius: '10px' }}>No question failure data available yet.</div>
                    )}
                  </div>

                  {/* Section 4 — AI Pattern Protocol */}
                  {classInsight?.weeklyAnalysis && (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8' }}></div>
                        🧠 AI Pattern Protocol
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        <div style={{ background: '#fef2f2', padding: '14px 18px', borderLeft: '4px solid #ef4444', borderRadius: '12px 12px 0 0' }}>
                          <div style={{ fontSize: '10px', fontWeight: '900', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>🚩 Detected Class Pattern</div>
                          <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '700', lineHeight: '1.6' }}>{classInsight.weeklyAnalysis.problem}</div>
                        </div>
                        <div style={{ background: '#faf5ff', padding: '14px 18px', borderLeft: '4px solid #8b5cf6' }}>
                          <div style={{ fontSize: '10px', fontWeight: '900', color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>🤖 Why This Is Happening</div>
                          <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', fontWeight: '500' }}>{classInsight.weeklyAnalysis.reason}</div>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: '14px 18px', borderLeft: '4px solid #10b981', borderRadius: '0 0 12px 12px' }}>
                          <div style={{ fontSize: '10px', fontWeight: '900', color: '#065f46', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>📋 Lecturer Action Protocol</div>
                          <div style={{ fontSize: '13px', color: '#14532d', fontWeight: '600', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{classInsight.weeklyAnalysis.suggestion}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 5 — Baseline Metrics */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>📊 Baseline Metrics</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                      {[
                        { label: 'Average Attendance', value: deepDive?.classStats?.attendance || 0, bench: 75, color: '#6366f1' },
                        { label: 'Average Quiz Score', value: deepDive?.averageScore || 0, bench: 80, color: '#10b981' }
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ flex: '0 0 140px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>{row.label}</div>
                          <div style={{ flex: 1, position: 'relative', height: '28px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', left: `${row.bench}%`, top: 0, bottom: 0, width: '2px', background: '#94a3b8', zIndex: 2 }}></div>
                            <div style={{ height: '100%', width: `${row.value}%`, background: row.color, borderRadius: '8px', transition: 'width 0.8s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: 'white' }}>{row.value.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', flex: '0 0 60px' }}>Bench {row.bench}%</div>
                        </div>
                      ))}
                    </div>
                    {/* Notes strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { label: 'Notes Generated', value: deepDive?.classStats?.notesFrequency || 0, sub: 'Class records' },
                        { label: 'Active Note Takers', value: `${deepDive?.classStats?.activeNoteTakers || 0}/${deepDive?.classStats?.totalEnrolled || 25}`, sub: 'Students using AI Notes' },
                        { label: 'Best Topic (AI Notes)', value: deepDive?.bestSubtopic || 'N/A', sub: 'Most summarised' }
                      ].map((tile, i) => (
                        <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>{tile.label}</div>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{tile.value}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{tile.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default LecturerAnalytics;

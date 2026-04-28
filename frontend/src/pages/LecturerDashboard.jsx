import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconCalendarStats, IconPencilCheck, IconTrendingUp,
  IconTrendingDown, IconRefresh, IconBulb, IconUsers, IconListCheck, IconReportAnalytics,
  IconCheckbox,
  IconSquare,
  IconReport,
  IconNotes,
  IconBrain,
  IconBooks,
  IconChevronRight,
  IconCalendar
} from '@tabler/icons-react';

import actionFigureImg from '../images/action-figure-1.png';
import { BASE_URL } from '../api';

function LecturerDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);


  const [classStats, setClassStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Fetch Profile
        const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setUserData(profileData);
        }

        // 2. Fetch Weekly Class Stats (Aggregate for lecturer modules)
        const statsRes = await fetch(`${BASE_URL}/analytics/weekly-report`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const sData = await statsRes.json();
        if (statsRes.ok) {
          setClassStats(sData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-container">Loading Dashboard...</div>;

  return (
    <>
      <div className="welcome-banner" >
        <h1>Welcome Back, {userData?.username || 'Lecturer'} <span role="img" aria-label="wave">👋</span></h1>
        <p>Overview of your student's progress and active modules.</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {/* Row 1 Stats */}


        {/* Row 1: Notes (Left) -> Attendance -> Quiz -> Avatar (Right, spans 2 rows) */}
        <div className="stat-card card-notes">
          <div className="stat-header">
            <div className="stat-title">
              <div className="icon-wrapper" style={{ backgroundColor: '#10b981', color: 'white' }}><IconNotes size={16} /></div>
              <h3>Notes Generated</h3>
            </div>
            <IconTrendingUp size={20} className="trend-icon up" />
          </div>
          <div className="stat-value">
            <h2>{classStats?.notes?.frequency || 0}</h2>
            <span className="trend-text up">{classStats?.notes?.status || 'Normal'} Class Usage</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ backgroundColor: '#10b981', width: '60%' }}></div></div>
        </div>

        <div className="stat-card card-attendance">
          <div className="stat-header">
            <div className="stat-title">
              <div className="icon-wrapper blue-bg"><IconUsers size={16} /></div>
              <h3>Avg Class Attendance</h3>
            </div>
            <IconTrendingUp size={20} className="trend-icon up" />
          </div>
          <div className="stat-value">
            <h2>{Math.round(classStats?.attendance?.overall || 0)}%</h2>
            <span className="trend-text up">Week 5 Benchmark</span>
          </div>
          <div className="progress-track"><div className="progress-fill blue-fill" style={{ width: `${classStats?.attendance?.overall || 0}%` }}></div></div>
        </div>

        <div className="stat-card card-quiz">
          <div className="stat-header">
            <div className="stat-title">
              <div className="icon-wrapper blue-bg"><IconListCheck size={16} /></div>
              <h3>Avg Class Quiz Score</h3>
            </div>
            <IconTrendingUp size={20} className="trend-icon up" />
          </div>
          <div className="stat-value">
            <h2>{Math.round(classStats?.quiz?.averageScore || 0)}%</h2>
            <span className="trend-text up">{classStats?.quiz?.totalAttempts || 0} Total Attempts</span>
          </div>
          <div className="progress-track"><div className="progress-fill yellow-fill" style={{ width: `${classStats?.quiz?.averageScore || 0}%` }}></div></div>
        </div>

        <div className="mascot-card card-mascot" style={{ gridColumn: 'span 1', gridRow: 'span 2', marginBottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <img src={actionFigureImg} alt="Big Mascot" style={{ width: '90%', height: 'auto', objectFit: 'contain' }} />
        </div>
        {/* Row 2: Weekly Report (Spans 3 columns next to Mascot) */}
        <div className="ai-card card-feedback" style={{ gridColumn: 'span 3', marginBottom: '20px' }}>
          <div className="ai-content" style={{ marginLeft: 0 }}>
            <div className="ai-header" style={{ marginBottom: '16px' }}>
              <h3>Weekly Class Learning Report</h3>
              <div className="bulb-icon" style={{ backgroundColor: '#e6f0ff', color: '#266df1' }}><IconReportAnalytics size={18} /></div>
            </div>

            <div className="raw-stats-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div className="raw-stat" style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Active Quizzes</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{classStats?.quiz?.totalAttempts || 0}</div>
              </div>
              <div className="raw-stat" style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Resource Syncs</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{classStats?.notes?.frequency || 0}</div>
              </div>
              <div className="raw-stat" style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Attendance Rate</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{Math.round(classStats?.attendance?.overall || 0)}%</div>
              </div>
            </div>

            <div className="ai-actions">
              <button className="btn-primary" onClick={() => navigate('/analytics')} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconBrain size={14} /> View AI Trace Intelligence
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Quick Action Buttons (Full Width) */}
        <div className="action-buttons-row" style={{ gridColumn: 'span 4', display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <div className="premium-action-card grad-indigo" onClick={() => navigate('/notes-ai')}>
            <div className="action-card-icon"><IconNotes size={24} /></div>
            <div className="action-card-label">Prepare Study Notes</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>AI-Powered generation for Week 5</div>
          </div>

          <div className="premium-action-card grad-emerald" onClick={() => navigate('/attendance')}>
            <div className="action-card-icon"><IconCheckbox size={24} /></div>
            <div className="action-card-label">Mark Attendance</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Secure QR session for Week 5</div>
          </div>

          <div className="premium-action-card grad-orange" onClick={() => navigate('/quiz-validator')}>
            <div className="action-card-icon"><IconPencilCheck size={24} /></div>
            <div className="action-card-label">Prepare Weekly Quiz</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Module validation & logic trace</div>
          </div>
        </div>

        {/* Row 4: Allocated Modules (Full Width) */}
        <div className="stat-card card-modules" style={{ gridColumn: 'span 4', padding: '24px' }}>
          <div className="stat-header" style={{ marginBottom: '35px' }}>
            <div className="stat-title">
              <div className="icon-wrapper" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', width: '40px', height: '40px' }}><IconBooks size={20} /></div>
              <div style={{ marginLeft: '12px' }}>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Allocated Modules</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Overview of your academic teaching load</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{userData?.assignedModules?.length || 0}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Active</div>
            </div>
          </div>

          <div className="modules-grid-enhanced" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {userData?.assignedModules?.length > 0 ? (
              userData.assignedModules.map((moduleCode, idx) => {
                if (!moduleCode || typeof moduleCode !== 'string') return null;
                const isITPM = moduleCode.includes('ITPM');
                const year = isITPM ? 2 : 3;
                const studentCount = isITPM ? 78 : 64;

                return (
                  <div
                    key={idx}
                    className="enhanced-module-card"
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '1px solid #f1f5f9',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = '#fcfcfd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#f1f5f9';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      <div style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: isITPM ? '#eff6ff' : '#f5f3ff',
                        color: isITPM ? '#3b82f6' : '#8b5cf6'
                      }}>
                        {isITPM ? <IconCalendarStats size={20} /> : <IconNotes size={20} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '16px', color: '#1e293b' }}>{moduleCode}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Academic Year 3 - Semester 2
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f8fafc', padding: '4px 10px', borderRadius: '8px' }}>
                          <IconUsers size={14} color="#64748b" />
                          <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>{studentCount}</span>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          color: isITPM ? '#1d4ed8' : '#6d28d9',
                          backgroundColor: isITPM ? '#dbeafe' : '#ede9fe',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em'
                        }}>
                          Year {year}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: 'span 4', padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                <IconCalendar size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <div>No modules allocated to your account yet.</div>
              </div>
            )}
        </div>
      </div>
    </div>
    </>
  );
}

export default LecturerDashboard;

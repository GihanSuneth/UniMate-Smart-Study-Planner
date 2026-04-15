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


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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
            <h2>142</h2>
            <span className="trend-text up">+12% this week</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ backgroundColor: '#10b981', width: '80%' }}></div></div>
        </div>

        <div className="stat-card card-attendance">
          <div className="stat-header">
            <div className="stat-title">
              <div className="icon-wrapper blue-bg"><IconUsers size={16} /></div>
              <h3>Class Attendance</h3>
            </div>
            <IconTrendingUp size={20} className="trend-icon up" />
          </div>
          <div className="stat-value">
            <h2>92%</h2>
            <span className="trend-text up">+2% this week</span>
          </div>
          <div className="progress-track"><div className="progress-fill blue-fill" style={{ width: '92%' }}></div></div>
        </div>

        <div className="stat-card card-quiz">
          <div className="stat-header">
            <div className="stat-title">
              <div className="icon-wrapper blue-bg"><IconListCheck size={16} /></div>
              <h3>Avg Quiz Score</h3>
            </div>
            <IconTrendingUp size={20} className="trend-icon up" />
          </div>
          <div className="stat-value">
            <h2>85%</h2>
            <span className="trend-text up">+3% this week</span>
          </div>
          <div className="progress-track"><div className="progress-fill yellow-fill" style={{ width: '85%' }}></div></div>
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
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Quizzes Done</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>850</div>
              </div>
              <div className="raw-stat" style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Notes Generated</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>142</div>
              </div>
              <div className="raw-stat" style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Weekly Attendance</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>92%</div>
              </div>
            </div>

            <div className="ai-actions">
              <button className="btn-primary" onClick={() => navigate('/analytics')} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconBrain size={14} /> Analyze with Intelligence
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Quick Action Buttons (Full Width) */}
        <div className="action-buttons-row" style={{ gridColumn: 'span 4', display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Prepare Notes', icon: <IconNotes size={16} />, color: '#999bf5ff', bg: '#c9bffeff', bdr: '#3d67f1ff', path: '/notes-ai' },
            { label: 'Take Attendance', icon: <IconCheckbox size={16} />, color: '#056545ff', bg: '#c9ffd9ff', bdr: '#2ffb76ff', path: '/attendance' },
            { label: 'Prepare Quiz', icon: <IconPencilCheck size={16} />, color: '#d48d11ff', bg: '#fff2bdff', bdr: '#ffd42aff', path: '/quiz-validator' }
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() => navigate(btn.path)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                background: btn.bg,
                color: btn.color,
                border: `1px solid ${btn.bdr}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '700',
                fontSize: '13px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = btn.bdr;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = btn.bg;
                e.currentTarget.style.transform = 'none';
              }}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
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
                          {isITPM ? 'IT Project Management' : 'Computer Science Core'}
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconCalendarStats, IconPencilCheck, IconTrendingUp, 
  IconTrendingDown, IconRefresh, IconBulb, IconBook,
  IconNotes, IconBrain, IconCheckbox, IconChecklist, IconCalendar, IconBooks, IconUsers
} from '@tabler/icons-react';
import actionFigureImg from '../images/action-figure-1.png';
import WeeklyReportCard from '../components/WeeklyReportCard';
import { BASE_URL } from '../api';

function StudentDashboard() {
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
      <div className="welcome-banner">
        <h1>Welcome Back, {userData?.username || 'Student'} <span role="img" aria-label="wave">👋</span></h1>
        <p>Your academic overview and learning insights are ready.</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {/* Row 1 & 2: Stats (Linear) -> AI Insights -> Mascot (Anchored) */}
        
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
              <div className="icon-wrapper blue-bg"><IconCalendarStats size={16} /></div>
              <h3>Attendance</h3>
            </div>
            <IconTrendingUp size={20} className="trend-icon up" />
          </div>
          <div className="stat-value">
            <h2>82%</h2>
            <span className="trend-text up">+5% this week</span>
          </div>
          <div className="progress-track"><div className="progress-fill blue-fill" style={{ width: '82%' }}></div></div>
        </div>

        <div className="stat-card card-quiz">
          <div className="stat-header">
            <div className="stat-title">
              <div className="icon-wrapper blue-bg"><IconPencilCheck size={16} /></div>
              <h3>Quiz Performance</h3>
            </div>
            <IconTrendingDown size={20} className="trend-icon down" />
          </div>
          <div className="stat-value">
            <h2>76%</h2>
            <span className="trend-text down">-4% this week</span>
          </div>
          <div className="progress-track"><div className="progress-fill yellow-fill" style={{ width: '76%' }}></div></div>
        </div>

        <div className="mascot-card card-mascot" style={{ gridColumn: 'span 1', gridRow: 'span 2', marginBottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <div className="decor-circle-1"></div>
          <div className="decor-circle-2"></div>
          <img src={actionFigureImg} alt="Big Mascot" style={{ width: '90%', height: 'auto', objectFit: 'contain', zIndex: 1 }} />
        </div>

        {/* Row 2: AI Weekly Report */}
        <WeeklyReportCard role="student" />

        {/* Row 3: Student Quick Actions (Aligned with Patterns) */}
        <div className="action-buttons-row" style={{ gridColumn: 'span 4', display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Study with AI', icon: <IconBrain size={16} />, color: '#999bf5ff', bg: '#c9bffeff', bdr: '#3d67f1ff', path: '/notes-ai' },
            { label: 'Mark Attendance', icon: <IconCheckbox size={16} />, color: '#056545ff', bg: '#c9ffd9ff', bdr: '#2ffb76ff', path: '/mark-attendance' },
            { label: 'Try Quiz', icon: <IconPencilCheck size={16} />, color: '#d48d11ff', bg: '#fff2bdff', bdr: '#ffd42aff', path: '/quiz-validator' }
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

        {/* Row 4: Enrolled Modules (Compact Horizontal Pattern) */}
        <div className="stat-card card-modules" style={{ gridColumn: 'span 4', padding: '24px' }}>
          <div className="stat-header" style={{ marginBottom: '35px' }}>
            <div className="stat-title">
              <div className="icon-wrapper" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', width: '40px', height: '40px' }}><IconBooks size={20} /></div>
              <div style={{ marginLeft: '12px' }}>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Enrolled Modules</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Detailed overview of your current academic units</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{userData?.enrolledModules?.length || 4}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Active</div>
            </div>
          </div>

          <div className="modules-grid-enhanced" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {(userData?.enrolledModules || ['IT3040', 'IT3020', 'IT3030', 'IT3010']).map((moduleCode, idx) => {
              const moduleNames = {
                'IT3040': 'IT Project Management',
                'IT3020': 'Data Science Origins',
                'IT3030': 'Professional Application Frameworks',
                'IT3010': 'Network Design & Management'
              };
              const isITPM = moduleCode.includes('IT3040');
              const year = 3;
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
                        {moduleNames[moduleCode] || 'Advanced Computer Science'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f8fafc', padding: '4px 10px', borderRadius: '8px' }}>
                        <IconUsers size={14} color="#64748b" />
                        <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>{studentCount} Batch</span>
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
            })}
          </div>
        </div>
       </div>
    </>
  );
}

export default StudentDashboard;

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

  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // 1. Fetch Profile
        const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setUserData(profileData);
        }

        // 2. Fetch Summary for Week 5
        const summaryRes = await fetch(`${BASE_URL}/analytics/summary/${userId}/5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const sData = await summaryRes.json();
        if (summaryRes.ok) {
          setSummaryData(sData);
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
            <h2>{summaryData?.weeklyStats?.notes || 0}</h2>
            <span className="trend-text up">Active Week 5</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ backgroundColor: '#10b981', width: '50%' }}></div></div>
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
            <h2>{Math.round(summaryData?.weeklyStats?.attendance || 0)}%</h2>
            <span className="trend-text up">Target: {summaryData?.target?.attendanceTarget || 80}%</span>
          </div>
          <div className="progress-track"><div className="progress-fill blue-fill" style={{ width: `${summaryData?.weeklyStats?.attendance || 0}%` }}></div></div>
        </div>

        <div className="stat-card card-quiz">
          <div className="stat-header">
            <div className="stat-title">
              <div className="icon-wrapper blue-bg"><IconPencilCheck size={16} /></div>
              <h3>Quiz Performance</h3>
            </div>
            <IconTrendingUp size={20} className="trend-icon up" />
          </div>
          <div className="stat-value">
            <h2>{Math.round(summaryData?.weeklyStats?.quiz || 0)}%</h2>
            <span className="trend-text up">Target: {summaryData?.target?.quizTarget || 75}%</span>
          </div>
          <div className="progress-track"><div className="progress-fill yellow-fill" style={{ width: `${summaryData?.weeklyStats?.quiz || 0}%` }}></div></div>
        </div>

        <div className="mascot-card card-mascot" style={{ gridColumn: 'span 1', gridRow: 'span 2', marginBottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <div className="decor-circle-1"></div>
          <div className="decor-circle-2"></div>
          <img src={actionFigureImg} alt="Big Mascot" style={{ width: '90%', height: 'auto', objectFit: 'contain', zIndex: 1 }} />
        </div>

        {/* Row 2: AI Weekly Report */}
        <WeeklyReportCard role="student" />

        {/* Row 3: Student Quick Actions (Full Width) */}
        <div className="action-buttons-row" style={{ gridColumn: 'span 4', display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <div className="premium-action-card grad-indigo" onClick={() => navigate('/notes-ai')}>
            <div className="action-card-icon"><IconBrain size={24} /></div>
            <div className="action-card-label">Study with AI</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Smart generation for Week 5</div>
          </div>

          <div className="premium-action-card grad-emerald" onClick={() => navigate('/mark-attendance')}>
            <div className="action-card-icon"><IconCheckbox size={24} /></div>
            <div className="action-card-label">Mark My Attendance</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Submit presence for Week 5</div>
          </div>

          <div className="premium-action-card grad-orange" onClick={() => navigate('/quiz-validator')}>
            <div className="action-card-icon"><IconPencilCheck size={24} /></div>
            <div className="action-card-label">Try Weekly Quiz</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Test mastery & view logic trace</div>
          </div>
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
            {(userData?.enrolledModules || ['IT3010', 'IT3011', 'IT3012', 'IT3013', 'IT3014']).map((moduleCode, idx) => {
              const moduleNames = {
                'IT3010': 'Network Design and Modeling',
                'IT3011': 'Database Systems',
                'IT3012': 'Operating Systems',
                'IT3013': 'Data Structures and Algorithms',
                'IT3014': 'Data Science and Analytics'
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

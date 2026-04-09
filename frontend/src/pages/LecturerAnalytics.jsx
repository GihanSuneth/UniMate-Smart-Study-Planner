import React from 'react';
import { 
  IconFlame, IconUserOff, IconCheck, IconX, IconUser,
  IconBooks, IconNotes, IconBrain, IconAlertTriangle, IconChartBar, IconListCheck
} from '@tabler/icons-react';
import './Analytics.css';

function LecturerAnalytics() {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Lecturer Analytics</h1>
        <p>Comprehensive overview of class performance and student habits.</p>
      </div>

      <div className="analytics-dashboard-grid">
        
        {/* Main Column */}
        <div className="analytics-main-col">
          
          {/* ASSIGNED MODULES */}
          <div className="overview-card" style={{ marginBottom: '24px' }}>
            <h3 className="overview-card-header">Assigned Modules</h3>
            <div className="overview-stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              
              <div className="analytics-stat-box" style={{ borderColor: 'var(--primary)' }}>
                <div className="stat-box-top">
                  <div className="icon blue"><IconBooks size={14}/></div>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>COMP200 - Database Systems</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '12px', color: 'var(--text-secondary)' }}>
                  <span>Students: 120</span>
                  <span>Avg Grade: 78%</span>
                </div>
              </div>

              <div className="analytics-stat-box" style={{ borderColor: '#ffb547' }}>
                <div className="stat-box-top">
                  <div className="icon orange"><IconBooks size={14}/></div>
                  <span style={{ fontWeight: 600, color: '#ffb547' }}>CS101 - Algorithms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '12px', color: 'var(--text-secondary)' }}>
                  <span>Students: 95</span>
                  <span>Avg Grade: 65%</span>
                </div>
              </div>

            </div>
          </div>

          <div className="overview-card" style={{ marginBottom: '24px' }}>
            <h3 className="overview-card-header">Class Insights</h3>
            <div className="overview-stats-grid">
              
              {/* NOTES TAKING ABILITIES */}
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className="icon blue"><IconNotes size={14}/></div>
                  <span>Note Taking Abilities</span>
                </div>
                <div className="stat-box-value">
                  <h2>82%</h2>
                  <span className="trend up">Excellent ✓</span>
                </div>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill blue" style={{width: '82%'}}></div>
                </div>
                <div style={{fontSize: 11, color: 'var(--text-secondary)', marginTop: '8px'}}>
                  AI Analysis of uploaded class notes
                </div>
              </div>

              {/* LEARNING PATTERNS */}
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className="icon orange"><IconBrain size={14}/></div>
                  <span>Learning Patterns</span>
                </div>
                <div className="stat-box-value" style={{ marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-dark)' }}>Visual & Interactive</h4>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  70% of the class retains information better through interactive diagrams and quizzes rather than reading texts.
                </p>
              </div>

              {/* WEAK SCENARIOS */}
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

          {/* DETAILED STUDENT PROFILES */}
          <div className="details-row">
             <div className="details-header">
               <div className="details-tab active">Student Profiles</div>
               <div className="details-tab"><IconListCheck size={16}/> Needs Attention</div>
             </div>
             <div className="user-row-placeholder">
               <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px'}}><IconUser size={14}/></div>
                  <strong>John Doe</strong>
               </div>
               <span>Class: COMP200</span>
               <span>Notes Quality: Poor</span>
               <span style={{color: 'var(--warning)', fontWeight: 600}}>At Risk</span>
             </div>
             <div className="user-row-placeholder">
               <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px'}}><IconUser size={14}/></div>
                  <strong>Jane Smith</strong>
               </div>
               <span>Class: CS101</span>
               <span>Notes Quality: Excellent</span>
               <span style={{color: 'var(--success)', fontWeight: 600}}>On Track</span>
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

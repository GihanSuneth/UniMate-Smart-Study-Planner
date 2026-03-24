import React from 'react';
import { 
  IconCalendarStats, IconPencilCheck, IconAlertTriangle, IconBulb, 
  IconFlame, IconUserOff, IconCheck, IconX, IconTrendingUp, IconTrendingDown,
  IconUser
} from '@tabler/icons-react';
import './Analytics.css';
import actionFigure4Img from '../images/action-figure-4.png';

function Analytics() {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Welcome Back, John <span role="img" aria-label="wave">👋</span></h1>
        <p>Here are your academic performance insights.</p>
      </div>

      <div className="analytics-dashboard-grid">
        {/* Main Content Column */}
        <div className="analytics-main-col">
          
          <div className="overview-card">
            <h3 className="overview-card-header">Student Overview</h3>
            <div className="overview-stats-grid">
              
              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className="icon blue"><IconCalendarStats size={14}/></div>
                  <span>Attendance</span>
                </div>
                <div className="stat-box-value">
                  <h2>88%</h2>
                  <span className="trend up">+2% from last week</span>
                </div>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill blue" style={{width: '88%'}}></div>
                </div>
                <span style={{fontSize: 10, color: '#a3aed1'}}>To this text - sample</span>
              </div>

              <div className="analytics-stat-box">
                <div className="stat-box-top">
                  <div className="icon orange"><IconPencilCheck size={14}/></div>
                  <span>Quiz Performance</span>
                </div>
                <div className="stat-box-value">
                  <h2>74%</h2>
                  <span className="trend down">-5% for last week</span>
                </div>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill orange" style={{width: '74%'}}></div>
                </div>
              </div>

              <div className="analytics-stat-box weak-topics-box">
                <div className="stat-box-top">
                  <div className="icon light-blue" style={{backgroundColor: '#e3f2fd', color: '#42a5f5'}}><IconAlertTriangle size={14}/></div>
                  <span>Weak Topics</span>
                </div>
                <ul className="topic-bullet-list">
                  <li>Database Joins</li>
                  <li>API Authentication</li>
                </ul>
                <button className="review-btn">Review</button>
              </div>

            </div>
          </div>

          <div className="charts-row">
            <div className="chart-widget">
              <div className="chart-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                <h3 style={{fontSize: 16, fontWeight: 600}}>Attendance Trends</h3>
                <select className="date-select"><option>This Week</option></select>
              </div>
              <div className="chart-body" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                 <svg className="fake-chart-svg" viewBox="0 0 500 150" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" className="grid-line" />
                  <line x1="0" y1="70" x2="500" y2="70" className="grid-line" />
                  <line x1="0" y1="110" x2="500" y2="110" className="grid-line" />
                  
                  {/* Attendance Area */}
                  <path fill="rgba(1, 181, 116, 0.1)" d="M0,130 L100,90 L200,60 L300,70 L400,30 L500,40 L500,150 L0,150 Z" />
                  <polyline fill="none" stroke="#01b574" strokeWidth="3" points="0,130 100,90 200,60 300,70 400,30 500,40" />
                  
                  {/* Secondary Line */}
                  <polyline fill="none" stroke="#266df1" strokeWidth="2" opacity="0.3" points="0,140 100,120 200,105 300,110 400,90 500,80" />
                  
                  <circle cx="200" cy="60" r="4" fill="#01b574"/>
                  <circle cx="400" cy="30" r="4" fill="#01b574"/>
                 </svg>
                 <div className="chart-x-axis" style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginTop: 8}}>
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                 </div>
              </div>
            </div>

            <div className="chart-widget">
              <div className="chart-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                <h3 style={{fontSize: 16, fontWeight: 600}}>Quiz Performance</h3>
                <select className="date-select"><option>Last Week</option></select>
              </div>
              <div className="chart-body" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                 <svg className="fake-chart-svg" viewBox="0 0 500 150" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
                  <line x1="0" y1="30" x2="500" y2="30" className="grid-line" />
                  <line x1="0" y1="70" x2="500" y2="70" className="grid-line" />
                  <line x1="0" y1="110" x2="500" y2="110" className="grid-line" />
                  
                  <path fill="rgba(255, 181, 71, 0.2)" d="M0,130 L100,100 L200,80 L300,110 L400,50 L500,40 L500,150 L0,150 Z" />
                  <polyline fill="none" stroke="#ffb547" strokeWidth="3" points="0,130 100,100 200,80 300,110 400,50 500,40" />
                  
                  <polyline fill="none" stroke="#266df1" strokeWidth="2" opacity="0.2" points="0,140 100,125 200,115 300,120 400,85 500,70" />
                  
                  <circle cx="200" cy="80" r="4" fill="#ffb547"/>
                  <circle cx="300" cy="110" r="4" fill="#ffb547"/>
                 </svg>
                 <div className="chart-x-axis" style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginTop: 8}}>
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="details-row">
             <div className="details-header">
               <div className="details-tab active">Profiles</div>
               <div className="details-tab"><IconUser size={16}/> Student</div>
             </div>
             <div className="user-row-placeholder">
               <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--border-color)'}}></div>
                  <strong>John Doe</strong>
               </div>
             </div>
             <div className="user-row-placeholder">
               <span>Sales: Past Week</span>
               <span>7% Students</span>
               <span>Font: www.google.com/fonts</span>
             </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="analytics-side-col">
          
          <div className="mascot-area">
             <div className="tip-bubble">
               <div className="tip-header">
                 <IconBulb size={16} /> Tip:
               </div>
               Review your weak topics and quizzes again to improve your understanding
             </div>
             <div className="mascot-image-wrapper">
               <img src={actionFigure4Img} alt="Mascot Helper" className="mascot-image-4" />
             </div>
          </div>

          <div className="lecturer-analytics-card">
            <h3 className="la-header">Lecturer Analytics</h3>
            <p className="la-subheader">Student Engagement this Week</p>

            <div className="donut-chart-container">
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
                   <div className="legend-sub">1 Students</div>
                </div>
              </div>
            </div>

            <div className="student-activity-box">
              <div className="activity-box-title">Student Activity</div>
              <div className="activity-stats-row">
                 <div className="astat">
                    <div className="astat-val green"><IconCheck size={14} stroke={3} /> Active</div>
                    <div className="astat-sub">64 Students</div>
                 </div>
                 <div className="astat">
                    <div className="astat-val orange"><IconX size={14} stroke={3} /> Inactive</div>
                    <div className="astat-sub">11 Students</div>
                 </div>
              </div>
            </div>

            <div className="lecturer-insights">
              <div className="insight-title">Lecturer Insights:</div>
              <ul className="insight-list">
                <li><strong>Most Active Courses</strong></li>
                <li>COMP200 - 88% Engagement</li>
                <li>CS101 - 81% Engagement</li>
              </ul>
            </div>

            <div className="key-observation">
              <div className="key-title">Key Observation:</div>
              <div className="key-text">
                Low quiz participation in CS101. Consider including motivating factors or rewards.
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}

export default Analytics;

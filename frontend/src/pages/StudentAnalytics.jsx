import React from 'react';
import { 
  IconCalendarStats, IconPencilCheck, IconAlertTriangle, IconBulb, 
  IconUser
} from '@tabler/icons-react';
import './Analytics.css';

function StudentAnalytics() {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Welcome Back, Student <span role="img" aria-label="wave">👋</span></h1>
        <p>Here are your academic performance insights.</p>
      </div>

      <div className="analytics-dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="analytics-main-col">
          
          <div className="overview-card">
            <h3 className="overview-card-header">Your Overview</h3>
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
                  <line x1="0" y1="30" x2="500" y2="30" className="grid-line" />
                  <line x1="0" y1="70" x2="500" y2="70" className="grid-line" />
                  <line x1="0" y1="110" x2="500" y2="110" className="grid-line" />
                  
                  <path fill="rgba(1, 181, 116, 0.1)" d="M0,130 L100,90 L200,60 L300,70 L400,30 L500,40 L500,150 L0,150 Z" />
                  <polyline fill="none" stroke="#01b574" strokeWidth="3" points="0,130 100,90 200,60 300,70 400,30 500,40" />
                  
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
        </div>

        <div className="analytics-side-col" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="weekly-report-card" style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-card)' }}>
             <div className="ai-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
               <div className="bulb-icon" style={{ backgroundColor: '#e6f0ff', color: '#266df1', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <IconBulb size={18} />
               </div>
               <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', margin: 0 }}>Weekly Learning Report</h3>
             </div>
             <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '20px' }}>
               <strong style={{ color: 'var(--text-dark)' }}>Learning Pattern:</strong> Highly active during evening hours. Excellent retention in visual topics. We recommend focusing on practical exercises for <strong style={{ color: 'var(--text-dark)' }}>Normalization</strong> to improve your weak areas.
             </p>
             <div className="ai-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
               <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '16px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}>View Full Report</button>
               <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'white', color: 'var(--text-dark)', cursor: 'pointer' }}>My Study Plan</button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StudentAnalytics;

import React from 'react';
import { 
  IconCalendarStats, IconPencilCheck, IconTrendingUp, 
  IconTrendingDown, IconRefresh, IconBulb, IconBook
} from '@tabler/icons-react';

import actionFigureImg from '../images/action-figure-1.png';

function Dashboard() {
  return (
    <>
       <div className="welcome-banner">
         <h1>Welcome Back, John <span role="img" aria-label="wave">👋</span></h1>
         <p>Here's your academic overview for the week.</p>
       </div>

       <div className="dashboard-grid">
          
          {/* Row 1 */}
          <div className="stat-card card-attendance">
             <div className="stat-header">
               <div className="stat-title">
                 <div className="icon-wrapper blue-bg"><IconCalendarStats size={16}/></div>
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
                 <div className="icon-wrapper blue-bg"><IconPencilCheck size={16}/></div>
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

          <div className="stat-card card-weak weak-topics">
             <div className="weak-topics-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
               <div className="stat-title">
                 <div className="icon-wrapper red-bg" style={{backgroundColor: '#ee5d50', opacity: 0.9}}><IconBulb size={16}/></div>
                 <h3>Weak Topics</h3>
               </div>
               <button className="refresh-btn"><IconRefresh size={16}/></button>
             </div>
             <ul className="topic-list">
               <li><span className="dot red"></span> Normalization</li>
               <li><span className="dot red"></span> ER Diagrams</li>
             </ul>
             <button className="btn-primary small-btn">Review</button>
          </div>

          {/* Big Mascot Card */}
          <div className="mascot-card card-mascot">
             <div className="decor-circle-1"></div>
             <div className="decor-circle-2"></div>
             <img src={actionFigureImg} alt="Big Mascot" className="main-mascot" />
          </div>

          {/* Row 2: Enrolled Modules */}
          <div className="ai-card card-feedback" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', width: '100%' }}>
               <div className="bulb-icon" style={{ backgroundColor: '#e6f0ff', color: '#266df1', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <IconBook size={18} />
               </div>
               <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', margin: 0 }}>Enrolled Modules</h3>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', width: '100%' }}>
               {[
                 { name: 'ITPM', code: 'IT3040', color: '#eef4ff', textColor: '#266df1', border: '#d1e3ff' },
                 { name: 'DS', code: 'IT3020', color: '#fff5eb', textColor: '#f5a623', border: '#ffe4c4' },
                 { name: 'PAF', code: 'IT3030', color: '#e6f8f1', textColor: '#01b574', border: '#ccebe1' },
                 { name: 'NDM', code: 'IT3010', color: '#ffefef', textColor: '#ee5d50', border: '#ffd6d6' }
               ].map(mod => (
                 <div key={mod.code} style={{ backgroundColor: mod.color, border: `1px solid ${mod.border}`, padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: mod.textColor, marginBottom: '4px' }}>{mod.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{mod.code}</span>
                 </div>
               ))}
             </div>
          </div>

          {/* Row 3 Charts */}
          <div className="chart-card card-chart-1">
            <div className="chart-header">
              <div className="chart-title">
                <IconTrendingUp size={20} className="chart-icon blue-icon" />
                <h3>Attendance Trends</h3>
              </div>
              <select className="date-select"><option>This Week</option><option>Last Week</option></select>
            </div>
            <div className="chart-body">
              <svg className="fake-chart-svg" viewBox="0 0 500 150" preserveAspectRatio="none">
                <line x1="0" y1="30" x2="500" y2="30" className="grid-line" />
                <line x1="0" y1="70" x2="500" y2="70" className="grid-line" />
                <line x1="0" y1="110" x2="500" y2="110" className="grid-line" />
                
                <path fill="rgba(1, 181, 116, 0.1)" d="M0,130 L100,90 L200,60 L300,70 L400,30 L500,40 L500,150 L0,150 Z" />
                <polyline fill="none" stroke="#01b574" strokeWidth="3" points="0,130 100,90 200,60 300,70 400,30 500,40" />
                <polyline fill="none" stroke="#266df1" strokeWidth="3" opacity="0.3" points="0,140 100,110 200,80 300,90 400,60 500,50" />
                
                <circle cx="200" cy="60" r="4" fill="#01b574"/>
                <circle cx="300" cy="70" r="4" fill="#01b574"/>
                <circle cx="400" cy="30" r="4" fill="#01b574"/>
              </svg>
              <div className="chart-x-axis">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
              </div>
            </div>
          </div>

          <div className="chart-card card-chart-2">
            <div className="chart-header">
              <div className="chart-title">
                <div className="icon-wrapper yellow-bg" style={{width: 24, height: 24}}><IconPencilCheck size={14}/></div>
                <h3>Quiz Performance</h3>
              </div>
              <select className="date-select"><option>This Week</option><option>Last Week</option></select>
            </div>
            <div className="chart-body">
               <svg className="fake-chart-svg" viewBox="0 0 500 150" preserveAspectRatio="none">
                <line x1="0" y1="30" x2="500" y2="30" className="grid-line" />
                <line x1="0" y1="70" x2="500" y2="70" className="grid-line" />
                <line x1="0" y1="110" x2="500" y2="110" className="grid-line" />
                
                <path fill="rgba(255, 181, 71, 0.2)" d="M0,130 L100,100 L200,80 L300,110 L400,50 L500,40 L500,150 L0,150 Z" />
                <polyline fill="none" stroke="#ffb547" strokeWidth="3" points="0,130 100,100 200,80 300,110 400,50 500,40" />
                
                <polyline fill="none" stroke="#ffb547" strokeWidth="3" opacity="0.2" points="0,140 100,110 200,90 300,120 400,70 500,70" />
                
                <circle cx="200" cy="80" r="4" fill="#ffb547"/>
                <circle cx="400" cy="50" r="4" fill="#ffb547"/>
               </svg>
               <div className="chart-x-axis">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
              </div>
            </div>
          </div>
       </div>
    </>
  );
}

export default Dashboard;

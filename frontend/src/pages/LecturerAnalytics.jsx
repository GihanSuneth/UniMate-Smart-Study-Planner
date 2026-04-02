import React from 'react';
import { 
  IconFlame, IconUserOff, IconCheck, IconX, IconUser
} from '@tabler/icons-react';
import './Analytics.css';

function LecturerAnalytics() {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Lecturer Analytics</h1>
        <p>Overview of student engagement and participation.</p>
      </div>

      <div className="analytics-dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="analytics-main-col">
          
          <div className="lecturer-analytics-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 className="la-header">Class Overview</h3>
            <p className="la-subheader">Student Engagement this Week</p>

            <div className="donut-chart-container" style={{ margin: '30px 0' }}>
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

            <div className="student-activity-box" style={{ marginBottom: '24px' }}>
              <div className="activity-box-title">Student Activity Details</div>
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

            <div className="lecturer-insights" style={{ marginBottom: '20px' }}>
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

          <div className="details-row" style={{ maxWidth: '800px', margin: '30px auto' }}>
             <div className="details-header">
               <div className="details-tab active">Student Profiles</div>
               <div className="details-tab"><IconUser size={16}/> Student</div>
             </div>
             <div className="user-row-placeholder">
               <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--border-color)'}}></div>
                  <strong>John Doe</strong>
               </div>
               <span>COMP200</span>
             </div>
             <div className="user-row-placeholder">
               <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--border-color)'}}></div>
                  <strong>Jane Smith</strong>
               </div>
               <span>CS101</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LecturerAnalytics;

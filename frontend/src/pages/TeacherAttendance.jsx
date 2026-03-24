import React from 'react';
import { IconCheck, IconX, IconUser, IconMailOpened, IconEdit } from '@tabler/icons-react';
import './Attendance.css';

import actionFigure2Img from '../images/action-figure-2.png';
import qrSvg from '../images/qr.svg';

function TeacherAttendance() {
  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Start an attendance session and share the QR code with your class.</p>
      </div>

      <div className="attendance-grid">
        <div className="role-column" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
          <div className="attendance-card">
            <h3 className="card-title">Start Attendance Session</h3>
            <button className="generate-btn">Generate QR Code</button>
            
            <div className="qr-display-box">
              <img src={qrSvg} alt="QR Code" className="qr-code-img" />
              <img src={actionFigure2Img} alt="Mascot" className="qr-mascot" />
            </div>

            <div className="status-indicators">
              <div className="status-item present">
                 <IconCheck size={20} color="var(--success)" stroke={3} />
                 <span>Students Present: <span className="count">35</span></span>
              </div>
              <div className="status-item absent">
                 <IconX size={20} color="var(--danger)" stroke={3} />
                 <span>Absent: <span className="count">4</span></span>
              </div>
            </div>

            <button className="action-btn">End Session</button>
          </div>
        </div>
      </div>

      <div className="user-list-section" style={{ maxWidth: '600px', margin: '30px auto 0' }}>
        <h3 className="card-title" style={{marginBottom: 16}}>Recent Submissions</h3>
        <div className="user-list-header">
           <h3>John Doe</h3>
           <div className="role-badge"><IconUser size={18} /> Student</div>
        </div>

        <div className="user-row">
           <div className="user-info-group">
             <IconMailOpened size={20} color="var(--text-secondary)" />
             John Doe
           </div>
        </div>

        <div className="user-row">
           <div className="user-info-group">
             <IconEdit size={20} color="var(--text-secondary)" />
             John Doe
           </div>
           
           <div className="user-info-group fade" style={{marginLeft: 'auto'}}>
             John Doe
           </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherAttendance;

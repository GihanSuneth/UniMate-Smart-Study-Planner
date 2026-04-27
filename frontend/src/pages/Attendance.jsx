import React from 'react';
import { IconCheck, IconX, IconUser, IconMail, IconMailOpened, IconEdit } from '@tabler/icons-react';
import './Attendance.css';


import actionFigure2Img from '../images/action-figure-2.png';
import qrSvg from '../images/qr.svg';

function Attendance() {
  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Manage attendance using a QR code system for smart sessions.</p>
      </div>

      <div className="attendance-grid">
        {/* Left Column: Lecturers */}
        <div className="role-column">
          <h2 className="column-header">For Lecturers</h2>
          
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

        {/* Right Column: Students */}
        <div className="role-column">
          <h2 className="column-header">For Students</h2>
          
          <div className="attendance-card">
            <h3 className="card-title">Scan QR Code to mark your attendance</h3>
            
            <div className="qr-display-box">
              <img src={qrSvg} alt="QR Code" className="qr-code-img" />
              <img src={actionFigure2Img} alt="Mascot" className="qr-mascot" />
            </div>

            <button className="generate-btn scan-btn">Scan QR Code</button>

            <div className="attendance-status-block">
              <h4>Attendance Status: 82%</h4>
              
              <div className="status-cards">
                <div className="status-card present-card">
                  <div className="status-card-header">
                    <IconCheck size={18} stroke={3} /> Present
                  </div>
                  <div className="status-card-value">Present Days: 64</div>
                </div>
                
                <div className="status-card absent-card">
                  <div className="status-card-header">
                    <IconX size={18} stroke={3} /> Absent
                  </div>
                  <div className="status-card-value">Absent Days: 14</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="user-list-section">
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

export default Attendance;
